#!/usr/bin/env bash
# Recompute TASK / rubric / plan / fixture / validator hashes and compare
# them to each benchmark manifest.json. Exit 1 on the first mismatch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

hash_of() {
  sha256sum "$1" | awk '{print $1}'
}

python3 - "$ROOT" <<'PY'
import hashlib, json, sys
from pathlib import Path

root = Path(sys.argv[1])
fail = 0

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()

for manifest_path in sorted((root / "benchmarks").glob("*/manifest.json")):
    bench = manifest_path.parent
    man = json.loads(manifest_path.read_text())
    bid = man["benchmark_id"]
    checks = [
        (bench / "TASK.md", man["task_sha256"], "TASK.md"),
        (bench / "seed" / "TASK.md", man["task_sha256_in_seed"], "seed/TASK.md"),
        (bench / "rubric.md", man["rubric_sha256"], "rubric.md"),
        (bench / "plan.yaml", man["plan_file_sha256"], "plan.yaml"),
    ]
    # B01-B04 and B06 pin an npm lockfile; B05 (Python) and B07 (Go) have none.
    if "package_lock_sha256" in man:
        checks.append(
            (bench / "seed" / "package-lock.json", man["package_lock_sha256"], "package-lock.json")
        )
    for path, expected, label in checks:
        got = sha256(path)
        if got != expected:
            print(f"FAIL {bid} {label}\n  expected {expected}\n  got      {got}")
            fail = 1
        else:
            print(f"OK   {bid} {label}")
    for fixture in man.get("fixtures", []):
        path = bench / fixture["path"]
        got = sha256(path)
        if got != fixture["sha256"]:
            print(f"FAIL {bid} fixture {fixture['path']}\n  expected {fixture['sha256']}\n  got      {got}")
            fail = 1
        else:
            print(f"OK   {bid} fixture {fixture['path']}")
        if "also_at" in fixture:
            alt = bench / fixture["also_at"]
            if sha256(alt) != fixture["sha256"]:
                print(f"FAIL {bid} fixture duplicate {fixture['also_at']}")
                fail = 1
            else:
                print(f"OK   {bid} fixture duplicate {fixture['also_at']}")
    for validator in man.get("validators", []):
        path = bench / validator["path"]
        got = sha256(path)
        if got != validator["sha256"]:
            print(f"FAIL {bid} validator {validator['path']}\n  expected {validator['sha256']}\n  got      {got}")
            fail = 1
        else:
            print(f"OK   {bid} validator {validator['path']}")
        # The benchmark-root validation/ tree is a byte-identical copy of the
        # validator as it ships inside the seed. Where that copy lives inside
        # the seed differs per benchmark: B01-B04 ship it as seed/scripts/,
        # B05-B07 as seed/validation/.
        seed_root = man.get("validator_seed_root", "scripts")
        seed_copy = bench / "seed" / seed_root / Path(validator["path"]).relative_to("validation")
        if not seed_copy.exists():
            print(f"FAIL {bid} missing seed copy of {validator['path']} at {seed_copy.relative_to(bench)}")
            fail = 1
        elif sha256(seed_copy) != validator["sha256"]:
            print(f"FAIL {bid} seed copy diverges from validation/ for {validator['path']}")
            fail = 1

sys.exit(fail)
PY
