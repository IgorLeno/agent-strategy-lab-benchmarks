# Evaluation protocol (FROZEN)

Every experiment in this battery is scored blind, before arm identity is known.
Quality is scored separately from cost: the rubric never awards points for
being faster or cheaper.

## Sequence

```
both arms complete
  → deterministic validation recorded
  → evidence captured (visual where required)
  → random X / Y assignment, written only to .runs/<experiment_id>/blind-map.json
  → blind bundle published
  → evaluator scores against the frozen rubric
  → scores sealed in evaluation/score-seal.md
  → mapping revealed in evaluation/reveal.json
  → identified source, metrics and result published
```

The order is not a suggestion. Publishing anything that identifies an arm
before the seal makes the experiment `RUN_INVALID`.

## What the blind bundle may contain

Permitted before the seal:

- `candidate-x/source/` and `candidate-y/source/` — the final application tree;
- `patch.diff` per candidate, against the frozen seed;
- `validation-summary.json` per candidate — pass/fail per frozen command, with
  the validator's own report where it produces one;
- `correctness-evidence.json` per candidate;
- screenshots, review PDFs and JPEG connector previews, for the visual
  experiments;
- for B01 only, the frozen `reference/reference.png`, which is identical for
  both candidates and therefore carries no arm identity.

**Forbidden before the seal:**

- the words `direct` or `agentlab` anywhere in the bundle, including paths,
  filenames, commit messages and JSON keys;
- `profile_id`;
- worker runtime, wall clock, tokens, quota, `modelUsage`, API-equivalent cost;
- commit identity, `final_commit_sha`, branch names;
- launch `argv`, harness logs, run directories;
- any arm-specific metadata, including file timestamps that differ by arm;
- for a replication, anything from its first run (see `replication-policy.md`).

The X / Y mapping lives only in `.runs/<experiment_id>/blind-map.json`, which is
gitignored, and is not published until the seal exists.

## Sanitising a validation summary

Validator output can leak arm identity through absolute paths, temporary
directory names and durations. Before publication a validation summary keeps
only: the command, its exit status, and the validator's structured verdict
(check names, pass/fail, and the detail message with any absolute path removed).
It drops timings, host paths, environment dumps and process ids.

## Visual experiments — E04, E05, E06

Visual evaluation is required for B01, B03-R2 and B04-R2. It uses the existing
corpus infrastructure without modification: `scripts/visual-evidence/`,
`VisualEvidenceManifestV1`, the review PDF, and the JPEG connector previews
capped at 40960 bytes. PNG stays canonical; the PDF and the JPEGs are transport.

Capture configuration per experiment:

| Experiment | Capture configuration |
| --- | --- |
| E04 B01 | [`visual/b01-screenshot-visual-capture.json`](visual/b01-screenshot-visual-capture.json) |
| E05 B03-R2 | the same screenshot set as `CLAUDE-SONNET5-MEDIUM-B03-V1`: `desktop-full`, `desktop-hero`, `mobile-full`, `mobile-hero`, `day-cycle-state-1`, `day-cycle-state-2`, `faq-open`; connector previews from `scripts/visual-evidence/fixtures/b03-connector-preview-pages.json` |
| E06 B04-R2 | the frozen `benchmarks/B04-atlas/visual-capture.json` |

The B01 capture configuration lives here, in the protocol, rather than inside
`benchmarks/B01-screenshot/`, because that benchmark is frozen and must stay
byte-identical. It uses only the markup hooks that `B01-screenshot/TASK.md`
already freezes.

Visual scoring order: the evaluator scores the visual criteria of the rubric
from the captures alone, then the remaining criteria from the source and the
sanitised validation summary. Both happen before the seal.

### B01 auxiliary evidence

A perceptual or pixel-difference measurement between a candidate render and
`reference.png` may be recorded for E04. If it is:

- it is labelled **auxiliary only**;
- it does not change `rubric.md`;
- it does not decide the winner;
- it does not replace human visual scoring;
- it is stored outside `evaluation/score-seal.md`.

No new metric enters the score. The B01 rubric is used exactly as frozen.

## Non-visual experiments — E07, E08, E09

B05, B06 and B07 have no visual dimension. Blindness still applies:

```
Direct + Agent Lab complete
  → deterministic validation
  → Candidate X / Y: source + patch + sanitised validation summary
  → blind scoring against the frozen rubric
  → score seal
  → reveal
  → identified metrics
```

The validators of these three benchmarks report grouped, per-concern results
(layer for B06, concern for B05 and B07). That grouping is part of the evidence
an evaluator may use, and it carries no arm identity.

## Score seal

Before any reveal, the experiment writes `evaluation/score-seal.md` containing
only:

- `Candidate X` and `Candidate Y`;
- the score per rubric criterion, with its maximum;
- the total per candidate;
- the evidence notes needed to justify a band.

The seal must not name an arm, a model, a cost, or a runtime.

## Reveal

After the seal, `evaluation/reveal.json` records the mapping:

```json
{
  "schema_version": 1,
  "experiment_id": "...",
  "score_sealed_before_reveal": true,
  "mapping": { "candidate-x": "DIRECT", "candidate-y": "AGENTLAB" },
  "scores_at_reveal": { "candidate-x": 0, "candidate-y": 0 }
}
```

Only then are `result.md`, `experiment.json`, `direct/` and `agentlab/`
published. The pre-reveal blind bundle is kept as historical evidence and is
not rewritten to match the reveal.

## Fairness checklist

Confirmed and recorded per experiment before it is published:

- both arms received the same seed tree and the same seed SHA;
- both arms received byte-identical `TASK.md`;
- the same validator, at the same hashes, ran against both;
- the environment and dependency state were equivalent;
- the same model and the same reasoning effort in both arms;
- no output of one arm was visible to the other;
- no previous run's source, screenshots or scores were available to the
  evaluator before the seal.
