#!/usr/bin/env bash
# Process-level Allium analysis on every spec under spec/ (FR-1.1 verification, NFR-O1).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v allium >/dev/null 2>&1; then
  echo "analyse-allium-specs: allium not on PATH. Install from https://github.com/juxt/allium-tools" >&2
  exit 1
fi

exec allium analyse spec/
