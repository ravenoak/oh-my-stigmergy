#!/usr/bin/env bash
# FR-4.1 / NFR-S1: deny-by-default shim with attested policy (see policy.schema.json).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
policy_file="${POLICY_FILE:-${here}/policy.maintainer.json}"
if [[ $# -lt 1 ]]; then
  echo "usage: wrap.sh <command> [args…]" >&2
  exit 2
fi
python3 "${here}/policy_gate.py" "$policy_file" "$@"
exit_code=$?
if [[ "${exit_code}" -ne 0 ]]; then
  exit "${exit_code}"
fi
exec "$@"
