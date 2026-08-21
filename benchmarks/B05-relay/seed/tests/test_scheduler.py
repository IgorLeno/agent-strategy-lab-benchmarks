import unittest

from support import build_service

from relay.errors import InvalidLease, UnknownJob
from relay.models import JobState


class DispatchTest(unittest.TestCase):
    def test_submit_then_dispatch(self):
        service, _ = build_service()
        job = service.submit({"kind": "resize"})
        self.assertEqual(job.state, JobState.READY)
        self.assertEqual(service.stats().pending, 1)

        lease = service.dispatch()
        self.assertIsNotNone(lease)
        self.assertEqual(lease.job_id, job.id)
        self.assertEqual(lease.epoch, 1)
        self.assertEqual(service.get(job.id).state, JobState.RUNNING)
        self.assertEqual(service.stats().running, 1)

    def test_dispatch_on_empty_queue(self):
        service, _ = build_service()
        self.assertIsNone(service.dispatch())

    def test_priority_order(self):
        service, _ = build_service()
        service.submit({"n": 1}, priority=0)
        high = service.submit({"n": 2}, priority=10)
        lease = service.dispatch()
        self.assertEqual(lease.job_id, high.id)

    def test_ack_marks_success(self):
        service, _ = build_service()
        job = service.submit({"n": 1})
        lease = service.dispatch()
        acked = service.ack(lease)
        self.assertEqual(acked.state, JobState.SUCCEEDED)
        self.assertEqual(service.get(job.id).state, JobState.SUCCEEDED)
        self.assertTrue(acked.attempts[-1].succeeded)

    def test_ack_twice_is_rejected(self):
        service, _ = build_service()
        service.submit({"n": 1})
        lease = service.dispatch()
        service.ack(lease)
        with self.assertRaises(InvalidLease):
            service.ack(lease)

    def test_nack_retries_with_backoff(self):
        service, clock = build_service()
        job = service.submit({"n": 1}, max_attempts=3)
        lease = service.dispatch()
        clock.advance(1.0)
        retried = service.nack(lease, error="boom")

        self.assertEqual(retried.state, JobState.READY)
        self.assertEqual(retried.last_error, "boom")
        self.assertEqual(retried.available_at, clock.now() + 1.0)
        self.assertIsNone(service.dispatch(), "backoff has not elapsed yet")

        clock.advance(1.0)
        again = service.dispatch()
        self.assertIsNotNone(again)
        self.assertEqual(again.job_id, job.id)
        self.assertEqual(again.epoch, 2)

    def test_dead_letter_after_max_attempts(self):
        service, clock = build_service()
        job = service.submit({"n": 1}, max_attempts=2)
        for _ in range(2):
            lease = service.dispatch()
            self.assertIsNotNone(lease)
            service.nack(lease, error="boom")
            clock.advance(60.0)
        self.assertEqual(service.get(job.id).state, JobState.DEAD_LETTER)
        self.assertIsNone(service.dispatch())

    def test_stale_lease_is_rejected(self):
        service, clock = build_service()
        service.submit({"n": 1})
        first = service.dispatch()
        service.nack(first, error="boom")
        clock.advance(5.0)
        second = service.dispatch()
        self.assertEqual(second.epoch, 2)
        with self.assertRaises(InvalidLease):
            service.ack(first)

    def test_unknown_job(self):
        service, _ = build_service()
        with self.assertRaises(UnknownJob):
            service.get("job-9999")
        with self.assertRaises(UnknownJob):
            service.cancel("job-9999")


class ReapTest(unittest.TestCase):
    def test_expired_lease_returns_the_job_to_the_queue(self):
        service, clock = build_service(lease_seconds=30.0)
        job = service.submit({"n": 1})
        service.dispatch()
        self.assertEqual(service.reap_expired(), [])

        clock.advance(31.0)
        self.assertEqual(service.reap_expired(), [job.id])
        self.assertEqual(service.get(job.id).state, JobState.READY)

        again = service.dispatch()
        self.assertIsNotNone(again)
        self.assertEqual(again.job_id, job.id)


class CancelTest(unittest.TestCase):
    def test_cancel_a_ready_job(self):
        service, _ = build_service()
        job = service.submit({"n": 1})
        result = service.cancel(job.id)
        self.assertTrue(result.cancelled)
        self.assertFalse(result.already_terminal)
        self.assertEqual(service.get(job.id).state, JobState.CANCELLED)
        self.assertIsNone(service.dispatch())

    def test_cancel_reports_already_terminal(self):
        service, _ = build_service()
        job = service.submit({"n": 1})
        service.cancel(job.id)
        second = service.cancel(job.id)
        self.assertFalse(second.cancelled)
        self.assertTrue(second.already_terminal)
        self.assertEqual(second.state, JobState.CANCELLED)


if __name__ == "__main__":
    unittest.main()
