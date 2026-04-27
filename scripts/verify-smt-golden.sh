#!/usr/bin/env bash
# FR-4.3: run z3 on curated golden SMT fixtures.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v z3 >/dev/null 2>&1; then
  echo "verify-smt-golden: z3 not on PATH; install z3 (apt install z3 / brew install z3)." >&2
  exit 1
fi

fixture_dir="tests/fixtures/crucible"
for smt in "${fixture_dir}"/*.smt2; do
  [[ -e "$smt" ]] || continue
  echo "verify-smt-golden: z3 $smt"
  out="$(z3 "$smt" 2>&1)" || {
    echo "verify-smt-golden: z3 failed on $smt" >&2
    echo "$out" >&2
    exit 1
  }
  if ! grep -qE '^(sat|unsat)$' <<< "${out}"; then
    echo "verify-smt-golden: unexpected z3 output for $smt:" >&2
    echo "$out" >&2
    exit 1
  fi
done

echo "verify-smt-golden: ok"
