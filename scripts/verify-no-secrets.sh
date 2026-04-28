#!/usr/bin/env bash
# NFR-S2: deterministic scan of PR diff hunks for common high-risk secret patterns.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

allow_file="devtools/secret-allowlist.txt"
test -f "$allow_file" || {
  echo "verify-no-secrets: missing $allow_file" >&2
  exit 1
}

mapfile -t allow_patterns < <(
  grep -v '^[[:space:]]*#' "$allow_file" | grep -v '^[[:space:]]*$' || true
)

diff_range=""
if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
  git fetch origin "${GITHUB_BASE_REF}" --quiet 2>/dev/null || true
  diff_range="origin/${GITHUB_BASE_REF}...HEAD"
elif [[ -n "${VERIFY_SECRET_DIFF_RANGE:-}" ]]; then
  diff_range="${VERIFY_SECRET_DIFF_RANGE}"
fi

if [[ -z "${diff_range}" ]]; then
  echo "verify-no-secrets: skip (set GITHUB_BASE_REF or VERIFY_SECRET_DIFF_RANGE for a git diff range)"
  exit 0
fi

left="${diff_range%%...*}"
right="${diff_range##*...}"
if [[ "${left}" == "${diff_range}" ]]; then
  echo "verify-no-secrets: diff range must use triple-dot (upstream...HEAD); got ${diff_range}" >&2
  exit 1
fi
if ! git rev-parse --verify "${left}^{commit}" >/dev/null 2>&1 || ! git rev-parse --verify "${right}^{commit}" >/dev/null 2>&1; then
  echo "verify-no-secrets: skip (cannot resolve ${diff_range} — shallow clone or missing refs)"
  exit 0
fi

raw="$(git diff "${diff_range}" 2>/dev/null || true)"
if [[ -z "${raw}" ]]; then
  echo "verify-no-secrets: ok (empty diff)"
  exit 0
fi

allowed_line() {
  local line="$1"
  local p
  for p in "${allow_patterns[@]}"; do
    [[ -z "${p}" ]] && continue
    [[ "${line}" == *"${p}"* ]] && return 0
  done
  return 1
}

failures=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ "${line}" == '+'* ]] || continue
  [[ "${line}" == '+++'* ]] && continue
  body="${line:1}"
  allowed_line "${body}" && continue

  if grep -qE 'AKIA[0-9A-Z]{16}' <<<"${body}"; then
    echo "verify-no-secrets: possible AWS access key id in added line" >&2
    failures=1
    continue
  fi
  if grep -qE 'gh[pousr]_[A-Za-z0-9]{20,}' <<<"${body}"; then
    echo "verify-no-secrets: possible GitHub token in added line" >&2
    failures=1
    continue
  fi
  if grep -qE 'gho_[A-Za-z0-9]{20,}' <<<"${body}"; then
    echo "verify-no-secrets: possible GitHub OAuth token in added line" >&2
    failures=1
    continue
  fi
  if grep -qE 'sk-[A-Za-z0-9]{10,}' <<<"${body}"; then
    echo "verify-no-secrets: possible API-style secret (sk-…) in added line" >&2
    failures=1
    continue
  fi
done <<<"${raw}"

if [[ "${failures}" -ne 0 ]]; then
  echo "verify-no-secrets: failures — fix secrets or extend ${allow_file} with an explicit substring match" >&2
  exit 1
fi

echo "verify-no-secrets: ok"
