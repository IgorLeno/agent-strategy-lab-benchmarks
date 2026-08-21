import unittest

from support import build_service

from relay.errors import InvalidCursor
from relay.pagination import decode_cursor, encode_cursor


class CursorTest(unittest.TestCase):
    def test_round_trip(self):
        service, clock = build_service()
        job = service.submit({"n": 1})
        token = encode_cursor(job, "asc")
        cursor = decode_cursor(token)
        self.assertEqual(cursor.job_id, job.id)
        self.assertEqual(cursor.created_at, job.created_at)
        self.assertEqual(cursor.order, "asc")

    def test_rejects_garbage(self):
        for token in ("", "!!!", "YWJj"):
            with self.assertRaises(InvalidCursor):
                decode_cursor(token)


class PaginationTest(unittest.TestCase):
    def test_walks_every_job_when_timestamps_are_distinct(self):
        service, clock = build_service()
        expected = []
        for n in range(7):
            expected.append(service.submit({"n": n}).id)
            clock.advance(1.0)

        seen, cursor = [], None
        while True:
            page = service.list_jobs(limit=2, cursor=cursor, order="asc")
            seen.extend(page.ids())
            cursor = page.next_cursor
            if cursor is None:
                break
        self.assertEqual(seen, expected)

    def test_descending_order_is_the_reverse(self):
        service, clock = build_service()
        expected = []
        for n in range(5):
            expected.append(service.submit({"n": n}).id)
            clock.advance(1.0)

        page = service.list_jobs(limit=5, order="desc")
        self.assertEqual(page.ids(), list(reversed(expected)))
        self.assertFalse(page.has_more)
        self.assertIsNone(page.next_cursor)

    def test_limit_bounds(self):
        service, _ = build_service()
        service.submit({"n": 1})
        with self.assertRaises(ValueError):
            service.list_jobs(limit=0)
        with self.assertRaises(ValueError):
            service.list_jobs(limit=1000)


if __name__ == "__main__":
    unittest.main()
