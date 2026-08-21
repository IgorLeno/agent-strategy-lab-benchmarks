#!/usr/bin/env node
// Empacota PNGs canônicos já selados para o artifact visual-b01-blind-review.
// Cópia byte-a-byte. Sem recapture, recompress, resize ou crop.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { sha256File } from './lib/hash.mjs';
import { containsAbsoluteLocalPath } from './lib/paths.mjs';

const CANONICAL = [
  'desktop-full.png',
  'desktop-shell.png',
  'sidebar.png',
  'stat-cards.png',
  'chart.png',
  'projects-table.png',
  'activity-quota.png',
  'mobile-full.png',
  'mobile-shell.png',
  'mobile-stat-cards.png',
  'mobile-projects-table.png',
];

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IDENTITY = /\b(direct|agentlab|agent-lab|agent_lab)\b/i;
const SECRET = /(BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/;
const FORBIDDEN_SEGMENT = /^(direct|agentlab|profile|runtime|tokens|modelUsage|mapping)$/i;

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const args = parseArgs(process.argv.slice(2));
const outDir = path.resolve(args.out ?? '');

if (!outDir || outDir === path.resolve('')) {
  console.error('uso: stage-b01-blind-review.mjs --out DIR');
  process.exit(2);
}

const specReference = path.join(repo, 'benchmarks/B01-screenshot/reference/reference.png');
const bundleRoot = path.join(repo, 'evaluation/blind/CLAUDE-SONNET5-MEDIUM-B01-V1');
const bundleReference = path.join(bundleRoot, 'reference/reference.png');

function assertPng(filePath) {
  const header = readFileSync(filePath).subarray(0, 8);
  if (!header.equals(PNG_SIG)) throw new Error(`não é PNG selado: ${filePath}`);
}

function listFiles(dir, prefix = '') {
  const entries = readdirSync(dir).sort();
  const files = [];
  for (const name of entries) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) files.push(...listFiles(full, rel));
    else files.push(rel);
  }
  return files;
}

if (sha256File(specReference) !== sha256File(bundleReference)) {
  throw new Error('reference.png do bundle diverge do spec congelado');
}
assertPng(specReference);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(path.join(outDir, 'reference'), { recursive: true });
copyFileSync(specReference, path.join(outDir, 'reference/reference.png'));

const candidates = {};
for (const candidate of ['candidate-x', 'candidate-y']) {
  const manifestPath = path.join(bundleRoot, candidate, 'visual-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const byFile = Object.fromEntries(manifest.screenshots.map((shot) => [shot.filename, shot.sha256]));
  mkdirSync(path.join(outDir, candidate, 'canonical'), { recursive: true });
  copyFileSync(manifestPath, path.join(outDir, candidate, 'visual-manifest.json'));
  const hashes = {};
  for (const name of CANONICAL) {
    const src = path.join(bundleRoot, candidate, 'visual', name);
    const dest = path.join(outDir, candidate, 'canonical', name);
    assertPng(src);
    copyFileSync(src, dest);
    const hash = sha256File(dest);
    if (hash !== sha256File(src)) throw new Error(`cópia alterou bytes: ${candidate}/${name}`);
    if (hash !== byFile[name]) throw new Error(`sha256 diverge de visual-manifest: ${candidate}/${name}`);
    hashes[name] = hash;
  }
  if (manifest.screenshots.length !== CANONICAL.length) {
    throw new Error(`${candidate} não tem 11 screenshots no manifest`);
  }
  candidates[candidate] = hashes;
}

const referenceSha = sha256File(path.join(outDir, 'reference/reference.png'));
const reviewManifest = {
  kind: 'BlindVisualReviewArtifactV1',
  schema_version: 1,
  artifact_name: 'visual-b01-blind-review',
  experiment_id: 'CLAUDE-SONNET5-MEDIUM-B01-V1',
  status: 'AWAITING_BLIND_EVALUATION',
  generated_at: new Date().toISOString(),
  transport: {
    copy: 'byte-for-byte',
    recapture: false,
    recompress: false,
    resize: false,
    crop: false,
  },
  reference: {
    path: 'reference/reference.png',
    source: 'benchmarks/B01-screenshot/reference/reference.png',
    sha256: referenceSha,
  },
  files: {
    'candidate-x': {
      manifest: 'candidate-x/visual-manifest.json',
      canonical: Object.fromEntries(CANONICAL.map((name) => [name, candidates['candidate-x'][name]])),
    },
    'candidate-y': {
      manifest: 'candidate-y/visual-manifest.json',
      canonical: Object.fromEntries(CANONICAL.map((name) => [name, candidates['candidate-y'][name]])),
    },
  },
  notes: {
    arm_assignment: 'unpublished',
    evaluator_labels: ['Candidate X', 'Candidate Y'],
  },
};
writeFileSync(path.join(outDir, 'blind-review-manifest.json'), `${JSON.stringify(reviewManifest, null, 2)}\n`);

const expected = [
  'blind-review-manifest.json',
  'candidate-x/visual-manifest.json',
  ...CANONICAL.map((name) => `candidate-x/canonical/${name}`),
  'candidate-y/visual-manifest.json',
  ...CANONICAL.map((name) => `candidate-y/canonical/${name}`),
  'reference/reference.png',
].sort();
const actual = listFiles(outDir).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`árvore inesperada: ${JSON.stringify(actual)}`);
}

for (const rel of actual) {
  for (const segment of rel.split('/')) {
    if (FORBIDDEN_SEGMENT.test(segment)) throw new Error(`segmento proibido no path: ${rel}`);
  }
  if (rel.endsWith('.json')) {
    const text = readFileSync(path.join(outDir, rel), 'utf8');
    if (containsAbsoluteLocalPath(text)) throw new Error(`path absoluto em ${rel}`);
    if (IDENTITY.test(text)) throw new Error(`identidade de braço em ${rel}`);
    if (SECRET.test(text)) throw new Error(`segredo em ${rel}`);
    if (/\bmodelUsage\b/.test(text) || /"tokens"\s*:/.test(text)) {
      throw new Error(`métrica identificadora em ${rel}`);
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      out: outDir,
      reference: 'PASS',
      candidate_x_canonical: 'PASS',
      candidate_y_canonical: 'PASS',
      identity_secret_path_scan: 'PASS',
      mapping: 'private',
      status: 'AWAITING_BLIND_EVALUATION',
    },
    null,
    2,
  ),
);
