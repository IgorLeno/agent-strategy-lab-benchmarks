# Agent Strategy Lab Benchmarks

Reproducible **benchmarks** and **experiments** comparing [Agent Strategy Lab](https://github.com/IgorLeno/agent-strategy-lab) orchestration against direct coding-agent execution.

This repository is the public corpus. It is independent of the Agent Strategy Lab source tree. The system under test lives at:

**https://github.com/IgorLeno/agent-strategy-lab**

## What this repository contains

1. **Benchmarks and experiments.** Frozen task definitions live under `benchmarks/`. Concrete runs live under `experiments/`.
2. **Agent Strategy Lab is the system under test.** It is a separate repository. This corpus records how that system behaved on a given seed, model, and protocol — it does not contain the Lab itself.
3. **A benchmark is not an experiment.** A benchmark is the stable definition of a task. An experiment is one execution of that task under a named model, effort, baseline, and pair of arms.
4. **Each benchmark is frozen.** Seed, `TASK.md`, rubric, and validators are byte-stable. Hashes are recorded in `manifest.json`. Do not rewrite a TASK or rubric after an output has been observed.
5. **Experiments reference benchmarks.** They do not copy or redefine `TASK.md` / `rubric.md`. The experiment points at `benchmark_id` and records the seed SHA and TASK SHA256 it actually ran.
6. **Negative results are preserved.** A slower arm, a visual loss, a purity warning, or a failed validator stays in the record. Nothing is deleted because it is unflattering.
7. **UNKNOWN is never turned into zero.** A missing measurement is `null` / `UNKNOWN` / `NOT_EVALUATED` with provenance. Substituting `0` would fabricate efficiency.
8. **Direct and Agent Lab must use comparable conditions.** Same seed, same TASK bytes, same model, same reasoning effort, same validators, sequential execution, no cross-arm leakage.
9. **No individual result is a universal conclusion.** `n = 1` is `n = 1`. Read any `experiments/*/result.md` as one sealed trial, not as a ranking of Agent Strategy Lab.

## Benchmark vs experiment

```
BENCHMARK                         EXPERIMENT
─────────                         ──────────
stable task definition            one concrete execution
seed / TASK / rubric / validators model, effort, Lab baseline
fixtures                          arms, patches, metrics, evaluation
                                  references a benchmark_id
```

One benchmark may have many experiments.

## Layout

```
benchmarks/
  B01-screenshot/
  B02-minesweeper/
  B03-luma/
  B04-atlas/
  B05-relay/
  B06-bridge/
  B07-stream/
experiments/
  CLAUDE-SONNET5-MEDIUM-B02-V1/
  CLAUDE-SONNET5-MEDIUM-B03-V1/
  CLAUDE-SONNET5-MEDIUM-B04-V1/
protocols/
  sonnet5-medium-battery-v2/
docs/
  methodology.md
  terminology.md
  result-schema.md
  visual-evidence.md
schemas/
  experiment-result.schema.json
  visual-evidence-manifest.schema.json
  connector-preview-manifest.schema.json
scripts/visual-evidence/
evaluation/visual-access-check/
```

## Frozen benchmarks

| ID | Name | Directory | Language | Seed SHA | TASK SHA256 |
| -- | ---- | --------- | -------- | -------- | ----------- |
| B1 | Screenshot | `B01-screenshot` | TypeScript | `6e05bc6c557ff0d6bbddcbb2d92fabb1f01478ee` | `f7c737526774b34860860a1fa5f654bca4ce7393b0d7469bb599e715fdaae3b0` |
| B2 | Minesweeper | `B02-minesweeper` | TypeScript | `6d4ba2039c85cb778bcac0618d0859917ad0ce3a` | `edcfd47d5b12a14463b32bcee9c2931213a9446d439eb49ba3ce7435a46e4553` |
| B3 | LUMA | `B03-luma` | TypeScript | `ccaa84f46741f188f8bd053accbd9308659641f5` | `54b1681097e943f8f9a4626937d6320097c2a61fcb12541cff830300b8ea0cef` |
| B4 | ATLAS | `B04-atlas` | TypeScript | `7f95c4b294e459ed017fb7e5403aa3ff342fc076` | `4fcff64ab9aac698a88ef53925762eae7d4d3de4d108f2568fb7108db447fdc2` |
| B5 | RELAY | `B05-relay` | Python | `e9964d2ca14db42adf8de079d926149178bceb1f` | `2f82d177ee12240de0d1cb94442eca16d8de061a6fe01ae45be5d66b3a64597c` |
| B6 | BRIDGE | `B06-bridge` | TypeScript | `7c5e7b37040d0d65adc7ed10a3f75a61c717e53c` | `55d4e4fcc6057efe74496fd3cfec72f92bb57da032314f6726d0d1d18cdbb88a` |
| B7 | STREAM | `B07-stream` | Go | `f7fd072115e0efa695be6182cb463ca9c109900a` | `150cb4323860370dc0fe2c06413220ea600470fdd3d31c7d1b4637210fb46822` |

B1-B4 are React + TypeScript greenfield UI tasks. B5 is regression debugging in an existing Python system, B6 a schema migration that has to stay coherent across six layers of a TypeScript monorepo, B7 a Go data pipeline graded on determinism and memory as well as correctness.

Seeds are stored as trees, not nested Git repositories. The original seed commit SHA is the identifier in each `manifest.json`. For B5-B7 the `seed_sha_note` field records the exact command sequence that reproduces the SHA.

Recompute hashes with:

```bash
./scripts/verify-frozen-hashes.sh
```

## Published experiments

[CLAUDE-SONNET5-MEDIUM-B02-V1](experiments/CLAUDE-SONNET5-MEDIUM-B02-V1/result.md) — Claude Sonnet 5, medium effort, B02 Minesweeper. Both arms passed deterministic validation on the first attempt. Direct was more efficient and received the higher blind visual/UX score. **n = 1.**

[CLAUDE-SONNET5-MEDIUM-B03-V1](experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/result.md) — Claude Sonnet 5, medium effort, B03 LUMA. Both arms passed deterministic validation on the first attempt. Direct was more efficient on wall/runtime/tokens/API-equivalent. Visual scoring is pending blind evaluation. **n = 1.**

[CLAUDE-SONNET5-MEDIUM-B04-V1](experiments/CLAUDE-SONNET5-MEDIUM-B04-V1/result.md) — Claude Sonnet 5, medium effort, B04 ATLAS. Blind quality: Agent Lab 85/100, Direct 79/100 (+6). Both passed deterministic validation on the first attempt and share a segment-filter panel gap. **n = 1.**

## Prepared, not started

[`protocols/sonnet5-medium-battery-v2/`](protocols/sonnet5-medium-battery-v2/) freezes a six-experiment battery before any worker launch: `SONNET5-MEDIUM-BATTERY-V2`. Four new task contexts (B01, B05, B06, B07) and two replications of already-published experiments (B03-R2, B04-R2), all on Claude Sonnet 5 at medium effort against Agent Lab baseline `14149421`.

**Status: `PREPARED_NOT_STARTED`. No result exists yet, and none is implied by the protocol.** The directory carries the frozen arm order, the blind evaluation protocol, the metrics schema, the replication contamination rules, and one launch packet per experiment.

## What is not published

Raw runtime is not in this repository: `run/`, `auth-status.json`, `dev-runtime/`, `dev-inbox/`, worker transcripts, subscription quota dumps, credentials, or operator home paths. Arm `source/` trees are historical snapshots of the produced application, without `node_modules/` or `dist/`.

## License

MIT. See [LICENSE](LICENSE).
