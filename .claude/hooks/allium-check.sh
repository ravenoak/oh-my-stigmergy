#!/usr/bin/env bash
# .claude/hooks/allium-check.sh
#
# PostToolUse hook: runs `allium check` after an Edit or Write tool call on a .allium file.
# Called by Claude Code with PostToolUse JSON on stdin.
#
# Exit 0  — success or not applicable (not a .allium file, or allium not installed).
# Exit 2  — allium check failed; stderr is fed back to the model.
#
# Graceful no-op: if allium is not on PATH this hook exits 0 silently so developers
# without allium-cli installed are not blocked. The CI gate enforces the check for everyone.

set -euo pipefail

# Read stdin (PostToolUse JSON sent by Claude Code)
input=$(cat)

# Extract the file_path from tool_input (handles Edit and Write tool shapes)
file_path=$(printf '%s' "$input" | python3 - <<'PYEOF'
import sys, json
try:
    data = json.load(sys.stdin)
    fp = data.get("tool_input", {}).get("file_path", "")
    print(fp)
except Exception:
    print("")
PYEOF
2>/dev/null || true)

# Only act on .allium files
case "$file_path" in
  *.allium) ;;
  *) exit 0 ;;
esac

# No-op if allium CLI is not installed
if ! command -v allium >/dev/null 2>&1; then
  exit 0
fi

# Run allium check; on failure exit 2 so Claude Code feeds the diagnostics back to the model
if ! output=$(allium check "$file_path" 2>&1); then
  printf '%s\n' "$output" >&2
  printf '\n[allium-check hook] `allium check` failed for: %s\n' "$file_path" >&2
  printf 'Fix the diagnostics above before committing.\n' >&2
  exit 2
fi

exit 0
