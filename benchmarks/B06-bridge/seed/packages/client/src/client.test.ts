import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigApi } from '@bridge/api';
import { BridgeClient, READABLE_FIELDS } from './index.js';

const V1 = { version: 1, name: 'nightly', timeout: 30, retries: 3, cache: true };

test('reads version 2 field paths from a version 1 document', () => {
  const client = new BridgeClient(new ConfigApi());
  const handle = client.create(V1);
  assert.equal(client.read(handle, 'execution.timeout_seconds'), 30);
  assert.equal(client.read(handle, 'execution.retry.max_attempts'), 3);
  assert.equal(client.read(handle, 'execution.retry.backoff'), 'exponential');
  assert.equal(client.read(handle, 'cache.enabled'), true);
  assert.equal(client.read(handle, 'cache.ttl_seconds'), 300);
});

test('applies the frozen defaults when version 1 omitted a field', () => {
  const client = new BridgeClient(new ConfigApi());
  const handle = client.create({ version: 1, name: 'bare' });
  assert.equal(client.read(handle, 'execution.timeout_seconds'), 60);
  assert.equal(client.read(handle, 'execution.concurrency'), 1);
  assert.equal(client.read(handle, 'execution.retry.max_attempts'), 0);
  assert.equal(client.read(handle, 'execution.retry.backoff'), 'none');
  assert.deepEqual(client.read(handle, 'delivery.notify'), []);
  assert.equal(client.read(handle, 'cache.enabled'), false);
});

test('snapshot covers every readable field', () => {
  const client = new BridgeClient(new ConfigApi());
  const handle = client.create(V1);
  assert.deepEqual(Object.keys(client.snapshot(handle)), [...READABLE_FIELDS]);
});

test('writes a version 2 field path back into the document', () => {
  const api = new ConfigApi();
  const client = new BridgeClient(api);
  const handle = client.create(V1);
  client.write(handle, 'execution.timeout_seconds', 90);
  assert.equal(client.read(handle, 'execution.timeout_seconds'), 90);
});

test('rejects an unknown field path', () => {
  const client = new BridgeClient(new ConfigApi());
  const handle = client.create(V1);
  assert.throws(() => client.read(handle, 'nope'), /E_INVALID_FIELD/);
  assert.throws(() => client.write(handle, 'version', 2), /E_INVALID_FIELD/);
});
