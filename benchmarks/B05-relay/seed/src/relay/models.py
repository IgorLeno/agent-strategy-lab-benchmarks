"""Core value types of the relay.

Everything in this module is data: no I/O, no clock access, no queue
manipulation. The scheduler and the storage layer own behaviour; these types
own shape.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from enum import Enum
from typing import Any, Mapping, Sequence


class JobState(str, Enum):
    """Lifecycle of a job.

    ``READY`` and ``RUNNING`` are live states; ``SUCCEEDED``, ``FAILED``,
    ``CANCELLED`` and ``DEAD_LETTER`` are terminal.
    """

    READY = "ready"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    DEAD_LETTER = "dead_letter"

    def __str__(self) -> str:
        return self.value


LIVE_STATES: frozenset[JobState] = frozenset({JobState.READY, JobState.RUNNING})

TERMINAL_STATES: frozenset[JobState] = frozenset(
    {
        JobState.SUCCEEDED,
        JobState.FAILED,
        JobState.CANCELLED,
        JobState.DEAD_LETTER,
    }
)


@dataclass
class Attempt:
    """One execution attempt of a job."""

    epoch: int
    started_at: float
    finished_at: float | None = None
    error: str | None = None

    @property
    def succeeded(self) -> bool:
        return self.finished_at is not None and self.error is None

    def to_dict(self) -> dict[str, Any]:
        return {
            "epoch": self.epoch,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "error": self.error,
        }


@dataclass
class Job:
    """A unit of work handed to the relay.

    ``attempt_epoch`` counts how many times the job has been handed out. It is
    the identity of the current attempt: a lease issued for epoch *n* stops
    being valid the moment the job moves to epoch *n + 1*.
    """

    id: str
    payload: Mapping[str, Any]
    state: JobState = JobState.READY
    priority: int = 0
    max_attempts: int = 3
    attempt_epoch: int = 0
    attempts: list[Attempt] = field(default_factory=list)
    created_at: float = 0.0
    updated_at: float = 0.0
    available_at: float = 0.0
    last_error: str | None = None

    @property
    def attempts_used(self) -> int:
        return len(self.attempts)

    @property
    def is_terminal(self) -> bool:
        return self.state in TERMINAL_STATES

    def copy(self) -> "Job":
        """Detached copy. Mutating the copy never touches the store."""
        return replace(
            self,
            payload=dict(self.payload),
            attempts=[replace(a) for a in self.attempts],
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "payload": dict(self.payload),
            "state": self.state.value,
            "priority": self.priority,
            "max_attempts": self.max_attempts,
            "attempt_epoch": self.attempt_epoch,
            "attempts": [a.to_dict() for a in self.attempts],
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "available_at": self.available_at,
            "last_error": self.last_error,
        }


@dataclass(frozen=True)
class Lease:
    """Proof that the holder is the current executor of a job.

    A lease is only usable while ``epoch`` matches the job's ``attempt_epoch``
    and the job is still ``RUNNING``.
    """

    job_id: str
    epoch: int
    issued_at: float
    expires_at: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "job_id": self.job_id,
            "epoch": self.epoch,
            "issued_at": self.issued_at,
            "expires_at": self.expires_at,
        }


@dataclass(frozen=True)
class CancelResult:
    """Outcome of ``cancel``.

    ``cancelled`` is True only for the call that performed the transition.
    Later calls on the same job report ``already_terminal``.
    """

    job_id: str
    cancelled: bool
    already_terminal: bool
    state: JobState

    def to_dict(self) -> dict[str, Any]:
        return {
            "job_id": self.job_id,
            "cancelled": self.cancelled,
            "already_terminal": self.already_terminal,
            "state": self.state.value,
        }


@dataclass(frozen=True)
class Page:
    """One page of a cursor-paginated listing."""

    items: Sequence[Job]
    next_cursor: str | None
    has_more: bool

    def __len__(self) -> int:
        return len(self.items)

    def __iter__(self):
        return iter(self.items)

    def ids(self) -> list[str]:
        return [job.id for job in self.items]

    def to_dict(self) -> dict[str, Any]:
        return {
            "items": [job.to_dict() for job in self.items],
            "next_cursor": self.next_cursor,
            "has_more": self.has_more,
        }


@dataclass(frozen=True)
class Stats:
    """Point-in-time snapshot of the relay."""

    pending: int
    running: int
    succeeded: int
    failed: int
    cancelled: int
    dead_letter: int
    queued: int
    total: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "pending": self.pending,
            "running": self.running,
            "succeeded": self.succeeded,
            "failed": self.failed,
            "cancelled": self.cancelled,
            "dead_letter": self.dead_letter,
            "queued": self.queued,
            "total": self.total,
        }
