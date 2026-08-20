# Scripts

`verify-frozen-hashes.sh` recomputes SHA256 of each frozen TASK, rubric, plan, fixture, and validator, and compares them to `benchmarks/*/manifest.json`.

It does not launch workers, call model APIs, or consume Claude/Codex quota.
