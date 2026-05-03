# Agent-driven lab exercise (post-fix) — remediation re-run

**Date:** 2026-05-03  
**Protocol:** [opencode-effectiveness-study-protocol.md](../opencode-effectiveness-study-protocol.md) **version 1.1.0**  
**Driver:** Cursor agent (non-human). **Not** a registered study run.  
**Claims boundary:** [ADR-0015](../../adr/0015-empirical-evaluation-study-claims.md) — descriptive apparatus notes only; **do not** infer population effects. [FEASIBILITY_PILOT_STATUS](../FEASIBILITY_PILOT_STATUS.md) remains `NotStarted`.

## Relation to 2026-05-02 exercise

Compared with [2026-05-02-agent-driven-lab-exercise.md](2026-05-02-agent-driven-lab-exercise.md):

- **Plugin load:** Host OpenCode **1.14.x** required **`main`** in [`packages/opencode-plugin/package.json`](../../../packages/opencode-plugin/package.json) for directory/npm resolution; **`0.1.3`** adds **`main`**, **`.stigmergy` mkdir before `spawn.lock`**, and keeps **`PluginModule`** exports. Published **`@oh-my-stigmergy/opencode-plugin@0.1.3`**. After cache bust, stderr shows **`StigmergyPlugin_initialized`** and tool registration — **no** `plugin has no server entrypoint`.
- **Audit:** Conditions **B1/B2** emit **`plugin_initialized`** and event traces to **`STIGMERGY_AUDIT_LOG_FILE`** under `/tmp/oms-eval2/` (not committed).
- **Supervised SBP:** Each **B** audit begins with **`supervision_spawn_timeout`** — the supervised child did **not** produce **`runtime.json`** within the plugin timeout on this machine; **`plugin_initialized`** lists **`baseUrl` `http://127.0.0.1:3847`** (fallback). **`M4(b)`** duplicate-pheromone counts from **`GET /pheromones`** were **not** captured (no stable **`runtime.json`** URL in the worktrees after runs).
- **Model:** The plan targeted **OpenRouter** free-tier ids. **`OPENROUTER_API_KEY`** from repo **`.env`** validates (**HTTP 200**) against **`GET https://openrouter.ai/api/v1/auth/key`**. A probe with **`openrouter/google/gemma-3-12b-it:free`** returned **OpenRouter 404** (“No endpoints found that support tool use” for the default tool surface). Layer 3 therefore used **`opencode/minimax-m2.5-free`** for **all** conditions so **`opencode run`** could complete **with tools**. Orchestration policy files under **`/tmp/oms-eval2/policy-{flat,stance}.json`** use the **same `opencode/*` ids** as the session model family so **B2** stance routing is internally consistent.
- **stdin:** Non-interactive **`opencode run`** **must** receive **`stdin` closed** (`< /dev/null`); otherwise the CLI can block indefinitely in this environment.

## Task bank (pinned SHAs)

| Task id | Repo | SHA | Rubric |
|---------|------|-----|--------|
| `ext-001` | `sindresorhus/is-plain-obj` | `97f38e8836f86a642cce98fc6ab3058bc36df181` | `R-ext-easy` |
| `ext-002` | `chalk/chalk` | `aa06bb5ac3f14df9fda8cfb54274dfc165ddfdef` | `R-ext-med` |

## Aggregate metrics (Layer 3)

**M1** = wall-clock **elapsed_sec** from driver **`\*-meta.txt`** (opencode session only).  
**M2** = **1** iff post-session **`npm test`** exit **0** per rubric (**ext-002** = post-edit test).  
**M3** / **M4(a)** from [`devtools/evaluation/summarize-audit.mjs`](../../../devtools/evaluation/summarize-audit.mjs) on **`\*-audit.ndjson`** (B conditions only; **A** has no audit file).

| Task | Condition | M1 (s) | opencode exit | M2 (`npm test`) | M3 | M4(a) `stigmergy_publish` |
|------|-----------|-------:|---------------:|----------------:|---:|--------------------------:|
| ext-001 | A | 21 | 0 | 1 | — | — |
| ext-001 | B1 | 43 | 0 | 1 | 1 | 0 |
| ext-001 | B2_flat | 40 | 0 | 1 | 1 | 0 |
| ext-001 | B2_stance | 41 | 0 | 1 | 1 | 0 |
| ext-002 | A | 37 | 0 | 1 | — | — |
| ext-002 | B1 | 56 | 0 | 1 | 1 | 0 |
| ext-002 | B2_flat | 55 | 0 | 1 | 1 | 0 |
| ext-002 | B2_stance | 50 | 0 | 1 | 1 | 0 |

**M4(b):** Not computed — no **`…-pheromones.json`** snapshots (no **`runtime.json`** with a live supervised **`url`** after runs). **`/tmp/oms-eval2/ext-001/.stigmergy/`** was empty post-matrix.

**Qualitative B2 note:** With **`tool_execute_total`: 0** in the summarizer output for all **B** runs, **B2** stance-vs-flat differences did **not** surface in **`stigmergy_resolve_model` / `stigmergy_actionable`** usage — the model completed tasks via **bash** only.

**ext-002 honesty check:** After the final **`B2_stance`** run, **`readme.md`** line 1 is **`<!-- study-marker -->`** (inserted by the agent per prompt).

## Limitations

- **N = 1** per cell; no inference.  
- **Agent driver**, single machine, single opencode version.  
- **SBP supervision** did not complete spawn handoff in-window (**`supervision_spawn_timeout`** on every **B** audit), so stigmergic coordination metrics (**M4**) are **weakly informative** despite **`plugin_initialized`**.  
- **OpenRouter** session routing left as **future work** when a free/cheap model supports OpenCode’s **tool** contract end-to-end.

## Raw artefacts

Under **`/tmp/oms-eval2/`** (`\*-meta.txt`, `\*-stdout.jsonl`, `\*-stderr.log`, `\*-audit.ndjson`, `\*-sbp.ndjson`, prompts, policies, **`run-session.sh`**). **Not** committed.
