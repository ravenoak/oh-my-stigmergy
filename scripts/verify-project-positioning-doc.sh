#!/usr/bin/env bash
# FR-6.4 / Phase 16: project positioning guide exists with required sections and canonical links.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

guide="docs/guides/project-positioning-and-boundaries.md"
test -f "$guide" || {
  echo "verify-project-positioning-doc: missing $guide" >&2
  exit 1
}

for heading in \
  "Multi-agent in this repository" \
  "Verification scope" \
  "Decentralization" \
  "Reference deployment scale"; do
  grep -qF "## ${heading}" "$guide" || {
    echo "verify-project-positioning-doc: guide must contain heading ## ${heading}" >&2
    exit 1
  }
done

for needle in \
  "0004-verification-stack-layering.md" \
  "0005-conflict-resolution-governance.md" \
  "0013-stigmergic-opencode-orchestration.md" \
  "BACKLOG.md"; do
  grep -qF "${needle}" "$guide" || {
    echo "verify-project-positioning-doc: guide must reference ${needle}" >&2
    exit 1
  }
done

echo "verify-project-positioning-doc: ok"
