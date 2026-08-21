# B5 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

There is no visual component. Evidence used by the evaluator, per candidate:

- the candidate source tree;
- `patch.diff` against the frozen seed;
- the sanitised external validation summary (`validation/check.py` report);
- the candidate's test suite.

| # | Criterion                       | Weight |
| - | ------------------------------- | ------ |
| 1 | Correctness / Regression safety | 70     |
| 2 | Public API preservation         | 10     |
| 3 | Minimality / Scope discipline   | 10     |
| 4 | Tests                           | 10     |

## 1. Correctness / Regression safety — 70

The four regressions of `TASK.md` §3 are: **A** duplicate execution, **B**
cancel accounting, **C** pagination boundary, **D** stale read after mutation.

Each is worth up to 15 points, judged on the fix itself, not only on the
validator verdict. The remaining 10 points are for not introducing a new defect.

Per regression (×4, 15 each):

- **13-15** — Fixed at the cause. The invariant named in the TASK holds for the
  whole class of inputs, not only for the sequence the validator exercises. The
  fix is expressed where the responsibility lives.
- **9-12** — Fixed, but at one remove from the cause: a guard added at a caller
  rather than in the component that owns the invariant, or a fix that holds for
  the tested shape and is fragile for a neighbouring one.
- **5-8** — The observable symptom is gone, the cause is not addressed:
  special-casing, a compensating second wrong, or a fix that only covers one of
  the two directions/paths the TASK names.
- **1-4** — Partially addressed; the invariant still breaks under a
  straightforward variation.
- **0** — Not fixed, or "fixed" by removing the behaviour.

Absence of new defects (10):

- **9-10** — External validation passes and no previously correct behaviour
  regressed: priority ordering, backoff, dead-lettering, lease validation,
  detached returns, error types.
- **5-8** — Passes, with one behaviour weakened (for example a broadened
  exception, or an invariant now enforced only by a caller).
- **1-4** — External validation passes only after the single allowed repair
  attempt, or a previously correct behaviour changed.
- **0** — External validation does not pass.

**Caps.** Any of the following caps this criterion at 20 points total:

- deleting, disabling or narrowing a public behaviour to make a check pass;
- special-casing the validator (detecting its fixtures, ids, or call order);
- making a check pass by editing `validation/`.

## 2. Public API preservation — 10

- **10** — Every export, method, parameter name, dataclass field and `JobState`
  value of `TASK.md` §4 is intact; returned objects are still detached; error
  types are unchanged and still raised in the same situations.
- **7-9** — Intact, with one cosmetic addition that no caller has to know about
  (a new keyword argument with a default, a new helper).
- **4-6** — A signature, field or exported name changed in a way a caller would
  notice, even if the validator's surface check still passes.
- **1-3** — Several surface changes, or behaviour of an existing method
  redefined.
- **0** — The public surface was reorganised.

## 3. Minimality / Scope discipline — 10

Judged on *where* the diff lands, not on how many lines it has. A larger diff
that is entirely caused by the four fixes scores above a smaller diff that
smuggles in a refactor.

- **9-10** — Every hunk is attributable to one of the four causes or to test
  coverage for it. No unrelated refactor, no renaming, no new abstraction, no
  dead code, no leftover debugging output, no reformatting of untouched code.
- **6-8** — Attributable, with one small opportunistic change (a tidy-up in a
  touched function, an extra comment block).
- **3-5** — A visible unrelated change: a module reorganised, a helper
  introduced that the fix did not need, or formatting churn across files the
  fix did not require.
- **1-2** — Substantial rewriting of working code around the fixes.
- **0** — The system was rewritten.

Dead code, commented-out code, or debug prints left in the diff cost at least
3 points here regardless of the band.

## 4. Tests — 10

- **9-10** — Each of the four regressions has a test that fails on the frozen
  seed and passes on the repair, written against the public API, deterministic
  on the injected clock. Existing coverage is preserved.
- **6-8** — Three of the four covered, or coverage present but shallow (asserts
  a symptom rather than the invariant).
- **3-5** — One or two covered, or new tests duplicate what the external
  validator already does without adding a case.
- **1-2** — Tests barely touched.
- **0** — Coverage removed, tests weakened to pass, or the suite no longer runs.

A test that encodes the broken behaviour, or that is skipped/xfailed to make the
suite green, scores 0 here.
