#!/usr/bin/env bash
# Apply classic GitHub branch protection on main (requires gh + repo admin).
# Body: devtools/branch-protection.json (see docs/operations/github-branch-protection.md).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

body_file="devtools/branch-protection.json"
branch="main"

if ! command -v gh >/dev/null 2>&1; then
  echo "apply-branch-protection-main: gh not found. Install https://cli.github.com/" >&2
  exit 1
fi

gh auth status >/dev/null 2>&1 || {
  echo "apply-branch-protection-main: run gh auth login with a token that can admin this repository." >&2
  exit 1
}

if ! command -v jq >/dev/null 2>&1; then
  echo "apply-branch-protection-main: jq not found (brew install jq / apt install jq)." >&2
  exit 1
fi

test -f "$body_file" || {
  echo "apply-branch-protection-main: missing $body_file" >&2
  exit 1
}

repo="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
owner="${repo%%/*}"
name="${repo##*/}"

strict="${1:-}"
gh_repo_args=(--repo "${owner}/${name}")

if [[ "${strict}" == "--strict" ]]; then
  if ! gh run list "${gh_repo_args[@]}" --workflow=allium-specs.yml --branch "${branch}" --limit 1 --json databaseId 2>/dev/null | jq -e 'length > 0' >/dev/null; then
    :
  else
    echo "apply-branch-protection-main: no allium-specs runs on ${branch}; push first or drop --strict." >&2
    exit 1
  fi
else
  if ! gh run list "${gh_repo_args[@]}" --workflow=allium-specs.yml --branch "${branch}" --limit 1 --json databaseId 2>/dev/null | jq -e 'length > 0' >/dev/null; then
    :
  else
    echo "apply-branch-protection-main: warning: no allium-specs runs on ${branch} yet; GitHub may return 422 until the check exists." >&2
  fi
fi

set +e
out="$(gh api --method PUT "repos/${owner}/${name}/branches/${branch}/protection" --input "$body_file" 2>&1)"
code=$?
set -e

if [[ "${code}" -ne 0 ]]; then
  echo "apply-branch-protection-main: gh api failed (${code}):" >&2
  echo "${out}" >&2
  echo "" >&2
  echo "If validation failed (422): ensure a green allium-specs run exists on ${branch}, then confirm the check name in the Actions UI matches:" >&2
  jq -r '.required_status_checks.checks[].context' "$body_file" >&2
  exit 1
fi

echo "apply-branch-protection-main: protection applied on ${owner}/${name} branch ${branch}."
echo "Next: update the Enablement record table in docs/operations/github-branch-protection.md"
