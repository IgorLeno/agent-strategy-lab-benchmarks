#!/usr/bin/env node
// JPEG connector previews a partir de PNGs canônicos. Nunca edita os PNGs.
// Sem npm novo. Chrome do sistema via CDP. Sem rede externa.
import { mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { attachPage, captureJpeg, launchChrome } from './lib/chrome.mjs';
import { parseArgs } from './lib/cli.mjs';
import {
  CONNECTOR_MAX_BYTES,
  ConnectorBudgetError,
  encodePlan,
  minAllowedWidth,
  previewHtml,
} from './lib/connector.mjs';
import {
  CONNECTOR_MANIFEST_KIND,
  CONNECTOR_MANIFEST_SCHEMA_VERSION,
  assertValidConnectorManifest,
} from './lib/connector-manifest.mjs';
import { sha256File } from './lib/hash.mjs';
import { isJpegBuffer, readJpegDimensionsFromBytes } from './lib/jpeg.mjs';
import { assertBlindCandidateId, assertNoAbsoluteLocalPath } from './lib/paths.mjs';
import { readPngDimensions } from './lib/png.mjs';
import { serveStatic } from './lib/serve.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.screenshots || !args.out || !args['experiment-id'] || !args['candidate-id']) {
  console.error(
    'uso: build-connector-previews.mjs --screenshots DIR --out DIR --experiment-id ID --candidate-id candidate-x [--pages id,id] [--pages-json file]',
  );
  process.exit(2);
}

const screenshotsDir = path.resolve(args.screenshots);
const outDir = path.resolve(args.out);
const previewsDir = path.join(outDir, 'connector-previews');
const candidateId = args['candidate-id'];
const experimentId = args['experiment-id'];
assertBlindCandidateId(candidateId);
assertNoAbsoluteLocalPath(experimentId, 'experiment_id');

function pageIds() {
  if (args['pages-json']) {
    const raw = JSON.parse(readFileSync(path.resolve(args['pages-json']), 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.pages;
    return list.map((item) => (typeof item === 'string' ? item.replace(/\.png$/, '') : item.id));
  }
  if (args.pages) {
    return String(args.pages).split(',').map((item) => item.trim()).filter(Boolean);
  }
  return readdirSync(screenshotsDir)
    .filter((name) => name.endsWith('.png'))
    .map((name) => name.replace(/\.png$/, ''))
    .sort();
}

const ids = pageIds();
mkdirSync(previewsDir, { recursive: true });

const sources = ids.map((id) => {
  const filename = `${id}.png`;
  const pngPath = path.join(screenshotsDir, filename);
  const { width, height } = readPngDimensions(pngPath);
  return { id, filename, pngPath, width, height, sha256: sha256File(pngPath) };
});

const tmp = mkdtempSync(path.join(os.tmpdir(), 'connector-preview-'));
const { browser, close } = await launchChrome();
const previews = [];

try {
  for (const source of sources) {
    symlinkSync(source.pngPath, path.join(tmp, source.filename));
  }
  const server = await serveStatic(tmp);
  try {
    for (const source of sources) {
      const plan = encodePlan(source.width, source.height);
      let chosen = null;
      for (const step of plan) {
        writeFileSync(path.join(tmp, 'preview.html'), previewHtml({
          filename: source.filename,
          width: step.width,
          height: step.height,
        }));
        const { send, targetId } = await attachPage(browser, `${server.origin}/preview.html`, {
          width: step.width,
          height: step.height,
          deviceScaleFactor: 1,
        });
        const jpeg = await captureJpeg(send, { quality: step.quality });
        await browser.send('Target.closeTarget', { targetId });
        if (!isJpegBuffer(jpeg)) throw new Error(`Chrome não devolveu JPEG para ${source.id}`);
        if (jpeg.length <= CONNECTOR_MAX_BYTES) {
          const dims = readJpegDimensionsFromBytes(jpeg);
          if (dims.width < minAllowedWidth(source.width) && source.width >= 800) {
            throw new ConnectorBudgetError(source.width, source.height);
          }
          chosen = { jpeg, step, dims };
          break;
        }
      }
      if (!chosen) throw new ConnectorBudgetError(source.width, source.height);
      const outName = `${source.id}.jpg`;
      writeFileSync(path.join(previewsDir, outName), chosen.jpeg);
      previews.push({
        id: source.id,
        filename: outName,
        sha256: sha256File(path.join(previewsDir, outName)),
        byte_size: chosen.jpeg.length,
        source_png: { filename: source.filename, sha256: source.sha256 },
        width: chosen.dims.width,
        height: chosen.dims.height,
        encoding: 'jpeg',
        jpeg_quality: chosen.step.quality,
        candidate_id: candidateId,
        requested_width: chosen.step.width,
        requested_height: chosen.step.height,
      });
    }
  } finally {
    await server.close();
  }
} finally {
  await close();
  rmSync(tmp, { recursive: true, force: true });
}

const manifest = {
  kind: CONNECTOR_MANIFEST_KIND,
  schema_version: CONNECTOR_MANIFEST_SCHEMA_VERSION,
  experiment_id: experimentId,
  candidate_id: candidateId,
  capture_protocol: args['capture-protocol'] ?? 'visual-evidence-v1',
  generated_at: new Date().toISOString(),
  size_budget_bytes: CONNECTOR_MAX_BYTES,
  algorithm: {
    preferred_width: 960,
    min_width: 800,
    width_step_px: 80,
    quality_steps: [80, 72, 64, 56, 48, 40, 32],
    no_upscale: true,
    no_color_correction: true,
    notes:
      'Tenta quality_steps em cada largura da escada (960→800, ou source se menor). Se nenhuma combinação couber em 40960 bytes sem largura < min(800, source), falha. Full-page alta não deve ser preview primário.',
  },
  previews,
};

assertValidConnectorManifest(manifest);
writeFileSync(path.join(outDir, 'connector-preview-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      ok: true,
      outDir: args.out,
      previews: previews.map((item) => ({
        id: item.id,
        filename: item.filename,
        byte_size: item.byte_size,
        width: item.width,
        height: item.height,
        jpeg_quality: item.jpeg_quality,
      })),
    },
    null,
    2,
  ),
);
