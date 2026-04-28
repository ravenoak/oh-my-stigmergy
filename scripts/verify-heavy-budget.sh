#!/usr/bin/env bash
# NFR-P1: CI graph-ingestion wall-clock budget matches ADR-0002 and committed seconds file.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="devtools/ci-heavy-budget-seconds.txt"
adr_file="docs/adr/0002-relation-first-retrieval.md"

test -f "$budget_file" || {
  echo "verify-heavy-budget: missing $budget_file" >&2
  exit 1
}
test -f "$adr_file" || {
  echo "verify-heavy-budget: missing $adr_file" >&2
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

echo "verify-heavy-budget: ok (${seconds}s)"
