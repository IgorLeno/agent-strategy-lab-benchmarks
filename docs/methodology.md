# Methodology

This corpus records controlled A/B trials of **Agent Strategy Lab** against **direct** invocation of the same coding agent.

## Question

For the same software change and the same worker, what does Agent Strategy Lab cost and produce compared with using the model directly?

The independent variable is the control plane around the worker. The worker (model, reasoning effort, billing mode) is pinned identically in both arms.

## Comparable conditions

Both arms of an experiment must share:

- the same frozen seed SHA;
- the same `TASK.md` bytes;
- the same validator commands and timeouts;
- the same implementer model and reasoning effort;
- sequential execution (never concurrent);
- isolated workspaces (no result of one arm visible to the other);
- the same Agent Lab baseline commit, with excluded feature commits recorded and unused.

If any of those diverge, the run is `INVALID`, not a data point to be averaged away.

## Frozen definitions

A benchmark is sealed before any worker launch:

- `seed/` — starting tree;
- `TASK.md` — the only work statement both arms receive;
- `rubric.md` — quality criteria, written before outputs exist;
- `validation/` — deterministic gates (`typecheck`, `build`, `test`, `check`).

Changing a TASK or rubric after observing an output invalidates the experiment that used it. New work gets a new benchmark id or a new experiment id.

## Arms

**DIRECT** launches the coding agent on a clone of the seed, with `TASK.md` as the prompt and no Agent Lab orchestrator.

**AGENT LAB** launches `dev-run-plan` on a clone of the same seed, with the same TASK text as the PlanFile `objective`, under a single pinned profile.

Repair, when allowed, is at most one additional attempt after the initial validation. A third attempt is forbidden.

## Measurement

- **Wall clock** covers the whole arm, including validation.
- **Worker runtime** is the provider/harness duration of the implementer process.
- **Tokens** come from the provider JSON. Cache-creation tokens are part of the total; they are not dropped.
- **API-equivalent USD** is an estimate from provider cost fields. It is not a charged invoice when billing is subscription-only.
- **Deterministic status** is the four frozen validators. Extra harness checks are noted, not substituted for the contract.

Missing values stay `UNKNOWN` / `null` with provenance. They are never stored as zero.

## Quality evaluation

Quality is scored separately from cost.

Visual/UX scoring, when performed, is **blind**: candidates are labelled Candidate X / Candidate Y before arms are revealed. Functionality may be taken from the deterministic validator. Code-quality scores that were not assigned remain `NOT_EVALUATED`.

## Visual evidence

Canonical pixels are **PNG**. A **PDF** is a review/transport layer so an evaluator can read the captures as a document when the review surface cannot render Git binaries. A **manifest** (`VisualEvidenceManifestV1`) records SHA256, dimensions, and which source PNG produced each PDF page.

The PDF never replaces the PNG, never color-corrects it, and never crops it destructively. Tall full-page captures paginate at readable width.

Blind sequence:

1. workers complete;
2. captures (canonical PNGs);
3. random X/Y mapping written only to `.runs/<experiment>/blind-map.json` (gitignored);
4. blind PDFs + manifests published;
5. evaluator scores;
6. scores sealed;
7. mapping revealed;
8. source / metrics published or identified.

Infrastructure: [`scripts/visual-evidence/README.md`](../scripts/visual-evidence/README.md). Full protocol: [`docs/visual-evidence.md`](visual-evidence.md).

## Purity warnings

If the implementer argv is pinned to one model but provider `modelUsage` lists a helper model, the experiment may still be `VALID_WITH_MODEL_PURITY_WARNING` when the helper is small and the implementer remains the pinned model. The warning is part of the public record.

## Reading results

A completed experiment is one sealed trial. It does not rank Agent Strategy Lab in general, does not transfer across models, and does not license dropping later negative results.
