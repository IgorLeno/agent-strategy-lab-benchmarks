# Blind bundle — CLAUDE-SONNET5-MEDIUM-B04-V1

B04 ATLAS. Labels are only **Candidate X** and **Candidate Y**.

Arm identities are not in this directory. The private map is outside the repository and remains unpublished until remaining scores are sealed.

Each candidate folder contains:

- `visual-review.pdf` — review transport (not a second original)
- `visual-manifest.json` — PNG provenance
- `connector-previews/*.jpg` — eleven GitHub connector previews, each ≤ 40960 bytes
- `connector-preview-manifest.json` — JPEG provenance back to the source PNG
- `source/` — sealed final implementation snapshot (no `.git`, `node_modules`, `dist`, `coverage`, `runtime`)
- `patch.diff` — seed → final content diff, relative paths only
- `validation-summary.json` — observed validator exit codes and filter-combination KPI facts (no rerun)
- `correctness-evidence.json` — sanitized expected vs observed KPI and table/chart checks from the frozen check log

Canonical pixels remain the private PNGs captured after each arm was final. This bundle does not include arm names, wall time, tokens, or provider usage.

Visual scores already sealed are not restated here.

`quality_status = AWAITING_BLIND_EVALUATION` (Correctness / Code remaining)
