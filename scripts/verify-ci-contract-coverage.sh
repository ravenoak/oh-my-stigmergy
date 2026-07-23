#!/usr/bin/env bash
# FR-0.2: every scripts/verify-*.sh is either referenced by a workflow or
# tests/ci_contract.sh, or carries an explicit waiver with a reason.
# Closes the "cited-but-never-run" gap: tests/ci_contract.sh is a hard-coded
# allow-list (no globbing), so a verify script can be added to the repo,
# cited in an ADR/doc as enforcing something, and never execute in CI.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

waivers="devtools/verify-script-waivers.json"
test -f "$waivers" || {
  echo "verify-ci-contract-coverage: missing $waivers" >&2
  exit 1
}

python3 <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(".").resolve()
scripts_dir = root / "scripts"
workflows_dir = root / ".github" / "workflows"
ci_contract = root / "tests" / "ci_contract.sh"
waivers_path = root / "devtools" / "verify-script-waivers.json"

waivers_data = json.loads(waivers_path.read_text(encoding="utf-8"))
waived = {}
for entry in waivers_data:
    if "script" not in entry or "reason" not in entry:
        raise SystemExit(
            f"verify-ci-contract-coverage: waiver entries need 'script' and 'reason': {entry!r}"
        )
    if not entry["reason"].strip():
        raise SystemExit(
            f"verify-ci-contract-coverage: empty waiver reason for {entry['script']!r}"
        )
    waived[entry["script"]] = entry["reason"]

haystacks = [ci_contract.read_text(encoding="utf-8")]
for wf in sorted(workflows_dir.glob("*.yml")) + sorted(workflows_dir.glob("*.yaml")):
    haystacks.append(wf.read_text(encoding="utf-8"))
combined = "\n".join(haystacks)

verify_scripts = sorted(
    p.name for p in scripts_dir.glob("verify-*.sh") if p.name != "verify-ci-contract-coverage.sh"
)
unwaived_uncovered = []
stale_waivers = []
for name in verify_scripts:
    referenced = name in combined
    if referenced and name in waived:
        stale_waivers.append(name)
    elif not referenced and name not in waived:
        unwaived_uncovered.append(name)

# The meta-check verifying itself must also be wired in — checked structurally,
# not via self-reference (grepping this file's own name inside itself proves nothing).
self_name = "verify-ci-contract-coverage.sh"
if self_name not in combined:
    unwaived_uncovered.append(self_name)

if unwaived_uncovered:
    print("verify-ci-contract-coverage: uncovered, unwaived verify scripts:", file=sys.stderr)
    for name in unwaived_uncovered:
        print(f"  scripts/{name}", file=sys.stderr)
    print(
        "Wire each into a workflow step or tests/ci_contract.sh, or add a waiver "
        f"entry with a reason to {waivers_path.relative_to(root)}.",
        file=sys.stderr,
    )
    sys.exit(1)

if stale_waivers:
    print("verify-ci-contract-coverage: stale waivers (script is now referenced):", file=sys.stderr)
    for name in stale_waivers:
        print(f"  scripts/{name}", file=sys.stderr)
    print(f"Remove the waiver entry from {waivers_path.relative_to(root)}.", file=sys.stderr)
    sys.exit(1)

print("verify-ci-contract-coverage: ok")
PY
