#!/usr/bin/env bash
# Publish @oh-my-stigmergy/sbp-server to the public npm registry.
# Usage: from repo root, with NPM_TOKEN in the environment (e.g. source .env).
# Extra args pass through to npm publish, e.g.  ./scripts/publish-sbp-server-npm.sh --dry-run
# npm 2FA:  ./scripts/publish-sbp-server-npm.sh --otp=123456
# If you see EOTP, either pass --otp (authenticator) or use an npm *automation*
# granular access token (no OTP) for CI-style publish: https://docs.npmjs.com/about-access-tokens
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
  echo "publish-sbp-server-npm: set NPM_TOKEN (e.g. in .env) or use npm login." >&2
  exit 1
fi

tmp="$(mktemp)"
printf '%s\n' "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >"${tmp}"
cleanup() { rm -f "${tmp}"; }
trap cleanup EXIT

(cd packages/sbp-server && npm ci --no-fund --no-audit && npm test && npm publish --access public --userconfig "${tmp}" "$@")
