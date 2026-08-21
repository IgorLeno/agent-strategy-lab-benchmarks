# B05 — RELAY job-relay regression debugging

Frozen benchmark definition. Do not edit `TASK.md`, `rubric.md`, `seed/` or
`validation/` after an experiment has used them.

| Field | Value |
| --- | --- |
| `benchmark_id` | `B05-relay` |
| Title | RELAY job-relay regression debugging (Python) |
| Language | Python (CPython >= 3.12, standard library only) |
| Task type | Regression debugging on an existing system |
| Visual evaluation | Not required |
| Seed SHA | `e9964d2ca14db42adf8de079d926149178bceb1f` |
| Network | Forbidden |

Work statement: [`TASK.md`](TASK.md). Scoring: [`rubric.md`](rubric.md).
Hashes: [`manifest.json`](manifest.json). Agent Lab PlanFile: [`plan.yaml`](plan.yaml).

## What the candidate receives

`seed/` is the starting tree: a job relay of about 1.2k lines under `src/relay`,
a green suite of 37 tests under `tests/`, and the external validator under
`seed/validation/`. Four interdependent regressions are present and are not
covered by the existing tests. `TASK.md` describes their symptoms and the
invariants to restore; it does not name files or lines.

`validation/` at this level is a byte-identical copy of `seed/validation/`, kept
here for discovery and hash verification. The operator restores it into the
working tree from this frozen copy before validating.

## Validation

```
python3 -m compileall -q src tests
python3 -m unittest discover -s tests -t tests
python3 validation/check.py
```

The validator drives the public API itself. It does not take the candidate's
test suite as evidence of correctness, though it does re-run it.

## Construction evidence

[`authoring/validator-self-test.md`](authoring/validator-self-test.md) records
the mutation matrix proving the validator separates complete repairs from
partial ones. The reference repair is not published.
