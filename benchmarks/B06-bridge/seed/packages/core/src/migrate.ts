/**
 * Migration between contract versions.
 *
 * `migrateToV2` is the single definition of what V1 means in V2 terms. Every
 * other layer — API, client, CLI — must go through it rather than reimplement
 * the mapping.
 */
import { ConfigError } from './errors.js';
import type { AnyConfig, ConfigV2 } from './types.js';

/** Migrate any supported config to V2. Must be idempotent for V2 input. */
export function migrateToV2(_config: AnyConfig): ConfigV2 {
  throw new ConfigError(
    'E_UNSUPPORTED_VERSION',
    'migration to version 2 is not implemented yet',
  );
}

/** True when the document would be changed by `migrateToV2`. */
export function needsMigration(config: AnyConfig): boolean {
  return config.version !== 2;
}
