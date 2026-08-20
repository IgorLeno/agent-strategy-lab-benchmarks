# Terminology

## Benchmark

A stable experimental **task definition**. Identified as `B01-screenshot`, `B02-minesweeper`, `B03-luma`, `B04-atlas`. Contains seed, TASK, rubric, validators, and fixtures. A benchmark does not contain model names, costs, or winners.

## Experiment

A **concrete execution** of a benchmark. Identified as `CLAUDE-SONNET5-MEDIUM-B02-V1`. Records model, effort, Agent Lab baseline, arm order, outputs, patches, metrics, validation, and evaluation. References `benchmark_id`; it does not redefine the TASK.

## Seed

The starting repository tree for a benchmark. The public identifier is the original Git commit SHA (`seed_sha`). This corpus stores the tree without a nested `.git/`.

## TASK

The work statement both arms receive. `TASK.md` at the benchmark root and `seed/TASK.md` are the same bytes. Experiments must record `task_sha256` of the file they actually used.

## Rubric

Human quality criteria frozen before outputs exist. Visual/UX scoring uses the rubric; deterministic validators do not award rubric points.

## Validator

The deterministic gate: `npm run typecheck`, `npm run build`, `npm test`, `npm run check`. `check` drives a headless browser against `dist/`. Validators are part of the benchmark, not of an experiment.

## Arm

One side of an experiment:

- **DIRECT** — coding agent on the seed, no Agent Lab orchestrator (`direct_profile = null`).
- **AGENT LAB** — the same worker launched through Agent Strategy Lab under a pinned profile.

## Baseline

The Agent Strategy Lab commit under test (`agent_lab_baseline`). Feature commits that exist as children of that baseline but are excluded from the trial are recorded as `excluded_agent_lab_commit`.

## Validity

- `VALID` — protocol held.
- `VALID_WITH_MODEL_PURITY_WARNING` — protocol held, with a recorded helper-model footnote.
- `INVALID` — a comparability rule was broken; do not treat metrics as an A/B result.
- `UNKNOWN` — not observed. Not zero.

## UNKNOWN / NOT_EVALUATED

A measurement that was not taken. Must not be replaced by `0`. Example: `code_quality = NOT_EVALUATED` on CLAUDE-SONNET5-MEDIUM-B02-V1.
