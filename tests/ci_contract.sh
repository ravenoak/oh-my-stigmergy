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
smt_script="scripts/verify-smt-golden.sh"
crucible_contract="tests/crucible_shim_contract.sh"
version_file="devtools/allium-cli.version"

for f in "$workflow" "$check_script" "$analyse_script" "$trace_script" "$cotouch_script" "$const_amend_script" "$fr_anchor_script" "$distill_script" "$smt_script" "$crucible_contract" "$version_file"; do
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
bash -n "$smt_script"
bash -n "$crucible_contract"

grep -q 'allium check' "$check_script" || {
  echo "ci_contract: $check_script must contain allium check" >&2
  exit 1
}
grep -q 'allium analyse' "$analyse_script" || {
  echo "ci_contract: $analyse_script must contain allium analyse" >&2
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
grep -q 'unittest discover' "$workflow" || {
  echo "ci_contract: $workflow must run graph unittest discover" >&2
  exit 1
}
grep -q 'packages/sbp-server' "$workflow" || {
  echo "ci_contract: $workflow must run SBP tests under packages/sbp-server" >&2
  exit 1
}
grep -q 'verify-smt-golden.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-smt-golden.sh" >&2
  exit 1
}
grep -q 'crucible_shim_contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run tests/crucible_shim_contract.sh" >&2
  exit 1
}
grep -q 'check-allium-specs.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/check-allium-specs.sh" >&2
  exit 1
}
grep -q 'analyse-allium-specs.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/analyse-allium-specs.sh" >&2
  exit 1
}
grep -q 'devtools/allium-cli.version' "$workflow" || {
  echo "ci_contract: $workflow must read devtools/allium-cli.version" >&2
  exit 1
}

echo "ci_contract: ok"
