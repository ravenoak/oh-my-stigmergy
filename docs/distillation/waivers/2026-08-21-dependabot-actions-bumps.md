# Dependabot consolidated action bumps (supersedes #57, #60, #62, #63, #64)

- **Reason:** Updates GitHub Actions workflow implementation details — bumps
  `actions/setup-python` 6.2.0→6.3.0, `astral-sh/setup-uv` 8.2.0→8.3.2, `actions/cache`
  6.0.0→6.1.0, `gitleaks/gitleaks-action` (SHA, stays on the `v2` branch), and
  `actions/setup-node` 6.4.0→7.0.0 (also corrects a stale `# v6` pin comment left over from an
  earlier bump — the pin itself was already on v6.4.0). All remain 40-char SHA-pinned. No Allium
  behaviour in `spec/` changed. Versions match exactly what each superseded Dependabot PR
  proposed; none of the five could merge as-is because Dependabot cannot add a required waiver
  file under this directory (see #56 for the same precedent).
- **Follow-up:** `actions/setup-node` v7.0.0 is used only in `.github/workflows/npm-publish.yml`,
  which is `workflow_dispatch`-only, so CI does not exercise it — verify at the next npm publish
  run. `gitleaks/gitleaks-action` v3.0.0 exists upstream but this repo pins the `v2` branch;
  evaluate the major separately.
