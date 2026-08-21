# Experiments

Each directory is one sealed trial. The name encodes model, effort, benchmark,
and version:

```
<MODEL>-<EFFORT>-<BENCHMARK>-<VERSION>
```

- [`CLAUDE-SONNET5-MEDIUM-B01-V1`](CLAUDE-SONNET5-MEDIUM-B01-V1/result.md) — B01 screenshot-to-interface
- [`CLAUDE-SONNET5-MEDIUM-B02-V1`](CLAUDE-SONNET5-MEDIUM-B02-V1/result.md) — B02 Minesweeper
- [`CLAUDE-SONNET5-MEDIUM-B03-V1`](CLAUDE-SONNET5-MEDIUM-B03-V1/result.md) — B03 LUMA (visual scoring pending)
- [`CLAUDE-SONNET5-MEDIUM-B04-V1`](CLAUDE-SONNET5-MEDIUM-B04-V1/result.md) — B04 ATLAS

Each experiment references a `benchmark_id` and does not redefine TASK/rubric.
