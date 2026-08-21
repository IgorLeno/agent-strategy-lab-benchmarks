"""Error types raised by the relay package.

Every public failure mode has a dedicated exception so callers can react
without string matching on messages.
"""

from __future__ import annotations


class RelayError(Exception):
    """Base class for every error raised by this package."""


class UnknownJob(RelayError):
    """Raised when a job id is not present in the store."""

    def __init__(self, job_id: str) -> None:
        super().__init__(f"unknown job: {job_id}")
        self.job_id = job_id


class InvalidLease(RelayError):
    """Raised when a lease does not match the current attempt of a job.

    A lease becomes invalid when the job moved on: it was acknowledged,
    cancelled, retried, or reaped after its lease expired.
    """

    def __init__(self, job_id: str, reason: str) -> None:
        super().__init__(f"invalid lease for job {job_id}: {reason}")
        self.job_id = job_id
        self.reason = reason


class InvalidCursor(RelayError):
    """Raised when a pagination cursor cannot be decoded."""

    def __init__(self, raw: str) -> None:
        super().__init__(f"invalid cursor: {raw!r}")
        self.raw = raw


class InvalidTransition(RelayError):
    """Raised when a job is asked to move to a state it cannot reach."""

    def __init__(self, job_id: str, current: str, requested: str) -> None:
        super().__init__(
            f"job {job_id} cannot move from {current} to {requested}"
        )
        self.job_id = job_id
        self.current = current
        self.requested = requested


class QueueFull(RelayError):
    """Raised when a bounded ready queue cannot accept another job."""

    def __init__(self, capacity: int) -> None:
        super().__init__(f"ready queue is full (capacity={capacity})")
        self.capacity = capacity
