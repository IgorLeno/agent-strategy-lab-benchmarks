# B7 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

There is no visual component. Evidence used by the evaluator, per candidate:

- the candidate source tree;
- `patch.diff` against the frozen seed;
- the sanitised external validation summary (`go run ./validation` report,
  which is grouped by concern and carries the measured memory and time);
- the candidate's test suite.

| # | Criterion             | Weight |
| - | --------------------- | ------ |
| 1 | Correctness           | 50     |
| 2 | Memory / Performance  | 20     |
| 3 | Determinism           | 10     |
| 4 | Error handling        | 10     |
| 5 | Code / Tests          | 10     |

## 1. Correctness — 50

Both artifacts match `TASK.md` §3–§6 byte for byte.

- **45-50** — Every fixture matches exactly: reason selection and its
  precedence, duplicate handling with the first occurrence accepted,
  `events.duplicates` consistent with `events.rejected`, blank-line accounting,
  no phantom line from a trailing newline, `raw` truncated at 1024 bytes, key
  order in both artifacts, all four categories and all three statuses always
  present, `customers.top` ordering and cap, UTC normalisation of the time
  range, `null` time range on an empty input, base name in `input.path`.
- **35-44** — External validation passes with one detail arrived at
  incidentally rather than by rule: an ordering that happens to hold for the
  fixtures, a `raw` bound applied at a different layer, an accounting field
  derived from another instead of counted.
- **25-34** — Passes only after the single allowed repair, or one contract area
  of §3–§6 is visibly weaker than specified.
- **12-24** — One artifact is wrong in a way the fixtures did not catch: a
  reason precedence inverted, a category omitted when its count is zero, a
  timestamp left in its input offset.
- **1-11** — Isolated parts correct.
- **0** — External validation does not pass.

**Caps.** Any of the following caps this criterion at 12 points:

- emitting any part of either artifact from a stored constant rather than from
  the input — including a summary fitted to the frozen fixtures;
- special-casing the validator (recognising its fixtures, sizes, or seed);
- editing `validation/` or `go.mod` to make a check pass;
- adding a module dependency.

The validator's second generated fixture exists to catch the first of these. A
candidate that fails only `no-hardcoded-output` is in this band, not in a
higher one.

## 2. Memory / Performance — 20

Judged on the design first and the measurement second. The measured numbers are
in the validation report.

- **18-20** — Genuinely streaming: the file is read incrementally, no
  collection grows with the number of *lines*, and the only state proportional
  to input is per-distinct-event or per-distinct-customer, which the TASK
  expects. Long lines are handled by a bounded, growing buffer rather than by
  raising a limit until the fixture fits. Comfortably inside both memory bounds
  and the time budget.
- **14-17** — Streams, and stays inside the envelope, but carries avoidable
  retention: a slice of every reject held until the end, a full copy of each
  line kept when a view would do.
- **8-13** — Inside the absolute budget but failing, or barely passing, the
  growth bound: memory tracks input size even though the file is read in
  chunks.
- **3-7** — Reads the whole file, or all lines, into memory. Passes correctness
  and fails the memory checks.
- **0** — Exceeds the time budget, or cannot process the large fixture.

Tuning constants to sit just under a bound, rather than changing what is
retained, scores no higher than 13.

## 3. Determinism — 10

- **9-10** — Output is byte-identical across repeated runs and across every
  buffer size, and it is so by construction: every ordering in the output comes
  from an explicit sort or an explicit canonical list, never from map
  iteration. The 200 KiB line is handled identically at 1 KiB and 1 MiB
  buffers.
- **6-8** — Deterministic, with one ordering that holds because of an
  implementation detail rather than an explicit rule.
- **3-5** — Deterministic for the frozen fixtures only, or the buffer size
  changes something that does not reach the compared bytes.
- **1-2** — Output varies between runs.
- **0** — Output varies between runs in a way that changes the totals.

## 4. Error handling — 10

- **9-10** — Every exit code of `TASK.md` §2 is correct, each with a message on
  stderr; a bad line never aborts the run; I/O failures are reported rather
  than swallowed; the stream stays aligned after an oversized line.
- **6-8** — Correct codes, with one message missing or one failure path
  reported less precisely than it could be.
- **3-5** — A usage error and a processing error share an exit code, or a
  failure is silent.
- **1-2** — Errors are ignored or the tool panics on malformed input.
- **0** — Invalid input crashes the tool.

## 5. Code / Tests — 10

- **9-10** — The streaming reader, the validation rules and the aggregation are
  separable and named for what they do; no duplicated contract constants; tests
  cover the reason precedence, duplicates, blank lines, UTC normalisation,
  ordering and the CLI exit codes, and would fail on the frozen seed; `go vet`
  clean without suppressions.
- **6-8** — Reasonable structure; tests present but thin on the contract's
  edges.
- **3-5** — Logic concentrated in one function; tests assert the happy path
  only.
- **1-2** — Contract constants copied around; tests barely touched.
- **0** — Coverage removed, or tests weakened to pass.
