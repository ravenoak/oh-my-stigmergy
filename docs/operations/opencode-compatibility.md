# OpenCode plugin compatibility

This document is the **operator-facing compatibility matrix** for [`@oh-my-stigmergy/opencode-plugin`](../../packages/opencode-plugin). It must stay in sync with [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json); CI checks that the **pinned** `@opencode-ai/plugin` version appears here.

## Pinned OpenCode plugin API

| Package | Pinned version | Role |
|---------|----------------|------|
| `@opencode-ai/plugin` | `1.14.29` | OpenCode host loads this package; we implement the plugin contract against it. |

**Upgrade policy:** bump the dependency in `package.json` and this table in the **same** change set; run `cd packages/opencode-plugin && npm ci && npm test`; read [OpenCode plugins](https://opencode.ai/docs/plugins/) for host changes.

## First-party packages

| Package | Source | Notes |
|---------|--------|-------|
| `@oh-my-stigmergy/opencode-plugin` | This monorepo `packages/opencode-plugin` | `private: false`; see [opencode-plugin-release.md](opencode-plugin-release.md). |
| `@oh-my-stigmergy/sbp-server` | This monorepo `packages/sbp-server` | Spawned or attached when **`SBP_URL`** is unset ([ADR-0014](../adr/0014-sbp-project-supervision.md)). |

## Event surface (implemented)

| Event | Behaviour |
|-------|-----------|
| `session.idle` | Publishes a low-intensity pheromone to SBP (fail-soft if SBP down). |
| `file.edited` | Publishes a pheromone with `path` when present. |

New event types require a host that emits them; track API changes in OpenCode release notes.

## Known limitations

- **Multi-session / named sub-agent roster** is **not** implemented in-tree: depends on OpenCode **multi-session** contracts; see [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md) and [BACKLOG.md](../BACKLOG.md) (deferred-upstream).
- **Model enforcement** is not done by this repo: only **policy strings** and tool hints; the host applies the active model.
- **Stigmergic** coordination state is in **SBP + audit logs**, not a single model’s context ([ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md)).

## Charter

- [ADR-0012](../adr/0012-opencode-plugin-architecture.md) — bridge architecture.
- [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md) — orchestration charter and OMO positioning.
- [ADR-0014](../adr/0014-sbp-project-supervision.md) — project-local SBP supervision (`SBP_URL` unset vs explicit attach).
