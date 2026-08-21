# Validity policy (FROZEN)

## Human intervention

Any human action during a run is **evidence**, not an untracked detail. Every
intervention is recorded in the arm's `metrics.json` under
`human_interventions`, with what was done and when.

**Permitted**

- launching an arm;
- executing the frozen validation commands of the benchmark manifest;
- classifying an infrastructure failure when the rule below already covers it;
- capturing and publishing evidence;
- starting the single protocolled repair attempt.

**Not permitted**

- suggesting a solution, an approach, or a file to look at;
- editing the worker's source, tests or configuration;
- giving one arm information the other did not receive;
- substituting a validator, a seed, a TASK or a rubric;
- re-running an arm because the result is unflattering;
- revealing arm identity before the score seal.

An action outside the permitted list makes the experiment `RUN_INVALID`.

## PRODUCT_FAILURE vs INFRA_FAILURE

**`PRODUCT_FAILURE`** — the worker ran and its output did not satisfy the
frozen validators. This is a result. It is published, it counts, and it is
never converted into an infrastructure problem.

Examples: validation commands exit non-zero; the repair attempt does not fix
the failure; the worker stops early leaving the task incomplete; the worker
edits a protected file.

**`INFRA_FAILURE`** — the worker never got a fair chance to act, for a reason
outside the system under test.

Examples: the model provider is unavailable or refuses the connection; the
filesystem or the workspace is broken; the browser required by a validator
cannot start; the toolchain is missing or corrupt; the runner crashes **before
the worker acts**.

Rules:

1. An `INFRA_FAILURE` is never recorded as a model failure, and never as a
   quality result.
2. An `INFRA_FAILURE` before the worker acts allows one clean relaunch of that
   arm from the same seed, with a fresh session. The relaunch is recorded.
3. An `INFRA_FAILURE` **after** the worker has begun producing output does not
   allow a relaunch: the experiment stops and the partial evidence is
   preserved.
4. If a failure cannot be classified under these rules, **stop**. Do not guess,
   and do not classify it after seeing which arm it favours.

## RUN_INVALID

An experiment is `RUN_INVALID` when any of the following is true:

- the two arms did not start from the same seed;
- the two arms did not receive byte-identical `TASK.md`;
- the rubric used differs from the frozen `rubric.md`;
- the validator used differs from the frozen validator;
- the implementer model was not `claude-sonnet-5`;
- the reasoning effort was not `medium`;
- the Agent Lab baseline was not `14149421ca6d2a430ddcd4208116a12fa2c0c987`;
- the Agent Lab profile was not
  `claude-build-worker-subscription-sonnet5-medium-v3`;
- any part of the run was billed to an API key rather than the subscription;
- output, source, or metrics of one arm reached the other;
- an R2 run was contaminated by its R1 (see `replication-policy.md`);
- a protected benchmark file was mutated;
- arm identity was revealed before the score seal;
- a third attempt was made on an arm.

When a `RUN_INVALID` condition is met: **preserve every artifact already
produced, record the condition, and stop.** Do not delete the evidence, do not
average it away, and do not restart the battery without a new experiment id.

## Model purity

The expected implementer is `claude-sonnet-5` at `medium` effort.

If the provider's `modelUsage` shows a small helper model — for example a
`claude-haiku-4-5` call made by the harness — while the implementer remained
Sonnet 5 Medium, the experiment is
`VALID_WITH_MODEL_PURITY_WARNING`. `modelUsage` is preserved verbatim and the
warning is published.

If the implementer itself was a different model or a different effort, the
experiment is `RUN_INVALID`.
