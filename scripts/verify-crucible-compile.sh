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
export FIXTURE_REL="tests/fixtures/crucible/transitions.allium"
golden="tests/fixtures/crucible/transitions.smt2"
tmp="$(mktemp)"
export OUT_TMP="${tmp}"
trap 'rm -f "${OUT_TMP}"' EXIT

python3 <<'PY'
import os
from pathlib import Path
import sys

root = Path(os.environ["REPO_ROOT"])
sys.path.insert(0, str(root / "packages/crucible/src"))
from crucible.compile import compile_allium_file

out = compile_allium_file(root / os.environ["FIXTURE_REL"])
Path(os.environ["OUT_TMP"]).write_text(out, encoding="utf-8")
PY

if ! diff -u "${golden}" "${tmp}"; then
  echo "verify-crucible-compile: SMT drift; update ${golden} after intentional model change" >&2
  exit 1
fi

echo "verify-crucible-compile: ok"
