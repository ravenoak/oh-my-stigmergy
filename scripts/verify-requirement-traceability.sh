#!/usr/bin/env bash
# Fail if FR/NFR requirement IDs diverge from RTM (NFR-D1 deterministic slice).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fr_doc="docs/requirements/FR.md"
nfr_doc="docs/requirements/NFR.md"
rtm_doc="docs/traceability/RTM.md"

for f in "$fr_doc" "$nfr_doc" "$rtm_doc"; do
  test -f "$f" || {
    echo "verify-requirement-traceability: missing $f" >&2
    exit 1
  }
done

req_tmp="$(mktemp)"
rtm_tmp="$(mktemp)"
cleanup() {
  rm -f "$req_tmp" "$rtm_tmp"
}
trap cleanup EXIT

{
  grep -E '^\| FR-[0-9]+\.[0-9]+ \|' "$fr_doc" | sed -E 's/^\| (FR-[0-9]+\.[0-9]+) \|.*/\1/'
  grep -E '^\| NFR-[A-Z][0-9]+ \|' "$nfr_doc" | sed -E 's/^\| (NFR-[A-Z][0-9]+) \|.*/\1/'
} | sort -u >"$req_tmp"

{
  grep -E '^\| FR-[0-9]+\.[0-9]+ \|' "$rtm_doc" | sed -E 's/^\| (FR-[0-9]+\.[0-9]+) \|.*/\1/'
  grep -E '^\| NFR-[A-Z][0-9]+ \|' "$rtm_doc" | sed -E 's/^\| (NFR-[A-Z][0-9]+) \|.*/\1/'
} | sort -u >"$rtm_tmp"

missing_in_rtm="$(comm -23 "$req_tmp" "$rtm_tmp" || true)"
extra_in_rtm="$(comm -13 "$req_tmp" "$rtm_tmp" || true)"

if [[ -n "$missing_in_rtm" ]]; then
  echo "verify-requirement-traceability: IDs in FR/NFR missing from RTM:" >&2
  echo "$missing_in_rtm" >&2
  exit 1
fi

if [[ -n "$extra_in_rtm" ]]; then
  echo "verify-requirement-traceability: IDs in RTM missing from FR.md or NFR.md:" >&2
  echo "$extra_in_rtm" >&2
  exit 1
fi

echo "verify-requirement-traceability: ok"
