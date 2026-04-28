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

prot="$(gh api "repos/${owner}/${name}/branches/${branch}/protection" 2>/dev/null)" || prot=""

if [[ -n "${prot}" ]]; then
  echo "${prot}" | jq -r --arg branch "${branch}" --arg repo "${repo}" '
    "repo=\($repo) branch=\($branch) source=classic_protection",
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
  exit 0
fi

# Fallback: repository rulesets (common when classic protection endpoint returns 404).
rulesets="$(gh api "repos/${owner}/${name}/rulesets" --paginate)"
ids="$(echo "${rulesets}" | jq -r '.[] | select(.enforcement == "active") | .id')"

echo "repo=${repo} branch=${branch} source=rulesets"
while IFS= read -r rid || [[ -n "${rid}" ]]; do
  [[ -z "${rid}" ]] && continue
  rs="$(gh api "repos/${owner}/${name}/rulesets/${rid}")"
  applies="$(echo "${rs}" | jq -e --arg b "${branch}" '
    (.conditions.ref_name.include // []) as $inc
    | ($inc | index("~DEFAULT_BRANCH") != null) or ($inc | index($b) != null)
  ' >/dev/null 2>&1 && echo 1 || echo 0)"
  [[ "${applies}" -eq 1 ]] || continue

  echo "ruleset.id=${rid}"
  echo "ruleset.name=$(echo "${rs}" | jq -r '.name')"
  echo "ruleset.enforcement=$(echo "${rs}" | jq -r '.enforcement')"
  echo "allowed_merge_methods=$(echo "${rs}" | jq -r '(.rules // []) | map(select(.type=="pull_request"))[0].parameters.allowed_merge_methods // [] | join(", ")')"
  echo "required_status_checks.strict=$(echo "${rs}" | jq -r '(.rules // []) | map(select(.type=="required_status_checks"))[0].parameters.strict_required_status_checks_policy // false')"
  echo "required_status_checks.contexts=$(echo "${rs}" | jq -r '(.rules // []) | map(select(.type=="required_status_checks"))[0].parameters.required_status_checks // [] | map(.context) | unique | join(", ")')"
done <<< "${ids}"
