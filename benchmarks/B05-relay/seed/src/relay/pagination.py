"""Cursor pagination over the job store.

Listings are ordered by ``(created_at, id)``. ``created_at`` alone is not a
total order: jobs submitted in the same tick share a timestamp, so the id is
the tiebreaker that makes the sequence stable.

A cursor is an opaque, URL-safe token. It carries the position of the last
item that was returned, plus the ordering it was produced under, so a caller
cannot silently flip direction halfway through a scan.
"""

from __future__ import annotations

import base64
import binascii
import json
from dataclasses import dataclass
from typing import Sequence

from .errors import InvalidCursor
from .models import Job, Page

CURSOR_VERSION = 1


@dataclass(frozen=True)
class Cursor:
    """Decoded pagination position."""

    created_at: float
    job_id: str
    order: str

    def to_dict(self) -> dict:
        return {
            "v": CURSOR_VERSION,
            "k": self.created_at,
            "id": self.job_id,
            "o": self.order,
        }


def encode_cursor(job: Job, order: str) -> str:
    """Build the token that resumes a scan just after ``job``."""
    cursor = Cursor(created_at=job.created_at, job_id=job.id, order=order)
    raw = json.dumps(cursor.to_dict(), separators=(",", ":"), sort_keys=True)
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii").rstrip("=")


def decode_cursor(token: str) -> Cursor:
    """Parse a token produced by :func:`encode_cursor`."""
    if not isinstance(token, str) or not token:
        raise InvalidCursor(token)
    padded = token + "=" * (-len(token) % 4)
    try:
        raw = base64.urlsafe_b64decode(padded.encode("ascii"))
        payload = json.loads(raw.decode("utf-8"))
    except (binascii.Error, UnicodeDecodeError, ValueError):
        raise InvalidCursor(token) from None
    if not isinstance(payload, dict) or payload.get("v") != CURSOR_VERSION:
        raise InvalidCursor(token)
    try:
        created_at = float(payload["k"])
        job_id = str(payload["id"])
        order = str(payload["o"])
    except (KeyError, TypeError, ValueError):
        raise InvalidCursor(token) from None
    if order not in ("asc", "desc"):
        raise InvalidCursor(token)
    return Cursor(created_at=created_at, job_id=job_id, order=order)


def _after_cursor(job: Job, cursor: Cursor, descending: bool) -> bool:
    """True when ``job`` comes strictly after ``cursor`` in the scan order."""
    if descending:
        return job.created_at < cursor.created_at
    return job.created_at > cursor.created_at


def paginate(
    jobs: Sequence[Job],
    *,
    limit: int,
    cursor: str | None = None,
    order: str = "asc",
) -> Page:
    """Return one page of ``jobs``.

    ``jobs`` must already be sorted in ``order``. The caller owns filtering by
    state; this function owns the window.
    """
    if order not in ("asc", "desc"):
        raise ValueError("order must be 'asc' or 'desc'")
    if limit <= 0:
        raise ValueError("limit must be >= 1")

    descending = order == "desc"
    window = list(jobs)

    if cursor is not None:
        decoded = decode_cursor(cursor)
        if decoded.order != order:
            raise InvalidCursor(cursor)
        window = [job for job in window if _after_cursor(job, decoded, descending)]

    items = window[:limit]
    has_more = len(window) > limit
    next_cursor = encode_cursor(items[-1], order) if items and has_more else None
    return Page(items=items, next_cursor=next_cursor, has_more=has_more)
