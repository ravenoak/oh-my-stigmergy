# OpenCode model routing playbook

Operator guide for **stance → OpenCode model id** routing and **bounded actionable queues** using `@oh-my-stigmergy/opencode-plugin` ([ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md)). This is **declarative policy** in your repo—OpenCode still resolves providers and credentials.

## Prerequisites

1. Complete [opencode-stigmergy-golden-path.md](opencode-stigmergy-golden-path.md) (SBP running, plugin wired).
2. Read [migration-from-oh-my-openagent.md](migration-from-oh-my-openagent.md) if you are replacing OMO-shaped workflows.
3. Keep [agent-session-budgets.md](agent-session-budgets.md) in scope for human/agent token discipline (NFR-C1)—the plugin does not enforce provider token budgets.

## 1. Orchestration policy file

Create a JSON file validated by [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json) (copy fields from built-in examples in [`packages/opencode-plugin/src/orchestration.mjs`](../../packages/opencode-plugin/src/orchestration.mjs) and replace model strings with **your** OpenCode provider ids).

| Field | Use |
|-------|-----|
| `defaultModel` | Required. Fallback model id. |
| `stanceModels` | Map `stanceTarget` → model id (from SBP pheromones / your naming). |
| `localPreferredStances` | Hints for operators: stances where you should prefer a **local** or fast model in OpenCode settings; `stigmergy_resolve_model` returns `local_preferred:true` for these. |
| `defaultOlfactoryThreshold` | When the `stigmergy_actionable` tool **omits** `olfactory_threshold`, use this minimum computed intensity (0–1). |
| `defaultActionableLimit` | When the tool **omits** `limit`, return at most this many pheromone rows (1–100). |
| `maxActionable` | Hard cap on returned rows (1–100); must be ≥ `defaultActionableLimit`. Bounds fan-out at the **plugin** layer. |

Set the environment variable:

```bash
export STIGMERGY_ORCHESTRATION_CONFIG=/absolute/or/relative/path/to/orchestration.json
```

## 2. Local vs hosted models

- **Routing** is by **string id** only; the plugin does not start Ollama or cloud APIs.
- Configure **local** and **cloud** providers in **OpenCode** (per upstream docs). Map stances to the ids those providers expose.
- Use `localPreferredStances` to align **policy** with your intent to use local models for certain stances; verify with the `stigmergy_resolve_model` tool output.

## 3. Tool usage

- **`stigmergy_resolve_model`** — pass `stance_target`; read `model:…` and `local_preferred:…` before starting a sub-task.
- **`stigmergy_actionable`** — you may call it with **no arguments** to apply `defaultOlfactoryThreshold`, `defaultActionableLimit`, and `maxActionable` from the policy file.

## 4. Verification

- Run `cd packages/opencode-plugin && npm test` after changing policy layout (CI runs this in `allium-specs`).
- Compatibility and pinned plugin API: [opencode-compatibility.md](../operations/opencode-compatibility.md).
- Publishing the package to npm: [opencode-plugin-release.md](../operations/opencode-plugin-release.md).
