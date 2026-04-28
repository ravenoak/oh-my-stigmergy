#!/usr/bin/env bash
# FR-4.1 / NFR-S1: deny-by-default shim with attested policy (see policy.schema.json).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
policy_file="${POLICY_FILE:-${here}/policy.maintainer.json}"
if [[ $# -lt 1 ]]; then
  echo "usage: wrap.sh <command> [args…]" >&2
  exit 2
fi
# Do not use bare `python3 …; exit_code=$?` with `set -e` — a denied gate (exit 1) would abort before audit.
if python3 "${here}/policy_gate.py" "$policy_file" "$@"; then
  exit_code=0
else
  exit_code=$?
fi
if [[ "${exit_code}" -ne 0 ]]; then
  if [[ -n "${CRUCIBLE_SHIM_AUDIT_LOG:-}" ]]; then
    python3 "${here}/policy_gate.py" --audit-denied "${CRUCIBLE_SHIM_AUDIT_LOG}" -- "$@" || true
  fi
  exit "${exit_code}"
fi
exec "$@"
