"""A tiny read-through cache used by the storage layer.

Aggregate queries (``count_by_state``, ``list_by_state``) are hot: the
scheduler asks for them on every dispatch and every stats call. They are
recomputed from the job table, which is O(n), so the storage layer memoises
them here and drops the memo whenever the job table changes.

The cache is deliberately dumb: one generation counter, one dict. Correctness
comes from the writer calling :meth:`invalidate` on every mutation.
"""

from __future__ import annotations

from typing import Any, Callable, Hashable


class VersionedCache:
    """Memoises values until the owner invalidates the generation."""

    __slots__ = ("_entries", "_generation", "_hits", "_misses")

    def __init__(self) -> None:
        self._entries: dict[Hashable, tuple[int, Any]] = {}
        self._generation = 0
        self._hits = 0
        self._misses = 0

    @property
    def generation(self) -> int:
        return self._generation

    @property
    def hits(self) -> int:
        return self._hits

    @property
    def misses(self) -> int:
        return self._misses

    def get_or_compute(self, key: Hashable, compute: Callable[[], Any]) -> Any:
        entry = self._entries.get(key)
        if entry is not None and entry[0] == self._generation:
            self._hits += 1
            return entry[1]
        self._misses += 1
        value = compute()
        self._entries[key] = (self._generation, value)
        return value

    def invalidate(self) -> int:
        """Drop every memoised value by moving to a new generation."""
        self._generation += 1
        self._entries.clear()
        return self._generation

    def peek(self, key: Hashable) -> Any | None:
        """Return the memoised value for ``key`` without recomputing it."""
        entry = self._entries.get(key)
        if entry is None or entry[0] != self._generation:
            return None
        return entry[1]
