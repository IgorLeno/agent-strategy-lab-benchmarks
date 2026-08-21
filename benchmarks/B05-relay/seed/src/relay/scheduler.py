"""Job scheduling.

The scheduler owns every state transition. It is the only component that is
allowed to move a job between states, hand out leases, or enqueue a job id.

Leases are keyed by ``(job_id, epoch)`` so an operator can audit every attempt
a job went through, including attempts that were abandoned.
"""

from __future__ import annotations

from typing import Callable, Mapping

from .clock import Clock, SystemClock
from .errors import InvalidLease, UnknownJob
from .metrics import Counters
from .models import (
    TERMINAL_STATES,
    Attempt,
    CancelResult,
    Job,
    JobState,
    Lease,
    Stats,
)
from .queue import ReadyQueue
from .retry import DEFAULT_RETRY_POLICY, RetryPolicy
from .storage import JobStore

DEFAULT_LEASE_SECONDS = 30.0


def _sequential_ids() -> Callable[[], str]:
    counter = {"n": 0}

    def factory() -> str:
        counter["n"] += 1
        return f"job-{counter['n']:04d}"

    return factory


class Scheduler:
    """Dispatch, acknowledge, retry, cancel and reap."""

    def __init__(
        self,
        *,
        clock: Clock | None = None,
        store: JobStore | None = None,
        queue: ReadyQueue | None = None,
        retry_policy: RetryPolicy | None = None,
        lease_seconds: float = DEFAULT_LEASE_SECONDS,
        id_factory: Callable[[], str] | None = None,
    ) -> None:
        self._clock = clock or SystemClock()
        self._store = store if store is not None else JobStore(self._clock)
        self._queue = queue if queue is not None else ReadyQueue()
        self._retry = retry_policy or DEFAULT_RETRY_POLICY
        self._lease_seconds = float(lease_seconds)
        self._new_id = id_factory or _sequential_ids()
        self._leases: dict[tuple[str, int], Lease] = {}
        self._counters = Counters()

    # ------------------------------------------------------------------
    # accessors
    # ------------------------------------------------------------------
    @property
    def store(self) -> JobStore:
        return self._store

    @property
    def queue(self) -> ReadyQueue:
        return self._queue

    @property
    def clock(self) -> Clock:
        return self._clock

    def counters(self) -> Mapping[str, int]:
        return self._counters.snapshot()

    def leases(self) -> Mapping[tuple[str, int], Lease]:
        return dict(self._leases)

    # ------------------------------------------------------------------
    # lifecycle
    # ------------------------------------------------------------------
    def submit(
        self,
        payload: Mapping[str, object],
        *,
        priority: int = 0,
        max_attempts: int = 3,
    ) -> Job:
        """Accept a new job and make it immediately available."""
        if max_attempts < 1:
            raise ValueError("max_attempts must be >= 1")
        now = self._clock.now()
        job = Job(
            id=self._new_id(),
            payload=dict(payload),
            state=JobState.READY,
            priority=priority,
            max_attempts=max_attempts,
            created_at=now,
            updated_at=now,
            available_at=now,
        )
        self._store.save(job)
        self._queue.push(job.id, job.priority)
        self._counters.inc("submitted")
        self._counters.inc("pending")
        return job.copy()

    def dispatch(self) -> Lease | None:
        """Hand out the next runnable job, or None when nothing is runnable."""
        now = self._clock.now()
        deferred: list[tuple[str, int]] = []
        chosen: Job | None = None

        while True:
            job_id = self._queue.pop()
            if job_id is None:
                break
            try:
                job = self._store.get(job_id)
            except UnknownJob:
                continue
            if job.state is not JobState.READY:
                continue
            if job.available_at > now:
                deferred.append((job.id, job.priority))
                continue
            chosen = job
            break

        for job_id, priority in deferred:
            self._queue.push(job_id, priority)

        if chosen is None:
            return None

        chosen.attempt_epoch += 1
        chosen.state = JobState.RUNNING
        chosen.updated_at = now
        chosen.attempts.append(Attempt(epoch=chosen.attempt_epoch, started_at=now))
        self._store.save(chosen)

        lease = Lease(
            job_id=chosen.id,
            epoch=chosen.attempt_epoch,
            issued_at=now,
            expires_at=now + self._lease_seconds,
        )
        self._leases[(lease.job_id, lease.epoch)] = lease
        self._counters.inc("dispatched")
        return lease

    def ack(self, lease: Lease) -> Job:
        """Mark the attempt behind ``lease`` as successful."""
        job = self._validate_lease(lease)
        now = self._clock.now()
        attempt = job.attempts[-1]
        attempt.finished_at = now
        attempt.error = None
        job.last_error = None
        self._store.update_state(job.id, JobState.SUCCEEDED)
        del self._leases[(lease.job_id, lease.epoch)]
        self._counters.inc("succeeded")
        self._counters.dec("pending")
        return job.copy()

    def nack(self, lease: Lease, *, error: str) -> Job:
        """Record a failed attempt and retry the job when attempts remain."""
        job = self._validate_lease(lease)
        now = self._clock.now()
        attempt = job.attempts[-1]
        attempt.finished_at = now
        attempt.error = error
        job.last_error = error

        if self._retry.should_retry(job.attempts_used, job.max_attempts):
            job.available_at = self._retry.next_available_at(now, job.attempts_used)
            self._store.update_state(job.id, JobState.READY)
            self._queue.push(job.id, job.priority)
            self._counters.inc("retried")
            return job.copy()

        self._store.update_state(job.id, JobState.DEAD_LETTER)
        del self._leases[(lease.job_id, lease.epoch)]
        self._counters.inc("dead_lettered")
        self._counters.dec("pending")
        return job.copy()

    def cancel(self, job_id: str) -> CancelResult:
        """Cancel a job. Safe to call more than once."""
        job = self._store.get(job_id)
        self._counters.dec("pending")
        self._queue.remove(job_id)

        if job.state in TERMINAL_STATES:
            return CancelResult(
                job_id=job_id,
                cancelled=False,
                already_terminal=True,
                state=job.state,
            )

        for key in [k for k in self._leases if k[0] == job_id]:
            del self._leases[key]
        self._store.update_state(job_id, JobState.CANCELLED)
        self._counters.inc("cancelled")
        return CancelResult(
            job_id=job_id,
            cancelled=True,
            already_terminal=False,
            state=JobState.CANCELLED,
        )

    def reap_expired(self) -> list[str]:
        """Return abandoned jobs to the ready queue.

        A worker that never acknowledges its lease must not block the job
        forever. Once the lease has expired the job goes back to the queue.
        """
        now = self._clock.now()
        reaped: list[str] = []
        for key, lease in sorted(self._leases.items()):
            if lease.expires_at > now:
                continue
            try:
                job = self._store.get(lease.job_id)
            except UnknownJob:
                del self._leases[key]
                continue
            job.available_at = now
            self._store.update_state(job.id, JobState.READY)
            self._queue.push(job.id, job.priority)
            del self._leases[key]
            self._counters.inc("reaped")
            reaped.append(job.id)
        return reaped

    # ------------------------------------------------------------------
    # reporting
    # ------------------------------------------------------------------
    def stats(self) -> Stats:
        counts = self._store.counts()
        return Stats(
            pending=counts[JobState.READY],
            running=counts[JobState.RUNNING],
            succeeded=counts[JobState.SUCCEEDED],
            failed=counts[JobState.FAILED],
            cancelled=counts[JobState.CANCELLED],
            dead_letter=counts[JobState.DEAD_LETTER],
            queued=len(self._queue),
            total=len(self._store),
        )

    # ------------------------------------------------------------------
    def _validate_lease(self, lease: Lease) -> Job:
        if not isinstance(lease, Lease):
            raise TypeError("lease must be a Lease")
        job = self._store.get(lease.job_id)
        if job.state is not JobState.RUNNING:
            raise InvalidLease(lease.job_id, f"job is {job.state.value}")
        if job.attempt_epoch != lease.epoch:
            raise InvalidLease(
                lease.job_id,
                f"stale epoch {lease.epoch} (current {job.attempt_epoch})",
            )
        return job
