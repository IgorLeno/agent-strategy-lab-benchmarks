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
experiments/
  CLAUDE-SONNET5-MEDIUM-B02-V1/
  CLAUDE-SONNET5-MEDIUM-B03-V1/
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

| ID | Directory | Seed SHA | TASK SHA256 |
| -- | --------- | -------- | ----------- |
| B1 | `B01-screenshot` | `6e05bc6c557ff0d6bbddcbb2d92fabb1f01478ee` | `f7c737526774b34860860a1fa5f654bca4ce7393b0d7469bb599e715fdaae3b0` |
| B2 | `B02-minesweeper` | `6d4ba2039c85cb778bcac0618d0859917ad0ce3a` | `edcfd47d5b12a14463b32bcee9c2931213a9446d439eb49ba3ce7435a46e4553` |
| B3 | `B03-luma` | `ccaa84f46741f188f8bd053accbd9308659641f5` | `54b1681097e943f8f9a4626937d6320097c2a61fcb12541cff830300b8ea0cef` |
| B4 | `B04-atlas` | `7f95c4b294e459ed017fb7e5403aa3ff342fc076` | `4fcff64ab9aac698a88ef53925762eae7d4d3de4d108f2568fb7108db447fdc2` |

Seeds are stored as trees, not nested Git repositories. The original seed commit SHA is the identifier in each `manifest.json`.

Recompute hashes with:

```bash
./scripts/verify-frozen-hashes.sh
```

## Published experiments

[CLAUDE-SONNET5-MEDIUM-B02-V1](experiments/CLAUDE-SONNET5-MEDIUM-B02-V1/result.md) — Claude Sonnet 5, medium effort, B02 Minesweeper. Both arms passed deterministic validation on the first attempt. Direct was more efficient and received the higher blind visual/UX score. **n = 1.**

[CLAUDE-SONNET5-MEDIUM-B03-V1](experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/result.md) — Claude Sonnet 5, medium effort, B03 LUMA. Both arms passed deterministic validation on the first attempt. Direct was more efficient on wall/runtime/tokens/API-equivalent. Visual scoring is pending blind evaluation. **n = 1.**

## What is not published

Raw runtime is not in this repository: `run/`, `auth-status.json`, `dev-runtime/`, `dev-inbox/`, worker transcripts, subscription quota dumps, credentials, or operator home paths. Arm `source/` trees are historical snapshots of the produced application, without `node_modules/` or `dist/`.

## License

MIT. See [LICENSE](LICENSE).
