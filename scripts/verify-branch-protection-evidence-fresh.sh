#!/usr/bin/env bash
# Fail if branch protection evidence is missing, unverified, or stale.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

evidence_path="${1:-docs/operations/branch-protection-evidence.json}"
max_age_days="${MAX_AGE_DAYS:-30}"

test -f "$evidence_path" || {
  echo "verify-branch-protection-evidence-fresh: missing $evidence_path" >&2
  exit 1
}

EVIDENCE_PATH="$evidence_path" MAX_AGE_DAYS="$max_age_days" python3 <<'PY'
import json
import sys
from datetime import datetime, timezone, timedelta

import os

path = os.environ["EVIDENCE_PATH"]
max_age_days = int(os.environ["MAX_AGE_DAYS"])

try:
    data = json.load(open(path, "r", encoding="utf-8"))
except Exception as e:
    print(f"verify-branch-protection-evidence-fresh: failed to parse {path}: {e}", file=sys.stderr)
    raise SystemExit(1)

if data.get("verified") is not True:
    print("verify-branch-protection-evidence-fresh: evidence is not verified (verified != true)", file=sys.stderr)
    raise SystemExit(1)

ts = data.get("last_verified_utc")
if not isinstance(ts, str) or not ts.endswith("Z"):
    print("verify-branch-protection-evidence-fresh: last_verified_utc must be an RFC3339 UTC timestamp ending in 'Z'", file=sys.stderr)
    raise SystemExit(1)

try:
    verified_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
except Exception as e:
    print(f"verify-branch-protection-evidence-fresh: invalid last_verified_utc: {e}", file=sys.stderr)
    raise SystemExit(1)

now = datetime.now(timezone.utc)
age = now - verified_at
if age < timedelta(0):
    print("verify-branch-protection-evidence-fresh: last_verified_utc is in the future", file=sys.stderr)
    raise SystemExit(1)

max_age = timedelta(days=max_age_days)
if age > max_age:
    print(
        f"verify-branch-protection-evidence-fresh: evidence is stale (age={age.days}d > {max_age_days}d). "
        "Run the scheduled branch protection audit or dispatch it manually.",
        file=sys.stderr,
    )
    raise SystemExit(1)

print("verify-branch-protection-evidence-fresh: ok")
PY

