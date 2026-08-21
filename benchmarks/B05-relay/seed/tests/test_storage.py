import unittest

from support import build_service

from relay.clock import ManualClock
from relay.errors import UnknownJob
from relay.models import Job, JobState
from relay.storage import JobStore


def make_job(job_id: str, created_at: float = 0.0, state=JobState.READY) -> Job:
    return Job(
        id=job_id,
        payload={"id": job_id},
        state=state,
        created_at=created_at,
        updated_at=created_at,
        available_at=created_at,
    )


class JobStoreTest(unittest.TestCase):
    def setUp(self):
        self.clock = ManualClock(100.0)
        self.store = JobStore(self.clock)

    def test_save_and_get(self):
        job = make_job("a")
        self.store.save(job)
        self.assertIs(self.store.get("a"), job)
        self.assertTrue(self.store.has("a"))
        self.assertEqual(len(self.store), 1)

    def test_unknown_job(self):
        with self.assertRaises(UnknownJob):
            self.store.get("nope")
        with self.assertRaises(UnknownJob):
            self.store.delete("nope")

    def test_ordered_uses_created_at_then_id(self):
        self.store.save(make_job("b", created_at=1.0))
        self.store.save(make_job("a", created_at=1.0))
        self.store.save(make_job("c", created_at=0.0))
        self.assertEqual([j.id for j in self.store.ordered()], ["c", "a", "b"])
        self.assertEqual(
            [j.id for j in self.store.ordered(descending=True)], ["b", "a", "c"]
        )

    def test_save_invalidates_the_aggregate_cache(self):
        self.store.save(make_job("a"))
        self.assertEqual(self.store.count_by_state(JobState.READY), 1)
        self.store.save(make_job("b"))
        self.assertEqual(self.store.count_by_state(JobState.READY), 2)

    def test_cache_serves_repeated_reads(self):
        self.store.save(make_job("a"))
        generation = self.store.cache_generation
        self.store.count_by_state(JobState.READY)
        hits_before = self.store.cache_hits
        self.store.count_by_state(JobState.READY)
        self.assertEqual(self.store.cache_hits, hits_before + 1)
        self.assertEqual(self.store.cache_generation, generation)

    def test_touch_updates_fields(self):
        self.store.save(make_job("a"))
        self.clock.advance(5.0)
        job = self.store.touch("a", priority=7)
        self.assertEqual(job.priority, 7)
        self.assertEqual(job.updated_at, 105.0)
        with self.assertRaises(AttributeError):
            self.store.touch("a", nonsense=1)


if __name__ == "__main__":
    unittest.main()
