#!/usr/bin/env bash
# FR-0.1 mechanical slice: if FR.md or NFR.md changes in a PR, RTM.md must change too.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-governance-doc-cotouch: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
# Ensure base ref exists (checkout may be shallow).
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-governance-doc-cotouch: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"

fr_hit=0
nfr_hit=0
rtm_hit=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  case "${line}" in
    docs/requirements/FR.md) fr_hit=1 ;;
    docs/requirements/NFR.md) nfr_hit=1 ;;
    docs/traceability/RTM.md) rtm_hit=1 ;;
  esac
done <<< "${changed}"

if [[ "${fr_hit}" -eq 1 ]] || [[ "${nfr_hit}" -eq 1 ]]; then
  if [[ "${rtm_hit}" -ne 1 ]]; then
    echo "verify-governance-doc-cotouch: docs/requirements/FR.md or NFR.md changed without docs/traceability/RTM.md in the same diff." >&2
    echo "Update RTM when changing requirements (FR-0.1)." >&2
    exit 1
  fi
fi

echo "verify-governance-doc-cotouch: ok"
