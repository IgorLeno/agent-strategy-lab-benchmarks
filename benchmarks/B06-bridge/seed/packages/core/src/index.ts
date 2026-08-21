/** Public surface of `@bridge/core`. */
export { ConfigError, isConfigError } from './errors.js';
export type { ConfigErrorCode } from './errors.js';
export { DEFAULTS } from './defaults.js';
export { migrateToV2, needsMigration } from './migrate.js';
export { parseConfig, parseConfigText, SUPPORTED_VERSIONS } from './parser.js';
export {
  serializeConfig,
  toCanonicalObject,
  V1_KEY_ORDER,
  V2_KEY_ORDER,
} from './serializer.js';
export {
  BACKOFF_STRATEGIES,
  isConfigV1,
  isConfigV2,
  V1_KNOWN_KEYS,
  V2_KNOWN_KEYS,
} from './types.js';
export type {
  AnyConfig,
  BackoffStrategy,
  CacheV2,
  ConfigV1,
  ConfigV2,
  DeliveryV2,
  ExecutionV2,
  RetryV2,
} from './types.js';
