# B05 — validator self-test

Evidence that `validation/check.py` discriminates between complete and
incomplete repairs. Produced during benchmark construction, before any
experiment. **No model was invoked**: the mutants are deterministic textual
patches applied by the benchmark author.

The reference repair itself is **not published**. Publishing it would put a
solution to the frozen TASK in the same corpus as the benchmark. Only the
verdicts are recorded here.

## Method

For each row, the frozen seed tree was copied, zero or more of the four
regressions of `TASK.md` §3 were repaired, and the frozen validator was run
unchanged:

```
python3 validation/check.py
```

The validator reports 39 checks in six groups: `environment`, `api`, `retry`,
`cancel`, `pagination`, `cache`, `preserved`.

## Results

| Regressions repaired | Verdict | Checks passed | Failing groups |
| --- | --- | ---: | --- |
| none (frozen seed) | **FAIL** | 29/39 | retry, cancel, pagination, cache |
| A only | **FAIL** | 30/39 | cancel, pagination, cache |
| B only | **FAIL** | 31/39 | retry, pagination, cache |
| C only | **FAIL** | 35/39 | retry, cancel, cache |
| D only | **FAIL** | 30/39 | retry, cancel, pagination |
| A + B | **FAIL** | 32/39 | pagination, cache |
| A + B + C | **FAIL** | 38/39 | cache |
| B + C + D | **FAIL** | 38/39 | retry |
| A + B + C + D | **PASS** | 39/39 | — |

## What this shows

- The frozen seed fails, and fails for the four intended reasons rather than
  for an environment problem.
- Every partial repair still fails. No single fix, and no combination of three
  fixes, is enough.
- The complete repair passes with no residual failure.
- Each regression is observable through at least one check group of its own,
  so a candidate that repairs three of four cannot be scored as complete.

## Frozen-seed baseline

The seed's own suite is green on the frozen tree:

```
python3 -m compileall -q src tests      -> exit 0
python3 -m unittest discover -s tests -t tests  -> Ran 37 tests, OK
python3 validation/check.py             -> exit 1, 29/39
```

That combination is the point of the benchmark: the repository looks healthy
from the inside and is not.
