#!/usr/bin/env bash
# FR-7.1 / Phase 19: stigmergy evaluation discipline guide — required sections and ADR-0004 link.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

guide="docs/guides/stigmergy-evaluation-discipline.md"
test -f "$guide" || {
  echo "verify-stigmergy-evaluation-discipline-doc: missing $guide" >&2
  exit 1
}

for heading in \
  "What this repository can prove with CI" \
  "Falsifiable hypotheses" \
  "What would count as evidence" \
  "Non-claims"; do
  grep -qF "## ${heading}" "$guide" || {
    echo "verify-stigmergy-evaluation-discipline-doc: must contain heading ## ${heading}" >&2
    exit 1
  }
done

grep -qF "0004-verification-stack-layering.md" "$guide" || {
  echo "verify-stigmergy-evaluation-discipline-doc: must reference ADR-0004" >&2
  exit 1
}
grep -qF "CONSTITUTION.md" "$guide" || {
  echo "verify-stigmergy-evaluation-discipline-doc: must reference CONSTITUTION.md" >&2
  exit 1
}

echo "verify-stigmergy-evaluation-discipline-doc: ok"
