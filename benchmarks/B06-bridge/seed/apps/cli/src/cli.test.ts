import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { run, USAGE } from './main.js';

function fixture(content: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), 'bridge-cli-'));
  const path = join(dir, 'config.json');
  writeFileSync(path, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return path;
}

test('validate reports the version', () => {
  const path = fixture({ version: 1, name: 'nightly' });
  const result = run(['validate', path]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'ok: version 1\n');
});

test('validate reports a contract error on stderr', () => {
  const path = fixture({ name: 'nightly' });
  const result = run(['validate', path]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /^E_MISSING_VERSION: /);
});

test('show reads a version 2 field path', () => {
  const path = fixture({ version: 1, name: 'nightly', timeout: 45 });
  const result = run(['show', path, '--field', 'execution.timeout_seconds']);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, '45\n');
});

test('set writes a field and prints the canonical document', () => {
  const path = fixture({ version: 1, name: 'nightly', timeout: 45 });
  const result = run(['set', path, '--field', 'execution.timeout_seconds', '--value', '90']);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, '{\n  "version": 1,\n  "name": "nightly",\n  "timeout": 90\n}\n');
});

test('a missing file is a usage error', () => {
  const result = run(['validate', '/nonexistent/config.json']);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /^E_IO: /);
});

test('an unknown command prints the usage block', () => {
  const path = fixture({ version: 1, name: 'nightly' });
  const result = run(['frobnicate', path]);
  assert.equal(result.code, 2);
  assert.equal(result.stderr, `${USAGE}\n`);
});
