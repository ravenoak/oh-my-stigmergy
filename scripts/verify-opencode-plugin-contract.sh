#!/usr/bin/env bash
# FR-5.1 (Phase 11): mechanical contract for packages/opencode-plugin.
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

for f in \
  packages/opencode-plugin/src/index.mjs \
  packages/opencode-plugin/src/auditLog.mjs \
  packages/opencode-plugin/src/sbpClient.mjs \
  packages/opencode-plugin/src/superviseSbp.mjs \
  packages/opencode-plugin/src/tools.mjs \
  packages/opencode-plugin/src/events.mjs \
  packages/opencode-plugin/src/orchestration.mjs \
  packages/opencode-plugin/schema/orchestration.schema.json \
  packages/opencode-plugin/bin/metrics.mjs \
  packages/opencode-plugin/test/plugin.test.mjs \
  packages/opencode-plugin/test/events.test.mjs \
  packages/opencode-plugin/test/tools-schema.test.mjs \
  packages/opencode-plugin/test/orchestration.test.mjs \
  packages/opencode-plugin/test/metrics.test.mjs \
  packages/opencode-plugin/test/superviseSbp.test.mjs; do
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
if bool(pkg.get("private")):
    print("verify-opencode-plugin-contract: package.json must set private: false for npm publish (ADR-0012)", file=sys.stderr)
    raise SystemExit(1)
exports = pkg.get("exports") or {}
if exports.get(".") != "./src/index.mjs":
    print("verify-opencode-plugin-contract: exports['.'] must be ./src/index.mjs", file=sys.stderr)
    raise SystemExit(1)
if "test" not in (pkg.get("scripts") or {}):
    print("verify-opencode-plugin-contract: package.json must define scripts.test", file=sys.stderr)
    raise SystemExit(1)
scripts = pkg.get("scripts") or {}
if scripts.get("metrics") != "node bin/metrics.mjs":
    print("verify-opencode-plugin-contract: package.json scripts.metrics must be node bin/metrics.mjs", file=sys.stderr)
    raise SystemExit(1)
deps = pkg.get("dependencies") or {}
want = "@oh-my-stigmergy/sbp-server"
if want not in deps:
    print(f"verify-opencode-plugin-contract: package.json must depend on {want!r} (FR-5.5)", file=sys.stderr)
    raise SystemExit(1)
print("verify-opencode-plugin-contract: ok (manifest)")
PY

# Export smoke imports @opencode-ai/plugin (and transitive deps); install first so
# governance (no separate npm step) matches local `bash scripts/verify-…`.
echo "verify-opencode-plugin-contract: npm ci (plugin deps for export smoke)"
( cd packages/opencode-plugin && npm ci --no-fund --no-audit )

node --input-type=module -e "
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const u = pathToFileURL(path.resolve('packages/opencode-plugin/src/index.mjs')).href;
const m = await import(u);
if (typeof m.StigmergyPlugin !== 'function') {
  console.error('verify-opencode-plugin-contract: StigmergyPlugin must be an async function export');
  process.exit(1);
}
console.log('verify-opencode-plugin-contract: ok (export smoke)');
"

echo "verify-opencode-plugin-contract: npm pack (tarball contains entry)"
pack_line="$( ( cd packages/opencode-plugin && npm pack 2>/dev/null ) | tail -1 )"
test -n "${pack_line}" || {
  echo "verify-opencode-plugin-contract: npm pack produced no output" >&2
  exit 1
}
tarball="packages/opencode-plugin/${pack_line}"
test -f "${tarball}" || {
  echo "verify-opencode-plugin-contract: missing ${tarball}" >&2
  exit 1
}
python3 <<PY
import tarfile
import sys
t = tarfile.open("${tarball}", "r:*")
names = [m.name for m in t.getmembers()]
if not any(n.endswith("package/src/index.mjs") for n in names):
    print("verify-opencode-plugin-contract: tarball must contain package/src/index.mjs", file=sys.stderr)
    sys.exit(1)
print("verify-opencode-plugin-contract: ok (npm pack)")
PY
rm -f "${tarball}"
