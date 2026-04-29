# @oh-my-stigmergy/opencode-plugin — release runbook

Maintainer steps to publish the OpenCode plugin to **npm** as a public package (FR-5.1 / [ADR-0012](../adr/0012-opencode-plugin-architecture.md)). CI proves `npm pack` and tests; it does **not** publish (no `NPM_TOKEN` in this repository’s required path).

## Preconditions

- `cd packages/opencode-plugin && npm ci && npm test` is green.
- `bash scripts/verify-opencode-plugin-contract.sh` from the repo root passes (manifest, `private: false`, `npm pack`).

## Version bump

1. Edit [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json) `version` (semver).
2. If you change `@opencode-ai/plugin`, also update [opencode-compatibility.md](opencode-compatibility.md) in the same change set.
3. Regenerate lockfile if dependencies changed: `cd packages/opencode-plugin && npm install`.

## Smoke

```bash
cd packages/opencode-plugin
npm pack --dry-run
npm pack
tar tzf oh-my-stigmergy-opencode-plugin-*.tgz | head
rm oh-my-stigmergy-opencode-plugin-*.tgz
```

## Publish

From `packages/opencode-plugin` with npm logged into an account that owns `@oh-my-stigmergy`:

```bash
npm publish --access public
```

Scoped packages require `--access public` on first publish.

## Tagging (recommended)

After publish, tag the monorepo for traceability (example for `0.2.0`):

```bash
git tag opencode-plugin-v0.2.0
git push origin opencode-plugin-v0.2.0
```

Use any consistent naming your maintainers prefer; document it here when it changes.

## Rollback

npm **unpublish** has registry policies and time limits; prefer shipping a **patch** version that restores compatibility rather than removing tarballs.
