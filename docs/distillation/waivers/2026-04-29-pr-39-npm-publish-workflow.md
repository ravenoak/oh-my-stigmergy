# PR 39 — npm-publish: install sbp-server before plugin tests

- **Reason:** This PR updates the **npm publish** GitHub Actions workflow so `packages/opencode-plugin` tests that import the monorepo SBP server have `packages/sbp-server` dependencies (e.g. `better-sqlite3`) installed. No Allium behaviour in `spec/` changed.
- **Follow-up:** none.
