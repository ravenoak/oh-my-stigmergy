#!/usr/bin/env bash
# FR-1.3: ensure spec/transitions.json mirrors transition graphs in spec/*.allium (no allium binary).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v python3 >/dev/null 2>&1; then
  echo "verify-transitions-sync: python3 required" >&2
  exit 1
fi

exec python3 "${repo_root}/scripts/verify_transitions_sync.py"
