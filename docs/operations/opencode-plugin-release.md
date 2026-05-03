# @oh-my-stigmergy/opencode-plugin — release runbook

Maintainer steps to publish to **npm** as public packages (FR-5.1 / [ADR-0012](../adr/0012-opencode-plugin-architecture.md)). Merge gates (`allium-specs`) still **do not** call `npm publish`; publishing is a **separate** workflow or local maintainer action.

## Trusted publishing (recommended — GitHub Actions OIDC)

Use **[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)** so CI publishes **without** a long-lived **`NPM_TOKEN`** secret: OpenID Connect (OIDC) supplies short-lived credentials. Requirements:

- **npm CLI ≥ 11.5.1** and **Node ≥ 22.14** ([npm docs](https://docs.npmjs.com/trusted-publishers/)) — the workflow upgrades npm and uses Node **24**.
- **GitHub-hosted runners** only (self-hosted not supported for OIDC publish today).
- **`package.json` `repository.url`** must match this repo — each publishable package sets **`repository.directory`** for the monorepo layout (`packages/sbp-server`, `packages/opencode-plugin`).

**One-time npmjs.com setup (per package):** On each package → **Settings** → **Trusted publishing** → **GitHub Actions**. Configure **exactly**:

| Field | Value |
|-------|--------|
| Organization / owner | `ravenoak` |
| Repository | `oh-my-stigmergy` |
| Workflow filename | `npm-publish.yml` (must match [`.github/workflows/npm-publish.yml`](../../.github/workflows/npm-publish.yml)) |
| Environment | *(optional)* If you add a GitHub **environment** (e.g. `npm`) on the workflow job, enter the same name here |

After saving, run **[Actions](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/npm-publish.yml) → npm publish → Run workflow** on **`main`**. Use checkboxes to publish **only** the server, **only** the plugin, or both (default). **Order:** the workflow always runs the **sbp-server** job first; **opencode-plugin** runs after and needs **`@oh-my-stigmergy/sbp-server@<pinned>`** already on the registry unless you are publishing plugin-only after a prior server release.

**Provenance:** For **public** packages from a **public** repo, npm attaches **provenance** attestations automatically when publishing via trusted publishing ([docs](https://docs.npmjs.com/trusted-publishers/#automatic-provenance-generation)).

**Hardening (optional):** After OIDC works, npm → package **Settings** → **Publishing access** → restrict token-based publishing per [npm guidance](https://docs.npmjs.com/trusted-publishers/#recommended-restrict-token-access-when-using-trusted-publishers).

## NPM token publish (fallback — local or automation token)

- Put **`NPM_TOKEN`** in a **local** `.env` at the repo root (copy from [`.env.example`](../../.env.example)); **never commit `.env`** — it is gitignored.
- npm expects **`//registry.npmjs.org/:_authToken=…`** for non-interactive publish. Helper scripts create a **temporary** npm userconfig so your global `~/.npmrc` is not overwritten:
  - [`scripts/publish-sbp-server-npm.sh`](../../scripts/publish-sbp-server-npm.sh)
  - [`scripts/publish-opencode-plugin-npm.sh`](../../scripts/publish-opencode-plugin-npm.sh)
- **`source .env`** (or `set -a && source .env && set +a`) before running those scripts so **`NPM_TOKEN`** is in the environment.
- **`EOTP` / “requires a one-time password”:** Use **`./scripts/publish-sbp-server-npm.sh --otp=123456`** or an npm **granular automation** token per [npm token docs](https://docs.npmjs.com/about-access-tokens).

**`npm error 404` / `Scope not found` on first publish:** The scope **`@oh-my-stigmergy`** must exist as an [npm organization](https://docs.npmjs.com/creating-an-organization) (or your user must be granted **publish** on that scope). Create the org at [npmjs.com](https://www.npmjs.com/signup), invite owners, then retry **`bash scripts/publish-sbp-server-npm.sh`**. CI on PRs that pin the plugin to the registry will stay red until **`@oh-my-stigmergy/sbp-server`** exists on npm.

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
