# Sonnet 5 Medium battery v2

**Status: `PREPARED_NOT_STARTED`. No experiment in this battery has been run.**

Six paired Direct × Agent Lab experiments, frozen before any worker launch.
This directory is the protocol. It defines what will be run, in what order,
under which pinned variables, and how the results will be evaluated. It carries
no results, and it must not be edited once the first experiment starts.

## Question

Unchanged from the corpus methodology:

> For the same software task and the same implementer worker, what does Agent
> Strategy Lab produce compared with using the same model directly?

Compared per arm: quality, correctness, first-pass success, need for repair,
wall clock, worker runtime, tokens, API-equivalent cost, launches, changed
files, human interventions.

## The six experiments

| # | Experiment | Benchmark | Kind | Arm order | Visual |
| - | ---------- | --------- | ---- | --------- | ------ |
| E04 | `CLAUDE-SONNET5-MEDIUM-B01-V1` | `B01-screenshot` | new context | AGENTLAB → DIRECT | yes |
| E05 | `CLAUDE-SONNET5-MEDIUM-B03-R2` | `B03-luma` | replication of `CLAUDE-SONNET5-MEDIUM-B03-V1` | DIRECT → AGENTLAB | yes |
| E06 | `CLAUDE-SONNET5-MEDIUM-B04-R2` | `B04-atlas` | replication of `CLAUDE-SONNET5-MEDIUM-B04-V1` | AGENTLAB → DIRECT | yes |
| E07 | `CLAUDE-SONNET5-MEDIUM-B05-V1` | `B05-relay` | new context | DIRECT → AGENTLAB | no |
| E08 | `CLAUDE-SONNET5-MEDIUM-B06-V1` | `B06-bridge` | new context | AGENTLAB → DIRECT | no |
| E09 | `CLAUDE-SONNET5-MEDIUM-B07-V1` | `B07-stream` | new context | DIRECT → AGENTLAB | no |

After this battery the corpus will hold nine paired experiments: B02, B03, B04,
B01, B03-R2, B04-R2, B05, B06, B07.

## Why two replications

The three completed experiments are each `n = 1`. A single trial cannot
separate two different things:

- **variation between tasks** — does the direction of the result depend on what
  is being built?
- **variation between runs of the same task** — does the same task, run again
  with fresh sessions, reproduce its own result?

B01, B05, B06 and B07 measure the first. B03-R2 and B04-R2 measure the second.
Replacing a replication with another new benchmark would leave the second
question unanswered, so the replications are not negotiable inside this
battery.

`B03-R2` also closes a gap in its original: `CLAUDE-SONNET5-MEDIUM-B03-V1`
finished with visual scoring pending. R2 will be scored blind from the start.

`B04-R2` asks whether the one result where Agent Lab led — higher blind quality
at lower wall, tokens and API-equivalent — reproduces. **Those numbers are the
motivation for repeating the trial, not an expectation of the outcome.** They
are not shown to any worker, and the R2 evaluator does not see them before the
score seal.

## Why four new contexts

The three completed experiments are all React + TypeScript greenfield UI work.
That is one narrow slice of software. The new benchmarks widen it deliberately,
without favouring either arm:

- **B01 Screenshot** — visual reconstruction where the specification *is* an
  image. Different from B03/B04: fidelity to a fixed reference rather than
  invention within a brief.
- **B05 RELAY** (Python) — debugging four interdependent regressions in an
  existing 1.2k-line system. No greenfield surface at all.
- **B06 BRIDGE** (TypeScript monorepo) — one schema change that has to stay
  coherent across six layers. Rewards carrying a change fully, not writing more.
- **B07 STREAM** (Go) — a data pipeline with verifiable memory and determinism
  properties, where a correct-but-not-streaming answer is objectively wrong.

Each of these can legitimately end `DIRECT > AGENT LAB`, `AGENT LAB > DIRECT`,
or a tie. None of them was designed around an Agent Lab feature.

## Frozen variables

Identical in all six experiments and in both arms:

| Variable | Value |
| --- | --- |
| Implementer | Claude Sonnet 5 |
| Model id | `claude-sonnet-5` |
| Reasoning effort | `medium` |
| Billing | Claude subscription only; no API billing |
| Agent Lab profile | `claude-build-worker-subscription-sonnet5-medium-v3` |
| Agent Lab baseline | `14149421ca6d2a430ddcd4208116a12fa2c0c987` |
| Excluded Agent Lab commit | `a24c0cb1d55724438c6a1c13d546797f11512084` |
| Sessions | fresh, per arm |
| Execution | strictly serial, never concurrent |
| Attempts | one INITIAL, at most one REPAIR |

The Agent Lab baseline stays at `14149421…` for the whole battery. Anything
found in Agent Lab during this battery goes to the experimental backlog, not
into the tree under test.

## Repair policy

At most one repair attempt per arm, after the initial attempt failed
deterministic validation.

- **Direct repair** — a fresh session, the original `TASK.md`, and the objective
  diagnostic output of the validator. Nothing else: no hint, no direction, no
  pointer to a file.
- **Agent Lab repair** — the bounded repair path of the frozen baseline.

A third attempt is forbidden. An arm that still fails after its repair is
recorded as failing.

Repair is a measured outcome, not a rescue: `first_pass` and `repair_used` are
published per arm regardless of the final status.

## Blinding

Every experiment is scored blind. The evaluator sees `Candidate X` and
`Candidate Y` and does not know which is Direct until the scores are sealed.

Full protocol: [`evaluation-protocol.md`](evaluation-protocol.md).

## Metrics

Per-arm schema, provenance rules, and the wall-clock rule inherited from
`CLAUDE-SONNET5-MEDIUM-B04-V1`: [`metrics-schema.md`](metrics-schema.md).

`UNKNOWN` is never stored as `0`. API-equivalent USD stays an estimate, never a
charge against the subscription.

## Replications

Contamination rules for B03-R2 and B04-R2, and the B04 validator limitation
that is preserved on purpose: [`replication-policy.md`](replication-policy.md).

## Stop policy

Stop, preserve the evidence, and do not continue when any of these holds:

- a `RUN_INVALID` condition of [`validity-policy.md`](validity-policy.md) is
  met;
- a failure cannot be classified as product or infrastructure under the frozen
  rules;
- an arm would need a third attempt;
- the two arms would not receive identical inputs;
- a result was observed before its score was sealed.

Stopping is the correct outcome in those cases. Re-running because a result is
unflattering is not permitted, and the battery order may not be changed after
any result is observed.

## Operator entry point

Execution order and per-experiment launch packets:
[`execution-order.md`](execution-order.md) and
[`experiments/`](experiments/).
