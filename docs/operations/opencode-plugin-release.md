# @oh-my-stigmergy/opencode-plugin — release runbook

Maintainer steps to publish the OpenCode plugin to **npm** as a public package (FR-5.1 / [ADR-0012](../adr/0012-opencode-plugin-architecture.md)). CI proves `npm pack` and tests; it does **not** publish (no `NPM_TOKEN` in this repository’s required path).

**Scoped sibling:** the plugin depends on **`@oh-my-stigmergy/sbp-server`**. In the monorepo, **`package.json`** commonly lists **`"file:../sbp-server"`** ([ADR-0014](../adr/0014-sbp-project-supervision.md)). **`npm publish`** for external consumers requires a **registry** dependency—follow **[Scoped packages on npm](#scoped-packages-on-npm-sbp-server--plugin)** below before publishing.

## Preconditions

- `cd packages/opencode-plugin && npm ci && npm test` is green.
- `bash scripts/verify-opencode-plugin-contract.sh` from the repo root passes (manifest, `private: false`, `npm pack`).

## Scoped packages on npm (SBP server + plugin)

**Order is fixed:** publish **`@oh-my-stigmergy/sbp-server` first**, then the plugin, so the plugin can depend on a **resolved semver** on the public registry.

1. **SBP server** — from [`packages/sbp-server`](../../packages/sbp-server): `npm ci && npm test`, bump `version` in `package.json` if needed, `npm publish --access public` (scope `@oh-my-stigmergy` must exist for your npm org).
2. **Plugin manifest** — in [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json), set **`"@oh-my-stigmergy/sbp-server"`** to the **exact** published version (e.g. `"0.1.0"`)—**not** `file:../sbp-server`.
3. **Lockfile** — `cd packages/opencode-plugin && npm install` to regenerate `package-lock.json` against the registry.
4. **Pre-publish gate** — from repo root: `bash scripts/verify-opencode-plugin-publishable.sh` (fails on **`file:`** / **`link:`** / **`workspace:`** dependencies).
5. **Plugin publish** — follow [Version bump](#version-bump), [Smoke](#smoke), and [Publish](#publish) below.

Rollback: ship a **patch** on whichever package broke compatibility; keep server and plugin version bumps in **related** change sets when you change the dependency edge.

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
