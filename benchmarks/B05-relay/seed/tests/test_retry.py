import unittest

from support import build_service  # noqa: F401

from relay.retry import RetryPolicy


class RetryPolicyTest(unittest.TestCase):
    def test_exponential_backoff_is_capped(self):
        policy = RetryPolicy(base_delay=1.0, factor=2.0, max_delay=8.0)
        self.assertEqual(
            [policy.delay_for(n) for n in range(1, 7)],
            [1.0, 2.0, 4.0, 8.0, 8.0, 8.0],
        )

    def test_should_retry_respects_max_attempts(self):
        policy = RetryPolicy()
        self.assertTrue(policy.should_retry(attempts_used=1, max_attempts=3))
        self.assertTrue(policy.should_retry(attempts_used=2, max_attempts=3))
        self.assertFalse(policy.should_retry(attempts_used=3, max_attempts=3))

    def test_next_available_at(self):
        policy = RetryPolicy(base_delay=2.0, factor=2.0)
        self.assertEqual(policy.next_available_at(100.0, 1), 102.0)
        self.assertEqual(policy.next_available_at(100.0, 2), 104.0)

    def test_invalid_configuration(self):
        with self.assertRaises(ValueError):
            RetryPolicy(factor=0.5)
        with self.assertRaises(ValueError):
            RetryPolicy(base_delay=10.0, max_delay=1.0)


if __name__ == "__main__":
    unittest.main()
