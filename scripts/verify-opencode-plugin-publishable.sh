#!/usr/bin/env bash
# Pre-publish gate: npm tarball consumers cannot resolve file:/workspace:/link: deps.
# Run manually (or on a release branch) before `npm publish`; normal PR CI keeps monorepo file: deps.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

pkg_json="packages/opencode-plugin/package.json"
test -f "$pkg_json" || {
  echo "verify-opencode-plugin-publishable: missing $pkg_json" >&2
  exit 1
}

python3 <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(".").resolve()
path = root / "packages" / "opencode-plugin" / "package.json"
data = json.loads(path.read_text(encoding="utf-8"))
bad = []
for section in ("dependencies", "optionalDependencies", "peerDependencies", "devDependencies"):
    block = data.get(section) or {}
    if not isinstance(block, dict):
        continue
    for name, spec in block.items():
        s = str(spec).strip() if spec is not None else ""
        if s.startswith("file:") or s.startswith("link:") or s.startswith("workspace:"):
            bad.append(f"{section}[{name!r}] = {s!r}")
if bad:
    print("verify-opencode-plugin-publishable: cannot publish with local path dependencies:", file=sys.stderr)
    for b in bad:
        print(f"  {b}", file=sys.stderr)
    print("verify-opencode-plugin-publishable: see docs/operations/opencode-plugin-release.md (registry train).", file=sys.stderr)
    raise SystemExit(1)
print("verify-opencode-plugin-publishable: ok (no file:/link:/workspace: in plugin package.json)")
PY
