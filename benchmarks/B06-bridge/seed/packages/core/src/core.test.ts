import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigError, isConfigError } from './errors.js';
import { parseConfig, parseConfigText } from './parser.js';
import { serializeConfig } from './serializer.js';
import type { ConfigV1 } from './types.js';

const V1 = {
  version: 1,
  name: 'nightly',
  timeout: 30,
  retries: 3,
  concurrency: 4,
  notify: ['ops@example.com'],
  cache: true,
  env: { TZ: 'UTC' },
};

test('parses a version 1 document', () => {
  const config = parseConfig(V1) as ConfigV1;
  assert.equal(config.version, 1);
  assert.equal(config.name, 'nightly');
  assert.equal(config.timeout, 30);
  assert.deepEqual(config.notify, ['ops@example.com']);
});

test('keeps unknown top-level fields on a version 1 document', () => {
  const config = parseConfig({ ...V1, owner: 'platform', tags: [1, 2] }) as ConfigV1;
  assert.equal(config['owner'], 'platform');
  assert.deepEqual(config['tags'], [1, 2]);
});

test('rejects a non-object', () => {
  assert.throws(() => parseConfig([1, 2, 3]), (error: unknown) => {
    assert.ok(isConfigError(error));
    assert.equal((error as ConfigError).code, 'E_NOT_OBJECT');
    return true;
  });
});

test('rejects a missing version', () => {
  assert.throws(() => parseConfig({ name: 'x' }), (error: unknown) => {
    assert.equal((error as ConfigError).code, 'E_MISSING_VERSION');
    return true;
  });
});

test('rejects an invalid field with its path', () => {
  assert.throws(() => parseConfig({ version: 1, name: 'x', timeout: 0 }), (error: unknown) => {
    const configError = error as ConfigError;
    assert.equal(configError.code, 'E_INVALID_FIELD');
    assert.equal(configError.path, 'timeout');
    return true;
  });
});

test('rejects malformed JSON text', () => {
  assert.throws(() => parseConfigText('{not json'), (error: unknown) => {
    assert.equal((error as ConfigError).code, 'E_NOT_OBJECT');
    return true;
  });
});

test('serializes a version 1 document canonically', () => {
  const text = serializeConfig(parseConfig({ name: 'nightly', version: 1, cache: false }));
  assert.equal(text, '{\n  "version": 1,\n  "name": "nightly",\n  "cache": false\n}\n');
});

test('canonical serialization is stable under key reordering', () => {
  const a = serializeConfig(parseConfig(V1));
  const reversed = Object.fromEntries(Object.entries(V1).reverse());
  const b = serializeConfig(parseConfig(reversed));
  assert.equal(a, b);
});
