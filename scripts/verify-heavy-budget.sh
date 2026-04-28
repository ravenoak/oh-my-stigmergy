#!/usr/bin/env bash
# NFR-P1: CI graph-ingestion wall-clock budget matches ADR-0002, devtools pin, and workflow step timeout.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="devtools/ci-heavy-budget-seconds.txt"
adr_file="docs/adr/0002-relation-first-retrieval.md"
workflow=".github/workflows/allium-specs.yml"

test -f "$budget_file" || {
  echo "verify-heavy-budget: missing $budget_file" >&2
  exit 1
}
test -f "$adr_file" || {
  echo "verify-heavy-budget: missing $adr_file" >&2
  exit 1
}
test -f "$workflow" || {
  echo "verify-heavy-budget: missing $workflow" >&2
  exit 1
}

seconds="$(tr -d ' \n\t' <"$budget_file")"
if [[ "$seconds" != "120" ]]; then
  echo "verify-heavy-budget: $budget_file must be 120 (seconds); got ${seconds:-empty}" >&2
  exit 1
fi

if ! grep -q '2 minute' "$adr_file"; then
  echo "verify-heavy-budget: $adr_file must cite the ≤ 2 minute graph CI budget" >&2
  exit 1
fi

python3 <<PY
import math
import re
from pathlib import Path

root = Path(".")
seconds = int((root / "devtools/ci-heavy-budget-seconds.txt").read_text(encoding="utf-8").strip())
expected_minutes = max(1, math.ceil(seconds / 60))
text = (root / ".github/workflows/allium-specs.yml").read_text(encoding="utf-8")
lines = text.splitlines()
marker = "Graph package unit tests (FR-2.x)"
idx = next((i for i, ln in enumerate(lines) if marker in ln), None)
if idx is None:
    raise SystemExit(f"verify-heavy-budget: step named {marker!r} not found in allium-specs.yml")

timeout_minutes = None
for j in range(idx + 1, min(idx + 20, len(lines))):
    stripped = lines[j].lstrip()
    if stripped.startswith("- name:"):
        break
    m = re.match(r"^\s*timeout-minutes:\s*(\d+)\s*$", lines[j])
    if m:
        timeout_minutes = int(m.group(1))
        break

if timeout_minutes is None:
    raise SystemExit("verify-heavy-budget: graph unittest step missing timeout-minutes")
if timeout_minutes != expected_minutes:
    raise SystemExit(
        f"verify-heavy-budget: timeout-minutes {timeout_minutes} != ceil({seconds}/60)={expected_minutes}"
    )
print(f"verify-heavy-budget: ok ({seconds}s -> timeout-minutes={timeout_minutes})")
PY
