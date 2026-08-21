/**
 * The BRIDGE configuration contract.
 *
 * Two versions are in the wild. V1 is flat and is what every deployed caller
 * writes today. V2 groups the execution knobs, names the units, and has an
 * explicit home for fields this package does not know about.
 */

/** Backoff strategies accepted by V2. */
export type BackoffStrategy = 'none' | 'linear' | 'exponential';

export const BACKOFF_STRATEGIES: readonly BackoffStrategy[] = ['none', 'linear', 'exponential'];

/** Fields V1 defines. Anything else at the top level is an extension. */
export interface ConfigV1 {
  version: 1;
  name: string;
  timeout?: number;
  retries?: number;
  concurrency?: number;
  notify?: string[];
  cache?: boolean;
  env?: Record<string, string>;
  [key: string]: unknown;
}

export interface RetryV2 {
  max_attempts: number;
  backoff: BackoffStrategy;
}

export interface ExecutionV2 {
  timeout_seconds: number;
  concurrency: number;
  retry: RetryV2;
}

export interface DeliveryV2 {
  notify: string[];
}

export interface CacheV2 {
  enabled: boolean;
  ttl_seconds: number;
}

export interface ConfigV2 {
  version: 2;
  name: string;
  execution: ExecutionV2;
  delivery: DeliveryV2;
  cache: CacheV2;
  env: Record<string, string>;
  extensions: Record<string, unknown>;
}

export type AnyConfig = ConfigV1 | ConfigV2;

/** Top-level keys V1 owns. Everything else is carried into `extensions`. */
export const V1_KNOWN_KEYS: readonly string[] = [
  'version',
  'name',
  'timeout',
  'retries',
  'concurrency',
  'notify',
  'cache',
  'env',
];

/** Top-level keys V2 owns. */
export const V2_KNOWN_KEYS: readonly string[] = [
  'version',
  'name',
  'execution',
  'delivery',
  'cache',
  'env',
  'extensions',
];

export function isConfigV1(config: AnyConfig): config is ConfigV1 {
  return config.version === 1;
}

export function isConfigV2(config: AnyConfig): config is ConfigV2 {
  return config.version === 2;
}
