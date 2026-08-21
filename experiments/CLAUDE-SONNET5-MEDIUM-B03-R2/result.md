# CLAUDE-SONNET5-MEDIUM-B03-R2

Benchmark:
B03 luma landing page

Model:
Claude Sonnet 5

Effort:
Medium

Agent Lab baseline:
`14149421ca6d2a430ddcd4208116a12fa2c0c987`

Evaluation:
blind before reveal

Reveal:
Candidate X = Agent Lab
Candidate Y = Direct

Quality:
Direct     98/100
Agent Lab  96/100

Winner:
Direct (+2)

This is **n = 1 benchmark** on **this** B03 run. It is not a general claim that Direct is better, and it is not a claim about Agent Strategy Lab as a whole.

This trial is a replication of `CLAUDE-SONNET5-MEDIUM-B03-V1`. The R1 comparison is recorded separately and was not used to adjust these scores.

## Blind scores (sealed before reveal)

| Criterion | Direct (Y) | Agent Lab (X) | Out of |
| --- | ---: | ---: | ---: |
| Visual | 43 | 41 | 45 |
| Hierarchy | 15 | 15 | 15 |
| Responsive | 15 | 15 | 15 |
| Interactions | 10 | 10 | 10 |
| Completeness | 10 | 10 | 10 |
| Code | 5 | 5 | 5 |
| **TOTAL** | **98** | **96** | **100** |

Quality difference: 98 − 96 = **+2 Direct**.

Agent Lab versus Direct: **−2**.

The gap is Visual (−2 for Agent Lab). Hierarchy, Responsive, Interactions, Completeness and Code are tied.

## Deterministic validation

Direct: PASS
Agent Lab: PASS

First pass:
true / true

Repair:
none / none

Attempts:
1 / 1

| Command | Direct | Agent Lab |
| --- | ---: | ---: |
| typecheck exit | 0 | 0 |
| build exit | 0 | 0 |
| test exit | 0 | 0 |
| tests passed | 1 | 4 |
| tests failed | 0 | 0 |
| check exit | 0 | 0 |

The extra Agent Lab tests come from `src/App.test.tsx`. They are not additional frozen validators and are not a correctness advantage.

Both arms passed the frozen `npm run check` markup, interaction and viewport checks, including day-cycle stage/copy changes, FAQ `aria-expanded`, no page-level horizontal scroll at 1440×900 and 390×844, and no console errors or runtime exceptions.

## Visual notes (this trial)

Direct (Candidate Y) stayed in the 40–45 visual band: funded-product appearance, extremely consistent dark + amber/violet system, readable lamp SVG/CSS, balanced 3×2 feature grid, scannable specs, strong pricing. Deductions: more conservative composition and repeated centred section headings, so it does not reach 45/45.

Agent Lab (Candidate X) also stayed in the 40–45 band: strong identity, coherent dark + amber/violet system, memorable hero gradient, readable lamp, distinct day-cycle, strong social proof and pricing. Deductions: desktop feature grid ends 4 + 2, specs are denser/less refined than the strongest sections, and small finish differences across regions.

Completeness (tied 10/10): Direct ~6327 characters, 7 FAQ items, 3 plans; Agent Lab ~7078 characters, 8 FAQ items, 3 plans. No placeholders. Eight substantial sections on both arms.

## Efficiency

Wall clock uses the ISO `started_at`/`finished_at` delta (recomputable). Overhead below uses that ISO delta.

| | Direct | Agent Lab |
| --- | ---: | ---: |
| wall_clock_ms | 286022 | 371148 |
| worker_runtime_ms | 261528 | 335428 |
| launches | 1 | 1 |
| tokens total | 1328439 | 2046278 |
| tokens input | 48 | 60 |
| tokens cached_input (cache read) | 1246359 | 1947882 |
| tokens output | 28812 | 31835 |
| tokens reasoning (subset of output) | 4163 | 2876 |
| API-equivalent USD (not charged) | 1.1281177 | 1.4652916 |
| changed files | 13 | 19 |
| insertions | 1871 | 1781 |
| deletions | 4 | 4 |
| first_pass | true | true |
| repair_used | false | false |
| human_interventions | 0 | 0 |

Agent Lab overhead vs Direct (`((agentlab / direct) − 1) × 100`):

- wall ~+30%
- worker runtime ~+28%
- tokens ~+54%
- API-equivalent ~+30%

Positive overhead means Agent Lab used more of that resource on this trial.

Descriptive ratios (not causal, not statistical):

- quality points Agent Lab minus Direct = **−2**
- additional Agent Lab tokens per quality point gained = (2046278 − 1328439) / −2 = **−358919.5**
- additional Agent Lab wall time per quality point gained = (371148 − 286022) / −2 = **−42.563 s**

Direct quota remaining is `UNKNOWN` (no probe). That value was not stored as 0.

Agent Lab five-hour remaining after the arm is 80% (`before=10% used`, `after=20% used`, `consumed_pp=10`, same window).

## Interpretation

On **this** B03 luma run with Claude Sonnet 5 Medium:

- Direct won quality (+2).
- Direct also used less wall time, worker runtime, tokens and API-equivalent cost.
- There was no correctness, hierarchy, responsive, interaction, completeness or code-quality advantage.
- The quality gap came only from Visual.
- Do not generalise from n = 1 B03, and do not generalise to Agent Strategy Lab.

## Methodological limits

- Both arms include a small `claude-haiku-4-5` helper in `modelUsage`. The implementer remained Sonnet 5 Medium. Validity: `VALID_WITH_MODEL_PURITY_WARNING`.
- `npm` invocations were denied by the versioned Claude settings allow-list. Direct did not run the four frozen validators inside the worker; the harness ran them afterwards. Agent Lab's worker used direct `node` binaries; the orchestrator then ran the official `npm` validators.
- The Agent Lab orchestrator added a fifth `git diff --cached --check`. It is not a frozen validator.
- Targeted interaction PNGs `day-cycle-state-1`, `day-cycle-state-2` and `faq-open` were partially non-diagnostic because of capture infrastructure. No visual score was inferred from those clips. Interaction scoring used the published blind source and the frozen validator. Canonical full-page desktop/mobile and hero PNGs remained the Visual / Hierarchy / Responsive basis.
- Canonical PNGs remain in the historical X/Y blind bundle and were not recaptured at reveal.
- Scores were sealed before reveal and were not recalculated afterwards.

Machine record: [`experiment.json`](experiment.json). Blind trail: [`../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B03-R2/`](../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B03-R2/). Score seal: [`evaluation/score-seal.md`](evaluation/score-seal.md). Reveal: [`evaluation/reveal.json`](evaluation/reveal.json). Benchmark: [`../../benchmarks/B03-luma/`](../../benchmarks/B03-luma/).
