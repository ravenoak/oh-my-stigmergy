#!/usr/bin/env bash
# FR-10.x: delivery floors ops doc exists with required sections and is linked from docs/README.md.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

doc="docs/operations/delivery-floors.md"
test -f "$doc" || {
  echo "verify-delivery-floors-doc: missing $doc" >&2
  exit 1
}

for heading in \
  "Status: report-only" \
  "Floor 1 — frozen test manifest (FR-10.1)" \
  "Floor 2 — lockfile freeze (FR-10.2)" \
  "Floor 3 — dependency allowlist (FR-10.3)" \
  "Fixture-PR test harness (FR-10.4)" \
  "Merge queue"; do
  grep -qF "## ${heading}" "$doc" || {
    echo "verify-delivery-floors-doc: must contain heading ## ${heading}" >&2
    exit 1
  }
done

grep -qF "DELIVERY_FLOORS_BLOCKING" "$doc" || {
  echo "verify-delivery-floors-doc: must document DELIVERY_FLOORS_BLOCKING promotion path" >&2
  exit 1
}

grep -qF "delivery-floors.md" docs/README.md || {
  echo "verify-delivery-floors-doc: docs/README.md must link delivery-floors.md" >&2
  exit 1
}

echo "verify-delivery-floors-doc: ok"
