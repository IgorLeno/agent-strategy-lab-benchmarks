#!/usr/bin/env node
// Verifica um Visual Evidence Bundle: PNGs canônicos + manifesto + PDF de review.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/cli.mjs';
import { sha256File } from './lib/hash.mjs';
import { assertValidManifest } from './lib/manifest.mjs';
import { pdfPageCount } from './lib/pdf.mjs';
import { containsAbsoluteLocalPath } from './lib/paths.mjs';
import { readPngDimensions } from './lib/png.mjs';

const args = parseArgs(process.argv.slice(2));
const bundleDir = args.bundle ? path.resolve(args.bundle) : null;
const manifestPath = path.resolve(args.manifest ?? path.join(bundleDir ?? '', 'visual-manifest.json'));
const screenshotsDir = path.resolve(args['screenshots-dir'] ?? args.screenshots ?? '');
const unexpectedPolicy = args['unexpected-policy'] ?? 'fail';

if (!existsSync(manifestPath) || !screenshotsDir || screenshotsDir === path.resolve('')) {
  console.error('uso: verify.mjs --manifest FILE --screenshots-dir DIR [--bundle DIR] [--unexpected-policy fail|ignore]');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assertValidManifest(manifest);

const errors = [];
const pdfPath = path.join(path.dirname(manifestPath), manifest.review_pdf.filename);
if (!existsSync(pdfPath)) errors.push(`PDF ausente: ${manifest.review_pdf.filename}`);
else {
  const sha = sha256File(pdfPath);
  if (sha !== manifest.review_pdf.sha256) {
    errors.push(`PDF sha256 diverge: manifest ${manifest.review_pdf.sha256} arquivo ${sha}`);
  }
  try {
    const pages = await pdfPageCount(pdfPath);
    if (pages !== manifest.review_pdf.page_count) {
      errors.push(`PDF page_count diverge: manifest ${manifest.review_pdf.page_count} pdfinfo ${pages}`);
    }
  } catch (error) {
    errors.push(`PDF ilegível: ${error.message}`);
  }
}

const expectedFiles = new Set(manifest.screenshots.map((shot) => shot.filename));
for (const shot of manifest.screenshots) {
  const pngPath = path.join(screenshotsDir, shot.filename);
  if (!existsSync(pngPath)) {
    errors.push(`screenshot ausente: ${shot.filename}`);
    continue;
  }
  const sha = sha256File(pngPath);
  if (sha !== shot.sha256) errors.push(`sha256 diverge em ${shot.filename}`);
  const { width, height } = readPngDimensions(pngPath);
  if (width !== shot.width || height !== shot.height) {
    errors.push(`dimensões divergem em ${shot.filename}: manifest ${shot.width}x${shot.height} arquivo ${width}x${height}`);
  }
  if (shot.pdf_page < 1 || shot.pdf_page > manifest.review_pdf.page_count) {
    errors.push(`pdf_page fora do PDF em ${shot.id}: ${shot.pdf_page}`);
  }
  const span = shot.pdf_page_span ?? 1;
  if (shot.pdf_page + span - 1 > manifest.review_pdf.page_count) {
    errors.push(`pdf_page_span ultrapassa o PDF em ${shot.id}`);
  }
}

if (unexpectedPolicy === 'fail') {
  const extra = readdirSync(screenshotsDir)
    .filter((name) => name.endsWith('.png'))
    .filter((name) => !expectedFiles.has(name));
  if (extra.length > 0) errors.push(`screenshot inesperado: ${extra.join(', ')}`);
}

if (containsAbsoluteLocalPath(manifest)) errors.push('path absoluto local no manifest');

if (errors.length > 0) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      candidate_id: manifest.candidate_id,
      screenshots: manifest.screenshots.length,
      pdf_pages: manifest.review_pdf.page_count,
    },
    null,
    2,
  ),
);
