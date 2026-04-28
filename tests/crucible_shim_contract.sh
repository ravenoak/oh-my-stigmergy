#!/usr/bin/env bash
# Contract: crucible shim deny-by-default + attestation (FR-4.1 / NFR-S1).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

maint="${repo_root}/devtools/crucible-shim/policy.maintainer.json"
tampered="$(mktemp)"
no_att="$(mktemp)"
audit="$(mktemp)"
trap 'rm -f "$tampered" "$no_att" "$audit"' EXIT

bash "${repo_root}/scripts/verify-shim-policy.sh" "$maint"

if POLICY_FILE="$maint" bash devtools/crucible-shim/wrap.sh true; then
  echo "crucible_shim_contract: expected block for true" >&2
  exit 1
fi

if POLICY_FILE="$maint" bash devtools/crucible-shim/wrap.sh curl https://example.com; then
  echo "crucible_shim_contract: expected block for curl" >&2
  exit 1
fi

out="$(POLICY_FILE="$maint" bash devtools/crucible-shim/wrap.sh echo ok)"
[[ "$out" == "ok" ]] || {
  echo "crucible_shim_contract: forward failed: $out" >&2
  exit 1
}

if POLICY_FILE="$maint" bash devtools/crucible-shim/wrap.sh echo disallowed; then
  echo "crucible_shim_contract: expected block for echo with bad args (args_regex)" >&2
  exit 1
fi

if CRUCIBLE_SHIM_AUDIT_LOG="$audit" POLICY_FILE="$maint" bash devtools/crucible-shim/wrap.sh echo disallowed; then
  echo "crucible_shim_contract: expected deny for audit test" >&2
  exit 1
fi
[[ -s "$audit" ]] || {
  echo "crucible_shim_contract: expected audit log file" >&2
  exit 1
}
python3 <<PY
import json
from pathlib import Path
line = Path("${audit}").read_text(encoding="utf-8").strip().splitlines()[-1]
row = json.loads(line)
assert row.get("event") == "shim_denied"
assert isinstance(row.get("ts"), int)
assert row.get("argv") == ["echo", "disallowed"]
PY

sed 's/"echo"/"echox"/' "$maint" >"$tampered"
if bash scripts/verify-shim-policy.sh "$tampered"; then
  echo "crucible_shim_contract: expected attestation failure on tampered policy" >&2
  exit 1
fi

python3 <<PY
import json
from pathlib import Path
maint = Path("${maint}")
outp = Path("${no_att}")
p = json.loads(maint.read_text(encoding="utf-8"))
del p["attestation"]
outp.write_text(json.dumps(p, indent=2), encoding="utf-8")
PY

if bash scripts/verify-shim-policy.sh "$no_att"; then
  echo "crucible_shim_contract: expected failure without attestation" >&2
  exit 1
fi

echo "crucible_shim_contract: ok"
