#!/usr/bin/env bash
# FR-4.1 partial: optional gate for a single command argv[1]…
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
policy_file="${POLICY_FILE:-${here}/policy.example.json}"
if [[ $# -lt 1 ]]; then
  echo "usage: wrap.sh <command> [args…]" >&2
  exit 2
fi
base="$(basename "$1")"
if ! command -v jq >/dev/null 2>&1; then
  echo "crucible-shim: jq required" >&2
  exit 2
fi
if jq -e --arg b "$base" '.deny | index($b) != null' "$policy_file" >/dev/null 2>&1; then
  echo "crucible-shim: blocked: $base" >&2
  exit 1
fi
exec "$@"
