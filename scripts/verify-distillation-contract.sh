#!/usr/bin/env bash
# FR-1.2: path prefixes in devtools/distillation-contract.json require spec/ or a waiver in docs/distillation/waivers/.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

contract="devtools/distillation-contract.json"
if [[ ! -f "$contract" ]]; then
  echo "verify-distillation-contract: missing $contract" >&2
  exit 1
fi

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-distillation-contract: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-distillation-contract: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
changed="$(git diff --name-only "${merge_base}" HEAD)"

prefixes_json="$(python3 -c "import json; d=json.load(open('$contract')); print('\n'.join(d['pathPrefixes']))")"
waiver_dir="$(python3 -c "import json; print(json.load(open('$contract'))['waiverDirectory'])")"

touched_contract_path=0
spec_touched=0
waiver_touched=0
while IFS= read -r path || [[ -n "${path}" ]]; do
  [[ -z "${path}" ]] && continue
  case "${path}" in
    spec/*) spec_touched=1 ;;
    "${waiver_dir}"/*) waiver_touched=1 ;;
  esac
  while IFS= read -r prefix || [[ -n "${prefix}" ]]; do
    [[ -z "${prefix}" ]] && continue
    case "${path}" in
      "${prefix}"*) touched_contract_path=1 ;;
    esac
  done <<< "${prefixes_json}"
done <<< "${changed}"

if [[ "${touched_contract_path}" -eq 1 ]]; then
  if [[ "${spec_touched}" -ne 1 ]] && [[ "${waiver_touched}" -ne 1 ]]; then
    echo "verify-distillation-contract: changes under watched prefixes require updates under spec/ or a new file under ${waiver_dir}/." >&2
    echo "See docs/guides/distillation-playbook.md (FR-1.2)." >&2
    exit 1
  fi
fi

echo "verify-distillation-contract: ok"
