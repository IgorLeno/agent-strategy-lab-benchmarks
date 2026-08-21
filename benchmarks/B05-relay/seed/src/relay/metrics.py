"""Process-local counters.

These are diagnostics, not the source of truth: ``RelayService.stats`` reads
state from the store. The counters exist so an operator can see how many
cancellations or retries actually happened over the life of the process.
"""

from __future__ import annotations

from typing import Mapping


class Counters:
    """A flat bag of named integer counters."""

    __slots__ = ("_values",)

    def __init__(self) -> None:
        self._values: dict[str, int] = {}

    def inc(self, name: str, amount: int = 1) -> int:
        self._values[name] = self._values.get(name, 0) + amount
        return self._values[name]

    def dec(self, name: str, amount: int = 1) -> int:
        self._values[name] = self._values.get(name, 0) - amount
        return self._values[name]

    def get(self, name: str) -> int:
        return self._values.get(name, 0)

    def snapshot(self) -> Mapping[str, int]:
        return dict(sorted(self._values.items()))

    def reset(self) -> None:
        self._values.clear()
