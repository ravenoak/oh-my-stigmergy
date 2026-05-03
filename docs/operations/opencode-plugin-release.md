# @oh-my-stigmergy/opencode-plugin — release runbook

Maintainer steps to publish the OpenCode plugin to **npm** as a public package (FR-5.1 / [ADR-0012](../adr/0012-opencode-plugin-architecture.md)). CI proves `npm pack` and tests; it does **not** publish (no GitHub Actions secret required for merge gates).

## NPM authentication (maintainers only)

- Put **`NPM_TOKEN`** in a **local** `.env` at the repo root (copy from [`.env.example`](../../.env.example)); **never commit `.env`** — it is gitignored.
- npm expects **`//registry.npmjs.org/:_authToken=…`** for non-interactive publish. Helper scripts create a **temporary** npm userconfig so your global `~/.npmrc` is not overwritten:
  - [`scripts/publish-sbp-server-npm.sh`](../../scripts/publish-sbp-server-npm.sh)
  - [`scripts/publish-opencode-plugin-npm.sh`](../../scripts/publish-opencode-plugin-npm.sh)
- **`source .env`** (or `set -a && source .env && set +a`) before running those scripts so **`NPM_TOKEN`** is in the environment.
- **`EOTP` / “requires a one-time password”:** npm accounts with **2FA** may require **`npm publish … --otp=<code>`**. Append via script passthrough: `./scripts/publish-sbp-server-npm.sh -- --otp=123456`. Alternatively create an npm **granular access token** with **Automation** (publish without OTP on compatible accounts) per [npm token docs](https://docs.npmjs.com/about-access-tokens).

**Scoped sibling:** the plugin depends on **`@oh-my-stigmergy/sbp-server`** at a **registry** semver on `main` ([ADR-0014](../adr/0014-sbp-project-supervision.md)). **`npm publish`** for consumers requires that **`@oh-my-stigmergy/sbp-server@<version>` exists on npm before** the plugin lockfile can resolve in CI—follow **[Scoped packages on npm](#scoped-packages-on-npm-sbp-server--plugin)** below.

## Preconditions

- `cd packages/opencode-plugin && npm ci && npm test` is green.
- `bash scripts/verify-opencode-plugin-contract.sh` from the repo root passes (manifest, `private: false`, `npm pack`).

## Scoped packages on npm (SBP server + plugin)

**Order is fixed:** publish **`@oh-my-stigmergy/sbp-server` first**, then the plugin, so the plugin can depend on a **resolved semver** on the public registry.

1. **SBP server** — from [`packages/sbp-server`](../../packages/sbp-server): prefer **`bash scripts/publish-sbp-server-npm.sh`** from the repo root (runs tests then `npm publish --access public`), or manually `npm ci && npm test` then `npm publish --access public`. Bump `version` in `package.json` if **`npm view @oh-my-stigmergy/sbp-server versions`** shows a conflict.
2. **Plugin manifest** — on `main`, [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json) lists **`"@oh-my-stigmergy/sbp-server"`** at the **exact** published version (e.g. `"0.1.0"`).
3. **Lockfile** — `cd packages/opencode-plugin && npm install` to regenerate `package-lock.json` against the registry after the server tarball exists on npm.
4. **Pre-publish gate** — **`allium-specs` governance** runs `bash scripts/verify-opencode-plugin-publishable.sh` on every PR (fails on **`file:`** / **`link:`** / **`workspace:`** in the plugin manifest).
5. **Plugin publish** — **`bash scripts/publish-opencode-plugin-npm.sh`** from repo root, or follow [Version bump](#version-bump), [Smoke](#smoke), and [Publish](#publish) below.

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
