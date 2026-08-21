# Execution order (FROZEN)

The order below was fixed before any experiment in this battery ran. **It must
not be changed after any result is observed**, including a partial result such
as the outcome of a first arm.

| # | Experiment | Benchmark | First arm | Second arm |
| - | ---------- | --------- | --------- | ---------- |
| E04 | `CLAUDE-SONNET5-MEDIUM-B01-V1` | `B01-screenshot` | AGENTLAB | DIRECT |
| E05 | `CLAUDE-SONNET5-MEDIUM-B03-R2` | `B03-luma` | DIRECT | AGENTLAB |
| E06 | `CLAUDE-SONNET5-MEDIUM-B04-R2` | `B04-atlas` | AGENTLAB | DIRECT |
| E07 | `CLAUDE-SONNET5-MEDIUM-B05-V1` | `B05-relay` | DIRECT | AGENTLAB |
| E08 | `CLAUDE-SONNET5-MEDIUM-B06-V1` | `B06-bridge` | AGENTLAB | DIRECT |
| E09 | `CLAUDE-SONNET5-MEDIUM-B07-V1` | `B07-stream` | DIRECT | AGENTLAB |

Three experiments launch Direct first, three launch Agent Lab first. Order is
counterbalanced because "which arm ran first" is a nuisance variable: provider
load, cache state and operator attention all differ between a first and a
second launch. Alternating removes a systematic advantage from either arm
across the battery; it does not remove it within a single experiment, which is
why `n = 1` stays `n = 1`.

## Serial execution

The two arms of an experiment never run concurrently, and two experiments never
run concurrently. One arm at a time, start to finish, including its validation.

Reason: both arms draw on the same subscription and the same machine.
Concurrency would make wall clock, worker runtime and quota unattributable.

## Per-experiment sequence

For each experiment, in order:

1. Confirm the working tree of this corpus is clean and
   `./scripts/verify-frozen-hashes.sh` exits 0.
2. Confirm the Agent Lab checkout is at `14149421ca6d2a430ddcd4208116a12fa2c0c987`.
3. Read the launch packet in [`experiments/`](experiments/).
4. Prepare two isolated workspaces from the benchmark seed. Both start from the
   same seed tree and the same `TASK.md` bytes. Restore `validation/` (B05-B07)
   or `scripts/` (B01-B04) into each workspace from the frozen benchmark.
5. Launch the **first arm** named above. Record `started_at` before the launch
   and `finished_at` after its validation finishes.
6. Run the frozen validation commands of the benchmark manifest. If they fail,
   run the single allowed repair, then validate again.
7. Launch the **second arm**. Same procedure. The second arm receives nothing
   produced by the first.
8. Capture visual evidence when the packet requires it.
9. Package the blind bundle, assign `Candidate X` / `Candidate Y` at random, and
   write the mapping only to `.runs/<experiment_id>/blind-map.json`, which is
   gitignored.
10. Score blind. Seal the scores in `evaluation/score-seal.md`.
11. Reveal: write `evaluation/reveal.json`.
12. Publish `result.md`, `experiment.json`, `direct/`, `agentlab/`.

Steps 9 to 12 are detailed in [`evaluation-protocol.md`](evaluation-protocol.md).

## What the operator may do

Permitted during a run, and recorded as evidence:

- launching an arm;
- running the frozen validation commands;
- classifying an infrastructure failure when the frozen rule already covers it;
- publishing evidence;
- starting the single protocolled repair.

Not permitted:

- suggesting a solution or a direction to a worker;
- editing the worker's source;
- giving a hint to one arm that the other did not receive;
- choosing a different validator, a different seed or a different TASK;
- re-running an arm because its result is unflattering;
- changing the order in this file after observing any result.

Full definitions: [`validity-policy.md`](validity-policy.md).
