#!/usr/bin/env bash
# FR-6.x: orchestration charter docs exist and root docs link to migration + ADR-0013.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

test -f docs/adr/0013-stigmergic-opencode-orchestration.md || {
  echo "verify-stigmergy-orchestration-doc: missing ADR-0013" >&2
  exit 1
}
test -f docs/guides/migration-from-oh-my-openagent.md || {
  echo "verify-stigmergy-orchestration-doc: missing migration guide" >&2
  exit 1
}
test -f scripts/bootstrap-opencode-stigmergy-stack.sh || {
  echo "verify-stigmergy-orchestration-doc: missing bootstrap script" >&2
  exit 1
}

for f in README.md AGENTS.md CONTRIBUTING.md; do
  grep -qF "0013-stigmergic-opencode-orchestration" "$f" || {
    echo "verify-stigmergy-orchestration-doc: $f must link to ADR-0013" >&2
    exit 1
  }
  grep -qF "migration-from-oh-my-openagent" "$f" || {
    echo "verify-stigmergy-orchestration-doc: $f must link to migration guide" >&2
    exit 1
  }
done

grep -qF "stigmergy_actionable" packages/opencode-plugin/README.md || {
  echo "verify-stigmergy-orchestration-doc: plugin README must mention stigmergy_actionable" >&2
  exit 1
}

echo "verify-stigmergy-orchestration-doc: ok"
