#!/usr/bin/env bash
# Read-only: verify the default branch is protected in a way that enforces required checks.
# Supports both classic branch protection and repository rulesets (where the classic protection endpoint returns 404).
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
  prot=""
}

missing=0
if [[ -n "${prot}" ]]; then
  # Classic branch protection API shape.
  while IFS= read -r ctx || [[ -n "${ctx}" ]]; do
    [[ -z "${ctx}" ]] && continue
    if ! echo "${prot}" | jq -e --arg c "${ctx}" '
        ((.required_status_checks.checks // []) | map(.context) | index($c) != null)
        or ((.required_status_checks.contexts // []) | index($c) != null)
      ' >/dev/null 2>&1
    then
      echo "verify-branch-protection-remote: missing required check context: ${ctx}" >&2
      missing=1
    fi
  done < <(jq -r '.required_status_checks.checks[].context' "$body_file")
else
  # Rulesets API (common when classic protection endpoint returns 404).
  rulesets="$(gh api "repos/${owner}/${name}/rulesets" --paginate)"
  # Find active rulesets that apply to the default branch (main).
  # Note: include can contain "~DEFAULT_BRANCH"; treat that as matching main here.
  active_ids="$(echo "${rulesets}" | jq -r '
    .[]
    | select(.enforcement == "active")
    | .id
  ')"

  found_required_checks=0
  while IFS= read -r rid || [[ -n "${rid}" ]]; do
    [[ -z "${rid}" ]] && continue
    rs="$(gh api "repos/${owner}/${name}/rulesets/${rid}")"

    # Must apply to default branch (or explicitly main).
    applies="$(echo "${rs}" | jq -e --arg b "${branch}" '
      (.conditions.ref_name.include // []) as $inc
      | ($inc | index("~DEFAULT_BRANCH") != null) or ($inc | index($b) != null)
    ' >/dev/null 2>&1 && echo 1 || echo 0)"
    [[ "${applies}" -eq 1 ]] || continue

    # Ensure required_status_checks rule exists.
    if echo "${rs}" | jq -e '
      (.rules // []) | any(.type == "required_status_checks")
    ' >/dev/null 2>&1; then
      found_required_checks=1
    fi

    # Verify each expected context has some corresponding required check in rulesets.
    #
    # Rulesets API often reports only the job name (e.g. "check") rather than
    # the classic UI string (e.g. "allium-specs / check"). To avoid false negatives
    # while still being falsifiable, accept either an exact match OR a match on the
    # suffix after " / ".
    while IFS= read -r expected || [[ -n "${expected}" ]]; do
      [[ -z "${expected}" ]] && continue
      suffix="${expected##* / }"
      if ! echo "${rs}" | jq -e --arg e "${expected}" --arg s "${suffix}" '
        (.rules // [])
        | map(select(.type == "required_status_checks"))[0].parameters.required_status_checks
        | map(.context)
        | (index($e) != null or index($s) != null)
      ' >/dev/null 2>&1; then
        echo "verify-branch-protection-remote: missing required check context in rulesets: ${expected} (or suffix ${suffix})" >&2
        missing=1
      fi
    done < <(jq -r '.required_status_checks.checks[].context' "$body_file")

    # Verify merge method policy is linear (squash/rebase only) when a PR rule exists.
    if echo "${rs}" | jq -e '
      (.rules // [])
      | map(select(.type == "pull_request"))[0].parameters.allowed_merge_methods
      | (index("squash") != null) and (index("rebase") != null)
    ' >/dev/null 2>&1; then
      :
    else
      echo "verify-branch-protection-remote: ruleset does not require squash+rebase merge methods" >&2
      missing=1
    fi
  done <<< "${active_ids}"

  if [[ "${found_required_checks}" -ne 1 ]]; then
    echo "verify-branch-protection-remote: no active ruleset with required_status_checks found for ${branch} (or ~DEFAULT_BRANCH)" >&2
    missing=1
  fi
fi

if [[ "${missing}" -ne 0 ]]; then
  echo "verify-branch-protection-remote: expected from ${body_file}:" >&2
  jq -r '.required_status_checks.checks[].context' "$body_file" >&2
  exit 1
fi

echo "verify-branch-protection-remote: ok (${owner}/${name} ${branch})"
