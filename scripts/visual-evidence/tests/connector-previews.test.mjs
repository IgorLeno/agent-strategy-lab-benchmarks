import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loadCaptureConfig } from '../lib/config.mjs';
import {
  CONNECTOR_MAX_BYTES,
  encodePlan,
  minAllowedWidth,
  widthLadder,
} from '../lib/connector.mjs';
import { validateConnectorManifest } from '../lib/connector-manifest.mjs';
import { sha256File } from '../lib/hash.mjs';
import { isJpegBuffer, readJpegDimensions } from '../lib/jpeg.mjs';
import { containsAbsoluteLocalPath } from '../lib/paths.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const buildBin = path.join(here, '../build-connector-previews.mjs');
const verifyBin = path.join(here, '../verify-connector-previews.mjs');
const b03Direct = path.join(repo, 'experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/direct/screenshots');
const b04Config = path.join(repo, 'benchmarks/B04-atlas/visual-capture.json');
const accessCheck = path.join(repo, 'evaluation/visual-access-check');

function runNode(script, args, extra = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    cwd: repo,
    ...extra,
  });
}

function samplePreview(overrides = {}) {
  return {
    id: 'desktop-hero',
    filename: 'desktop-hero.jpg',
    sha256: 'a'.repeat(64),
    byte_size: 12_000,
    source_png: { filename: 'desktop-hero.png', sha256: 'c'.repeat(64) },
    width: 960,
    height: 495,
    encoding: 'jpeg',
    jpeg_quality: 72,
    candidate_id: 'candidate-x',
    ...overrides,
  };
}

function sampleManifest(overrides = {}) {
  const { preview, ...rest } = overrides;
  const resolved = samplePreview(preview);
  return {
    kind: 'ConnectorPreviewManifestV1',
    schema_version: 1,
    experiment_id: 'CLAUDE-SONNET5-MEDIUM-B03-V1',
    candidate_id: 'candidate-x',
    capture_protocol: 'visual-evidence-v1',
    generated_at: '2026-08-20T00:00:00.000Z',
    size_budget_bytes: CONNECTOR_MAX_BYTES,
    previews: [resolved],
    ...rest,
  };
}

test('escada de largura: 960→800, sem upscale, piso min(800, source)', () => {
  assert.deepEqual(widthLadder(1440), [960, 880, 800]);
  assert.deepEqual(widthLadder(390), [390]);
  assert.deepEqual(widthLadder(800), [800]);
  assert.equal(minAllowedWidth(1440), 800);
  assert.equal(minAllowedWidth(390), 390);
  const plan = encodePlan(1440, 743);
  assert.equal(plan[0].width, 960);
  assert.equal(plan[0].quality, 80);
  assert.ok(plan.every((step) => step.width >= 800));
});

test('connector manifest rejeita braço, path absoluto e oversize', () => {
  assert.deepEqual(validateConnectorManifest(sampleManifest()), []);
  assert.ok(validateConnectorManifest(sampleManifest({ candidate_id: 'direct' })).length > 0);
  assert.ok(
    validateConnectorManifest(sampleManifest({ preview: samplePreview({ filename: 'direct-hero.jpg' }) })).length > 0,
  );
  assert.ok(validateConnectorManifest(sampleManifest({ experiment_id: '/home/plasma-test/x' })).length > 0);
  assert.ok(
    validateConnectorManifest(sampleManifest({ preview: samplePreview({ byte_size: 50_000 }) })).length > 0,
  );
});

test('B04 connector_previews: 11 ids, sources TARGET/viewport, só hooks do contrato', () => {
  const config = loadCaptureConfig(b04Config);
  const ids = config.connector_previews.map((item) => item.id);
  assert.deepEqual(ids, [
    '01-dashboard',
    '02-kpis-filters',
    '03-revenue-budget',
    '04-cost-profitability',
    '05-segment-comparison',
    '06-segment-table',
    '07-q1-all',
    '08-full-year-enterprise',
    '09-mobile-dashboard',
    '10-mobile-chart',
    '11-mobile-table',
  ]);
  const shots = Object.fromEntries(config.screenshots.map((shot) => [shot.id, shot]));
  for (const preview of config.connector_previews) {
    const source = shots[preview.source_screenshot_id];
    assert.ok(source, preview.source_screenshot_id);
    assert.equal(source.full_page, false);
    assert.match(preview.filename, /^[0-9]{2}-[a-z0-9-]+\.jpg$/);
  }
  const q1 = shots['state-q1-all-viewport'];
  assert.ok(q1.actions.some((action) => action.value === 'q1'));
  assert.ok(q1.actions.some((action) => action.value === 'all'));
  const enterprise = shots['state-full-year-enterprise-viewport'];
  assert.ok(enterprise.actions.some((action) => action.value === 'full-year'));
  assert.ok(enterprise.actions.some((action) => action.value === 'enterprise'));
});

test('verify falha se preview está ausente', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 've-conn-missing-'));
  try {
    writeFileSync(path.join(dir, 'connector-preview-manifest.json'), JSON.stringify(sampleManifest(), null, 2));
    mkdirSync(path.join(dir, 'connector-previews'));
    const result = runNode(verifyBin, [
      '--manifest',
      path.join(dir, 'connector-preview-manifest.json'),
      '--previews-dir',
      path.join(dir, 'connector-previews'),
    ]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /ausente/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('build + verify connector preview a partir de desktop-hero B03', (t) => {
  const shots = mkdtempSync(path.join(os.tmpdir(), 've-conn-shots-'));
  const out = mkdtempSync(path.join(os.tmpdir(), 've-conn-out-'));
  try {
    copyFileSync(path.join(b03Direct, 'desktop-hero.png'), path.join(shots, 'desktop-hero.png'));
    const built = runNode(
      buildBin,
      [
        '--screenshots',
        shots,
        '--out',
        out,
        '--experiment-id',
        'CLAUDE-SONNET5-MEDIUM-B03-V1',
        '--candidate-id',
        'candidate-x',
        '--pages',
        'desktop-hero',
      ],
      { timeout: 120_000 },
    );
    if (built.status !== 0) t.diagnostic(built.stderr || built.stdout);
    assert.equal(built.status, 0);
    const jpegPath = path.join(out, 'connector-previews/desktop-hero.jpg');
    assert.ok(existsSync(jpegPath));
    const bytes = readFileSync(jpegPath);
    assert.ok(isJpegBuffer(bytes));
    assert.ok(bytes.length <= CONNECTOR_MAX_BYTES);
    const dims = readJpegDimensions(jpegPath);
    assert.ok(dims.width >= 800);
    assert.ok(dims.width <= 960);
    const manifest = JSON.parse(readFileSync(path.join(out, 'connector-preview-manifest.json'), 'utf8'));
    assert.equal(manifest.candidate_id, 'candidate-x');
    assert.equal(containsAbsoluteLocalPath(manifest), false);
    assert.doesNotMatch(JSON.stringify(manifest), /direct|agentlab/i);
    assert.equal(manifest.previews[0].byte_size, bytes.length);
    assert.equal(manifest.previews[0].sha256, sha256File(jpegPath));
    assert.equal(manifest.previews[0].source_png.sha256, sha256File(path.join(shots, 'desktop-hero.png')));
    const verified = runNode(verifyBin, [
      '--manifest',
      path.join(out, 'connector-preview-manifest.json'),
      '--previews-dir',
      path.join(out, 'connector-previews'),
      '--screenshots-dir',
      shots,
    ]);
    if (verified.status !== 0) t.diagnostic(verified.stderr);
    assert.equal(verified.status, 0);
  } finally {
    rmSync(shots, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('access-check connector previews publicados', () => {
  const required = [
    'desktop-hero',
    'mobile-hero',
    'day-cycle-state-1',
    'day-cycle-state-2',
    'faq-open',
  ];
  for (const candidate of ['candidate-x', 'candidate-y']) {
    const folder = path.join(accessCheck, candidate);
    const manifestPath = path.join(folder, 'connector-preview-manifest.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.candidate_id, candidate);
    assert.doesNotMatch(JSON.stringify(manifest), /direct|agentlab/i);
    assert.equal(containsAbsoluteLocalPath(manifest), false);
    const ids = manifest.previews.map((item) => item.id);
    for (const id of required) assert.ok(ids.includes(id), id);
    for (const preview of manifest.previews) {
      assert.ok(preview.byte_size <= CONNECTOR_MAX_BYTES);
      const jpegPath = path.join(folder, 'connector-previews', preview.filename);
      assert.ok(existsSync(jpegPath));
      assert.ok(isJpegBuffer(readFileSync(jpegPath)));
      assert.equal(sha256File(jpegPath), preview.sha256);
    }
  }
});
