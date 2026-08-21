"""Public entry point of the relay.

``RelayService`` is the only surface external callers are expected to use.
Everything it returns is a detached copy: mutating a returned ``Job`` never
changes stored state.
"""

from __future__ import annotations

from typing import Callable, Mapping

from .clock import Clock, SystemClock
from .models import CancelResult, Job, JobState, Lease, Page, Stats
from .pagination import paginate
from .queue import ReadyQueue
from .retry import RetryPolicy
from .scheduler import DEFAULT_LEASE_SECONDS, Scheduler
from .storage import JobStore

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


class RelayService:
    """Facade over the scheduler, store and queue."""

    def __init__(
        self,
        *,
        clock: Clock | None = None,
        retry_policy: RetryPolicy | None = None,
        lease_seconds: float = DEFAULT_LEASE_SECONDS,
        queue_capacity: int | None = None,
        id_factory: Callable[[], str] | None = None,
    ) -> None:
        self._clock = clock or SystemClock()
        self._scheduler = Scheduler(
            clock=self._clock,
            store=JobStore(self._clock),
            queue=ReadyQueue(queue_capacity),
            retry_policy=retry_policy,
            lease_seconds=lease_seconds,
            id_factory=id_factory,
        )

    # ------------------------------------------------------------------
    @property
    def clock(self) -> Clock:
        return self._clock

    @property
    def scheduler(self) -> Scheduler:
        return self._scheduler

    # ------------------------------------------------------------------
    def submit(
        self,
        payload: Mapping[str, object],
        *,
        priority: int = 0,
        max_attempts: int = 3,
    ) -> Job:
        return self._scheduler.submit(
            payload, priority=priority, max_attempts=max_attempts
        )

    def dispatch(self) -> Lease | None:
        return self._scheduler.dispatch()

    def ack(self, lease: Lease) -> Job:
        return self._scheduler.ack(lease)

    def nack(self, lease: Lease, *, error: str) -> Job:
        return self._scheduler.nack(lease, error=error)

    def cancel(self, job_id: str) -> CancelResult:
        return self._scheduler.cancel(job_id)

    def reap_expired(self) -> list[str]:
        return self._scheduler.reap_expired()

    # ------------------------------------------------------------------
    def get(self, job_id: str) -> Job:
        return self._scheduler.store.get(job_id).copy()

    def list_jobs(
        self,
        *,
        state: JobState | None = None,
        limit: int = DEFAULT_PAGE_SIZE,
        cursor: str | None = None,
        order: str = "asc",
    ) -> Page:
        """Cursor-paginated listing ordered by ``(created_at, id)``."""
        if limit > MAX_PAGE_SIZE:
            raise ValueError(f"limit must be <= {MAX_PAGE_SIZE}")
        descending = order == "desc"
        jobs = self._scheduler.store.ordered(descending=descending)
        if state is not None:
            jobs = [job for job in jobs if job.state is state]
        page = paginate(jobs, limit=limit, cursor=cursor, order=order)
        return Page(
            items=[job.copy() for job in page.items],
            next_cursor=page.next_cursor,
            has_more=page.has_more,
        )

    def stats(self) -> Stats:
        return self._scheduler.stats()

    def counters(self) -> Mapping[str, int]:
        return self._scheduler.counters()
