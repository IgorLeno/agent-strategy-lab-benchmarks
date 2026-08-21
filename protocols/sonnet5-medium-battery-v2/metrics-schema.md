# Metrics schema (FROZEN)

The per-arm record of this battery. The reference implementation is
`experiments/CLAUDE-SONNET5-MEDIUM-B04-V1/*/metrics.json`; this document freezes
what that file taught, including the two things it got wrong.

Machine schema for the experiment record: [`schemas/experiment-result.schema.json`](../../schemas/experiment-result.schema.json).
Corpus-level description: [`docs/result-schema.md`](../../docs/result-schema.md).

## Per-arm fields

Each arm publishes `metrics.json` with at least:

| Field | Notes |
| --- | --- |
| `schema_version` | `1` |
| `benchmark_id` | e.g. `B05-relay` |
| `arm` | `direct` or `agentlab` |
| `seed_sha` | the frozen seed commit of the benchmark |
| `task_sha256` | SHA256 of the `TASK.md` bytes actually given to the worker |
| `rubric_sha256` | SHA256 of the frozen `rubric.md` |
| data hashes | fixture hashes where the benchmark has fixtures (B04 `financial_json_sha256`, B06 migration/invalid cases, B07 frozen JSONL fixtures) |
| `agent` | `claude` |
| `model` | `claude-sonnet-5` |
| `reasoning_effort` | `medium` |
| `profile_id` | the Agent Lab profile, or `null` for the direct arm |
| `started_at` | ISO 8601 with milliseconds, UTC |
| `finished_at` | ISO 8601 with milliseconds, UTC |
| `wall_clock_ms` | see **Wall clock** below |
| `wall_clock_ms_provenance` | how it was derived |
| `worker_runtime_ms` | `{ value, provenance }` |
| `launch_count` | number of worker launches in this arm |
| `first_pass` | `true` when the initial attempt passed validation |
| `repair_used` | `true` when the single allowed repair ran |
| `final_status` | `PASS` or `FAIL` |
| `tokens` | `{ input, cached_input, output, reasoning, total, provenance }` |
| `quota` | `{ value, unit, provenance }` |
| `api_equivalent_usd` | `{ value, provenance }` |
| `billing_mode` | `subscription_only` |
| `human_interventions` | array; empty when none |
| `changed_files` | `{ count, paths, insertions, deletions }` |
| `final_commit_sha` | the arm's final commit in its workspace |
| `modelUsage` | provider object, verbatim |
| `model_purity_warning` | present only when a helper model appeared |

## Wall clock

**Canonical `wall_clock_ms` is the delta between `started_at` and
`finished_at`.** Nothing else.

`CLAUDE-SONNET5-MEDIUM-B04-V1` stored a second, hardcoded `wall_clock_ms`
emitted by another component, which disagreed with its own ISO timestamps by
1925 ms in one arm and 3301 ms in the other. That divergence had to be resolved
after the fact and is recorded in that experiment's
`integrity.metrics_divergence`.

For this battery:

- `wall_clock_ms` is computed from the sealed ISO timestamps and is
  recomputable by any reader;
- a value emitted by another component may be published as **auxiliary
  evidence**, in a clearly named field, never as the canonical value;
- overhead and ratio calculations use the ISO delta;
- `wall_clock_ms_provenance` says so explicitly.

The wall clock covers the whole arm, including validation.

## Tokens

`tokens.total = input + cache_creation + cache_read + output`.

- `cached_input` is the provider's `cache_read_input_tokens`.
- Cache-creation tokens are part of `total`; they are never dropped, and the
  provenance string states the arithmetic.
- `reasoning` is a subset of `output` where the provider reports it that way.
- The provenance names the source, e.g. the provider JSON field it came from.

## API-equivalent USD

An **estimate** derived from the provider's cost fields. Under
`billing_mode: subscription_only` nothing in this battery is charged per token,
so this number is never presented as an invoice, a bill, or a saving. The
provenance says which model rows it sums.

## UNKNOWN

A measurement that was not taken stays `null` / `"UNKNOWN"` /
`"NOT_EVALUATED"`, with provenance explaining why.

`UNKNOWN` is never written as `0`. Substituting zero would fabricate efficiency,
and the arithmetic downstream would silently propagate the fabrication.

## Model purity

Expected implementer: `claude-sonnet-5`, effort `medium`.

If `modelUsage` shows a small helper model while the implementer stayed Sonnet 5
Medium, the arm records:

```json
"model_purity_warning": {
  "code": "MODEL_PURITY_WARNING",
  "implementer": "claude-sonnet-5",
  "implementer_effort": "medium",
  "helper_models": ["..."],
  "action": "preserved modelUsage; not invalidated because implementer remained Sonnet 5 Medium"
}
```

and the experiment is `VALID_WITH_MODEL_PURITY_WARNING`. `modelUsage` is kept
verbatim. If the implementer itself changed, the experiment is `RUN_INVALID`.

## Comparisons between arms

`overhead_agentlab_vs_direct` reports the signed relative difference per
dimension, with the exact float alongside the rounded display value, and names
the basis it used (`wall_basis: "ISO started_at/finished_at delta"`).

Derived ratios such as "tokens per quality point" are labelled descriptive.
They are not efficiency measurements and not causal claims.

## What must not appear

- raw run directories, harness logs, worker transcripts;
- authentication status, credentials, quota dumps beyond the recorded summary;
- absolute operator paths or home directories;
- `node_modules/`, `dist/`, build caches;
- any arm-identifying value inside a pre-reveal blind bundle.
