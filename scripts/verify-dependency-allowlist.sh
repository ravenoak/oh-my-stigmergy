#!/usr/bin/env bash
# FR-10.3: newly added dependencies must be on the allowlist. Report-only (see DELIVERY_FLOORS_BLOCKING).
set -uo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

config="devtools/dependency-allowlist.json"
if [[ ! -f "$config" ]]; then
  echo "verify-dependency-allowlist: missing $config" >&2
  exit 1
fi

if [[ -z "${GITHUB_BASE_REF:-}" ]] || [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "verify-dependency-allowlist: skip (requires pull_request and GITHUB_BASE_REF)"
  exit 0
fi

base_branch="${GITHUB_BASE_REF}"
git fetch origin "${base_branch}" --depth=256 2>/dev/null || git fetch origin "${base_branch}" 2>/dev/null || true

if ! git rev-parse --verify "origin/${base_branch}" >/dev/null 2>&1; then
  echo "verify-dependency-allowlist: cannot resolve origin/${base_branch}" >&2
  exit 1
fi

merge_base="$(git merge-base "origin/${base_branch}" HEAD)"
export MERGE_BASE="$merge_base"

python3 <<'PY'
import json
import os
import re
import subprocess
import sys
import tomllib

merge_base = os.environ["MERGE_BASE"]
config = json.load(open("devtools/dependency-allowlist.json", encoding="utf-8"))


def show(ref, path):
    proc = subprocess.run(["git", "show", f"{ref}:{path}"], capture_output=True, text=True)
    return proc.stdout if proc.returncode == 0 else None


def pip_names(text):
    if text is None:
        return set()
    data = tomllib.loads(text)
    deps = data.get("project", {}).get("dependencies", [])
    return {re.split(r"[<>=!~\[; ]", d)[0].strip() for d in deps if d.strip()}


def npm_names(text):
    if text is None:
        return set()
    data = json.loads(text)
    names = set()
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        names |= set(data.get(key, {}).keys())
    return names


violations = []
for ecosystem, extractor in (("pip", pip_names), ("npm", npm_names)):
    allowed = set(config["allowed"].get(ecosystem, []))
    for path in config["manifests"].get(ecosystem, []):
        old = extractor(show(merge_base, path))
        new = extractor(show("HEAD", path))
        added = new - old
        for name in sorted(added - allowed):
            violations.append(f"{path}: added dependency {name!r} not in {ecosystem} allowlist")

if not violations:
    print("verify-dependency-allowlist: ok")
    raise SystemExit(0)

label_env = os.environ.get("PR_LABELS", "")
review_label = "deps-review"
has_review_label = review_label in [l.strip() for l in label_env.split(",")]

if has_review_label:
    print(f"verify-dependency-allowlist: ALLOWED — new deps present but PR carries the '{review_label}' label:")
    for v in violations:
        print(f"  {v}")
    raise SystemExit(0)

print(f"verify-dependency-allowlist: WARN — new dependencies not on the allowlist:", file=sys.stderr)
for v in violations:
    print(f"  {v}", file=sys.stderr)
print(
    f"Add the dependency to devtools/dependency-allowlist.json after review, or add the "
    f"'{review_label}' label.",
    file=sys.stderr,
)
if os.environ.get("DELIVERY_FLOORS_BLOCKING") == "1":
    raise SystemExit(1)
raise SystemExit(0)
PY
