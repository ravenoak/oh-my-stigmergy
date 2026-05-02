#!/usr/bin/env bash
# FR-5.5: ADR-0014 and operator docs reference project-local SBP supervision.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

adr="docs/adr/0014-sbp-project-supervision.md"
test -f "$adr" || {
  echo "verify-stigmergy-sbp-supervision-doc: missing $adr" >&2
  exit 1
}

golden="docs/guides/opencode-stigmergy-golden-path.md"
readme="packages/opencode-plugin/README.md"
compat="docs/operations/opencode-compatibility.md"

for f in "$golden" "$readme" "$compat"; do
  test -f "$f" || {
    echo "verify-stigmergy-sbp-supervision-doc: missing $f" >&2
    exit 1
  }
done

grep -qF "0014-sbp-project-supervision.md" "$golden" || {
  echo "verify-stigmergy-sbp-supervision-doc: golden path must link ADR-0014" >&2
  exit 1
}
grep -qF "0014-sbp-project-supervision.md" "$readme" || {
  echo "verify-stigmergy-sbp-supervision-doc: plugin README must link ADR-0014" >&2
  exit 1
}
grep -qF "0014-sbp-project-supervision.md" "$compat" || {
  echo "verify-stigmergy-sbp-supervision-doc: compatibility doc must link ADR-0014" >&2
  exit 1
}

trouble="docs/operations/opencode-stigmergy-troubleshooting.md"
grep -qF "## Project-local SBP supervision" "$trouble" || {
  echo "verify-stigmergy-sbp-supervision-doc: troubleshooting must contain ## Project-local SBP supervision" >&2
  exit 1
}
grep -qF "0014-sbp-project-supervision.md" "$trouble" || {
  echo "verify-stigmergy-sbp-supervision-doc: troubleshooting must reference ADR-0014" >&2
  exit 1
}

echo "verify-stigmergy-sbp-supervision-doc: ok"
