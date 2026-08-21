/**
 * Parsing: untrusted JSON in, a typed config out.
 *
 * The parser is the only place that decides whether a document is acceptable.
 * Every other layer receives an already-valid `ConfigV1` or `ConfigV2`.
 */
import { ConfigError } from './errors.js';
import type { AnyConfig, ConfigV1 } from './types.js';
import { V1_KNOWN_KEYS } from './types.js';
import {
  isPlainObject,
  requireBoolean,
  requireInteger,
  requireNonEmptyString,
  requireStringArray,
  requireStringMap,
} from './validate.js';

export const SUPPORTED_VERSIONS: readonly number[] = [1, 2];

function parseV1(raw: Record<string, unknown>): ConfigV1 {
  const config: ConfigV1 = {
    version: 1,
    name: requireNonEmptyString(raw['name'], 'name'),
  };

  if (raw['timeout'] !== undefined) {
    config.timeout = requireInteger(raw['timeout'], 'timeout', { min: 1 });
  }
  if (raw['retries'] !== undefined) {
    config.retries = requireInteger(raw['retries'], 'retries', { min: 0 });
  }
  if (raw['concurrency'] !== undefined) {
    config.concurrency = requireInteger(raw['concurrency'], 'concurrency', { min: 1 });
  }
  if (raw['notify'] !== undefined) {
    config.notify = requireStringArray(raw['notify'], 'notify');
  }
  if (raw['cache'] !== undefined) {
    config.cache = requireBoolean(raw['cache'], 'cache');
  }
  if (raw['env'] !== undefined) {
    config.env = requireStringMap(raw['env'], 'env');
  }

  for (const [key, value] of Object.entries(raw)) {
    if (!V1_KNOWN_KEYS.includes(key)) {
      config[key] = value;
    }
  }

  return config;
}

/** Parse an already-decoded JSON value. */
export function parseConfig(raw: unknown): AnyConfig {
  if (!isPlainObject(raw)) {
    throw ConfigError.notObject();
  }
  if (!('version' in raw)) {
    throw ConfigError.missingVersion();
  }
  const version = raw['version'];
  if (version === 1) {
    return parseV1(raw);
  }
  throw ConfigError.unsupportedVersion(version);
}

/** Parse JSON text. */
export function parseConfigText(text: string): AnyConfig {
  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    throw ConfigError.notObject();
  }
  return parseConfig(decoded);
}
