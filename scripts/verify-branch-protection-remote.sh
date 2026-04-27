#!/usr/bin/env bash
# Read-only: verify main branch protection lists required checks from devtools/branch-protection.json.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

body_file="devtools/branch-protection.json"
branch="main"

if ! command -v gh >/dev/null 2>&1; then
  echo "verify-branch-protection-remote: gh not found." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "verify-branch-protection-remote: jq not found." >&2
  exit 1
fi

gh auth status >/dev/null 2>&1 || {
  echo "verify-branch-protection-remote: gh auth login required." >&2
  exit 1
}

test -f "$body_file" || {
  echo "verify-branch-protection-remote: missing $body_file" >&2
  exit 1
}

repo="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
owner="${repo%%/*}"
name="${repo##*/}"

prot="$(gh api "repos/${owner}/${name}/branches/${branch}/protection" 2>/dev/null)" || {
  echo "verify-branch-protection-remote: could not GET protection (404 = not protected or insufficient token)." >&2
  exit 1
}

missing=0
while IFS= read -r ctx || [[ -n "${ctx}" ]]; do
  [[ -z "${ctx}" ]] && continue
  if ! echo "${prot}" | jq -e --arg c "${ctx}" '
      ((.required_status_checks.checks // []) | map(.context) | index($c) != null)
      or ((.required_status_checks.contexts // []) | index($c) != null)
    ' >/dev/null 2>&1
  then
    continue
  fi
  echo "verify-branch-protection-remote: missing required check context: ${ctx}" >&2
  missing=1
done < <(jq -r '.required_status_checks.checks[].context' "$body_file")

if [[ "${missing}" -ne 0 ]]; then
  echo "verify-branch-protection-remote: expected from ${body_file}:" >&2
  jq -r '.required_status_checks.checks[].context' "$body_file" >&2
  exit 1
fi

echo "verify-branch-protection-remote: ok (${owner}/${name} ${branch})"
