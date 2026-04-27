#!/usr/bin/env bash
# FR-0.1: every FR row with a concrete spec anchor must resolve to existing paths under the repo root.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fr_doc="docs/requirements/FR.md"
test -f "$fr_doc" || {
  echo "verify-fr-spec-anchors: missing $fr_doc" >&2
  exit 1
}

python3 <<'PY'
import pathlib
import re
import sys

root = pathlib.Path(".").resolve()
fr_path = root / "docs" / "requirements" / "FR.md"
text = fr_path.read_text(encoding="utf-8")
req_dir = fr_path.parent
errors = []

link_re = re.compile(r"\]\((\.\./\.\./[^)]+)\)")

for line in text.splitlines():
    if not re.match(r"^\|\s*FR-[0-9]+\.[0-9]+\s*\|", line):
        continue
    parts = [p.strip() for p in line.split("|")]
    if len(parts) < 7:
        continue
    rid = parts[1]
    anchor = parts[5]
    if not anchor or anchor in ("—", "-"):
        continue
    if "`spec/**/*.allium`" in anchor or "spec/**/*.allium" in anchor:
        if not list((root / "spec").rglob("*.allium")):
            errors.append(f"{rid}: glob spec/**/*.allium matched no files")
        continue
    links = link_re.findall(anchor)
    if not links:
        if "spec/" in anchor and "http" not in anchor:
            errors.append(
                f"{rid}: spec anchor not parseable (use markdown links to ../../spec/...): {anchor[:100]!r}"
            )
        continue
    for rel in links:
        if not rel.startswith("../../"):
            errors.append(f"{rid}: link must be ../../... from FR.md (got {rel!r})")
            continue
        target = (req_dir / rel).resolve()
        try:
            target.relative_to(root)
        except ValueError:
            errors.append(f"{rid}: path escapes repo: {rel}")
            continue
        if not target.is_file() and not target.is_dir():
            errors.append(f"{rid}: missing path {rel} -> {target}")

if errors:
    print("verify-fr-spec-anchors: failures:", file=sys.stderr)
    for e in errors:
        print(f"  {e}", file=sys.stderr)
    sys.exit(1)
print("verify-fr-spec-anchors: ok")
PY
