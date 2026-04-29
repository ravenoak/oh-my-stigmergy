#!/usr/bin/env bash
# FR-5.4: operator golden-path guide exists, LICENSE present, and adoption links are wired.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

guide="docs/guides/opencode-stigmergy-golden-path.md"
test -f "$guide" || {
  echo "verify-opencode-golden-path: missing $guide" >&2
  exit 1
}
test -f LICENSE || {
  echo "verify-opencode-golden-path: missing LICENSE at repo root" >&2
  exit 1
}

for f in README.md AGENTS.md CONTRIBUTING.md; do
  path="$repo_root/$f"
  test -f "$path" || {
    echo "verify-opencode-golden-path: missing $f" >&2
    exit 1
  }
  grep -qF "opencode-stigmergy-golden-path" "$path" || {
    echo "verify-opencode-golden-path: $f must link to opencode-stigmergy-golden-path" >&2
    exit 1
  }
done

grep -qF "graph.load_node" "$guide" || {
  echo "verify-opencode-golden-path: guide must mention graph.load_node" >&2
  exit 1
}
grep -qF "SBP_URL" "$guide" || {
  echo "verify-opencode-golden-path: guide must mention SBP_URL" >&2
  exit 1
}
grep -qF "STIGMERGY_AUDIT_LOG_FILE" "$guide" || {
  echo "verify-opencode-golden-path: guide must mention STIGMERGY_AUDIT_LOG_FILE" >&2
  exit 1
}
grep -qF "SBP_LOG_FILE" "$guide" || {
  echo "verify-opencode-golden-path: guide must mention SBP_LOG_FILE" >&2
  exit 1
}

echo "verify-opencode-golden-path: ok"
