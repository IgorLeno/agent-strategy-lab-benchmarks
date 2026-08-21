# B06 — BRIDGE contract migration V1 → V2

Frozen benchmark definition. Do not edit `TASK.md`, `rubric.md`, `seed/` or
`validation/` after an experiment has used them.

| Field | Value |
| --- | --- |
| `benchmark_id` | `B06-bridge` |
| Title | BRIDGE contract migration V1 to V2 (TypeScript monorepo) |
| Language | TypeScript (Node >= 22, npm workspaces, project references) |
| Task type | Cross-layer schema migration |
| Visual evaluation | Not required |
| Seed SHA | `7c5e7b37040d0d65adc7ed10a3f75a61c717e53c` |
| Network | Forbidden |

Work statement: [`TASK.md`](TASK.md). Scoring: [`rubric.md`](rubric.md).
Hashes: [`manifest.json`](manifest.json). Agent Lab PlanFile: [`plan.yaml`](plan.yaml).

## What the candidate receives

`seed/` is a four-package monorepo — `packages/core`, `packages/api`,
`packages/client`, `apps/cli` — that reads, validates, migrates and writes a
pipeline configuration. Version 1 of the contract works end to end and has 24
passing tests. Version 2 is fully specified in `TASK.md` and implemented in no
layer: the parser rejects it, the serializer refuses it, the migration throws,
the service policy does not accept it, the client cannot resolve it, and
`bridge migrate` is a stub.

Each of the six layers has an independent responsibility, so repairing five of
them leaves the product broken — and the validator says which one is missing.

`validation/` at this level is a byte-identical copy of `seed/validation/`,
kept here for discovery and hash verification. The operator restores it into
the working tree from this frozen copy before validating.

## Dependencies

`typescript` and `@types/node` only, pinned in `seed/package-lock.json`. The
seed assumes `node_modules/` is already installed: there is no network access
during a run.

## Validation

```
npm run typecheck
npm run build
npm test
npm run check
```

`npm run check` runs the external validator, which recomputes the canonical
contract itself, drives every layer separately, and spawns the real CLI.

## Construction evidence

[`authoring/validator-self-test.md`](authoring/validator-self-test.md) records
the five-of-six mutation matrix. The reference implementation is not published.
