#!/usr/bin/env bash
# Lightweight contract checks for the Allium CI merge gate (no allium binary required).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

workflow=".github/workflows/allium-specs.yml"
script="scripts/check-allium-specs.sh"

test -f "$workflow" || {
  echo "ci_contract: missing $workflow" >&2
  exit 1
}
test -f "$script" || {
  echo "ci_contract: missing $script" >&2
  exit 1
}

bash -n "$script"

grep -q 'allium check' "$workflow" || {
  echo "ci_contract: $workflow must invoke allium check" >&2
  exit 1
}
grep -q 'check-allium-specs.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/check-allium-specs.sh" >&2
  exit 1
}
grep -q 'ci_contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run tests/ci_contract.sh" >&2
  exit 1
}

echo "ci_contract: ok"
