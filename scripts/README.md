# Scripts

`verify-frozen-hashes.sh` recomputes SHA256 of each frozen TASK, rubric, plan, fixture, and validator, and compares them to `benchmarks/*/manifest.json`.

It does not launch workers, call model APIs, or consume Claude/Codex quota.

`visual-evidence/` builds PNG + manifest + review-PDF bundles and JPEG connector previews (≤ 40960 bytes). See [`visual-evidence/README.md`](visual-evidence/README.md). Tests:

```bash
node --test scripts/visual-evidence/tests/*.test.mjs
```
