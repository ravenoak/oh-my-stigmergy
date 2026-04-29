#!/usr/bin/env bash
# Bootstrap repo mediums needed for OpenCode + stigmergy plugin (SBP + graph + plugin deps).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

dry_run=0
print_snippet=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) dry_run=1 ;;
    --print-opencode-snippet) print_snippet=1 ;;
    *) echo "usage: $0 [--dry-run] [--print-opencode-snippet]" >&2; exit 2 ;;
  esac
  shift
done

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "bootstrap-opencode-stigmergy-stack: required command not found: $1" >&2
    exit 1
  }
}

need_cmd node
need_cmd npm
need_cmd uv

pyver="$(python3.13 -c 'import sys; print(sys.version_info[:2])' 2>/dev/null || true)"
if [[ "${pyver}" != "(3, 13)" ]]; then
  echo "bootstrap-opencode-stigmergy-stack: Python 3.13 recommended (see CONTRIBUTING)" >&2
fi

if [[ "${dry_run}" -eq 1 ]]; then
  echo "bootstrap-opencode-stigmergy-stack: dry-run — would uv sync, npm ci (sbp-server, opencode-plugin)"
  exit 0
fi

echo "bootstrap-opencode-stigmergy-stack: uv sync (graph tools)"
uv sync -U --all-extras --all-groups -p "$(command -v python3.13 || command -v python3)"

echo "bootstrap-opencode-stigmergy-stack: npm ci (sbp-server)"
( cd packages/sbp-server && npm ci --no-fund --no-audit )

echo "bootstrap-opencode-stigmergy-stack: npm ci (opencode-plugin)"
( cd packages/opencode-plugin && npm ci --no-fund --no-audit )

echo "bootstrap-opencode-stigmergy-stack: ok"

if [[ "${print_snippet}" -eq 1 ]]; then
  cat <<'SNIP'
/* Merge into opencode.json "plugin" array — adjust path if you use npm package name. */
{
  "plugin": ["@oh-my-stigmergy/opencode-plugin"]
}
/* Or local path from checkout: */
/* "plugin": ["file:///ABS/PATH/TO/oh-my-stigmergy/packages/opencode-plugin"] */
SNIP
fi
