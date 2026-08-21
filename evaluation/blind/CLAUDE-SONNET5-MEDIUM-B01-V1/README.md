# Blind bundle — CLAUDE-SONNET5-MEDIUM-B01-V1

B01 screenshot-to-interface. Labels are only **Candidate X** and **Candidate Y**.

Arm identities are not in this directory. The private map is outside the repository and remains unpublished until scores are sealed.

Each candidate folder contains:

- `visual-review.pdf` — review transport (not a second original)
- `visual-manifest.json` — PNG provenance
- `visual/*.png` — canonical captures (do not edit)
- `connector-previews/*.jpg` — nine GitHub connector previews, each ≤ 40960 bytes
- `connector-preview-manifest.json` — JPEG provenance back to the source PNG
- `source/` — sealed final implementation snapshot (no `.git`, `node_modules`, `dist`, runtime)
- `patch.diff` — seed → final content diff, relative paths only
- `validation-summary.json` — observed validator exit codes and structured checks (no duration, no host path)
- `correctness-evidence.json` — sanitised frozen `npm run check` facts

`reference/reference.png` is the frozen specification. It is identical for both candidates and carries no arm identity.

Do not score cost, wall clock or tokens. Do not infer arm identity from filenames.
