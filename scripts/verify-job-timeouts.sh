#!/usr/bin/env bash
# NFR-P2: allium-specs jobs declare job-level timeout-minutes matching devtools/ci-job-timeouts.json.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

pin="devtools/ci-job-timeouts.json"
test -f "$pin" || {
  echo "verify-job-timeouts: missing $pin" >&2
  exit 1
}

python3 <<'PY'
import json
import pathlib
import re

root = pathlib.Path(".").resolve()
data = json.loads((root / "devtools" / "ci-job-timeouts.json").read_text(encoding="utf-8"))
wf = root / data["workflow"]
if not wf.is_file():
    raise SystemExit(f"verify-job-timeouts: workflow missing: {wf}")
text = wf.read_text(encoding="utf-8")
lines = text.splitlines()


def job_block(lines: list[str], job: str) -> str:
    start_re = re.compile(rf"^  {re.escape(job)}:\s*$")
    start = None
    for i, line in enumerate(lines):
        if start_re.match(line):
            start = i + 1
            break
    if start is None:
        raise SystemExit(f"verify-job-timeouts: job {job!r} not found in {wf}")
    body_lines: list[str] = []
    for j in range(start, len(lines)):
        line = lines[j]
        if re.match(r"^  [a-z0-9-]+:\s*$", line):
            break
        body_lines.append(line)
    return "\n".join(body_lines)


# Job-level keys use exactly 4 spaces in allium-specs.yml.
timeout_re = re.compile(r"^    timeout-minutes:\s*(\d+)\s*$", re.MULTILINE)

for job, want in data["jobs"].items():
    block = job_block(lines, job)
    m = timeout_re.search(block)
    if not m:
        raise SystemExit(
            f"verify-job-timeouts: job {job!r} missing job-level "
            f"'    timeout-minutes: N' in {wf} (step-level timeouts do not count)"
        )
    got = int(m.group(1))
    if got != want:
        raise SystemExit(
            f"verify-job-timeouts: job {job!r} has timeout-minutes={got}, "
            f"expected {want} per devtools/ci-job-timeouts.json"
        )

print("verify-job-timeouts: ok")
PY
