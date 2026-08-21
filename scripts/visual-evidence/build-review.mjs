#!/usr/bin/env node
// Gera o PDF de review e o VisualEvidenceManifestV1 a partir de PNGs já
// capturados. Nunca altera os PNGs originais. Nenhuma rede externa.
import { mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { attachPage, launchChrome, printToPdf } from './lib/chrome.mjs';
import { parseArgs } from './lib/cli.mjs';
import { sha256File } from './lib/hash.mjs';
import { paperSizeFor, reviewSheetHtml } from './lib/html.mjs';
import { assertValidManifest, MANIFEST_KIND, MANIFEST_SCHEMA_VERSION } from './lib/manifest.mjs';
import { pdfPageCount, mergePdfsFromBuffers } from './lib/pdf.mjs';
import { assertBlindCandidateId, assertNoAbsoluteLocalPath } from './lib/paths.mjs';
import { readPngDimensions } from './lib/png.mjs';
import { serveStatic } from './lib/serve.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.screenshots || !args.out || !args['experiment-id'] || !args['candidate-id']) {
  console.error(
    'uso: build-review.mjs --screenshots DIR --out DIR --experiment-id ID --candidate-id candidate-x [--pages id,id] [--capture-json file] [--source-build-identity text] [--capture-protocol text] [--pages-json file]',
  );
  process.exit(2);
}

const screenshotsDir = path.resolve(args.screenshots);
const outDir = path.resolve(args.out);
const candidateId = args['candidate-id'];
const experimentId = args['experiment-id'];
assertBlindCandidateId(candidateId);

const sourceBuildIdentity = args['source-build-identity'] ?? 'unpublished-arm-identity';
const captureProtocol = args['capture-protocol'] ?? 'visual-evidence-v1';
assertNoAbsoluteLocalPath(sourceBuildIdentity, 'source_build_identity');
assertNoAbsoluteLocalPath(captureProtocol, 'capture_protocol');

const captureMeta = args['capture-json']
  ? JSON.parse(readFileSync(path.resolve(args['capture-json']), 'utf8'))
  : null;

function stateFor(filename, fileMeta) {
  if (filename.startsWith('day-cycle-state-1')) return 'day-cycle-option-0';
  if (filename.startsWith('day-cycle-state-2')) return 'day-cycle-option-1';
  if (filename.startsWith('faq-open')) return 'faq-question-0-open';
  if (fileMeta?.target) return String(fileMeta.target);
  return 'default';
}

function selectorFor(fileMeta) {
  if (!fileMeta?.target) return null;
  return `[data-testid="${fileMeta.target}"]`;
}

function hydrateSpec(idOrSpec) {
  const spec = typeof idOrSpec === 'string'
    ? { id: idOrSpec, filename: `${idOrSpec}.png` }
    : { ...idOrSpec, filename: idOrSpec.filename ?? `${idOrSpec.id}.png` };
  const filename = spec.filename;
  const fileMeta = captureMeta?.files?.[filename] ?? {};
  const viewportName =
    spec.viewport ??
    (fileMeta.viewport === 'mobile' || filename.startsWith('mobile-') ? 'mobile' : 'desktop');
  const viewport = captureMeta?.viewports?.[viewportName] ??
    (viewportName === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  return {
    id: spec.id ?? filename.replace(/\.png$/, ''),
    filename,
    review_label: spec.review_label ?? spec.id ?? filename.replace(/\.png$/, ''),
    full_page: spec.full_page ?? Boolean(fileMeta.fullPage),
    selector: spec.selector === undefined ? selectorFor(fileMeta) : spec.selector,
    state: spec.state ?? stateFor(filename, fileMeta),
    viewport_width: spec.viewport_width ?? viewport.width,
    viewport_height: spec.viewport_height ?? viewport.height,
  };
}

function defaultPagesFromDir() {
  if (args['pages-json']) {
    const raw = JSON.parse(readFileSync(path.resolve(args['pages-json']), 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.pages;
    return list.map(hydrateSpec);
  }
  const requested = args.pages
    ? String(args.pages).split(',').map((item) => item.trim()).filter(Boolean)
    : null;
  const pngs = readdirSync(screenshotsDir).filter((name) => name.endsWith('.png')).sort();
  const names = requested ?? pngs.map((name) => name.replace(/\.png$/, ''));
  return names.map(hydrateSpec);
}

const pageSpecs = defaultPagesFromDir();
mkdirSync(outDir, { recursive: true });

const shots = pageSpecs.map((spec) => {
  const pngPath = path.join(screenshotsDir, spec.filename);
  const { width, height } = readPngDimensions(pngPath);
  return {
    ...spec,
    sha256: sha256File(pngPath),
    width,
    height,
    pngPath,
  };
});

const { browser, close } = await launchChrome();
const tmp = mkdtempSync(path.join(os.tmpdir(), 'visual-evidence-review-'));
const pdfBuffers = [];
const withPages = [];

try {
  for (const shot of shots) {
    symlinkSync(shot.pngPath, path.join(tmp, shot.filename));
  }
  const server = await serveStatic(tmp);
  try {
    let nextPage = 1;
    for (const shot of shots) {
      const paper = paperSizeFor(shot);
      writeFileSync(
        path.join(tmp, 'sheet.html'),
        reviewSheetHtml({
          candidateId,
          experimentId,
          shot,
          paperWidthIn: paper.paperWidthIn,
          paperHeightIn: paper.paperHeightIn,
        }),
      );
      const { send, targetId } = await attachPage(
        browser,
        `${server.origin}/sheet.html`,
        { width: Math.ceil(paper.paperWidthIn * 96), height: Math.ceil(paper.paperHeightIn * 96) },
      );
      const pdf = await printToPdf(send, {
        preferCSSPageSize: true,
        paperWidth: paper.paperWidthIn,
        paperHeight: paper.paperHeightIn,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      });
      const partPath = path.join(tmp, `${shot.id}.pdf`);
      writeFileSync(partPath, pdf);
      const span = await pdfPageCount(partPath);
      pdfBuffers.push(pdf);
      withPages.push({
        id: shot.id,
        filename: shot.filename,
        sha256: shot.sha256,
        width: shot.width,
        height: shot.height,
        viewport_width: shot.viewport_width,
        viewport_height: shot.viewport_height,
        full_page: Boolean(shot.full_page),
        selector: shot.selector ?? null,
        state: shot.state,
        pdf_page: nextPage,
        pdf_page_span: span,
        review_label: shot.review_label ?? shot.id,
      });
      nextPage += span;
      await browser.send('Target.closeTarget', { targetId });
    }
  } finally {
    await server.close();
  }
} finally {
  await close();
}

const pdfName = 'visual-review.pdf';
const pdfPath = path.join(outDir, pdfName);
await mergePdfsFromBuffers(pdfBuffers, pdfPath);
rmSync(tmp, { recursive: true, force: true });

const pageCount = await pdfPageCount(pdfPath);
const last = withPages.at(-1);
const expectedEnd = last ? last.pdf_page + last.pdf_page_span - 1 : 0;
if (pageCount !== expectedEnd) {
  throw new Error(`page_count ${pageCount} != soma das páginas ${expectedEnd}`);
}

const pdfPages = [];
for (const shot of withPages) {
  for (let offset = 0; offset < shot.pdf_page_span; offset += 1) {
    pdfPages.push({
      page: shot.pdf_page + offset,
      screenshot_id: shot.id,
      filename: shot.filename,
    });
  }
}

const manifest = {
  kind: MANIFEST_KIND,
  schema_version: MANIFEST_SCHEMA_VERSION,
  experiment_id: experimentId,
  candidate_id: candidateId,
  source_build_identity: sourceBuildIdentity,
  capture_protocol: captureProtocol,
  generated_at: new Date().toISOString(),
  screenshots: withPages,
  pdf_pages: pdfPages,
  review_pdf: {
    filename: pdfName,
    sha256: sha256File(pdfPath),
    page_count: pageCount,
  },
  notes: {
    png_canonical: true,
    pdf_is_review_transport: true,
    pdf_byte_identity:
      'Chrome embute CreationDate/ModDate/ID. Reruns com os mesmos PNGs são semanticamente equivalentes (páginas, mapping, SHA256 dos PNGs) mas o SHA256 do PDF pode mudar. Não falsificamos determinismo.',
  },
};

assertValidManifest(manifest);
writeFileSync(path.join(outDir, 'visual-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      ok: true,
      outDir: args.out,
      pdf: pdfName,
      pdf_sha256: manifest.review_pdf.sha256,
      page_count: pageCount,
      screenshots: withPages.map((shot) => ({ id: shot.id, pdf_page: shot.pdf_page, pdf_page_span: shot.pdf_page_span })),
    },
    null,
    2,
  ),
);
