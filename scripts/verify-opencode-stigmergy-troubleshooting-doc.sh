#!/usr/bin/env bash
# FR-6.5 / Phase 17: OpenCode + stigmergy troubleshooting ops doc exists with required sections and links.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

doc="docs/operations/opencode-stigmergy-troubleshooting.md"
test -f "$doc" || {
  echo "verify-opencode-stigmergy-troubleshooting-doc: missing $doc" >&2
  exit 1
}

for heading in \
  "SBP unreachable or wrong URL or port" \
  "Plugin bridge errors (sbp_error and graph_error)" \
  "uv and Python 3.13" \
  "STIGMERGY_ORCHESTRATION_CONFIG and orchestration policy"; do
  grep -qF "## ${heading}" "$doc" || {
    echo "verify-opencode-stigmergy-troubleshooting-doc: must contain heading ## ${heading}" >&2
    exit 1
  }
done

grep -qF "opencode-stigmergy-golden-path.md" "$doc" || {
  echo "verify-opencode-stigmergy-troubleshooting-doc: must reference golden path" >&2
  exit 1
}
grep -qF "bootstrap-opencode-stigmergy-stack.sh" "$doc" || {
  echo "verify-opencode-stigmergy-troubleshooting-doc: must reference bootstrap script" >&2
  exit 1
}
grep -qF "0012-opencode-plugin-architecture.md" "$doc" || {
  echo "verify-opencode-stigmergy-troubleshooting-doc: must reference ADR-0012" >&2
  exit 1
}
grep -qF "0013-stigmergic-opencode-orchestration.md" "$doc" || {
  echo "verify-opencode-stigmergy-troubleshooting-doc: must reference ADR-0013" >&2
  exit 1
}

echo "verify-opencode-stigmergy-troubleshooting-doc: ok"
