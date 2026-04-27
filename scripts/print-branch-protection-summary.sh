#!/usr/bin/env bash
# Pretty-print main branch protection (requires gh + jq + read access to admin API).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

branch="${1:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "print-branch-protection-summary: gh not found." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "print-branch-protection-summary: jq not found." >&2
  exit 1
fi

gh auth status >/dev/null 2>&1 || {
  echo "print-branch-protection-summary: gh auth login required." >&2
  exit 1
}

repo="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
owner="${repo%%/*}"
name="${repo##*/}"

prot="$(gh api "repos/${owner}/${name}/branches/${branch}/protection" 2>/dev/null)" || {
  echo "print-branch-protection-summary: could not GET protection (404 = not protected or insufficient token)." >&2
  exit 1
}

echo "${prot}" | jq -r --arg branch "${branch}" --arg repo "${repo}" '
  "repo=\($repo) branch=\($branch)",
  ("enforce_admins: " + ((.enforce_admins.enabled // false) | tostring)),
  ("required_linear_history: " + ((.required_linear_history.enabled // false) | tostring)),
  ("allow_force_pushes: " + ((.allow_force_pushes.enabled // false) | tostring)),
  ("required_status_checks.strict: " + ((.required_status_checks.strict // false) | tostring)),
  ("contexts: " + (
    [ (.required_status_checks.checks // [])[] | .context ]
    + (.required_status_checks.contexts // [])
    | unique
    | join(", ")
  ))
'
