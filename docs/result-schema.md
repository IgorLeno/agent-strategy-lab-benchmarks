# Result schema

Machine record: [`schemas/experiment-result.schema.json`](../schemas/experiment-result.schema.json).

Human summary: `experiments/<id>/result.md`.

## `experiment.json`

Required fields:

| Field | Meaning |
| --- | --- |
| `experiment_id` | Directory name, e.g. `CLAUDE-SONNET5-MEDIUM-B02-V1` |
| `benchmark_id` | Directory under `benchmarks/`, e.g. `B02-minesweeper` |
| `status` | `COMPLETE` when both arms finished under the protocol |
| `agent_lab_baseline` | 40-hex commit of Agent Strategy Lab |
| `excluded_agent_lab_commit` | Feature commit that must not participate |
| `model` | Implementer model id |
| `reasoning_effort` | Pinned effort |
| `direct_profile` | Always `null` for the direct arm |
| `agentlab_profile` | Pinned Agent Lab profile id |
| `seed_sha` | Original seed commit |
| `task_sha256` | SHA256 of the TASK bytes used |
| `arm_order` | `DIRECT` / `AGENTLAB` in launch order |
| `validity` | See `docs/terminology.md` |

Optional but expected on a published trial: `warning`, `winner`, `evaluation`, `integrity`, `overhead_agentlab_vs_direct`.

`evaluation.code_quality` may be `"NOT_EVALUATED"`. That string must not be coerced to `0`.

## Per-arm files

Each arm directory (`direct/`, `agentlab/`) publishes:

| File | Contents |
| --- | --- |
| `source/` | Final application tree (no `.git/`, `node_modules/`, `dist/`) |
| `patch.diff` | `git diff --binary` from the B0x seed to that tree |
| `metrics.json` | Wall clock, worker runtime, tokens, API-equivalent USD, diffstat |
| `validation.json` | The four frozen validator commands and hashes of their captured streams |
| `screenshots/` | Captured frames when they exist; otherwise empty on purpose |

## Token totals

`tokens.total = input + cache_creation + cache_read + output`.

`tokens.cached` in this corpus is `cache_read_input_tokens` from the provider JSON. Cache-creation tokens are included in `total` via provenance, not discarded.

`reasoning` tokens are a subset of `output` when the provider reports them that way.

## API-equivalent USD

Provider `total_cost_usd` (or harness equivalent). Subscription runs are not invoices. Display rounding (three decimals) is recorded separately from the exact observed float.

## What the schema refuses

- Treating `UNKNOWN` as `0`.
- Embedding raw `run/` paths, auth dumps, or operator home directories.
- Redefining TASK/rubric inside the experiment record.
