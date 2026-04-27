#!/usr/bin/env bash
# Lightweight contract checks for the Allium CI merge gate (no allium binary required).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

workflow=".github/workflows/allium-specs.yml"
check_script="scripts/check-allium-specs.sh"
analyse_script="scripts/analyse-allium-specs.sh"
trace_script="scripts/verify-requirement-traceability.sh"
cotouch_script="scripts/verify-governance-doc-cotouch.sh"
const_amend_script="scripts/verify-constitution-amendment-cotouch.sh"
fr_anchor_script="scripts/verify-fr-spec-anchors.sh"
distill_script="scripts/verify-distillation-contract.sh"
transitions_sync_script="scripts/verify-transitions-sync.sh"
transitions_sync_py="scripts/verify_transitions_sync.py"
smt_script="scripts/verify-smt-golden.sh"
crucible_contract="tests/crucible_shim_contract.sh"
version_file="devtools/allium-cli.version"

for f in "$workflow" "$check_script" "$analyse_script" "$trace_script" "$cotouch_script" "$const_amend_script" "$fr_anchor_script" "$distill_script" "$transitions_sync_script" "$transitions_sync_py" "$smt_script" "$crucible_contract" "$version_file"; do
  test -f "$f" || {
    echo "ci_contract: missing $f" >&2
    exit 1
  }
done

bash -n "$check_script"
bash -n "$analyse_script"
bash -n "$trace_script"
bash -n "$cotouch_script"
bash -n "$const_amend_script"
bash -n "$fr_anchor_script"
bash -n "$distill_script"
bash -n "$transitions_sync_script"
bash -n "$smt_script"
bash -n "$crucible_contract"

python3 -m py_compile "$transitions_sync_py" || {
  echo "ci_contract: $transitions_sync_py must be valid Python" >&2
  exit 1
}

grep -q 'allium check' "$check_script" || {
  echo "ci_contract: $check_script must contain allium check" >&2
  exit 1
}
grep -q 'allium analyse' "$analyse_script" || {
  echo "ci_contract: $analyse_script must contain allium analyse" >&2
  exit 1
}

grep -q '^  filter:' "$workflow" || {
  echo "ci_contract: $workflow must define filter job" >&2
  exit 1
}
grep -q '^  governance:' "$workflow" || {
  echo "ci_contract: $workflow must define governance job" >&2
  exit 1
}
grep -q '^  specs-and-packages:' "$workflow" || {
  echo "ci_contract: $workflow must define specs-and-packages job" >&2
  exit 1
}
grep -q '^  check:' "$workflow" || {
  echo "ci_contract: $workflow must define check merge gate job" >&2
  exit 1
}
grep -q 'needs: \[filter, governance, specs-and-packages\]' "$workflow" || {
  echo "ci_contract: $workflow check job must need filter, governance, specs-and-packages" >&2
  exit 1
}
grep -q 'if: always()' "$workflow" || {
  echo "ci_contract: $workflow check job must use if: always() for skipped heavy job" >&2
  exit 1
}

governance_block="$(awk '/^  governance:/,/^  specs-and-packages:/' "$workflow")"
echo "$governance_block" | grep -q 'cargo install' && {
  echo "ci_contract: governance job must not run cargo install (keep PR minutes low)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-transitions-sync.sh' || {
  echo "ci_contract: governance job must run scripts/verify-transitions-sync.sh" >&2
  exit 1
}

heavy_block="$(awk '/^  specs-and-packages:/,/^  check:/' "$workflow")"
echo "$heavy_block" | grep -q 'actions/cache@v4' || {
  echo "ci_contract: specs-and-packages job must cache cargo (actions/cache@v4)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'devtools/allium-cli.version' || {
  echo "ci_contract: specs-and-packages must reference devtools/allium-cli.version" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/graph/tests' || {
  echo "ci_contract: specs-and-packages must run graph unit tests under packages/graph/tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/transitions/tests' || {
  echo "ci_contract: specs-and-packages must run transitions unit tests under packages/transitions/tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/sbp-server' || {
  echo "ci_contract: specs-and-packages must run SBP tests under packages/sbp-server" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'verify-smt-golden.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/verify-smt-golden.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'crucible_shim_contract.sh' || {
  echo "ci_contract: specs-and-packages must run tests/crucible_shim_contract.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'check-allium-specs.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/check-allium-specs.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'analyse-allium-specs.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/analyse-allium-specs.sh" >&2
  exit 1
}

grep -q 'tests/ci_contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run tests/ci_contract.sh" >&2
  exit 1
}
grep -q 'verify-requirement-traceability.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-requirement-traceability.sh" >&2
  exit 1
}
grep -q 'verify-governance-doc-cotouch.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-governance-doc-cotouch.sh" >&2
  exit 1
}
grep -q 'verify-constitution-amendment-cotouch.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-constitution-amendment-cotouch.sh" >&2
  exit 1
}
grep -q 'verify-fr-spec-anchors.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-fr-spec-anchors.sh" >&2
  exit 1
}
grep -q 'verify-distillation-contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-distillation-contract.sh" >&2
  exit 1
}

echo "ci_contract: ok"
