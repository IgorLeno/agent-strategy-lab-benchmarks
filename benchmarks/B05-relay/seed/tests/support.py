"""Shared helpers for the RELAY test suite."""

from __future__ import annotations

import os
import sys

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)

from relay import ManualClock, RelayService  # noqa: E402


def build_service(start: float = 1_000_000.0, **kwargs) -> tuple[RelayService, ManualClock]:
    """A service on a deterministic clock, with sequential job ids."""
    clock = ManualClock(start)
    return RelayService(clock=clock, **kwargs), clock
