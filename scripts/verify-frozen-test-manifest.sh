#!/usr/bin/env bash
# FR-10.1: implement-phase PRs must not silently change frozen test files.
#
# Phase-keying note (interim, per docs/planning/orchestrator-implementation-plan.md Stage 3):
# there is no ledger phaseTransition mark to key on yet — this check activates whenever
# devtools/frozen-test-manifest.json registers a path, regardless of "phase". The manifest's
# frozenPaths map IS the phase declaration for now; ledger-mark keying is the Stage-4 upgrade
# once the human-as-orchestrator bridge publishes real phase marks.
#
# Report-only (FR-10 acceptance: ships warn-only; promotion to blocking is a separate PR):
# set DELIVERY_FLOORS_BLOCKING=1 to make a real violation fail the check instead of warning.
set -uo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

manifest="devtools/frozen-test-manifest.json"
if [[ ! -f "$manifest" ]]; then
  echo "verify-frozen-test-manifest: missing $manifest" >&2
  exit 1
fi

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-frozen-test-manifest: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-frozen-test-manifest: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"

amendment_label="$(python3 -c "import json; print(json.load(open('$manifest')).get('amendmentLabel',''))")"
has_amendment_label=0
IFS=',' read -ra labels <<< "${PR_LABELS:-}"
for l in "${labels[@]:-}"; do
  [[ "$l" == "$amendment_label" ]] && has_amendment_label=1
done

violations=""
while IFS= read -r path || [[ -n "${path}" ]]; do
  [[ -z "${path}" ]] && continue
  recorded_hash="$(python3 -c "import json,sys; d=json.load(open('$manifest'))['frozenPaths']; print(d.get(sys.argv[1],''))" "$path")"
  [[ -z "$recorded_hash" ]] && continue
  new_hash="$(git show "HEAD:${path}" 2>/dev/null | shasum -a 256 | cut -d' ' -f1)"
  if [[ "$new_hash" != "$recorded_hash" ]]; then
    violations+="${path}"$'\n'
  fi
done <<< "${changed}"

if [[ -z "$violations" ]]; then
  echo "verify-frozen-test-manifest: ok (no frozen paths changed)"
  exit 0
fi

if [[ "$has_amendment_label" -eq 1 ]]; then
  echo "verify-frozen-test-manifest: ALLOWED — frozen paths changed but PR carries the '${amendment_label}' label (escape hatch used):"
  echo "$violations"
  exit 0
fi

echo "verify-frozen-test-manifest: WARN — frozen test paths changed without the '${amendment_label}' label:" >&2
echo "$violations" >&2
echo "Add the '${amendment_label}' label to the PR if this change is intentional, or update devtools/frozen-test-manifest.json's recorded hash after review." >&2

if [[ "${DELIVERY_FLOORS_BLOCKING:-0}" == "1" ]]; then
  exit 1
fi
exit 0
