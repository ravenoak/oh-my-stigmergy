#!/usr/bin/env bash
# Fail if any GitHub Actions workflow uses a floating ref (tag/branch) instead of an immutable SHA.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

workflows_dir=".github/workflows"
test -d "$workflows_dir" || {
  echo "verify-actions-pinned: missing $workflows_dir/" >&2
  exit 1
}

python3 <<'PY'
import pathlib
import re
import sys

root = pathlib.Path(".").resolve()
wf_dir = root / ".github" / "workflows"

# Match: uses: owner/repo@ref (allow optional quotes), with or without a leading
# "- ", and tolerate a trailing "# comment" (e.g. "# v6.3.0") — both forms occur
# in this repo's workflows.
uses_re = re.compile(r"^\s*(?:-\s+)?uses:\s*['\"]?([^@'\"\s]+)@([^'\"\s#]+)['\"]?\s*(?:#.*)?$")
sha_re = re.compile(r"^[0-9a-f]{40}$")

errors: list[str] = []

for wf in sorted(wf_dir.glob("*.yml")) + sorted(wf_dir.glob("*.yaml")):
    text = wf.read_text(encoding="utf-8")
    for i, line in enumerate(text.splitlines(), start=1):
        m = uses_re.match(line)
        if not m:
            continue
        action, ref = m.group(1), m.group(2)
        # Local actions (./path) are fine; everything else must be SHA pinned.
        if action.startswith("./"):
            continue
        if not sha_re.match(ref):
            errors.append(f"{wf.as_posix()}:{i}: uses {action}@{ref} is not SHA-pinned")

if errors:
    print("verify-actions-pinned: failures:", file=sys.stderr)
    for e in errors:
        print(f"  {e}", file=sys.stderr)
    sys.exit(1)

print("verify-actions-pinned: ok")
PY

