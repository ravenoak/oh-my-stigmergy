# Dependabot consolidated action bumps (supersedes #50, #51, #53, #54)

- **Reason:** Updates GitHub Actions workflow implementation details — bumps
  `actions/checkout` 6.0.2→7.0.0, `actions/cache` 5.0.5→6.0.0, `astral-sh/setup-uv` 8.1.0→8.2.0,
  and `gitleaks/gitleaks-action` (SHA). All remain 40-char SHA-pinned. No Allium behaviour in
  `spec/` changed. (better-sqlite3 12.11.1 is also in this PR but `packages/` is not a watched
  prefix.)
- **Follow-up:** none.
