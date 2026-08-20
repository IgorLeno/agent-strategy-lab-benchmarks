# CLAUDE-SONNET5-MEDIUM-B02-V1

Experiment:
CLAUDE-SONNET5-MEDIUM-B02-V1

Winner:
DIRECT

Deterministic:
PASS / PASS

First pass:
PASS / PASS

Repair:
none / none

Visual:
Direct 44/55
Agent Lab 37/55

Wall:
Direct 283.271 s
Agent Lab 486.939 s

Tokens:
Direct 1.399828 M
Agent Lab 2.918697 M

Agent Lab overhead:

wall ~+72%
worker ~+79%
tokens ~+109%
API-equivalent ~+74%

Conclusion:

For B02 Minesweeper with Claude Sonnet 5 Medium, both arms passed all
deterministic validation on the initial attempt. Direct execution was materially
more efficient and received the higher blind visual/UX score.

This is **n = 1 benchmark**. It is not a general claim that Agent Lab is worse.

Machine record: [`experiment.json`](experiment.json). Blind scores: [`evaluation/visual-review.md`](evaluation/visual-review.md). Benchmark definition: [`../../benchmarks/B02-minesweeper/`](../../benchmarks/B02-minesweeper/).
