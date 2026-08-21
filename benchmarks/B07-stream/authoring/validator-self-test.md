# B07 — validator self-test

Evidence that `validation/` discriminates between a complete implementation and
one that is correct but not streaming, or streaming but not deterministic.
Produced during benchmark construction, before any experiment. **No model was
invoked**: the mutants are deterministic textual patches applied by the
benchmark author.

The reference implementation is **not published**. Only the verdicts are
recorded here.

## Method

For each row, the frozen seed tree was copied, the reference implementation was
applied, one property was then removed, and the frozen commands were run
unchanged:

```
go build ./...
go run ./validation
```

The validator reports 28 checks in five groups: `environment`, `correctness`,
`determinism`, `errors`, `performance`.

## Results

| Variant | Verdict | Checks passed | Failing groups |
| --- | --- | ---: | --- |
| frozen seed (nothing implemented) | **FAIL** | 8/28 | correctness, determinism, errors, performance |
| reference | **PASS** | 28/28 | — |
| reference, but retains every line in memory | **FAIL** | 26/28 | performance |
| reference, but builds `by_category` / `by_status` from map iteration | **FAIL** | 13/28 | correctness, determinism, performance |
| reference, but does not deduplicate `event_id` | **FAIL** | 24/28 | correctness, performance |
| reference, but reads lines with a default `bufio.Scanner` (64 KiB cap) | **FAIL** | 26/28 | determinism |
| reference, but keeps the seed's lax field validation | **FAIL** | 23/28 | correctness, performance |

## What this shows

- The frozen seed builds, vets, and passes its own 10-test suite, and still
  fails external validation for four independent reasons.
- **Correct but not streaming is caught.** The "retains every line" variant
  produces byte-perfect artifacts for every fixture and still fails, on the
  memory checks alone. Correctness is not a substitute for the memory
  property.
- **Non-deterministic output is caught**, both through the repeated-run and
  buffer-size checks and through direct comparison with the recomputed bytes.
- **Fitting the output to the fixtures is caught**: `no-hardcoded-output` runs
  a second fixture generated from a different seed, and every incomplete
  variant above fails it.
- A buffer-size bug that only appears on a 200 KiB line is caught even though
  every frozen fixture is small.

## Measurement honesty

Peak resident memory is `ru_maxrss` of the terminated child process. During
construction the first version of this validator reported the **parent's**
resident set for both children, because a large parent is copied into a
forked child's accounting: the reference and the frozen seed both reported the
same 176 MiB.

The validator therefore streams the large fixture to disk instead of holding
it, and takes both measurements before any expectation is computed in memory.
Under that method the same two binaries measure 46 MiB (reference) and 242 MiB
(frozen seed) on a 57 MiB input, which is the separation the bounds rely on.

## Frozen-seed baseline

```
go build ./...      -> exit 0
go vet ./...        -> exit 0
go test ./...       -> ok (10 tests)
go run ./validation -> exit 1, 8/28
```
