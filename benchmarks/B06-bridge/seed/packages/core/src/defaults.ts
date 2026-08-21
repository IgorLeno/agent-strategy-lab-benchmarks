/**
 * Values the migration fills in when V1 left a field out.
 *
 * These are part of the frozen contract: a V1 document without `timeout`
 * migrates to exactly `DEFAULTS.timeout_seconds`, not to "whatever the runtime
 * happens to use".
 */
import type { BackoffStrategy } from './types.js';

export const DEFAULTS = {
  timeout_seconds: 60,
  concurrency: 1,
  max_attempts: 0,
  backoff_when_retrying: 'exponential' as BackoffStrategy,
  backoff_without_retries: 'none' as BackoffStrategy,
  cache_ttl_seconds_when_enabled: 300,
  cache_ttl_seconds_when_disabled: 0,
} as const;
