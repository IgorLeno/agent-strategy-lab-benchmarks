# Visual evidence — access check

Infrastructure proof only. **Not** the B03 blind quality evaluation. Scores were not changed.

Source PNGs: already published under `experiments/CLAUDE-SONNET5-MEDIUM-B03-V1/{direct,agentlab}/screenshots/`. They were not recaptured. No Claude/Codex/model quota was used.

Candidate X / Candidate Y mapping for this access check is arbitrary and is **not** stored in this directory. The private map belongs in `.runs/<experiment>/blind-map.json` (gitignored).

Each candidate folder contains:

- `visual-review.pdf` — review/transport document (one capture per sheet; tall full-page PNGs paginate at readable width)
- `visual-manifest.json` — SHA256, dimensions, and PNG → PDF page provenance

Canonical pixels remain the original PNGs.
