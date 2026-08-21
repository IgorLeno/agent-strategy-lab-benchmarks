import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { assertContractHooksOnly, loadCaptureConfig } from '../lib/config.mjs';
import { sha256File } from '../lib/hash.mjs';
import { validateManifest } from '../lib/manifest.mjs';
import { containsAbsoluteLocalPath } from '../lib/paths.mjs';
import { readPngDimensions } from '../lib/png.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const verifyBin = path.join(here, '../verify.mjs');
const buildBin = path.join(here, '../build-review.mjs');
const b03Direct = path.join(
  repo,
  'experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/direct/screenshots',
);
const b03Agent = path.join(
  repo,
  'experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/agentlab/screenshots',
);
const b04Config = path.join(repo, 'benchmarks/B04-atlas/visual-capture.json');
const accessCheck = path.join(repo, 'evaluation/visual-access-check');

function runNode(script, args, extra = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    cwd: repo,
    ...extra,
  });
}

function sampleShot(overrides = {}) {
  return {
    id: 'desktop-hero',
    filename: 'desktop-hero.png',
    sha256: 'a'.repeat(64),
    width: 1440,
    height: 743,
    viewport_width: 1440,
    viewport_height: 900,
    full_page: false,
    selector: '[data-testid="hero"]',
    state: 'default',
    pdf_page: 1,
    pdf_page_span: 1,
    ...overrides,
  };
}

function sampleManifest(overrides = {}) {
  const { shot, ...rest } = overrides;
  const resolved = sampleShot(shot);
  return {
    kind: 'VisualEvidenceManifestV1',
    schema_version: 1,
    experiment_id: 'CLAUDE-SONNET5-MEDIUM-B03-V1',
    candidate_id: 'candidate-x',
    source_build_identity: 'unpublished-arm-identity',
    capture_protocol: 'visual-evidence-v1',
    generated_at: '2026-08-20T00:00:00.000Z',
    screenshots: [resolved],
    pdf_pages: [{ page: 1, screenshot_id: resolved.id, filename: resolved.filename }],
    review_pdf: {
      filename: 'visual-review.pdf',
      sha256: 'b'.repeat(64),
      page_count: 1,
    },
    ...rest,
  };
}

test('manifest schema aceita um bundle mínimo válido', () => {
  assert.deepEqual(validateManifest(sampleManifest()), []);
});

test('manifest schema rejeita candidate_id que revela o braço', () => {
  const errors = validateManifest(sampleManifest({ candidate_id: 'direct' }));
  assert.ok(errors.some((item) => /braço|candidate_id/i.test(item)));
});

test('manifest schema rejeita path absoluto', () => {
  const errors = validateManifest(sampleManifest({ experiment_id: '/home/plasma-test/secret' }));
  assert.ok(errors.some((item) => /absoluto/i.test(item)));
  assert.equal(containsAbsoluteLocalPath({ foo: '/home/plasma-test/x' }), true);
  assert.equal(containsAbsoluteLocalPath({ foo: 'candidate-x' }), false);
});

test('SHA256 de PNG B03 coincide com o arquivo', () => {
  const file = path.join(b03Direct, 'desktop-hero.png');
  const hex = sha256File(file);
  assert.match(hex, /^[a-f0-9]{64}$/);
  assert.equal(hex, sha256File(file));
});

test('dimensões PNG B03 são lidas do IHDR', () => {
  const directHero = readPngDimensions(path.join(b03Direct, 'desktop-hero.png'));
  assert.equal(directHero.width, 1440);
  assert.equal(directHero.height, 743);
  const agentFull = readPngDimensions(path.join(b03Agent, 'desktop-full.png'));
  assert.equal(agentFull.width, 1440);
  assert.ok(agentFull.height > 900);
});

test('verify falha se o screenshot está ausente', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 've-missing-'));
  try {
    const manifest = sampleManifest();
    writeFileSync(path.join(dir, 'visual-manifest.json'), JSON.stringify(manifest, null, 2));
    writeFileSync(path.join(dir, 'visual-review.pdf'), 'not-a-pdf');
    const empty = mkdtempSync(path.join(os.tmpdir(), 've-empty-'));
    const result = runNode(verifyBin, [
      '--manifest',
      path.join(dir, 'visual-manifest.json'),
      '--screenshots-dir',
      empty,
    ]);
    rmSync(empty, { recursive: true, force: true });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /ausente/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verify falha se há PNG inesperado', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 've-extra-'));
  try {
    copyFileSync(path.join(b03Direct, 'desktop-hero.png'), path.join(dir, 'desktop-hero.png'));
    copyFileSync(path.join(b03Direct, 'faq-open.png'), path.join(dir, 'unexpected.png'));
    const { width, height } = readPngDimensions(path.join(dir, 'desktop-hero.png'));
    const sha = sha256File(path.join(dir, 'desktop-hero.png'));
    const manifest = sampleManifest({
      shot: sampleShot({ sha256: sha, width, height }),
    });
    const bundle = mkdtempSync(path.join(os.tmpdir(), 've-bundle-'));
    writeFileSync(path.join(bundle, 'visual-manifest.json'), JSON.stringify(manifest, null, 2));
    writeFileSync(path.join(bundle, 'visual-review.pdf'), 'x');
    const result = runNode(verifyBin, [
      '--manifest',
      path.join(bundle, 'visual-manifest.json'),
      '--screenshots-dir',
      dir,
    ]);
    rmSync(bundle, { recursive: true, force: true });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /inesperado/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('blind candidate id não contém direct/agentlab', () => {
  for (const id of ['candidate-x', 'candidate-y']) {
    const errors = validateManifest(sampleManifest({ candidate_id: id }));
    assert.deepEqual(errors, []);
  }
  for (const id of ['direct', 'agentlab', 'Candidate Direct']) {
    assert.ok(validateManifest(sampleManifest({ candidate_id: id })).length > 0);
  }
});

test('blind-map.json e .runs/ estão gitignored', () => {
  const ignore = readFileSync(path.join(repo, '.gitignore'), 'utf8');
  assert.match(ignore, /^\.runs\/$/m);
  assert.match(ignore, /^\*\*\/blind-map\.json$/m);
  const check = spawnSync('git', ['check-ignore', '-q', '.runs/CLAUDE-SONNET5-MEDIUM-B03-V1/blind-map.json'], {
    cwd: repo,
  });
  assert.equal(check.status, 0);
});

test('B04 visual-capture.json usa somente hooks do contrato', () => {
  const config = loadCaptureConfig(b04Config);
  const used = assertContractHooksOnly(config);
  assert.ok(used.includes('kpi'));
  assert.ok(used.includes('filter-period'));
  assert.ok(used.includes('filter-segment'));
  assert.ok(used.includes('chart'));
  assert.ok(used.includes('segment-table'));
  const raw = readFileSync(b04Config, 'utf8');
  assert.doesNotMatch(raw, /direct|agentlab/i);
  assert.doesNotMatch(raw, /#[A-Za-z]/);
  assert.doesNotMatch(raw, /\.[a-zA-Z][\w-]*\s*\{/);
  const ids = config.screenshots.map((shot) => shot.id);
  for (const required of [
    'desktop-default',
    'mobile-default',
    'kpi-filters',
    'chart-revenue-budget',
    'chart-cost-profitability',
    'chart-segment-comparison',
    'segment-table',
    'state-q1-all',
    'state-full-year-enterprise',
    'mobile-chart',
    'mobile-table',
  ]) {
    assert.ok(ids.includes(required), required);
  }
  const q1 = config.screenshots.find((shot) => shot.id === 'state-q1-all');
  assert.ok(q1.actions.some((action) => action.filter === 'period' && action.value === 'q1'));
  assert.ok(q1.actions.some((action) => action.filter === 'segment' && action.value === 'all'));
  const enterprise = config.screenshots.find((shot) => shot.id === 'state-full-year-enterprise');
  assert.ok(enterprise.actions.some((action) => action.value === 'full-year'));
  assert.ok(enterprise.actions.some((action) => action.value === 'enterprise'));
});

test('build-review + verify com um PNG B03 (hero)', async (t) => {
  const out = mkdtempSync(path.join(os.tmpdir(), 've-review-'));
  const shots = mkdtempSync(path.join(os.tmpdir(), 've-shots-'));
  try {
    copyFileSync(path.join(b03Direct, 'desktop-hero.png'), path.join(shots, 'desktop-hero.png'));
    const built = runNode(buildBin, [
      '--screenshots',
      shots,
      '--out',
      out,
      '--experiment-id',
      'CLAUDE-SONNET5-MEDIUM-B03-V1',
      '--candidate-id',
      'candidate-x',
      '--source-build-identity',
      'unpublished-arm-identity',
      '--capture-protocol',
      'CLAUDE-SONNET5-MEDIUM-B03-V1-screenshots',
      '--pages',
      'desktop-hero',
    ], { timeout: 120_000 });
    if (built.status !== 0) {
      t.diagnostic(built.stderr || built.stdout);
    }
    assert.equal(built.status, 0);
    const manifest = JSON.parse(readFileSync(path.join(out, 'visual-manifest.json'), 'utf8'));
    assert.equal(manifest.candidate_id, 'candidate-x');
    assert.equal(containsAbsoluteLocalPath(manifest), false);
    assert.equal(manifest.screenshots[0].filename, 'desktop-hero.png');
    assert.equal(manifest.screenshots[0].pdf_page, 1);
    assert.equal(manifest.pdf_pages[0].screenshot_id, 'desktop-hero');
    assert.ok(existsSync(path.join(out, 'visual-review.pdf')));
    assert.equal(sha256File(path.join(out, 'visual-review.pdf')), manifest.review_pdf.sha256);
    const verified = runNode(verifyBin, [
      '--manifest',
      path.join(out, 'visual-manifest.json'),
      '--screenshots-dir',
      shots,
    ]);
    if (verified.status !== 0) t.diagnostic(verified.stderr);
    assert.equal(verified.status, 0);
    assert.match(JSON.parse(verified.stdout).ok ? 'ok' : '', /ok/);
    assert.equal(manifest.review_pdf.page_count, JSON.parse(verified.stdout).pdf_pages);
  } finally {
    rmSync(out, { recursive: true, force: true });
    rmSync(shots, { recursive: true, force: true });
  }
});

test('access-check publicado: PDF, mapping PNG→página, ids cegos', (t) => {
  for (const candidate of ['candidate-x', 'candidate-y']) {
    const folder = path.join(accessCheck, candidate);
    const manifestPath = path.join(folder, 'visual-manifest.json');
    const pdfPath = path.join(folder, 'visual-review.pdf');
    if (!existsSync(manifestPath) || !existsSync(pdfPath)) {
      t.diagnostic(`access-check ${candidate} ainda não gerado`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.candidate_id, candidate);
    assert.doesNotMatch(JSON.stringify(manifest), /direct|agentlab/i);
    assert.equal(containsAbsoluteLocalPath(manifest), false);
    assert.ok(existsSync(pdfPath));
    assert.equal(sha256File(pdfPath), manifest.review_pdf.sha256);
    const ids = manifest.screenshots.map((shot) => shot.id);
    for (const required of [
      'desktop-hero',
      'desktop-full',
      'mobile-hero',
      'mobile-full',
      'day-cycle-state-1',
      'day-cycle-state-2',
      'faq-open',
    ]) {
      assert.ok(ids.includes(required), required);
    }
    const mobileFull = manifest.screenshots.find((shot) => shot.id === 'mobile-full');
    assert.equal(mobileFull.viewport_width, 390);
    assert.equal(mobileFull.viewport_height, 844);
    const desktopFull = manifest.screenshots.find((shot) => shot.id === 'desktop-full');
    assert.equal(desktopFull.viewport_width, 1440);
    for (const shot of manifest.screenshots) {
      const pages = manifest.pdf_pages.filter((entry) => entry.screenshot_id === shot.id);
      assert.equal(pages[0].page, shot.pdf_page);
      assert.equal(pages[0].filename, shot.filename);
    }
  }
});
