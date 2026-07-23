#!/usr/bin/env bash
# Fixture-PR harness (FR-10.4): stages a synthetic git repo + PR diff so co-touch-style
# verify-*.sh scripts (which always cd to their OWN script location as repo_root, then
# diff against origin/$GITHUB_BASE_REF) can be exercised against controlled scenarios
# instead of only ever being tested by real PRs at real CI time.
#
# Usage: source this file, then:
#   dir="$(fixture_pr_init)"
#   fixture_pr_write "$dir" path/to/file "content"
#   fixture_pr_commit_base "$dir"
#   fixture_pr_branch "$dir"
#   fixture_pr_write "$dir" path/to/changed/file "new content"
#   fixture_pr_commit_pr "$dir" "commit message"
#   fixture_pr_run "$dir" scripts/verify-x.sh   # sets GITHUB_EVENT_NAME/BASE_REF, captures output+exit
#   echo "$FIXTURE_PR_OUTPUT" "$FIXTURE_PR_EXIT"
set -uo pipefail

fixture_pr_init() {
  local dir
  dir="$(mktemp -d "${TMPDIR:-/tmp}/fixture-pr-XXXXXX")"
  git -C "$dir" init -q -b main
  git -C "$dir" config user.email "fixture@example.invalid"
  git -C "$dir" config user.name "Fixture PR"
  echo "$dir"
}

# Write a file (creating parent dirs) inside the fixture repo.
fixture_pr_write() {
  local dir="$1" rel="$2" content="$3"
  mkdir -p "$(dirname "$dir/$rel")"
  printf '%s' "$content" > "$dir/$rel"
}

# Commit whatever is staged as the base state, then fake an `origin/main` ref pointing
# at it — the scripts under test only ever resolve `origin/$GITHUB_BASE_REF` as a git
# ref; no real remote or network fetch is required.
fixture_pr_commit_base() {
  local dir="$1"
  git -C "$dir" add -A
  git -C "$dir" commit -q -m "base"
  git -C "$dir" update-ref refs/remotes/origin/main refs/heads/main
}

fixture_pr_branch() {
  local dir="$1" name="${2:-pr-branch}"
  git -C "$dir" checkout -q -b "$name"
}

fixture_pr_commit_pr() {
  local dir="$1" message="${2:-pr change}"
  git -C "$dir" add -A
  git -C "$dir" commit -q -m "$message"
}

# Copy a script (and its relative path) from the real repo into the fixture, so that
# when it computes repo_root from BASH_SOURCE[0], it resolves to the fixture directory
# rather than the real checkout.
fixture_pr_install_script() {
  local dir="$1" real_repo_root="$2" rel="$3"
  mkdir -p "$(dirname "$dir/$rel")"
  cp "$real_repo_root/$rel" "$dir/$rel"
  chmod +x "$dir/$rel"
}

# Run a script inside the fixture repo as a pull_request CI job would, capturing
# combined stdout+stderr into FIXTURE_PR_OUTPUT and the exit code into FIXTURE_PR_EXIT.
fixture_pr_run() {
  local dir="$1" rel="$2" base_ref="${3:-main}"
  FIXTURE_PR_OUTPUT="$(cd "$dir" && GITHUB_EVENT_NAME=pull_request GITHUB_BASE_REF="$base_ref" \
    PR_LABELS="${FIXTURE_PR_LABELS:-}" bash "$rel" 2>&1)"
  FIXTURE_PR_EXIT=$?
}

fixture_pr_cleanup() {
  local dir="$1"
  [[ -n "$dir" && -d "$dir" ]] && rm -rf "$dir"
}
