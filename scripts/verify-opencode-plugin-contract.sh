#!/usr/bin/env bash
# FR-5.1 (Phase 11): mechanical contract for packages/opencode-plugin manifest.
# P11-a: manifest + lockfile + README only. P11-b extends this script for export smoke + test files.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

pkg="packages/opencode-plugin/package.json"
lock="packages/opencode-plugin/package-lock.json"
readme="packages/opencode-plugin/README.md"

for f in "$pkg" "$lock" "$readme"; do
  test -f "$f" || {
    echo "verify-opencode-plugin-contract: missing $f" >&2
    exit 1
  }
done

python3 <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(".").resolve()
pkg = json.loads((root / "packages" / "opencode-plugin" / "package.json").read_text(encoding="utf-8"))
want_name = "@oh-my-stigmergy/opencode-plugin"
if pkg.get("name") != want_name:
    print(f"verify-opencode-plugin-contract: expected name {want_name!r}, got {pkg.get('name')!r}", file=sys.stderr)
    raise SystemExit(1)
if pkg.get("type") != "module":
    print("verify-opencode-plugin-contract: package.json must set type: module", file=sys.stderr)
    raise SystemExit(1)
if not bool(pkg.get("private")):
    print("verify-opencode-plugin-contract: package.json must set private: true until publish policy exists", file=sys.stderr)
    raise SystemExit(1)
print("verify-opencode-plugin-contract: ok (manifest)")
PY
