#!/usr/bin/env bash
# FR-0.1: if CONSTITUTION.md changes on a PR, PRD and RTM must co-change (constitution "Amendment" + traceability).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-constitution-amendment-cotouch: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-constitution-amendment-cotouch: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"

const_hit=0
prd_hit=0
rtm_hit=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  case "${line}" in
    docs/CONSTITUTION.md) const_hit=1 ;;
    docs/PRD.md) prd_hit=1 ;;
    docs/traceability/RTM.md) rtm_hit=1 ;;
  esac
done <<< "${changed}"

if [[ "${const_hit}" -eq 1 ]]; then
  if [[ "${prd_hit}" -ne 1 ]] || [[ "${rtm_hit}" -ne 1 ]]; then
    echo "verify-constitution-amendment-cotouch: docs/CONSTITUTION.md changed without docs/PRD.md and docs/traceability/RTM.md in the same diff." >&2
    echo "Amendments update constitution and PRD scope/metrics; traceability must reflect governance (FR-0.1)." >&2
    exit 1
  fi
fi

echo "verify-constitution-amendment-cotouch: ok"
