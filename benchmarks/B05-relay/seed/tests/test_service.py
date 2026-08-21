import unittest

from support import build_service

from relay.models import JobState


class ServiceSurfaceTest(unittest.TestCase):
    def test_get_returns_a_detached_copy(self):
        service, _ = build_service()
        job = service.submit({"n": 1})
        copy = service.get(job.id)
        copy.priority = 99
        self.assertEqual(service.get(job.id).priority, 0)

    def test_list_filters_by_state(self):
        service, clock = build_service()
        first = service.submit({"n": 1})
        clock.advance(1.0)
        second = service.submit({"n": 2})
        service.dispatch()

        ready = service.list_jobs(state=JobState.READY, limit=10)
        running = service.list_jobs(state=JobState.RUNNING, limit=10)
        self.assertEqual(ready.ids(), [second.id])
        self.assertEqual(running.ids(), [first.id])

    def test_counters_after_submit(self):
        service, _ = build_service()
        service.submit({"n": 1})
        service.submit({"n": 2})
        counters = service.counters()
        self.assertEqual(counters["submitted"], 2)
        self.assertEqual(counters["pending"], 2)
        self.assertEqual(counters["pending"], service.stats().pending)

    def test_stats_totals(self):
        service, clock = build_service()
        for n in range(3):
            service.submit({"n": n})
            clock.advance(1.0)
        stats = service.stats()
        self.assertEqual(stats.total, 3)
        self.assertEqual(stats.pending, 3)
        self.assertEqual(stats.queued, 3)

    def test_payload_is_copied_on_submit(self):
        service, _ = build_service()
        payload = {"n": 1}
        job = service.submit(payload)
        payload["n"] = 2
        self.assertEqual(service.get(job.id).payload["n"], 1)


if __name__ == "__main__":
    unittest.main()
