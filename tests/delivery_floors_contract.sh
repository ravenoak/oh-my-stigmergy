#!/usr/bin/env bash
# FR-10.4: fixture-PR harness driving the delivery-floor checks through synthetic scenarios
# (none of these paths are exercised by a real PR against THIS repo in normal operation, since
# devtools/frozen-test-manifest.json ships with no frozen paths yet).
set -uo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/fixture_pr.sh
source "$repo_root/tests/lib/fixture_pr.sh"

fail=0
assert_exit() {
  local desc="$1" want="$2" got="$3"
  if [[ "$got" != "$want" ]]; then
    echo "FAIL: $desc (expected exit $want, got $got)" >&2
    echo "--- output ---" >&2
    echo "$FIXTURE_PR_OUTPUT" >&2
    fail=1
  else
    echo "ok: $desc"
  fi
}

assert_output_contains() {
  local desc="$1" needle="$2"
  if [[ "$FIXTURE_PR_OUTPUT" != *"$needle"* ]]; then
    echo "FAIL: $desc (output missing: $needle)" >&2
    echo "--- output ---" >&2
    echo "$FIXTURE_PR_OUTPUT" >&2
    fail=1
  else
    echo "ok: $desc"
  fi
}

# --- Harness self-check: replicate verify-governance-doc-cotouch.sh's real behavior ---

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" docs/requirements/FR.md "base FR"
fixture_pr_write "$dir" docs/traceability/RTM.md "base RTM"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-governance-doc-cotouch.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" docs/requirements/FR.md "changed FR, no RTM touch"
fixture_pr_commit_pr "$dir" "FR only"
fixture_pr_run "$dir" scripts/verify-governance-doc-cotouch.sh
assert_exit "harness self-check: cotouch fails when FR changes without RTM" 1 "$FIXTURE_PR_EXIT"
fixture_pr_cleanup "$dir"

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" docs/requirements/FR.md "base FR"
fixture_pr_write "$dir" docs/traceability/RTM.md "base RTM"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-governance-doc-cotouch.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" docs/requirements/FR.md "changed FR"
fixture_pr_write "$dir" docs/traceability/RTM.md "changed RTM too"
fixture_pr_commit_pr "$dir" "FR and RTM"
fixture_pr_run "$dir" scripts/verify-governance-doc-cotouch.sh
assert_exit "harness self-check: cotouch passes when both change" 0 "$FIXTURE_PR_EXIT"
fixture_pr_cleanup "$dir"

# --- verify-frozen-test-manifest.sh ---

dir="$(fixture_pr_init)"
frozen_content="frozen test body"
frozen_hash="$(printf '%s' "$frozen_content" | shasum -a 256 | cut -d' ' -f1)"
fixture_pr_write "$dir" devtools/frozen-test-manifest.json \
  "{\"amendmentLabel\":\"test-amendment\",\"frozenPaths\":{\"tests/fixtures/frozen.txt\":\"${frozen_hash}\"}}"
fixture_pr_write "$dir" tests/fixtures/frozen.txt "$frozen_content"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-frozen-test-manifest.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" tests/fixtures/frozen.txt "mutated without permission"
fixture_pr_commit_pr "$dir" "sneaky frozen-file edit"
FIXTURE_PR_LABELS="" fixture_pr_run "$dir" scripts/verify-frozen-test-manifest.sh
assert_exit "frozen-test-manifest: report-only, exits 0 even on violation" 0 "$FIXTURE_PR_EXIT"
assert_output_contains "frozen-test-manifest: warns on unlabeled frozen-path change" "WARN"
DELIVERY_FLOORS_BLOCKING=1 FIXTURE_PR_LABELS="" fixture_pr_run "$dir" scripts/verify-frozen-test-manifest.sh
assert_exit "frozen-test-manifest: blocking mode fails on unlabeled violation" 1 "$FIXTURE_PR_EXIT"
DELIVERY_FLOORS_BLOCKING=1 FIXTURE_PR_LABELS="test-amendment" fixture_pr_run "$dir" scripts/verify-frozen-test-manifest.sh
assert_exit "frozen-test-manifest: amendment label escapes blocking mode" 0 "$FIXTURE_PR_EXIT"
assert_output_contains "frozen-test-manifest: escape hatch is recorded in output" "ALLOWED"
fixture_pr_cleanup "$dir"

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" devtools/frozen-test-manifest.json \
  "{\"amendmentLabel\":\"test-amendment\",\"frozenPaths\":{\"tests/fixtures/frozen.txt\":\"${frozen_hash}\"}}"
fixture_pr_write "$dir" tests/fixtures/frozen.txt "$frozen_content"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-frozen-test-manifest.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" README.md "unrelated change"
fixture_pr_commit_pr "$dir" "unrelated"
fixture_pr_run "$dir" scripts/verify-frozen-test-manifest.sh
assert_exit "frozen-test-manifest: no violation when frozen path untouched" 0 "$FIXTURE_PR_EXIT"
assert_output_contains "frozen-test-manifest: clean-pass output" "ok"
fixture_pr_cleanup "$dir"

# --- verify-lockfile-freeze.sh ---

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" devtools/lockfile-freeze.json \
  '{"reviewLabel":"deps-review","pairs":[{"lockfile":"uv.lock","manifest":"pyproject.toml"}]}'
fixture_pr_write "$dir" uv.lock "lock v1"
fixture_pr_write "$dir" pyproject.toml "manifest v1"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-lockfile-freeze.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" uv.lock "lock v2, drifted"
fixture_pr_commit_pr "$dir" "lockfile drift only"
FIXTURE_PR_LABELS="" fixture_pr_run "$dir" scripts/verify-lockfile-freeze.sh
assert_exit "lockfile-freeze: report-only on drift without label" 0 "$FIXTURE_PR_EXIT"
assert_output_contains "lockfile-freeze: warns on unreviewed drift" "WARN"
FIXTURE_PR_LABELS="deps-review" fixture_pr_run "$dir" scripts/verify-lockfile-freeze.sh
assert_output_contains "lockfile-freeze: deps-review label allows drift" "ALLOWED"
fixture_pr_cleanup "$dir"

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" devtools/lockfile-freeze.json \
  '{"reviewLabel":"deps-review","pairs":[{"lockfile":"uv.lock","manifest":"pyproject.toml"}]}'
fixture_pr_write "$dir" uv.lock "lock v1"
fixture_pr_write "$dir" pyproject.toml "manifest v1"
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-lockfile-freeze.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" uv.lock "lock v2"
fixture_pr_write "$dir" pyproject.toml "manifest v2, matches the bump"
fixture_pr_commit_pr "$dir" "reviewed dependency bump"
fixture_pr_run "$dir" scripts/verify-lockfile-freeze.sh
assert_exit "lockfile-freeze: no violation when manifest changes alongside lockfile" 0 "$FIXTURE_PR_EXIT"
fixture_pr_cleanup "$dir"

# --- verify-dependency-allowlist.sh ---

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" devtools/dependency-allowlist.json \
  '{"manifests":{"npm":["package.json"],"pip":[]},"allowed":{"npm":["left-pad"],"pip":[]}}'
fixture_pr_write "$dir" package.json '{"dependencies":{"left-pad":"^1.0.0"}}'
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-dependency-allowlist.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" package.json '{"dependencies":{"left-pad":"^1.0.0","suspicious-new-dep":"^1.0.0"}}'
fixture_pr_commit_pr "$dir" "add an unreviewed dependency"
FIXTURE_PR_LABELS="" fixture_pr_run "$dir" scripts/verify-dependency-allowlist.sh
assert_exit "dependency-allowlist: report-only on unlisted new dep" 0 "$FIXTURE_PR_EXIT"
assert_output_contains "dependency-allowlist: warns on unlisted dependency" "suspicious-new-dep"
DELIVERY_FLOORS_BLOCKING=1 FIXTURE_PR_LABELS="" fixture_pr_run "$dir" scripts/verify-dependency-allowlist.sh
assert_exit "dependency-allowlist: blocking mode fails on unlisted dep" 1 "$FIXTURE_PR_EXIT"
DELIVERY_FLOORS_BLOCKING=1 FIXTURE_PR_LABELS="deps-review" fixture_pr_run "$dir" scripts/verify-dependency-allowlist.sh
assert_exit "dependency-allowlist: deps-review label escapes blocking mode" 0 "$FIXTURE_PR_EXIT"
fixture_pr_cleanup "$dir"

dir="$(fixture_pr_init)"
fixture_pr_write "$dir" devtools/dependency-allowlist.json \
  '{"manifests":{"npm":["package.json"],"pip":[]},"allowed":{"npm":["left-pad"],"pip":[]}}'
fixture_pr_write "$dir" package.json '{"dependencies":{"left-pad":"^1.0.0"}}'
fixture_pr_commit_base "$dir"
fixture_pr_install_script "$dir" "$repo_root" scripts/verify-dependency-allowlist.sh
fixture_pr_branch "$dir"
fixture_pr_write "$dir" package.json '{"dependencies":{"left-pad":"^1.1.0"}}'
fixture_pr_commit_pr "$dir" "bump an already-allowed dependency"
fixture_pr_run "$dir" scripts/verify-dependency-allowlist.sh
assert_exit "dependency-allowlist: no violation on version bump of an allowed dep" 0 "$FIXTURE_PR_EXIT"
fixture_pr_cleanup "$dir"

if [[ "$fail" -ne 0 ]]; then
  echo "delivery_floors_contract: FAILED" >&2
  exit 1
fi
echo "delivery_floors_contract: ok"
