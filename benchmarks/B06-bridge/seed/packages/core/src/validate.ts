/** Field-level validators shared by the parser. */
import { ConfigError } from './errors.js';

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireInteger(
  value: unknown,
  path: string,
  { min }: { min: number },
): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw ConfigError.invalidField(path, `expected an integer >= ${min}`);
  }
  if (value < min) {
    throw ConfigError.invalidField(path, `expected an integer >= ${min}`);
  }
  return value;
}

export function requireNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw ConfigError.invalidField(path, 'expected a non-empty string');
  }
  return value;
}

export function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw ConfigError.invalidField(path, 'expected a boolean');
  }
  return value;
}

export function requireStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw ConfigError.invalidField(path, 'expected an array of strings');
  }
  return [...(value as string[])];
}

export function requireStringMap(value: unknown, path: string): Record<string, string> {
  if (!isPlainObject(value)) {
    throw ConfigError.invalidField(path, 'expected an object of string values');
  }
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') {
      throw ConfigError.invalidField(`${path}.${key}`, 'expected a string');
    }
    out[key] = entry;
  }
  return out;
}

export function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw ConfigError.invalidField(path, 'expected an object');
  }
  return value;
}
