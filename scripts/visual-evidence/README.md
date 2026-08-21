# Visual evidence

Reusable, deterministic visual-evidence infrastructure for this corpus.

## Bundle

```
Visual Evidence Bundle
  = canonical PNG
  + verifiable manifest
  + review PDF generated from the PNGs
```

The PDF does **not** replace the PNG. PNGs remain the canonical pixels. The PDF is a review/transport document so an evaluator that can read GitHub text/code, but cannot render binary PNGs, can still see the captures.

| Layer | Role |
| --- | --- |
| PNG | Canonical evidence. Never edited by the review pipeline. No color correction. |
| Manifest (`VisualEvidenceManifestV1`) | Provenance: SHA256, dimensions, viewport, state, PNG → PDF page mapping. |
| PDF | Review transport. May scale for page composition only, preserving aspect ratio. Tall full-page captures paginate at readable width instead of shrinking to a thumbnail. |

## Commands

All scripts live in `scripts/visual-evidence/`. They use the system Chrome/Chromium via CDP and `pdfunite`/`pdfinfo` from poppler. No new npm dependency. No external network.

```bash
# Capture from a built dist/ using a VisualCaptureConfigV1 file
node scripts/visual-evidence/capture.mjs \
  --config benchmarks/B04-atlas/visual-capture.json \
  --dist path/to/dist \
  --out path/to/screenshots

# Build review PDF + manifest from already-captured PNGs
node scripts/visual-evidence/build-review.mjs \
  --screenshots path/to/screenshots \
  --out path/to/bundle \
  --experiment-id EXPERIMENT \
  --candidate-id candidate-x \
  --capture-json path/to/capture.json \
  --pages desktop-hero,desktop-full

# Verify bundle against the source PNGs
node scripts/visual-evidence/verify.mjs \
  --manifest path/to/visual-manifest.json \
  --screenshots-dir path/to/screenshots

# Blind package (mapping written only to --map-out)
node scripts/visual-evidence/package-blind.mjs \
  --experiment-id EXPERIMENT \
  --x path/to/arm-a/screenshots \
  --y path/to/arm-b/screenshots \
  --x-label unpublished \
  --y-label unpublished \
  --out evaluation/blind \
  --map-out .runs/EXPERIMENT/blind-map.json
```

## Manifest

Schema: [`schemas/visual-evidence-manifest.schema.json`](../schemas/visual-evidence-manifest.schema.json).

Required fields include `schema_version`, `experiment_id`, `candidate_id`, `source_build_identity`, `capture_protocol`, `generated_at`, `screenshots[]` (`id`, `filename`, `sha256`, `width`, `height`, `viewport_width`, `viewport_height`, `full_page`, `selector`, `state`, `pdf_page`), `pdf_pages[]` (every physical PDF page → source PNG), and `review_pdf` (`filename`, `sha256`, `page_count`).

Filenames are basenames. Absolute local paths are rejected.

## Capture

`capture.mjs` is generic. Viewport, `full_page`, structured `target` (page / `data-testid` / union of hooks), and declarative `actions` come from the JSON config.

B04 future captures are frozen as evidence config only in [`benchmarks/B04-atlas/visual-capture.json`](../benchmarks/B04-atlas/visual-capture.json). That file does not change `TASK.md`, `rubric.md`, `seed/`, or `validation/`. Filter actions use only the TASK hooks `data-testid="filter-period"` / `data-testid="filter-segment"` with `period=q1|full-year` and `segment=all|enterprise`. Charts are addressed by TASK order among `[data-testid="chart"]` because `data-chart` names are not frozen.

B03 PNGs already published were produced by the experiment runtime script (Chrome + `puppeteer-core` + `scripts/lib/browser.mjs` in the validated `dist/`). This corpus reuses that protocol's files; it does not recapture them.

## PDF generation

1. Local HTML, one screenshot per sheet, with id / filename / SHA256 / dimensions in the header.
2. System Chrome headless, `Page.printToPDF` with backgrounds enabled (`printBackground`, `print-color-adjust: exact`).
3. Tall captures keep readable width and flow across PDF pages. That is pagination of the view, not a destructive crop of the PNG.
4. Sheets are concatenated with `pdfunite` (object copy, not rasterization).

Chrome embeds `/CreationDate`, `/ModDate`, and `/ID`. A rerun with the same PNGs is **semantically** the same review (same PNG hashes, same page mapping, same page count policy) but the PDF SHA256 may change. This is documented rather than faked.

## Blind review

```
workers complete
  → captures (canonical PNGs)
  → random X/Y mapping written only to .runs/<experiment>/blind-map.json
  → blind PDFs + manifests published as candidate-x / candidate-y
  → evaluator scores
  → scores sealed
  → mapping revealed
  → source / metrics published or identified
```

Public bundles must not contain `direct` or `agentlab` in `candidate_id`. The private map is gitignored (`.runs/`, `**/blind-map.json`).

`evaluation/visual-access-check/` proves the PDF transport using already-published B03 PNGs. Its X/Y assignment is arbitrary and is **not** the B03 quality evaluation.

## Tests

```bash
node --test scripts/visual-evidence/tests/*.test.mjs
```
