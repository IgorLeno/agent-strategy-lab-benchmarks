# Replication policy (FROZEN)

Two of the six experiments repeat a task that has already been run:

| Replication | Repeats | Benchmark |
| --- | --- | --- |
| `CLAUDE-SONNET5-MEDIUM-B03-R2` | `CLAUDE-SONNET5-MEDIUM-B03-V1` | `B03-luma` |
| `CLAUDE-SONNET5-MEDIUM-B04-R2` | `CLAUDE-SONNET5-MEDIUM-B04-V1` | `B04-atlas` |

## What a replication is

A replication is a **new stochastic realisation of the same experiment**, not a
new benchmark and not a correction of the old one. It uses:

- the same benchmark, **byte for byte**: the same seed tree, the same
  `TASK.md`, the same `rubric.md`, the same validators, the same fixtures;
- fresh worker sessions in both arms;
- the same pinned model, effort, billing mode, profile and Agent Lab baseline;
- the frozen arm order for that experiment, which may differ from R1's.

`benchmarks/B03-luma/` and `benchmarks/B04-atlas/` are **not modified** for the
replications. Not the TASK, not the rubric, not the seed, not the validators,
not the manifest, not the plan, not the recorded hashes. If a replication would
require a change to the benchmark, it is not a replication, and it needs a new
benchmark version and a new experiment id instead.

## No contamination from R1

A replication is worthless if it is anchored to its original. Before the R2
score seal, no evaluator and no worker may receive:

- the R1 score, per criterion or total;
- the R1 winner, or the direction of the R1 result;
- R1 screenshots, review PDFs or connector previews;
- R1 source, patches or diffs;
- R1 metrics: wall clock, worker runtime, tokens, quota, API-equivalent;
- any narrative summary of R1, including this corpus's own `result.md`.

Concretely:

1. **Workers.** Both arms receive the frozen `TASK.md` and nothing else. No
   arm receives a previous attempt, a previous patch, or a note about what went
   well last time.
2. **Evaluator.** The evaluator scores R2's `Candidate X` and `Candidate Y`
   against the frozen rubric only. R1's score is not a reference point, not a
   prior, and not a tiebreaker. The R1 result may be read only **after** the R2
   seal exists.
3. **Workspaces.** R2 workspaces are created fresh from the frozen seed. No
   directory, cache, session or branch from R1 is reused.
4. **Comparison.** R1 and R2 are compared only after both are sealed and
   revealed. The comparison is a separate analysis; it never edits either
   record.

Violating any of these makes the replication `RUN_INVALID`
(see [`validity-policy.md`](validity-policy.md)).

## E05 — B03 LUMA R2

Arm order: **DIRECT → AGENTLAB**.

`CLAUDE-SONNET5-MEDIUM-B03-V1` completed with both arms passing deterministic
validation on the first attempt, and with **visual scoring pending**: no blind
quality score was ever assigned. R2 therefore is not "the second measurement of
a known number" — it is the first fully blind quality measurement of this task,
and it will be scored end to end under the protocol in
[`evaluation-protocol.md`](evaluation-protocol.md).

R2 produces, in this order: Candidate X / Y bundles, visual evidence, blind
source, sanitised validation, score seal, reveal, identified metrics.

The efficiency figures observed in R1 are not an expectation for R2 and are not
shown to the evaluator before the seal.

## E06 — B04 ATLAS R2

Arm order: **AGENTLAB → DIRECT**.

`CLAUDE-SONNET5-MEDIUM-B04-V1` is the one completed experiment where Agent Lab
led: +6 blind quality points, and lower wall clock, tokens and API-equivalent
cost. That is the **scientific motivation** for repeating the trial. It is not
an operational expectation, it is not a target, and it is not shown to any
worker or to the evaluator before the R2 seal.

### Known B04 validator limitation, preserved on purpose

`benchmarks/B04-atlas/validation/check.mjs` tests the stale-panel transition on
the **period** axis and not on the **segment** axis, although `TASK.md` requires
every panel to react to both. Both arms of R1 shared the resulting gap.

**This limitation is intentionally preserved for R2.** Fixing the validator
would change the benchmark, which would make R2 a different experiment rather
than a replication of R1. The gap is recorded in the R1 experimental backlog
and stays there.

The generalised lesson is already frozen for the new benchmarks of this
battery:

> Every independent behavioural axis that is specified to affect a system must
> receive an independent validation transition whenever it is objectively
> testable.

B05, B06 and B07 were built under that rule. B04 was not, and is not retrofitted.

## After the battery

Once all six experiments are sealed and revealed, R1 and R2 may be compared.
Useful questions the pair can answer:

- does the direction of the R1 result hold?
- how large is run-to-run variation relative to the between-arm difference?
- is the efficiency ordering stable, or was it a single draw?

Questions the pair cannot answer: anything about Agent Strategy Lab in general.
Two runs of one task on one model remain two runs of one task on one model.
