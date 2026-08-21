"""Retry policy.

Backoff is deterministic: no jitter, no randomness. Two runs of the same
scenario produce the same ``available_at`` values.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RetryPolicy:
    """Exponential backoff capped at ``max_delay``."""

    base_delay: float = 1.0
    factor: float = 2.0
    max_delay: float = 60.0

    def __post_init__(self) -> None:
        if self.base_delay < 0:
            raise ValueError("base_delay must be >= 0")
        if self.factor < 1:
            raise ValueError("factor must be >= 1")
        if self.max_delay < self.base_delay:
            raise ValueError("max_delay must be >= base_delay")

    def should_retry(self, attempts_used: int, max_attempts: int) -> bool:
        """True while the job still has an attempt left after this failure."""
        return attempts_used < max_attempts

    def delay_for(self, attempts_used: int) -> float:
        """Backoff applied before the job becomes available again."""
        if attempts_used <= 0:
            return self.base_delay
        delay = self.base_delay * (self.factor ** (attempts_used - 1))
        return min(delay, self.max_delay)

    def next_available_at(self, now: float, attempts_used: int) -> float:
        return now + self.delay_for(attempts_used)


DEFAULT_RETRY_POLICY = RetryPolicy()
