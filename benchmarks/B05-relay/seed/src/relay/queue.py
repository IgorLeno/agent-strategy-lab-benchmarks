"""The ready queue.

Jobs waiting to be dispatched live here, ordered by ``(-priority, sequence)``:
higher priority first, and within one priority level, first submitted first
served. The queue stores ids only; the job bodies live in the store.
"""

from __future__ import annotations

import heapq
from typing import Iterator

from .errors import QueueFull


class ReadyQueue:
    """A stable priority queue of job ids."""

    __slots__ = ("_heap", "_sequence", "_capacity", "_removed")

    def __init__(self, capacity: int | None = None) -> None:
        self._heap: list[tuple[int, int, str]] = []
        self._sequence = 0
        self._capacity = capacity
        self._removed: set[str] = set()

    def __len__(self) -> int:
        return sum(1 for _, _, job_id in self._heap if job_id not in self._removed)

    def __contains__(self, job_id: object) -> bool:
        if not isinstance(job_id, str):
            return False
        if job_id in self._removed:
            return False
        return any(entry[2] == job_id for entry in self._heap)

    def __iter__(self) -> Iterator[str]:
        return iter(self.snapshot())

    def push(self, job_id: str, priority: int = 0) -> None:
        """Append ``job_id`` to the queue.

        The queue is a transport, not a set: it records what the caller asked
        it to record. Deciding whether a job is allowed to be enqueued is the
        scheduler's job, because only the scheduler knows the job state.
        """
        if self._capacity is not None and len(self) >= self._capacity:
            raise QueueFull(self._capacity)
        self._removed.discard(job_id)
        self._sequence += 1
        heapq.heappush(self._heap, (-priority, self._sequence, job_id))

    def pop(self) -> str | None:
        """Remove and return the next job id, or None when empty."""
        while self._heap:
            _, _, job_id = heapq.heappop(self._heap)
            if job_id in self._removed:
                if not any(entry[2] == job_id for entry in self._heap):
                    self._removed.discard(job_id)
                continue
            return job_id
        return None

    def remove(self, job_id: str) -> bool:
        """Tombstone every pending entry for ``job_id``."""
        if not any(entry[2] == job_id for entry in self._heap):
            return False
        self._removed.add(job_id)
        return True

    def count(self, job_id: str) -> int:
        """How many live entries the queue currently holds for ``job_id``."""
        if job_id in self._removed:
            return 0
        return sum(1 for entry in self._heap if entry[2] == job_id)

    def snapshot(self) -> list[str]:
        """Job ids in dispatch order, without mutating the queue."""
        ordered = sorted(self._heap)
        return [job_id for _, _, job_id in ordered if job_id not in self._removed]

    def clear(self) -> None:
        self._heap.clear()
        self._removed.clear()
