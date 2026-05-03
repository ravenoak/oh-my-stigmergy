#!/usr/bin/env bash
# Publish @oh-my-stigmergy/opencode-plugin only after @oh-my-stigmergy/sbp-server is on npm.
# Same auth pattern as scripts/publish-sbp-server-npm.sh (NPM_TOKEN + optional --otp).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${NPM_TOKEN:-}" ]]; then
  echo "publish-opencode-plugin-npm: set NPM_TOKEN (e.g. in .env) or use npm login." >&2
  exit 1
fi

bash scripts/verify-opencode-plugin-publishable.sh

tmp="$(mktemp)"
printf '%s\n' "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >"${tmp}"
cleanup() { rm -f "${tmp}"; }
trap cleanup EXIT

(cd packages/opencode-plugin && npm ci --no-fund --no-audit && npm test && npm publish --access public --userconfig "${tmp}" "$@")
