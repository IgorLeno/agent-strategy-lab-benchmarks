"""In-memory job store.

The store owns the job table and every derived view of it. Derived views are
memoised in a :class:`~relay.cache.VersionedCache` because the scheduler reads
them far more often than the table changes.

Contract for writers: any code path that changes a job in a way an aggregate
can observe must leave the cache invalidated before it returns.
"""

from __future__ import annotations

from typing import Iterable, Iterator, Mapping

from .cache import VersionedCache
from .errors import UnknownJob
from .models import Job, JobState


class JobStore:
    """Dictionary-backed store with memoised aggregates."""

    __slots__ = ("_jobs", "_cache", "_clock")

    def __init__(self, clock) -> None:
        self._jobs: dict[str, Job] = {}
        self._cache = VersionedCache()
        self._clock = clock

    # ------------------------------------------------------------------
    # writes
    # ------------------------------------------------------------------
    def save(self, job: Job) -> Job:
        """Insert or replace a whole job record."""
        self._jobs[job.id] = job
        self._cache.invalidate()
        return job

    def update_state(self, job_id: str, state: JobState) -> Job:
        """Move an existing job to ``state``.

        This is the hot path: the scheduler calls it on every dispatch, ack,
        nack, cancel and reap. It updates the record in place instead of
        rebuilding it.
        """
        job = self._require(job_id)
        job.state = state
        job.updated_at = self._clock.now()
        return job

    def touch(self, job_id: str, **fields) -> Job:
        """Update arbitrary scalar fields of a job."""
        job = self._require(job_id)
        for key, value in fields.items():
            if not hasattr(job, key):
                raise AttributeError(f"Job has no field {key!r}")
            setattr(job, key, value)
        job.updated_at = self._clock.now()
        self._cache.invalidate()
        return job

    def delete(self, job_id: str) -> None:
        if self._jobs.pop(job_id, None) is None:
            raise UnknownJob(job_id)
        self._cache.invalidate()

    # ------------------------------------------------------------------
    # reads
    # ------------------------------------------------------------------
    def get(self, job_id: str) -> Job:
        return self._require(job_id)

    def has(self, job_id: str) -> bool:
        return job_id in self._jobs

    def __len__(self) -> int:
        return len(self._jobs)

    def __iter__(self) -> Iterator[Job]:
        return iter(self._jobs.values())

    def all(self) -> list[Job]:
        return list(self._jobs.values())

    def ordered(self, *, descending: bool = False) -> list[Job]:
        """Every job ordered by ``(created_at, id)``.

        The tuple is the total order of the store: ``created_at`` alone is not
        unique, since jobs submitted in the same tick share a timestamp.
        """
        key = lambda job: (job.created_at, job.id)  # noqa: E731
        return sorted(self._jobs.values(), key=key, reverse=descending)

    def list_by_state(self, state: JobState) -> list[Job]:
        return self._cache.get_or_compute(
            ("list_by_state", state),
            lambda: [job for job in self._jobs.values() if job.state is state],
        )

    def count_by_state(self, state: JobState) -> int:
        return self._cache.get_or_compute(
            ("count_by_state", state),
            lambda: sum(1 for job in self._jobs.values() if job.state is state),
        )

    def counts(self) -> Mapping[JobState, int]:
        return {state: self.count_by_state(state) for state in JobState}

    def select(self, predicate) -> Iterable[Job]:
        return (job for job in self._jobs.values() if predicate(job))

    # ------------------------------------------------------------------
    # diagnostics
    # ------------------------------------------------------------------
    @property
    def cache_generation(self) -> int:
        return self._cache.generation

    @property
    def cache_hits(self) -> int:
        return self._cache.hits

    @property
    def cache_misses(self) -> int:
        return self._cache.misses

    def invalidate_cache(self) -> int:
        return self._cache.invalidate()

    # ------------------------------------------------------------------
    def _require(self, job_id: str) -> Job:
        job = self._jobs.get(job_id)
        if job is None:
            raise UnknownJob(job_id)
        return job
