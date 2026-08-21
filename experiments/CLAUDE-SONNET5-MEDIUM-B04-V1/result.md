# CLAUDE-SONNET5-MEDIUM-B04-V1

Benchmark:
B04 ATLAS

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
Direct     79/100
Agent Lab  85/100

Winner:
Agent Lab (+6)

This is **n = 1 benchmark**. It is not a general claim that Agent Lab is better.

## Blind scores (sealed before reveal)

| Criterion | Direct (X) | Agent Lab (Y) | Out of |
| --- | ---: | ---: | ---: |
| Correctness | 20 | 20 | 30 |
| Visualization | 23 | 23 | 25 |
| Filters | 17 | 19 | 20 |
| Polish | 12 | 14 | 15 |
| Responsive | 2 | 4 | 5 |
| Code | 5 | 5 | 5 |
| **TOTAL** | **79** | **85** | **100** |

Quality difference: 85 − 79 = **+6 Agent Lab**.

The gain is in Filters, Polish and Responsive. Correctness and Visualization are tied. Code is tied at 5/5.

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
| tests passed | 7 | 8 |
| tests failed | 0 | 0 |
| check exit | 0 | 0 |

The extra Agent Lab test is the seed scaffold `src/seed.test.ts`. That is not an additional required aggregation case and is not a correctness advantage.

Both arms exposed all nine KPIs on the observed validator combinations (`full-year/all`, `q2/all`, `q4/all`, `full-year/enterprise`, `q1/smb`, `full-year/mid-market`) and implemented typed aggregation from `data/financial.json`.

## Correctness gap (shared)

Both candidates leave the same defect: the segment filter does not fully recompute the segment comparison chart and the segment table.

Direct: `segmentSummaries(document, period)` does not take the segment filter.

Agent Lab: `segmentBreakdown(financial, period)` also does not take the segment filter.

Agent Lab reduces opacity of unselected segments on the segment chart. That communicates the filter; it does not fix the aggregation. Agent Lab did **not** correct the defect.

## Validator limitation (methodological, not a fix)

The frozen B04 `check.mjs`:

- recomputes KPIs across several filter combinations;
- checks table/chart staleness when **period** changes;

and does **not** run an equivalent stale-panel check when **segment** changes.

Both arms therefore obtained `npm run check` PASS despite the shared gap. The B04 validator is not being patched retroactively.

Experimental backlog (future benchmarks): every independent filter axis that is specified to affect every panel must have a stale-panel validation transition.

## Efficiency

Wall clock uses the ISO `started_at`/`finished_at` delta (recomputable). Private metrics also stored a hardcoded `wall_clock_ms` that disagrees (Direct 348708 vs 346783; Agent Lab 316515 vs 313214). Overhead below uses the ISO delta. See `experiment.json` `integrity.metrics_divergence`.

| | Direct | Agent Lab |
| --- | ---: | ---: |
| wall_clock_ms | 346783 | 313214 |
| worker_runtime_ms | 318646 | 276618 |
| launches | 1 | 1 |
| tokens total | 3661979 | 2694157 |
| tokens input | 96 | 90 |
| tokens cached_input (cache read) | 3550807 | 2607716 |
| tokens output | 31077 | 26188 |
| tokens reasoning (subset of output) | 5663 | 4307 |
| API-equivalent USD (not charged) | 2.0147771 | 1.5412248 |
| changed files | 13 | 12 |
| insertions | 1342 | 1098 |
| deletions | 12 | 3 |

Agent Lab overhead vs Direct (`((agentlab / direct) − 1) × 100`):

- wall ~−10%
- worker runtime ~−13%
- tokens ~−26%
- API-equivalent ~−24%

Negative overhead means Agent Lab used less of that resource on this trial.

Descriptive ratios (not causal, not statistical):

- additional Agent Lab tokens per quality point gained = (2694157 − 3661979) / 6 ≈ **−161304**
- additional Agent Lab wall time per quality point gained = (313214 − 346783) / 6 ≈ **−5.595 s**

## Interpretation

- Agent Lab won quality on this trial (+6).
- There was no correctness advantage.
- The quality gain came from Filters, Polish and Responsive.
- Both arms share the segment-propagation defect.
- Do not generalise from n = 1 B04.

Machine record: [`experiment.json`](experiment.json). Blind trail: [`../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B04-V1/`](../../evaluation/blind/CLAUDE-SONNET5-MEDIUM-B04-V1/). Score seal: [`evaluation/score-seal.md`](evaluation/score-seal.md). Reveal: [`evaluation/reveal.json`](evaluation/reveal.json). Benchmark: [`../../benchmarks/B04-atlas/`](../../benchmarks/B04-atlas/).
