#!/usr/bin/env bash
# FR-4.2: deterministic Allium model -> SMT must match committed goldens.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v allium >/dev/null 2>&1; then
  echo "verify-crucible-compile: allium not on PATH" >&2
  exit 1
fi

export REPO_ROOT="${repo_root}"

python3 <<'PY'
import os
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(os.environ["REPO_ROOT"])
sys.path.insert(0, str(root / "packages/crucible/src"))
from crucible.compile import compile_model_fixture

# `minimal.allium` pairs with a hand-maintained `minimal.smt2` for `verify-smt-golden.sh`, not compiler output.
paths = [p for p in sorted(root.glob("tests/fixtures/crucible/*.allium")) if p.name != "minimal.allium"]
paths += sorted(root.glob("tests/fixtures/crucible/*.model.json"))
if not paths:
    print("verify-crucible-compile: no fixtures under tests/fixtures/crucible/", file=sys.stderr)
    raise SystemExit(1)

for path in paths:
    if path.name.endswith(".model.json"):
        golden = root / "tests/fixtures/crucible" / (path.name[: -len(".model.json")] + ".smt2")
    else:
        golden = root / "tests/fixtures/crucible" / (path.stem + ".smt2")
    if not golden.is_file():
        print(f"verify-crucible-compile: missing golden {golden}", file=sys.stderr)
        raise SystemExit(1)
    out = compile_model_fixture(path, named=False)
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", suffix=".smt2") as tf:
        tf.write(out)
        live = tf.name
    diff = subprocess.run(["diff", "-u", str(golden), live], capture_output=True, text=True)
    os.unlink(live)
    if diff.returncode != 0:
        sys.stderr.write(diff.stdout + diff.stderr)
        print(f"verify-crucible-compile: drift for {path.name} vs {golden.name}", file=sys.stderr)
        raise SystemExit(1)
    print(f"verify-crucible-compile: ok {path.name}")

print("verify-crucible-compile: ok")
PY
