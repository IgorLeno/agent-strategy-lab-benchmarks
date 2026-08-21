import unittest

from support import build_service  # noqa: F401  (keeps sys.path setup in one place)

from relay.errors import QueueFull
from relay.queue import ReadyQueue


class ReadyQueueTest(unittest.TestCase):
    def test_fifo_within_one_priority(self):
        queue = ReadyQueue()
        for job_id in ("a", "b", "c"):
            queue.push(job_id)
        self.assertEqual([queue.pop(), queue.pop(), queue.pop()], ["a", "b", "c"])
        self.assertIsNone(queue.pop())

    def test_higher_priority_first(self):
        queue = ReadyQueue()
        queue.push("low", 0)
        queue.push("high", 10)
        queue.push("mid", 5)
        self.assertEqual(queue.snapshot(), ["high", "mid", "low"])

    def test_remove_tombstones_entry(self):
        queue = ReadyQueue()
        queue.push("a")
        queue.push("b")
        self.assertTrue(queue.remove("a"))
        self.assertFalse(queue.remove("zzz"))
        self.assertEqual(queue.pop(), "b")

    def test_capacity(self):
        queue = ReadyQueue(capacity=1)
        queue.push("a")
        with self.assertRaises(QueueFull):
            queue.push("b")

    def test_contains_and_len(self):
        queue = ReadyQueue()
        queue.push("a")
        self.assertIn("a", queue)
        self.assertNotIn("b", queue)
        self.assertEqual(len(queue), 1)


if __name__ == "__main__":
    unittest.main()
