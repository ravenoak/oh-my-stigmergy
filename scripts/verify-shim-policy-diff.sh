#!/usr/bin/env bash
# FR-4.1: if policy.maintainer.json changes in a PR, README must co-touch (review signal).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-shim-policy-diff: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-shim-policy-diff: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"

policy_hit=0
readme_hit=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  case "${line}" in
    devtools/crucible-shim/policy.maintainer.json) policy_hit=1 ;;
    devtools/crucible-shim/README.md) readme_hit=1 ;;
  esac
done <<< "${changed}"

if [[ "${policy_hit}" -eq 1 ]] && [[ "${readme_hit}" -ne 1 ]]; then
  echo "verify-shim-policy-diff: devtools/crucible-shim/policy.maintainer.json changed without devtools/crucible-shim/README.md in the same PR." >&2
  echo "Co-touch the README to record the policy intent (FR-4.1)." >&2
  exit 1
fi

echo "verify-shim-policy-diff: ok"
