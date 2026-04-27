#!/usr/bin/env bash
# NFR-S1 / FR-4.1: verify committed crucible-shim policy attestation.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

policy="${1:-${repo_root}/devtools/crucible-shim/policy.maintainer.json}"
test -f "$policy" || {
  echo "verify-shim-policy: missing $policy" >&2
  exit 1
}

exec python3 "${repo_root}/devtools/crucible-shim/policy_gate.py" --verify-attestation "$policy"
