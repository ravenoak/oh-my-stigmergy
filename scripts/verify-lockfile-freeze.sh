#!/usr/bin/env bash
# FR-10.2: a lockfile changing without its sibling manifest changing in the same PR is either
# an unreviewed drift or needs the deps-review label. Report-only (see DELIVERY_FLOORS_BLOCKING).
set -uo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

config="devtools/lockfile-freeze.json"
if [[ ! -f "$config" ]]; then
  echo "verify-lockfile-freeze: missing $config" >&2
  exit 1
fi

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-lockfile-freeze: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-lockfile-freeze: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"
is_changed() { grep -qxF "$1" <<< "$changed"; }

review_label="$(python3 -c "import json; print(json.load(open('$config')).get('reviewLabel',''))")"
has_review_label=0
IFS=',' read -ra labels <<< "${PR_LABELS:-}"
for l in "${labels[@]:-}"; do
  [[ "$l" == "$review_label" ]] && has_review_label=1
done

violations=""
pair_count="$(python3 -c "import json; print(len(json.load(open('$config'))['pairs']))")"
for ((i = 0; i < pair_count; i++)); do
  lockfile="$(python3 -c "import json; print(json.load(open('$config'))['pairs'][$i]['lockfile'])")"
  manifest="$(python3 -c "import json; print(json.load(open('$config'))['pairs'][$i]['manifest'])")"
  if is_changed "$lockfile" && ! is_changed "$manifest"; then
    violations+="${lockfile} changed without ${manifest}"$'\n'
  fi
done

if [[ -z "$violations" ]]; then
  echo "verify-lockfile-freeze: ok"
  exit 0
fi

if [[ "$has_review_label" -eq 1 ]]; then
  echo "verify-lockfile-freeze: ALLOWED — lockfile drift present but PR carries the '${review_label}' label:"
  echo "$violations"
  exit 0
fi

echo "verify-lockfile-freeze: WARN — lockfile changed without its manifest and without the '${review_label}' label:" >&2
echo "$violations" >&2
echo "Add the '${review_label}' label if this is a reviewed transitive-only bump, or update the manifest to match." >&2

if [[ "${DELIVERY_FLOORS_BLOCKING:-0}" == "1" ]]; then
  exit 1
fi
exit 0
