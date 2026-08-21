# Visual evidence

See also [`scripts/visual-evidence/README.md`](../scripts/visual-evidence/README.md).

## Why a PDF exists

Published experiments already store PNG screenshots. Those files are the canonical visual record. Some review surfaces (including a ChatGPT session that reads this repository through the GitHub connector) can read text and code but cannot render the PNG binaries.

The corpus therefore publishes a **Visual Evidence Bundle**:

| Artifact | Role |
| --- | --- |
| PNG | Canonical. Unmodified source pixels. |
| `visual-manifest.json` | Provenance between PNG and PDF page. |
| `visual-review.pdf` | Human/document review transport. |
| JPEG connector preview | GitHub.fetch_file base64 transport. Hard limit 40960 bytes. |

The PDF is not a second original. If PDF and PNG ever disagree, the PNG wins. JPEG previews are not originals either.

## Connector JPEG algorithm

Preferred width 960px, aspect ratio preserved, never upscale. Encode with Chrome JPEG quality 80→32. If the file still exceeds 40960 bytes, drop width by 80px down to min(800, source). If that still exceeds the budget, fail loudly. Do not use a full-page PNG as the primary connector preview.

## How screenshots are captured

`scripts/visual-evidence/capture.mjs` drives a **local** `dist/` over loopback HTTP, using the **system** Chrome/Chromium (same candidate list as the frozen validators: `CHROME_PATH`, `google-chrome`, `chromium`, …). Control is CDP, not a new npm package.

A `VisualCaptureConfigV1` JSON declares, per shot:

- viewport (`desktop` 1440×900 or `mobile` 390×844, `deviceScaleFactor` 1);
- `full_page` or a structured target (`page`, `data-testid`, or union of hooks);
- declarative actions (`set-filter` on the TASK filter hooks, `click-testid`, `wait`).

B03 captures already in this repository were produced after validation, from each arm's `dist/`, by the experiment runtime (Chrome + `puppeteer-core` + the seed `scripts/lib/browser.mjs`). This infrastructure consumes those PNGs; it does not recapture them and does not launch workers.

B04 future captures are declared in `benchmarks/B04-atlas/visual-capture.json`. That file is evidence configuration. It is not a change to `TASK.md`, `rubric.md`, `seed/`, or `validation/`. It uses only the frozen markup contract (`data-testid="kpi"`, `filter-period`, `filter-segment`, `chart`, `segment-table`) and the frozen filter values `q1` / `full-year` / `all` / `enterprise`. Chart identity is TASK order among `[data-testid="chart"]` because `data-chart` names are not frozen.

## How the PDF is generated

1. Write local HTML (no remote assets). Each screenshot is its own sheet with a text header (id, filename, dimensions, SHA256).
2. Print that sheet with Chrome `Page.printToPDF`, backgrounds on.
3. Concatenate sheets with `pdfunite`.

Scaling is allowed only for page composition, with aspect ratio preserved. A very tall full-page PNG is **not** shrunk into one illegible thumbnail; it keeps a readable width and continues on subsequent PDF pages. That pagination does not crop the source PNG.

## Reproducibility

PNG SHA256 is stable when capture is not repeated.

PDF SHA256 is **not** claimed byte-identical across reruns: Chrome writes `/CreationDate`, `/ModDate`, and `/ID`. Semantic identity is: same PNG hashes, same `pdf_pages` mapping, same page-count policy. This is documented instead of being falsified.

## Blind review

Public labels are only **Candidate X** and **Candidate Y**. The real mapping (`direct` / `agentlab`) lives in `.runs/<experiment>/blind-map.json` and is gitignored until scores are sealed.

```
workers complete
  → captures
  → random X/Y mapping (private)
  → blind PDFs published
  → evaluator scores
  → scores sealed
  → mapping revealed
  → source / metrics published or identified
```

`evaluation/visual-access-check/` is a transport proof on the already-published B03 PNGs. It is not a B03 rescore. Its X/Y mapping is arbitrary and private.
