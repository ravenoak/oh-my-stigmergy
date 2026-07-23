#!/usr/bin/env bash
# FR-8.1: spec/transitions.json must match a live regeneration from spec/*.allium.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v allium >/dev/null 2>&1; then
  echo "verify-transitions-golden: allium not on PATH" >&2
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
sys.path.insert(0, str(root / "packages/transitions/src"))
from transitions.artifact import render_transitions_artifact

golden = root / "spec" / "transitions.json"
if not golden.is_file():
    print(f"verify-transitions-golden: missing {golden}", file=sys.stderr)
    raise SystemExit(1)

live_text = render_transitions_artifact(root / "spec")
with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", suffix=".json") as tf:
    tf.write(live_text)
    live = tf.name

diff = subprocess.run(["diff", "-u", str(golden), live], capture_output=True, text=True)
os.unlink(live)
if diff.returncode != 0:
    sys.stderr.write(diff.stdout + diff.stderr)
    print("verify-transitions-golden: drift — regenerate with "
          "'uv run python -m transitions --spec-dir spec --output spec/transitions.json'", file=sys.stderr)
    raise SystemExit(1)

print("verify-transitions-golden: ok")
PY
