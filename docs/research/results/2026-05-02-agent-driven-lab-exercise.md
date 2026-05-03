# Agent-driven lab exercise — extended evaluation battery

**Date:** 2026-05-02
**Protocol:** [opencode-effectiveness-study-protocol.md](../opencode-effectiveness-study-protocol.md) **version 1.1.0**
**Driver:** Cursor agent (non-human), acting as apparatus exerciser. **Not** a registered study run.
**Claims boundary:** [ADR-0015](../../adr/0015-empirical-evaluation-study-claims.md) — **do not** promote any M1/M2 observation here to a population-level effectiveness claim. [FEASIBILITY_PILOT_STATUS](../FEASIBILITY_PILOT_STATUS.md) remains `NotStarted`.

## Scope

Extended battery on top of the canonical A / B1 / B2 protocol on real OSS code at pinned SHAs, plus plugin functional probes and an exploratory 2-policy B2 orchestration seed sweep. The extensions are:

- **Layer 0** — static preflight (no LLM).
- **Layer 1** — offline orchestration-policy probes (no LLM).
- **Layer 2** — local runtime probes against SBP + graph CLIs (no LLM).
- **Layer 3** — end-to-end `opencode run` sessions on each task × condition (LLM via OpenCode hosted free tier).
- **Layer 4** — deterministic summarization and this writeup.

## Apparatus and deviations

| Field | Value |
|-------|-------|
| Host | `opencode` CLI `1.14.31` on macOS (darwin 25.3.0) |
| Driver | Cursor agent, non-interactive `opencode run --format json --dangerously-skip-permissions --print-logs --log-level INFO` |
| Provider | **OpenCode hosted free tier** (e.g. `opencode/minimax-m2.5-free`) |
| Model (all conditions) | `opencode/minimax-m2.5-free` as top-level `-m` |
| Auth on disk | `~/.local/share/opencode/auth.json` contains an OpenRouter key that upstream reports `401 User not found` (dead key) |
| Plugin under test | [`packages/opencode-plugin`](../../../packages/opencode-plugin) (this repo, HEAD of `feature/opencode-eval-battery-run`) |
| SBP under test | [`packages/sbp-server`](../../../packages/sbp-server) (same) |
| Summarizer | [`devtools/evaluation/summarize-audit.mjs`](../../../devtools/evaluation/summarize-audit.mjs) (deterministic) |

**Pre-registered-vs-actual deviations:**

- The plan dialog selected **OpenRouter** as the provider. The on-disk OpenRouter key returns `401` from `GET https://openrouter.ai/api/v1/key`. Runs proceeded with `opencode/minimax-m2.5-free` (OpenCode hosted free tier) rather than re-blocking the session for credential renewal. All 8 LLM runs used the **same** top-level model so cross-condition model effects are controlled.
- Orchestration policy model ids in `/tmp/oms-eval/policy-{flat,stance}.json` used `opencode/*` ids (not OpenRouter) so the stance-routing probe in Layer 1 stayed consistent with the session-level model.
- Top-level session model does **not** change under B2 policies; `STIGMERGY_ORCHESTRATION_CONFIG` controls plugin-level stance routing only (`stigmergy_resolve_model` / `stigmergy_actionable` defaults). Under the plugin-not-loading finding below, B2 policies had **no observable behavioural effect** during Layer 3.

## Task bank (pinned SHAs)

| Task id | Repo | SHA | Rubric |
|---------|------|-----|--------|
| `ext-001` | `sindresorhus/is-plain-obj` | `97f38e8836f86a642cce98fc6ab3058bc36df181` | `R-ext-easy` (clone → `npm install` → `npm test` exit 0; no source edit) |
| `ext-002` | `chalk/chalk` | `aa06bb5ac3f14df9fda8cfb54274dfc165ddfdef` | `R-ext-med` (pre-edit test 0 → prepend `<!-- study-marker -->` to `readme.md` → post-edit test 0) |

`smoke-oms` is exercised in preflight (plugin `npm test`, 26/26 pass; sbp-server `npm test`, 26/26 pass) and is not counted as a Layer 3 task.

## Layer 0 results (static preflight)

| Check | Result |
|-------|--------|
| `packages/opencode-plugin` `npm test` | 26/26 pass (includes new test for `PluginModule` default export) |
| `packages/sbp-server` `npm test` | 26/26 pass |
| `./scripts/verify-opencode-evaluation-protocol.sh` | `ok` |
| `./scripts/check-allium-specs.sh` | `spec/governance.allium`, `spec/project.allium` — no diagnostics |
| `node devtools/evaluation/summarize-audit.mjs docs/research/fixtures/lab-audit.ndjson` | CSV row `1,2,1` — matches [2026-04-29-lab-pipeline-smoke.md](2026-04-29-lab-pipeline-smoke.md) |

## Layer 1 results (offline orchestration-policy probes)

9/9 assertions passed against [`validateOrchestrationPolicy`](../../../packages/opencode-plugin/src/orchestration.mjs), [`resolveModelForStance`](../../../packages/opencode-plugin/src/orchestration.mjs), [`resolveActionableToolParams`](../../../packages/opencode-plugin/src/orchestration.mjs), and [`filterActionablePheromones`](../../../packages/opencode-plugin/src/orchestration.mjs):

- accept `policy-flat.json` (all stances → `opencode/minimax-m2.5-free`).
- accept `policy-stance.json` (feature_implementation → `opencode/nemotron-3-super-free`; security_auditing → `opencode/hy3-preview-free`; dependency_refactoring / default → `opencode/minimax-m2.5-free`).
- reject `policy-bad-no-default.json` with `orchestration_policy: defaultModel required`.
- reject `policy-bad-limit.json` with `orchestration_policy: defaultActionableLimit must be <= maxActionable`.
- `resolveModelForStance` routes known stances to declared ids, unknown stances to `defaultModel`.
- `resolveActionableToolParams` uses policy defaults when args empty; caps `limit` at `maxActionable=50` when args exceed it.
- `filterActionablePheromones` filters below-threshold rows, filters by `stanceTarget`, sorts by intensity descending.

Raw policies and probe script are not committed (they contain placeholder hosted-tier ids); regeneration steps are in [apparatus and deviations](#apparatus-and-deviations).

## Layer 2 results (local runtime probes)

| Probe | Result |
|-------|--------|
| `PORT=3847 npm start` in `packages/sbp-server` | Listens; `GET /healthz` → `{"ok":true,"store":"memory",...}` |
| `POST /pheromones` with valid UUID + `feature_implementation` stance | `201 ok`; row visible via `GET /pheromones` with computed `intensity` |
| `POST /pheromones/:id/inflate` | `200 ok`; `inflations` counter incremented; `intensity` increased post-inflate |
| `POST /pheromones/:id/claim` (first) | `200 ok` |
| `POST /pheromones/:id/claim` (second) | `409 claimed` (idempotency as designed) |
| `uv run python -m graph.load_node <repo> tests/fixtures/graph-corpus/sample.py#1` | Returns byte-card output |
| `uv run python -m graph.aspect <repo>` | Returns `CALLS …` aspect rows |
| Plugin-supervised SBP (`supervised PORT=0 writes runtime.json sqlite ledger and healthz`) | Validated at **unit-test** level in `packages/opencode-plugin/test/superviseSbp.test.mjs` (passed in Layer 0). Not re-validated end-to-end in Layer 3 because of the Layer 3 finding below. |

## Layer 3 results (end-to-end A/B1/B2 on real code)

### Aggregate table (one row per task × condition)

| Task | Condition | `elapsed_s` (M1) | `opencode exit` | `npm test` exit (M2 basis) | audit lines | SBP log lines | M3 misconfig | `stigmergy_publish` count (M4a) |
|------|-----------|-----------------:|----------------:|---------------------------:|------------:|--------------:|-------------:|-------------------------------:|
| ext-001 | A | 21 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-001 | B1 | 16 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-001 | B2_flat | 14 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-001 | B2_stance | 16 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-002 | A | 68 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-002 | B1 | 28 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-002 | B2_flat | 39 | 0 | 0 | 0 | 0 | 0 | 0 |
| ext-002 | B2_stance | 34 | 0 | 0 | 0 | 0 | 0 | 0 |

Elapsed time is **wall-clock within the opencode session only** (`T1 - T0` from the run driver at `/tmp/oms-eval/run-session.sh`); does not include the post-session independent `npm test` rubric verification.

`npm test` exit is the **independent rubric check** run by the driver after the session exits. For `ext-002` it is the **post-edit** test, satisfying R-ext-med.

### M2 (task success) by rubric

- **ext-001** (R-ext-easy): 4 / 4 conditions pass (`npm install && npm test` exit 0, no source modified).
- **ext-002** (R-ext-med): 4 / 4 conditions pass (`<!-- study-marker -->` inserted as first line of `readme.md`; `git diff --stat` shows `readme.md | 1 +` / `1 file changed, 1 insertion(+)` for all four runs; post-edit `npm test` exit 0).

### M4(b) — duplicate logical pheromone ids

Not applicable: no SBP ledger was created under B1/B2 during Layer 3 (see [primary finding](#primary-finding-h_stack-for-opencode-11431)) — `/tmp/oms-eval/ext-*-pheromones.json` was never written because `.stigmergy/runtime.json` never appeared.

### B2_flat vs B2_stance qualitative contrast

Both B2 policies were **loaded** (plugin bootstrap attempted in all three B* conditions) but had no observable behavioural impact on the session because the plugin itself never attached (below). M1 variation across B1 / B2_flat / B2_stance within the same task (14–16s for ext-001; 28–39s for ext-002) is within-condition noise and **is not a B2 effect**. The exploratory seed sweep returned a **null** result, as predicted by the plugin-not-loaded finding — consistent, not informative about H_orch.

## Primary finding (H_stack for opencode 1.14.31)

Across all six Layer 3 runs with **Condition B1 or B2**, opencode emits:

```
INFO  service=plugin path=@oh-my-stigmergy/opencode-plugin loading plugin
WARN  service=plugin path=@oh-my-stigmergy/opencode-plugin
  message=Plugin @oh-my-stigmergy/opencode-plugin does not expose a server entrypoint
          plugin has no server entrypoint
```

and then proceeds with the session **without** the plugin attached. Observable consequences:

- `STIGMERGY_AUDIT_LOG_FILE` was **never written** (0 lines in all six B1/B2 audit files).
- `SBP_LOG_FILE` was **never written** (no supervised SBP was started).
- No `.stigmergy/runtime.json` was written.
- No `stigmergy_*` tools were available to the session.

**Falsifies an operational precondition for H_stack on this opencode version:** the default stigmergy stack does not deliver any behaviour in opencode 1.14.31 under the documented install path. M1/M2 parity between A and B1/B2 here is therefore **not** evidence that the stack is neutral; it is evidence that the stack was **inactive**.

### Root cause (reverse-engineered from the host binary)

Opencode 1.14.31 resolves each `plugin` entry by name via Bun install (into `~/.cache/opencode/packages/...`), then `import()`s the module namespace and runs:

```js
// simplified from minified host code
function VA_(_) {
  if (typeof _ === "function") return _;
  if (!_ || typeof _ !== "object" || !("server" in _)) return;
  if (typeof _.server !== "function") return;
  return _.server;
}
// report.missing("plugin has no server entrypoint") fires when the
// per-plugin resolver (gj) returns falsy for kind="server".
```

The published `@oh-my-stigmergy/opencode-plugin@0.1.1` exports only the named `StigmergyPlugin` function; it does **not** provide a `PluginModule`-shape module (`{ id, server }` as the default export and/or a named `server`). Opencode's loader records `missing` → `WARN plugin has no server entrypoint` and **skips attachment**. The observed behaviour does not depend on the specific `STIGMERGY_ORCHESTRATION_CONFIG` or on env vars; it is purely a plugin-contract mismatch.

### Repair applied in this branch

This branch (`feature/opencode-eval-battery-run`) adds a backward-compatible `PluginModule` export to the plugin:

- `export const server = StigmergyPlugin;`
- `export default { id: "@oh-my-stigmergy/opencode-plugin", server: StigmergyPlugin };`

and a new `packages/opencode-plugin/test/plugin.test.mjs` assertion (`module default export matches PluginModule shape for @opencode-ai/plugin 1.14.x`) that guards the contract. With the local source patched, node-level import tests expose the expected shape (`typeof m.server === "function"`, `m.default.id === "@oh-my-stigmergy/opencode-plugin"`).

**Caveat on Layer 3 runs:** opencode re-resolves the plugin from the **npm registry** on each `opencode run`, so it installs v0.1.1 into its own cache **regardless** of a local `.opencode/package.json` `file:` override. In-place cache overwrites were observed to be clobbered on the next run. End-to-end validation of the fix therefore needs either:

1. publishing a new plugin version (e.g. `0.1.2`) to npm so the host resolver picks it up, or
2. a local-path / tarball plugin-install channel in opencode that actually bypasses the npm registry.

Neither was in scope for this agent-driven exercise.

## Layer 3 per-run artefacts (reference)

Kept outside the repo per protocol data-retention guidance (`/tmp/oms-eval/`):

- `ext-00N-COND-stdout.jsonl` — opencode JSON event stream for the session.
- `ext-00N-COND-stderr.log` — host log output (`--print-logs INFO`).
- `ext-00N-COND-audit.ndjson` — plugin audit log (empty for all B1/B2 here).
- `ext-00N-COND-sbp.ndjson` — SBP server log (never created here).
- `ext-00N-COND-rubric.log` — independent post-session `npm test` output.
- `ext-00N-COND-plugin-status.log` — extracted `loading plugin` / `server entrypoint` host log lines.
- `ext-00N-COND-times.txt` — `T0`, `T1`, `ELAPSED_S`, `OPENCODE_EXIT`, `RUBRIC_NPM_TEST_EXIT`, env vars as set.

## Honest null-result statement

Under this opencode host version and the as-published plugin (`@oh-my-stigmergy/opencode-plugin@0.1.1`), **B1 and B2 are not distinguishable from A** because the plugin does not load. This does **not** refute H_stack in general; it falsifies the **installability precondition** for H_stack on opencode 1.14.31. Re-running once a patched plugin is on npm (or via a local-path install channel) is required to measure whether the stigmergy stack actually moves M1/M2.

## Follow-ups (not actioned by this exercise)

- Publish the plugin contract fix (`PluginModule` default export plus named `server`) as a new version and update [`docs/operations/opencode-compatibility.md`](../../operations/opencode-compatibility.md) to pin the verified opencode CLI range.
- Add a merge-gate structural check in [`scripts/verify-opencode-plugin-contract.sh`](../../../scripts/verify-opencode-plugin-contract.sh) that asserts `export default { server }` and a named `server` export exist in [`src/index.mjs`](../../../packages/opencode-plugin/src/index.mjs) so CI catches future host-contract drift without an LLM run.
- When an operator with live provider credentials runs the canonical human protocol, keep `FEASIBILITY_PILOT_STATUS` updates and the published study file out of scope for agent-driven exercises per ADR-0015.

## References

- [protocol](../opencode-effectiveness-study-protocol.md) 1.1.0 (Conditions A / B1 / B2, metrics M1–M4, rubrics R-ext-easy / R-ext-med)
- [ADR-0015](../../adr/0015-empirical-evaluation-study-claims.md) claims boundary
- [ADR-0012](../../adr/0012-opencode-plugin-architecture.md) plugin architecture
- [ADR-0014](../../adr/0014-sbp-project-supervision.md) SBP project supervision
- [opencode-compatibility.md](../../operations/opencode-compatibility.md) pinned `@opencode-ai/plugin` version matrix
