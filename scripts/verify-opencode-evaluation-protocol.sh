#!/usr/bin/env bash
# FR-7.2 / Phase 20: OpenCode effectiveness study protocol — structural checks only (no study outcomes).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

protocol="docs/research/opencode-effectiveness-study-protocol.md"
test -f "$protocol" || {
  echo "verify-opencode-evaluation-protocol: missing $protocol" >&2
  exit 1
}

for heading in \
  "Objectives" \
  "Experimental conditions" \
  "Metric definitions" \
  "Task bank" \
  "Analysis and reporting" \
  "Data retention and ethics"; do
  grep -qF "## ${heading}" "$protocol" || {
    echo "verify-opencode-evaluation-protocol: must contain heading ## ${heading}" >&2
    exit 1
  }
done

grep -qF "0004-verification-stack-layering.md" "$protocol" || {
  echo "verify-opencode-evaluation-protocol: must reference ADR-0004" >&2
  exit 1
}
grep -qF "0015-empirical-evaluation-study-claims.md" "$protocol" || {
  echo "verify-opencode-evaluation-protocol: must reference ADR-0015" >&2
  exit 1
}

# Frozen metric table — pipe-delimited rows with M1–M4 identifiers.
grep -qF "| **M1**" "$protocol" || {
  echo "verify-opencode-evaluation-protocol: must define primary metric M1 in metric tables" >&2
  exit 1
}
grep -qF "| **M4**" "$protocol" || {
  echo "verify-opencode-evaluation-protocol: must define secondary metric M4 in metric tables" >&2
  exit 1
}

grep -qF "**Protocol version:**" "$protocol" || {
  echo "verify-opencode-evaluation-protocol: must declare protocol version" >&2
  exit 1
}

echo "verify-opencode-evaluation-protocol: ok"
