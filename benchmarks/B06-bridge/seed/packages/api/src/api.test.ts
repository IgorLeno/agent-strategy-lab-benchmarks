import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigApi } from './index.js';
import type { ConfigBody, ErrorBody } from './index.js';

const V1 = { version: 1, name: 'nightly', timeout: 30, retries: 2 };

test('create stores a version 1 document', () => {
  const api = new ConfigApi();
  const response = api.create(V1);
  assert.equal(response.status, 201);
  const body = response.body as ConfigBody;
  assert.equal(body.version, 1);
  assert.equal(body.config['name'], 'nightly');
  assert.match(body.id, /^cfg-\d{4}$/);
});

test('create reports a contract error as 400 with the code', () => {
  const api = new ConfigApi();
  const response = api.create({ name: 'no version' });
  assert.equal(response.status, 400);
  assert.equal((response.body as ErrorBody).code, 'E_MISSING_VERSION');
});

test('get returns 404 for an unknown id', () => {
  const api = new ConfigApi();
  const response = api.get('cfg-9999');
  assert.equal(response.status, 404);
  assert.equal((response.body as ErrorBody).code, 'E_NOT_FOUND');
});

test('list returns stored ids in order', () => {
  const api = new ConfigApi();
  api.create(V1);
  api.create({ ...V1, name: 'second' });
  assert.deepEqual(api.list().body.ids, ['cfg-0001', 'cfg-0002']);
});

test('validate does not store', () => {
  const api = new ConfigApi();
  const response = api.validate(V1);
  assert.equal(response.status, 200);
  assert.deepEqual(api.list().body.ids, []);
});
