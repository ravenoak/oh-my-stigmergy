#!/usr/bin/env bash
# FR-6.4 / Phase 16: stigmergic SDLC workflows guide exists with three workflows and required keywords.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

guide="docs/guides/stigmergic-sdlc-workflows.md"
test -f "$guide" || {
  echo "verify-stigmergic-sdlc-workflows-doc: missing $guide" >&2
  exit 1
}

for heading in \
  "Workflow: Pheromone trail from work item to claimed implementation" \
  "Workflow: Spec and intent change with Allium and repository gates" \
  "Workflow: OpenCode plugin release and npm publish discipline"; do
  grep -qF "## ${heading}" "$guide" || {
    echo "verify-stigmergic-sdlc-workflows-doc: guide must contain heading ## ${heading}" >&2
    exit 1
  }
done

grep -qiF "pheromone" "$guide" || {
  echo "verify-stigmergic-sdlc-workflows-doc: guide must mention pheromone" >&2
  exit 1
}
grep -qiF "load_node" "$guide" || {
  echo "verify-stigmergic-sdlc-workflows-doc: guide must mention load_node" >&2
  exit 1
}
grep -qiF "allium" "$guide" || {
  echo "verify-stigmergic-sdlc-workflows-doc: guide must mention allium" >&2
  exit 1
}
grep -qF "opencode-stigmergy-golden-path.md" "$guide" || {
  echo "verify-stigmergic-sdlc-workflows-doc: guide must link to opencode-stigmergy-golden-path.md" >&2
  exit 1
}

echo "verify-stigmergic-sdlc-workflows-doc: ok"
