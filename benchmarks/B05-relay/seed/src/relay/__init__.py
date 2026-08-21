"""RELAY — an in-process job relay.

Submit work, hand it to a worker under a lease, acknowledge or fail it, retry
with backoff, cancel it, and list it with cursor pagination.

The public surface of this package is :class:`~relay.service.RelayService`
plus the value types re-exported here.
"""

from .clock import Clock, ManualClock, SystemClock
from .errors import (
    InvalidCursor,
    InvalidLease,
    InvalidTransition,
    QueueFull,
    RelayError,
    UnknownJob,
)
from .models import (
    LIVE_STATES,
    TERMINAL_STATES,
    Attempt,
    CancelResult,
    Job,
    JobState,
    Lease,
    Page,
    Stats,
)
from .pagination import decode_cursor, encode_cursor
from .retry import DEFAULT_RETRY_POLICY, RetryPolicy
from .service import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, RelayService

__all__ = [
    "Attempt",
    "CancelResult",
    "Clock",
    "DEFAULT_PAGE_SIZE",
    "DEFAULT_RETRY_POLICY",
    "InvalidCursor",
    "InvalidLease",
    "InvalidTransition",
    "Job",
    "JobState",
    "LIVE_STATES",
    "Lease",
    "MAX_PAGE_SIZE",
    "ManualClock",
    "Page",
    "QueueFull",
    "RelayError",
    "RelayService",
    "RetryPolicy",
    "Stats",
    "SystemClock",
    "TERMINAL_STATES",
    "UnknownJob",
    "decode_cursor",
    "encode_cursor",
]

__version__ = "1.4.0"
