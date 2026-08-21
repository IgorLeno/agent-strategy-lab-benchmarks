#!/usr/bin/env node
// Captura determinística de screenshots a partir de VisualCaptureConfigV1.
// Usa Chrome/Chromium do sistema via CDP. Nenhuma dependência npm nova.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { applyActions, targetClip } from './lib/actions.mjs';
import { attachPage, capturePng, launchChrome, sleep } from './lib/chrome.mjs';
import { parseArgs } from './lib/cli.mjs';
import { loadCaptureConfig } from './lib/config.mjs';
import { serveStatic } from './lib/serve.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.config || !args.dist || !args.out) {
  console.error('uso: capture.mjs --config visual-capture.json --dist dist/ --out screenshots/');
  process.exit(2);
}

const config = loadCaptureConfig(path.resolve(args.config));
const dist = path.resolve(args.dist);
const outDir = path.resolve(args.out);
mkdirSync(outDir, { recursive: true });

const server = await serveStatic(dist);
const { browser, close } = await launchChrome();
const log = {
  capture_protocol: config.capture_protocol,
  benchmark_id: config.benchmark_id,
  origin: 'validated dist/',
  deviceScaleFactor: config.device_scale_factor ?? 1,
  files: {},
};

try {
  for (const shot of config.screenshots) {
    const viewport = config.viewports[shot.viewport];
    if (!viewport) throw new Error(`viewport desconhecido: ${shot.viewport}`);
    const { send, targetId } = await attachPage(browser, server.origin, {
      ...viewport,
      deviceScaleFactor: config.device_scale_factor ?? 1,
      mobile: shot.viewport === 'mobile',
    });
    await sleep(shot.settle_ms ?? 300);
    await applyActions(send, shot.actions ?? []);
    const clip = shot.full_page ? null : await targetClip(send, shot.target ?? { kind: 'page' });
    const png = await capturePng(send, {
      fullPage: Boolean(shot.full_page),
      clip,
      deviceScaleFactor: config.device_scale_factor ?? 1,
      mobile: shot.viewport === 'mobile',
    });
    writeFileSync(path.join(outDir, shot.filename), png);
    log.files[shot.filename] = {
      id: shot.id,
      fullPage: Boolean(shot.full_page),
      viewport: shot.viewport,
      target: shot.target ?? null,
      bytes: png.length,
    };
    await browser.send('Target.closeTarget', { targetId });
  }
  writeFileSync(path.join(outDir, 'capture-log.json'), `${JSON.stringify(log, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, outDir: args.out, files: Object.keys(log.files) }, null, 2));
} finally {
  await close();
  await server.close();
}
