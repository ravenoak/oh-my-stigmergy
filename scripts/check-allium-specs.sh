#!/usr/bin/env bash
# Structural Allium validation on every spec under spec/ (FR-0.2, FR-1.1 structural slice).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v allium >/dev/null 2>&1; then
  echo "check-allium-specs: allium not on PATH. Install from https://github.com/juxt/allium-tools" >&2
  exit 1
fi

exec allium check spec/
