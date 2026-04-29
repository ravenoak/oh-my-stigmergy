#!/usr/bin/env bash
# FR-6.3: operator playbook, compatibility matrix (pinned peer version), release runbook — linked from root docs.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

playbook="docs/guides/opencode-model-routing-playbook.md"
compat="docs/operations/opencode-compatibility.md"
release_doc="docs/operations/opencode-plugin-release.md"
pkg_json="packages/opencode-plugin/package.json"

for f in "$playbook" "$compat" "$release_doc"; do
  test -f "$f" || {
    echo "verify-opencode-operator-docs: missing $f" >&2
    exit 1
  }
done
test -f "$pkg_json" || {
  echo "verify-opencode-operator-docs: missing $pkg_json" >&2
  exit 1
}

grep -qF "0013-stigmergic-opencode-orchestration" "$compat" || {
  echo "verify-opencode-operator-docs: $compat must reference ADR-0013" >&2
  exit 1
}

grep -qF "OpenCode model routing playbook" "$playbook" || {
  echo "verify-opencode-operator-docs: playbook title anchor missing" >&2
  exit 1
}

grep -qF "npm publish" "$release_doc" || {
  echo "verify-opencode-operator-docs: release doc must mention npm publish" >&2
  exit 1
}

pinned="$(node -e "const p=require('./packages/opencode-plugin/package.json'); process.stdout.write(p.dependencies['@opencode-ai/plugin']||'');")"
test -n "$pinned" || {
  echo "verify-opencode-operator-docs: could not read @opencode-ai/plugin from package.json" >&2
  exit 1
}
grep -qF "$pinned" "$compat" || {
  echo "verify-opencode-operator-docs: $compat must mention pinned version ${pinned} from package.json" >&2
  exit 1
}

for f in README.md AGENTS.md CONTRIBUTING.md; do
  grep -qF "opencode-model-routing-playbook" "$f" || {
    echo "verify-opencode-operator-docs: $f must link to model routing playbook" >&2
    exit 1
  }
  grep -qF "opencode-compatibility.md" "$f" || {
    echo "verify-opencode-operator-docs: $f must link to opencode-compatibility.md" >&2
    exit 1
  }
  grep -qF "opencode-plugin-release.md" "$f" || {
    echo "verify-opencode-operator-docs: $f must link to opencode-plugin-release.md" >&2
    exit 1
  }
done

grep -qF "opencode-model-routing-playbook" packages/opencode-plugin/README.md || {
  echo "verify-opencode-operator-docs: plugin README must link model routing playbook" >&2
  exit 1
}

echo "verify-opencode-operator-docs: ok"
