"""Time sources.

The relay never calls ``time.time()`` directly. Every component receives a
clock, which makes retry backoff, lease expiry and ordering reproducible in
tests and in the external validator.
"""

from __future__ import annotations

import time
from typing import Protocol


class Clock(Protocol):
    """Monotonic-enough source of epoch seconds."""

    def now(self) -> float:  # pragma: no cover - protocol definition
        ...


class SystemClock:
    """Wall-clock time. Used in production wiring."""

    __slots__ = ()

    def now(self) -> float:
        return time.time()


class ManualClock:
    """Deterministic clock driven by the caller.

    ``ManualClock`` never moves on its own. Tests advance it explicitly, so a
    scenario that depends on a lease expiring is reproducible byte for byte.
    """

    __slots__ = ("_now",)

    def __init__(self, start: float = 0.0) -> None:
        self._now = float(start)

    def now(self) -> float:
        return self._now

    def advance(self, seconds: float) -> float:
        if seconds < 0:
            raise ValueError("cannot move a ManualClock backwards")
        self._now += float(seconds)
        return self._now

    def set(self, value: float) -> float:
        if value < self._now:
            raise ValueError("cannot move a ManualClock backwards")
        self._now = float(value)
        return self._now
