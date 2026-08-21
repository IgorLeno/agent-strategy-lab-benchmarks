/**
 * Serialization: a typed config out to canonical JSON text.
 *
 * Canonical means byte-stable: the same config always produces the same text,
 * with the key order declared here, two-space indentation and a trailing
 * newline. Two layers that serialize the same config must produce identical
 * bytes.
 */
import { ConfigError } from './errors.js';
import type { AnyConfig, ConfigV1 } from './types.js';
import { V1_KNOWN_KEYS } from './types.js';

/** Canonical top-level key order for a V1 document. */
export const V1_KEY_ORDER: readonly string[] = [
  'version',
  'name',
  'timeout',
  'retries',
  'concurrency',
  'notify',
  'cache',
  'env',
];

/** Canonical top-level key order for a V2 document. */
export const V2_KEY_ORDER: readonly string[] = [
  'version',
  'name',
  'execution',
  'delivery',
  'cache',
  'env',
  'extensions',
];

function sortedRecord(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = value[key];
  }
  return out;
}

function canonicalV1(config: ConfigV1): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of V1_KEY_ORDER) {
    const value = config[key];
    if (value === undefined) continue;
    out[key] = key === 'env' ? sortedRecord(value as Record<string, unknown>) : value;
  }
  const extras: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!V1_KNOWN_KEYS.includes(key)) extras[key] = value;
  }
  for (const [key, value] of Object.entries(sortedRecord(extras))) {
    out[key] = value;
  }
  return out;
}

/** Canonical plain object, ready for `JSON.stringify`. */
export function toCanonicalObject(config: AnyConfig): Record<string, unknown> {
  if (config.version === 1) {
    return canonicalV1(config as ConfigV1);
  }
  throw ConfigError.unsupportedVersion(config.version);
}

/** Canonical JSON text: two-space indent, trailing newline. */
export function serializeConfig(config: AnyConfig): string {
  return `${JSON.stringify(toCanonicalObject(config), null, 2)}\n`;
}
