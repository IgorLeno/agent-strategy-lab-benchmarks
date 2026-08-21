#!/usr/bin/env node
// Verifica ConnectorPreviewManifestV1 e os JPEGs <= 40960 bytes.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/cli.mjs';
import { CONNECTOR_MAX_BYTES, minAllowedWidth } from './lib/connector.mjs';
import { assertValidConnectorManifest } from './lib/connector-manifest.mjs';
import { sha256File } from './lib/hash.mjs';
import { isJpegBuffer, readJpegDimensions } from './lib/jpeg.mjs';
import { containsAbsoluteLocalPath, isBlindSafeText } from './lib/paths.mjs';
import { readPngDimensions } from './lib/png.mjs';

const args = parseArgs(process.argv.slice(2));
const bundleDir = args.bundle ? path.resolve(args.bundle) : null;
const manifestPath = path.resolve(
  args.manifest ?? path.join(bundleDir ?? '', 'connector-preview-manifest.json'),
);
const previewsDir = path.resolve(
  args['previews-dir'] ?? path.join(path.dirname(manifestPath), 'connector-previews'),
);
const screenshotsDir = args['screenshots-dir'] ? path.resolve(args['screenshots-dir']) : null;

if (!existsSync(manifestPath)) {
  console.error(
    'uso: verify-connector-previews.mjs --manifest FILE --previews-dir DIR [--screenshots-dir DIR]',
  );
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assertValidConnectorManifest(manifest);

const errors = [];
const expected = new Set(manifest.previews.map((item) => item.filename));

for (const preview of manifest.previews) {
  if (!isBlindSafeText(preview.id) || !isBlindSafeText(preview.filename)) {
    errors.push(`${preview.id} revela identidade de braço`);
  }
  const jpegPath = path.join(previewsDir, preview.filename);
  if (!existsSync(jpegPath)) {
    errors.push(`preview ausente: ${preview.filename}`);
    continue;
  }
  const bytes = readFileSync(jpegPath);
  if (!isJpegBuffer(bytes)) errors.push(`${preview.filename} sem magic JPEG`);
  if (bytes.length !== preview.byte_size) {
    errors.push(`${preview.filename} byte_size ${preview.byte_size} != ${bytes.length}`);
  }
  if (bytes.length > CONNECTOR_MAX_BYTES) {
    errors.push(`${preview.filename} ${bytes.length} > ${CONNECTOR_MAX_BYTES}`);
  }
  const sha = sha256File(jpegPath);
  if (sha !== preview.sha256) errors.push(`sha256 diverge em ${preview.filename}`);
  try {
    const { width, height } = readJpegDimensions(jpegPath);
    if (width !== preview.width || height !== preview.height) {
      errors.push(`${preview.filename} dimensões ${width}x${height} != ${preview.width}x${preview.height}`);
    }
    if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) {
      errors.push(`${preview.filename} dimensões inválidas`);
    }
    if (screenshotsDir) {
      const pngPath = path.join(screenshotsDir, preview.source_png.filename);
      if (!existsSync(pngPath)) errors.push(`source PNG ausente: ${preview.source_png.filename}`);
      else {
        if (sha256File(pngPath) !== preview.source_png.sha256) {
          errors.push(`source PNG sha256 diverge: ${preview.source_png.filename}`);
        }
        const png = readPngDimensions(pngPath);
        const floor = minAllowedWidth(png.width);
        if (png.width >= 800 && width < floor) {
          errors.push(`${preview.filename} largura ${width} < piso ${floor}; budget precisa ser revisto`);
        }
      }
    }
  } catch (error) {
    errors.push(`${preview.filename}: ${error.message}`);
  }
}

const extra = existsSync(previewsDir)
  ? readdirSync(previewsDir).filter((name) => name.endsWith('.jpg') && !expected.has(name))
  : [];
if (extra.length > 0) errors.push(`preview inesperado: ${extra.join(', ')}`);

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
      previews: manifest.previews.length,
      max_bytes: CONNECTOR_MAX_BYTES,
    },
    null,
    2,
  ),
);
