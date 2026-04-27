#!/usr/bin/env bash
# Contract: crucible shim blocks deny-listed basenames and forwards others.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

policy="$(mktemp)"
trap 'rm -f "$policy"' EXIT
jq -n --argjson deny '["true"]' '{deny:$deny}' >"$policy"

if POLICY_FILE="$policy" bash devtools/crucible-shim/wrap.sh true; then
  echo "crucible_shim_contract: expected block for true" >&2
  exit 1
fi

out="$(POLICY_FILE="$policy" bash devtools/crucible-shim/wrap.sh echo ok)"
[[ "$out" == "ok" ]] || {
  echo "crucible_shim_contract: forward failed: $out" >&2
  exit 1
}

echo "crucible_shim_contract: ok"
