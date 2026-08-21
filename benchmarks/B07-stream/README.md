# B07 — STREAM JSONL event pipeline

Frozen benchmark definition. Do not edit `TASK.md`, `rubric.md`, `seed/` or
`validation/` after an experiment has used them.

| Field | Value |
| --- | --- |
| `benchmark_id` | `B07-stream` |
| Title | STREAM JSONL event pipeline (Go) |
| Language | Go >= 1.24, standard library only |
| Task type | Data pipeline: correctness, determinism, memory |
| Visual evaluation | Not required |
| Seed SHA | `f7fd072115e0efa695be6182cb463ca9c109900a` |
| Network | Forbidden |

Work statement: [`TASK.md`](TASK.md). Scoring: [`rubric.md`](rubric.md).
Hashes: [`manifest.json`](manifest.json). Agent Lab PlanFile: [`plan.yaml`](plan.yaml).

## What the candidate receives

`seed/` is a Go module with the event type, a partially implemented CLI, small
fixtures and a green 10-test suite. It reads the whole file into memory, does
not deduplicate, orders its output by map iteration, and leaves timestamps in
their input offset. `TASK.md` specifies the contract exactly — both artifacts,
byte for byte — and the frozen memory and time envelope.

`validation/` at this level is a byte-identical copy of `seed/validation/`,
kept here for discovery and hash verification. The operator restores it into
the working tree from this frozen copy before validating.

## Large fixture

The performance fixture is **not stored**. `validation/gen.go` regenerates
400 000 events (about 57 MiB) byte for byte from a frozen seed, using its own
xorshift64\* generator so the bytes do not depend on the Go version's
`math/rand`. The validator streams it to disk rather than holding it, which is
what makes the child-process memory measurement meaningful.

## Validation

```
go build ./...
go vet ./...
go test ./...
go run ./validation
```

## Construction evidence

[`authoring/validator-self-test.md`](authoring/validator-self-test.md) records
the mutation matrix, including the variant that is byte-perfect on every
fixture and still fails because it keeps the input in memory. The reference
implementation is not published.
