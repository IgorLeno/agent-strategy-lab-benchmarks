# CLAUDE-SONNET5-MEDIUM-B01-V1

Benchmark:
B01 screenshot-to-interface

Model:
Claude Sonnet 5

Effort:
Medium

Agent Lab baseline:
`14149421ca6d2a430ddcd4208116a12fa2c0c987`

Evaluation:
blind before reveal

Reveal:
Candidate X = Direct
Candidate Y = Agent Lab

Quality:
Direct     87/100
Agent Lab  79/100

Winner:
Direct (+8)

This is **n = 1 benchmark**. It is not a general claim that Direct is better.

## Blind scores (sealed before reveal)

| Criterion | Direct (X) | Agent Lab (Y) | Out of |
| --- | ---: | ---: | ---: |
| Visual fidelity | 48 | 44 | 60 |
| Responsive | 14 | 10 | 15 |
| Completeness | 10 | 10 | 10 |
| Build/correctness | 10 | 10 | 10 |
| Code quality | 5 | 5 | 5 |
| **TOTAL** | **87** | **79** | **100** |

Quality difference: 87 − 79 = **+8 Direct**.

Agent Lab versus Direct: **−8**.

The gap is Visual fidelity (−4) and Responsive (−4). Completeness, Build/correctness and Code quality are tied.

## Deterministic validation

Direct: PASS
Agent Lab: PASS

First pass:
true / true

Repair:
none / none

| Command | Direct | Agent Lab |
| --- | ---: | ---: |
| typecheck exit | 0 | 0 |
| build exit | 0 | 0 |
| test exit | 0 | 0 |
| tests passed | 1 | 5 |
| tests failed | 0 | 0 |
| check exit | 0 | 0 |

The extra Agent Lab tests come from `src/App.test.tsx`. They are not additional frozen validators and are not a correctness advantage.

Both arms passed the frozen `npm run check` markup and viewport checks, including no page-level horizontal scroll at 1440×900 and 390×844, and no console errors or runtime exceptions.

## Visual notes (this trial)

Direct (Candidate X) stayed in the 42–53 visual band: same interface as `reference.png`, closer sidebar/stat-card geometry, and a preserved `Overview` active state. The chart is still too tall and the right column (`Activity` / `Quota`) is compressed.

Agent Lab (Candidate Y) also stayed in the 42–53 band, with more layout drift: taller/shifted stat cards, chart and table sitting lower, and the `Overview` selected background not preserved. `Activity` / `Quota` sit closer to the reference vertically than in Direct, but the main layout drifts more overall.

Responsive: Direct reflowed to a single column with compact navigation (14/15). Agent Lab remained functional at 390px with no page-level horizontal overflow (10/15), but kept the desktop sidebar and plan/upgrade block stacked above the content.

## Efficiency

Wall clock uses the ISO `started_at`/`finished_at` delta (recomputable). Overhead below uses that ISO delta.

| | Direct | Agent Lab |
| --- | ---: | ---: |
| wall_clock_ms | 183142 | 255816 |
| worker_runtime_ms | 156660 | 222663 |
| launches | 1 | 1 |
| tokens total | 1319001 | 1847986 |
| tokens input | 64 | 66 |
| tokens cached_input (cache read) | 1267299 | 1776939 |
| tokens output | 15703 | 20880 |
| tokens reasoning (subset of output) | 1411 | 2970 |
| API-equivalent USD (not charged) | 0.8338717 | 1.1510537 |
| changed files | 10 | 11 |
| insertions | 1062 | 1064 |
| deletions | 4 | 4 |
| first_pass | true | true |
| repair_used | false | false |
| human_interventions | 0 | 0 |

Agent Lab overhead vs Direct (`((agentlab / direct) − 1) × 100`):

- wall ~+40%
- worker runtime ~+42%
- tokens ~+40%
- API-equivalent ~+38%

Positive overhead means Agent Lab used more of that resource on this trial.

Descriptive ratios (not causal, not statistical):

- quality points Agent Lab minus Direct = **−8**
- additional Agent Lab tokens per quality point gained = (1847986 − 1319001) / −8 = **−66123.125**
- additional Agent Lab wall time per quality point gained = (255816 − 183142) / −8 ≈ **−9.084 s**

Direct quota remaining is `UNKNOWN` (no probe). That value was not stored as 0.

## Interpretation

On **this** B01 screenshot run with Claude Sonnet 5 Medium:

- Direct won quality (+8).
- Direct also used less wall time, worker runtime, tokens and API-equivalent cost.
- There was no correctness or completeness advantage.
- The quality gap came from Visual fidelity and Responsive.
- Do not generalise from n = 1 B01.

## Methodological limits

- Both arms include a small `claude-haiku-4-5` helper in `modelUsage`. The implementer remained Sonnet 5 Medium. Validity: `VALID_WITH_MODEL_PURITY_WARNING`.
- Direct `npm` invocations were denied by the versioned Claude settings allow-list; the harness still ran the four frozen validators after the worker.
- The Agent Lab orchestrator added a fifth `git diff --cached --check`. It is not a frozen validator.
- B01 capture configuration lives in the protocol directory so `benchmarks/B01-screenshot/` stays frozen.
- Canonical PNGs remain in the historical blind bundle and were not recaptured at reveal.

Machine record: [`experiment.json`](experiment.json). Blind trail: [`../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B01-V1/`](../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B01-V1/). Score seal: [`evaluation/score-seal.md`](evaluation/score-seal.md). Reveal: [`evaluation/reveal.json`](evaluation/reveal.json). Benchmark: [`../../benchmarks/B01-screenshot/`](../../benchmarks/B01-screenshot/).
