#!/usr/bin/env node
/**
 * External validator for B06 BRIDGE.
 *
 * It imports the built packages through their workspace names, drives every
 * layer of the monorepo independently, and recomputes the frozen contract
 * itself instead of trusting the repository's own tests.
 *
 * Usage: node validation/check.mjs [--report PATH] [--verbose]
 *
 * Exit code 0 means every check passed.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALIDATION_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(VALIDATION_DIR);
const FIXTURES = path.join(VALIDATION_DIR, 'fixtures');
const CLI = path.join(ROOT, 'apps', 'cli', 'dist', 'main.js');

const NETWORK_PATTERN =
  /\b(?:from\s+['"]node:(?:http|https|net|dgram|tls|dns)['"]|require\(['"]node:(?:http|https|net|dgram|tls|dns)['"]\)|\bfetch\s*\(|new\s+WebSocket\b|from\s+['"](?:undici|axios|node-fetch|got)['"])/;

const results = [];
let verbose = false;

function record(group, name, error) {
  results.push({
    group,
    name,
    status: error ? 'FAIL' : 'PASS',
    detail: error ? String(error && error.message ? error.message : error).split('\n')[0] : '',
  });
}

function check(group, name, fn) {
  try {
    fn();
    record(group, name, null);
  } catch (error) {
    record(group, name, error);
  }
}

async function checkAsync(group, name, fn) {
  try {
    await fn();
    record(group, name, null);
  } catch (error) {
    record(group, name, error);
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * The canonical V2 document, recomputed here from the fixture rather than
 * taken from the implementation.
 */
function canonicalV2Text(config) {
  const sorted = (record) =>
    Object.fromEntries(Object.keys(record ?? {}).sort().map((key) => [key, record[key]]));
  const ordered = {
    version: 2,
    name: config.name,
    execution: {
      timeout_seconds: config.execution.timeout_seconds,
      concurrency: config.execution.concurrency,
      retry: {
        max_attempts: config.execution.retry.max_attempts,
        backoff: config.execution.retry.backoff,
      },
    },
    delivery: { notify: [...config.delivery.notify] },
    cache: { enabled: config.cache.enabled, ttl_seconds: config.cache.ttl_seconds },
    env: sorted(config.env),
    extensions: sorted(config.extensions),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

function tempFile(contents) {
  const dir = mkdtempSync(path.join(tmpdir(), 'bridge-check-'));
  const file = path.join(dir, 'config.json');
  writeFileSync(file, typeof contents === 'string' ? contents : `${JSON.stringify(contents, null, 2)}\n`, 'utf8');
  return file;
}

function cli(args, { expectFailure = false } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
    });
    if (expectFailure) throw new Error(`expected a non-zero exit for: bridge ${args.join(' ')}`);
    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    if (error.status === undefined) throw error;
    if (!expectFailure) {
      throw new Error(
        `bridge ${args.join(' ')} exited ${error.status}: ${String(error.stderr ?? '').trim()}`,
      );
    }
    return { code: error.status, stdout: String(error.stdout ?? ''), stderr: String(error.stderr ?? '') };
  }
}

// ----------------------------------------------------------------------
// environment
// ----------------------------------------------------------------------
function checkEnvironment() {
  check('environment', 'no-network-usage', () => {
    const offenders = [];
    for (const dir of ['packages', 'apps']) {
      const base = path.join(ROOT, dir);
      if (!existsSync(base)) continue;
      for (const file of walk(base)) {
        if (!/\.(ts|mts|js|mjs)$/.test(file)) continue;
        const text = readFileSync(file, 'utf8');
        if (NETWORK_PATTERN.test(text)) offenders.push(path.relative(ROOT, file));
      }
    }
    assert.deepEqual(offenders, [], `network usage found in ${offenders.join(', ')}`);
  });

  check('environment', 'protected-files-untouched', () => {
    const listing = path.join(VALIDATION_DIR, 'PROTECTED.sha256');
    assert.ok(existsSync(listing), 'validation/PROTECTED.sha256 is missing');
    const recorded = new Set();
    const problems = [];
    for (const line of readFileSync(listing, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [digest, rel] = trimmed.split(/\s+/);
      recorded.add(rel);
      const target = path.join(ROOT, rel);
      if (!existsSync(target)) {
        problems.push(`${rel}: missing`);
        continue;
      }
      const actual = createHash('sha256').update(readFileSync(target)).digest('hex');
      if (actual !== digest) problems.push(`${rel}: modified`);
    }
    for (const file of walk(VALIDATION_DIR)) {
      const rel = path.relative(ROOT, file);
      if (path.basename(file) === 'PROTECTED.sha256') continue;
      if (!recorded.has(rel)) problems.push(`${rel}: added to validation/`);
    }
    assert.deepEqual(problems, [], `protected files changed: ${problems.join('; ')}`);
  });

  check('environment', 'build-output-present', () => {
    for (const rel of [
      'packages/core/dist/index.js',
      'packages/api/dist/index.js',
      'packages/client/dist/index.js',
      'apps/cli/dist/main.js',
    ]) {
      assert.ok(existsSync(path.join(ROOT, rel)), `missing build output: ${rel}`);
    }
  });
}

// ----------------------------------------------------------------------
// layers
// ----------------------------------------------------------------------
function checkParser(core, migrationCases, invalidCases) {
  check('parser', 'accepts-version-1', () => {
    const config = core.parseConfig({ version: 1, name: 'nightly', timeout: 30 });
    assert.equal(config.version, 1);
    assert.equal(config.name, 'nightly');
  });

  check('parser', 'accepts-version-2', () => {
    const raw = migrationCases.find((c) => c.id === 'v2-identity').input;
    const config = core.parseConfig(structuredClone(raw));
    assert.equal(config.version, 2, 'version 2 documents must parse');
    assert.equal(config.execution.timeout_seconds, raw.execution.timeout_seconds);
    assert.deepEqual(config.delivery.notify, raw.delivery.notify);
  });

  check('parser', 'fills-version-2-defaults', () => {
    const config = core.parseConfig({ version: 2, name: 'p', execution: { timeout_seconds: 5 } });
    assert.equal(config.execution.timeout_seconds, 5);
    assert.equal(config.execution.concurrency, 1);
    assert.equal(config.execution.retry.max_attempts, 0);
    assert.equal(config.execution.retry.backoff, 'none');
    assert.deepEqual(config.delivery.notify, []);
    assert.deepEqual(config.cache, { enabled: false, ttl_seconds: 0 });
    assert.deepEqual(config.env, {});
    assert.deepEqual(config.extensions, {});
  });

  check('parser', 'moves-unknown-version-2-keys-to-extensions', () => {
    const config = core.parseConfig({ version: 2, name: 'u', owner: 'platform', extensions: { a: 1 } });
    assert.deepEqual(config.extensions, { a: 1, owner: 'platform' });
    assert.equal(config.owner, undefined, 'unknown keys must not stay at the top level');
  });

  check('parser', 'parses-json-text', () => {
    const config = core.parseConfigText('{"version":1,"name":"from-text"}');
    assert.equal(config.name, 'from-text');
  });

  for (const item of invalidCases) {
    check('parser', `error-contract[${item.id}]`, () => {
      let thrown = null;
      try {
        core.parseConfig(structuredClone(item.input));
      } catch (error) {
        thrown = error;
      }
      assert.ok(thrown, `expected a ConfigError for ${item.id}`);
      assert.ok(core.isConfigError(thrown), `expected a ConfigError, got ${thrown?.name}`);
      assert.equal(thrown.code, item.code, `wrong error code for ${item.id}`);
      assert.ok(
        thrown.message.startsWith(`${item.code}: `),
        `message must start with the code: ${thrown.message}`,
      );
      if (item.path !== null) assert.equal(thrown.path, item.path, `wrong error path for ${item.id}`);
    });
  }
}

function checkMigration(core, migrationCases) {
  for (const item of migrationCases) {
    check('migration', `exact[${item.id}]`, () => {
      const migrated = core.migrateToV2(core.parseConfig(structuredClone(item.input)));
      assert.deepEqual(
        JSON.parse(JSON.stringify(migrated)),
        item.expected,
        `migration of ${item.id} does not match the frozen contract`,
      );
    });
  }

  check('migration', 'idempotent', () => {
    for (const item of migrationCases) {
      const once = core.migrateToV2(core.parseConfig(structuredClone(item.input)));
      const twice = core.migrateToV2(core.parseConfig(JSON.parse(JSON.stringify(once))));
      assert.deepEqual(
        JSON.parse(JSON.stringify(twice)),
        JSON.parse(JSON.stringify(once)),
        `migration is not idempotent for ${item.id}`,
      );
    }
  });

  check('migration', 'needs-migration-flag', () => {
    assert.equal(core.needsMigration(core.parseConfig({ version: 1, name: 'x' })), true);
    const v2 = core.parseConfig({ version: 2, name: 'x' });
    assert.equal(core.needsMigration(v2), false);
  });

  check('migration', 'does-not-mutate-its-input', () => {
    const input = core.parseConfig({ version: 1, name: 'x', timeout: 10, owner: 'platform' });
    const before = JSON.parse(JSON.stringify(input));
    core.migrateToV2(input);
    assert.deepEqual(JSON.parse(JSON.stringify(input)), before, 'migrateToV2 mutated its argument');
  });
}

function checkSerializer(core, migrationCases) {
  check('serializer', 'version-1-canonical-text', () => {
    const text = core.serializeConfig(core.parseConfig({ name: 'nightly', version: 1, cache: false }));
    assert.equal(text, '{\n  "version": 1,\n  "name": "nightly",\n  "cache": false\n}\n');
  });

  for (const item of migrationCases) {
    check('serializer', `version-2-canonical-text[${item.id}]`, () => {
      const migrated = core.migrateToV2(core.parseConfig(structuredClone(item.input)));
      assert.equal(
        core.serializeConfig(migrated),
        canonicalV2Text(item.expected),
        `canonical text for ${item.id} differs from the frozen key order`,
      );
    });
  }

  check('serializer', 'round-trip', () => {
    for (const item of migrationCases) {
      const migrated = core.migrateToV2(core.parseConfig(structuredClone(item.input)));
      const text = core.serializeConfig(migrated);
      const reparsed = core.parseConfigText(text);
      assert.equal(core.serializeConfig(reparsed), text, `round trip changed ${item.id}`);
    }
  });

  check('serializer', 'stable-under-key-reordering', () => {
    const forward = { version: 2, name: 'x', execution: { timeout_seconds: 9, concurrency: 2 } };
    const reversed = Object.fromEntries(Object.entries(forward).reverse());
    assert.equal(
      core.serializeConfig(core.parseConfig(forward)),
      core.serializeConfig(core.parseConfig(reversed)),
    );
  });
}

function checkApi(core, api, migrationCases) {
  const full = migrationCases.find((c) => c.id === 'full-v1');
  const identity = migrationCases.find((c) => c.id === 'v2-identity');

  check('api', 'creates-a-version-1-document', () => {
    const service = new api.ConfigApi();
    const response = service.create(structuredClone(full.input));
    assert.equal(response.status, 201);
    assert.equal(response.body.version, 1);
  });

  check('api', 'creates-a-version-2-document', () => {
    const service = new api.ConfigApi();
    const response = service.create(structuredClone(identity.input));
    assert.equal(response.status, 201, `version 2 create returned ${response.status}`);
    assert.equal(response.body.version, 2);
    assert.deepEqual(response.body.config, identity.expected, 'stored version 2 body is not canonical');
  });

  check('api', 'migrate-endpoint-converts-and-reports', () => {
    const service = new api.ConfigApi();
    const created = service.create(structuredClone(full.input));
    const response = service.migrate(created.body.id);
    assert.equal(response.status, 200, `migrate returned ${response.status}`);
    assert.equal(response.body.migrated, true);
    assert.equal(response.body.version, 2);
    assert.deepEqual(response.body.config, full.expected);
  });

  check('api', 'migrate-endpoint-is-idempotent', () => {
    const service = new api.ConfigApi();
    const created = service.create(structuredClone(full.input));
    const first = service.migrate(created.body.id);
    const second = service.migrate(created.body.id);
    assert.equal(second.status, 200);
    assert.equal(second.body.migrated, false, 'a second migration must report migrated=false');
    assert.deepEqual(second.body.config, first.body.config);
    assert.deepEqual(service.get(created.body.id).body.config, first.body.config);
  });

  check('api', 'body-matches-the-canonical-serializer', () => {
    const service = new api.ConfigApi();
    const created = service.create(structuredClone(full.input));
    const migrated = service.migrate(created.body.id);
    assert.equal(
      `${JSON.stringify(migrated.body.config, null, 2)}\n`,
      canonicalV2Text(full.expected),
      'API body key order diverges from the canonical serializer',
    );
  });

  check('api', 'error-mapping', () => {
    const service = new api.ConfigApi();
    const bad = service.create({ name: 'no version' });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.code, 'E_MISSING_VERSION');
    const missing = service.get('cfg-9999');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'E_NOT_FOUND');
    const unknown = service.migrate('cfg-9999');
    assert.equal(unknown.status, 404);
  });

  check('api', 'validate-endpoint-accepts-both-versions', () => {
    const service = new api.ConfigApi();
    assert.equal(service.validate(structuredClone(full.input)).body.version, 1);
    const v2 = service.validate(structuredClone(identity.input));
    assert.equal(v2.status, 200, 'validate rejected a version 2 document');
    assert.equal(v2.body.version, 2);
    assert.deepEqual(service.list().body.ids, [], 'validate must not store');
  });
}

function checkClient(core, api, client, migrationCases) {
  const full = migrationCases.find((c) => c.id === 'full-v1');
  const identity = migrationCases.find((c) => c.id === 'v2-identity');

  const expectedReads = (expected) => ({
    version: expected.version,
    name: expected.name,
    'execution.timeout_seconds': expected.execution.timeout_seconds,
    'execution.concurrency': expected.execution.concurrency,
    'execution.retry.max_attempts': expected.execution.retry.max_attempts,
    'execution.retry.backoff': expected.execution.retry.backoff,
    'delivery.notify': expected.delivery.notify,
    'cache.enabled': expected.cache.enabled,
    'cache.ttl_seconds': expected.cache.ttl_seconds,
  });

  check('client', 'reads-version-1-through-version-2-paths', () => {
    const bridge = new client.BridgeClient(new api.ConfigApi());
    const handle = bridge.create(structuredClone(full.input));
    for (const [field, value] of Object.entries(expectedReads(full.expected))) {
      if (field === 'version') continue;
      assert.deepEqual(bridge.read(handle, field), value, `client.read('${field}') on a V1 document`);
    }
  });

  check('client', 'reads-version-2-documents', () => {
    const bridge = new client.BridgeClient(new api.ConfigApi());
    const handle = bridge.create(structuredClone(identity.input));
    assert.equal(handle.version, 2);
    for (const [field, value] of Object.entries(expectedReads(identity.expected))) {
      assert.deepEqual(bridge.read(handle, field), value, `client.read('${field}') on a V2 document`);
    }
  });

  check('client', 'agrees-with-core-for-every-case', () => {
    for (const item of migrationCases) {
      const bridge = new client.BridgeClient(new api.ConfigApi());
      const handle = bridge.create(structuredClone(item.input));
      const snapshot = bridge.snapshot(handle);
      for (const [field, value] of Object.entries(expectedReads(item.expected))) {
        if (field === 'version') continue;
        assert.deepEqual(snapshot[field], value, `snapshot '${field}' for ${item.id}`);
      }
    }
  });

  check('client', 'writes-into-a-version-2-document', () => {
    const service = new api.ConfigApi();
    const bridge = new client.BridgeClient(service);
    const handle = bridge.create(structuredClone(identity.input));
    bridge.write(handle, 'execution.timeout_seconds', 90);
    bridge.write(handle, 'execution.retry.max_attempts', 7);
    bridge.write(handle, 'cache.enabled', false);
    assert.equal(bridge.read(handle, 'execution.timeout_seconds'), 90);
    assert.equal(bridge.read(handle, 'execution.retry.max_attempts'), 7);
    assert.equal(bridge.read(handle, 'cache.enabled'), false);
    const stored = service.get(handle.id).body;
    assert.equal(stored.version, 2, 'writing to a V2 document must not downgrade it');
    assert.equal(stored.config.execution.timeout_seconds, 90);
  });

  check('client', 'migrates-a-handle', () => {
    const service = new api.ConfigApi();
    const bridge = new client.BridgeClient(service);
    const handle = bridge.create(structuredClone(full.input));
    const migrated = bridge.migrate(handle);
    assert.equal(migrated.version, 2);
    assert.deepEqual(service.get(migrated.id).body.config, full.expected);
  });

  check('client', 'rejects-unknown-field-paths', () => {
    const bridge = new client.BridgeClient(new api.ConfigApi());
    const handle = bridge.create(structuredClone(identity.input));
    assert.throws(() => bridge.read(handle, 'nope'), /E_INVALID_FIELD/);
    assert.throws(() => bridge.write(handle, 'version', 2), /E_INVALID_FIELD/);
  });
}

function checkCli(core, migrationCases) {
  const full = migrationCases.find((c) => c.id === 'full-v1');
  const identity = migrationCases.find((c) => c.id === 'v2-identity');

  check('cli', 'validate-reports-both-versions', () => {
    assert.equal(cli(['validate', tempFile(full.input)]).stdout, 'ok: version 1\n');
    assert.equal(cli(['validate', tempFile(identity.input)]).stdout, 'ok: version 2\n');
  });

  check('cli', 'migrate-matches-the-canonical-serializer', () => {
    for (const item of migrationCases) {
      const result = cli(['migrate', tempFile(item.input)]);
      assert.equal(result.stdout, canonicalV2Text(item.expected), `cli migrate ${item.id}`);
    }
  });

  check('cli', 'migrate-is-idempotent', () => {
    const once = cli(['migrate', tempFile(full.input)]).stdout;
    const twice = cli(['migrate', tempFile(once)]).stdout;
    assert.equal(twice, once, 'cli migrate is not idempotent');
  });

  check('cli', 'migrate-writes-with-out', () => {
    const source = tempFile(full.input);
    const destination = path.join(path.dirname(source), 'migrated.json');
    const result = cli(['migrate', source, '--out', destination]);
    assert.match(result.stdout, /^wrote /);
    assert.equal(readFileSync(destination, 'utf8'), canonicalV2Text(full.expected));
  });

  check('cli', 'show-reads-both-versions', () => {
    assert.equal(cli(['show', tempFile(full.input), '--field', 'execution.timeout_seconds']).stdout, '30\n');
    assert.equal(cli(['show', tempFile(full.input), '--field', 'execution.retry.backoff']).stdout, 'exponential\n');
    assert.equal(
      cli(['show', tempFile(identity.input), '--field', 'execution.retry.max_attempts']).stdout,
      `${identity.expected.execution.retry.max_attempts}\n`,
    );
    assert.equal(
      cli(['show', tempFile(identity.input), '--field', 'cache.ttl_seconds']).stdout,
      `${identity.expected.cache.ttl_seconds}\n`,
    );
  });

  check('cli', 'set-writes-into-a-version-2-document', () => {
    const result = cli([
      'set', tempFile(identity.input), '--field', 'execution.timeout_seconds', '--value', '90',
    ]);
    const expected = structuredClone(identity.expected);
    expected.execution.timeout_seconds = 90;
    assert.equal(result.stdout, canonicalV2Text(expected), 'cli set on a V2 document');
  });

  check('cli', 'reports-contract-errors', () => {
    const bad = cli(['validate', tempFile({ name: 'no version' })], { expectFailure: true });
    assert.equal(bad.code, 1);
    assert.match(bad.stderr, /^E_MISSING_VERSION: /);
    const unsupported = cli(['migrate', tempFile({ version: 7, name: 'x' })], { expectFailure: true });
    assert.equal(unsupported.code, 1);
    assert.match(unsupported.stderr, /^E_UNSUPPORTED_VERSION: /);
  });

  check('cli', 'usage-errors-exit-2', () => {
    const missing = cli(['validate', '/nonexistent/nope.json'], { expectFailure: true });
    assert.equal(missing.code, 2);
    const unknown = cli(['frobnicate', tempFile(full.input)], { expectFailure: true });
    assert.equal(unknown.code, 2);
  });
}

function checkRepositoryTests() {
  check('environment', 'repository-tests-pass', () => {
    execFileSync('npm', ['test', '--silent'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300_000,
    });
  });
}

// ----------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  verbose = args.includes('--verbose');
  const reportIndex = args.indexOf('--report');
  const reportPath = reportIndex >= 0 ? args[reportIndex + 1] : null;

  const migrationCases = readJson(path.join(FIXTURES, 'migration-cases.json')).cases;
  const invalidCases = readJson(path.join(FIXTURES, 'invalid-cases.json')).cases;

  checkEnvironment();

  let core;
  let api;
  let client;
  try {
    core = await import('@bridge/core');
    api = await import('@bridge/api');
    client = await import('@bridge/client');
  } catch (error) {
    record('environment', 'packages-importable', error);
  }

  if (core && api && client) {
    record('environment', 'packages-importable', null);
    checkParser(core, migrationCases, invalidCases);
    checkMigration(core, migrationCases);
    checkSerializer(core, migrationCases);
    checkApi(core, api, migrationCases);
    checkClient(core, api, client, migrationCases);
    checkCli(core, migrationCases);
  }

  checkRepositoryTests();

  const failed = results.filter((r) => r.status === 'FAIL');
  for (const result of results) {
    if (result.status === 'FAIL') console.log(`FAIL [${result.group}] ${result.name}: ${result.detail}`);
    else if (verbose) console.log(`OK   [${result.group}] ${result.name}`);
  }

  const status = failed.length === 0 ? 'PASS' : 'FAIL';
  console.log(
    `\n${status}: ${results.length - failed.length}/${results.length} checks passed (${failed.length} failed)`,
  );

  if (reportPath) {
    writeFileSync(
      reportPath,
      `${JSON.stringify(
        {
          schema_version: 1,
          benchmark_id: 'B06-bridge',
          validator: 'validation/check.mjs',
          total: results.length,
          passed: results.length - failed.length,
          failed: failed.length,
          status,
          checks: results,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }

  process.exit(status === 'PASS' ? 0 : 1);
}

await main();
