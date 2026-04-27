#!/usr/bin/env bash
# Run structural validation on every Allium spec under spec/ (FR-0.2).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v allium >/dev/null 2>&1; then
  echo "check-allium-specs: allium not on PATH. Install from https://github.com/juxt/allium-tools" >&2
  exit 1
fi

exec allium check spec/
