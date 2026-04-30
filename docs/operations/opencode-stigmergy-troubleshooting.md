# OpenCode + stigmergy troubleshooting (operators)

Use this when the [golden path](../guides/opencode-stigmergy-golden-path.md) loop fails: SBP down, graph CLI errors, plugin prefixes like `sbp_error:` / `graph_error:`, or orchestration policy problems. **Honesty:** this doc does not diagnose arbitrary application bugs—only the **reference bridge** (HTTP SBP, `uv` graph CLIs, plugin tools). Verification boundaries: [ADR-0004](../adr/0004-verification-stack-layering.md).

## SBP unreachable or wrong URL or port

- **`SBP_URL`** must match where the SBP server listens (default in golden path: `http://127.0.0.1:3847`). Wrong host/port yields connection failures or timeouts from curl and from plugin tools.
- **Sanity check** (SBP running):

  ```bash
  curl -sSf "${SBP_URL:-http://127.0.0.1:3847}/pheromones"
  ```

- If the process is not listening: start from `packages/sbp-server` per the golden path; see [sbp-operator-runbook.md](sbp-operator-runbook.md) and load/decay expectations in [sbp-slo.md](sbp-slo.md).
- **`SBP_LOG_FILE`** — enable NDJSON server logs when diagnosing publish/stream behaviour ([golden path](../guides/opencode-stigmergy-golden-path.md) §6).

## Plugin bridge errors (sbp_error and graph_error)

Plugin tools return **structured prefixes** instead of crashing OpenCode when dependencies fail:

- **`sbp_error:`** — HTTP client could not complete an SBP request (wrong URL, server down, network). Fix **SBP_URL** and ensure the server is running.
- **`graph_error:`** — `uv run python -m graph.load_node` (or aspect) failed—often **`uv` / Python**, wrong repo root for `cwd`, or missing `uv sync`. See the next section.

Cross-read [golden path §5](../guides/opencode-stigmergy-golden-path.md) (“Verify inside OpenCode”).

## uv and Python 3.13

- Run [`scripts/bootstrap-opencode-stigmergy-stack.sh`](../../scripts/bootstrap-opencode-stigmergy-stack.sh) from the repo root to install **graph** and **Node** package deps (`uv sync`, `npm ci` in `packages/sbp-server` and `packages/opencode-plugin`).
- **Python 3.13** is the documented interpreter for graph CLIs ([CONTRIBUTING.md](../../CONTRIBUTING.md)). If `uv run python -m graph.load_node` fails, verify `python3.13` and re-run `uv sync`.
- From repo root, reproduce without OpenCode:

  ```bash
  uv run python -m graph.load_node "$PWD/tests/fixtures/graph-corpus" "tests/fixtures/graph-corpus/sample.py#1"
  ```

## STIGMERGY_ORCHESTRATION_CONFIG and orchestration policy

- **`STIGMERGY_ORCHESTRATION_CONFIG`** must point to a JSON file that validates against [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json). Invalid JSON or schema mismatch surfaces at plugin load or tool invocation—validate locally with the playbook examples in [opencode-model-routing-playbook.md](../guides/opencode-model-routing-playbook.md).
- **Orchestration semantics** follow [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md); **plugin packaging** follows [ADR-0012](../adr/0012-opencode-plugin-architecture.md). Multi-session / named sub-agent rosters remain **upstream-deferred** ([BACKLOG.md](../BACKLOG.md)).

## References

- [opencode-stigmergy-golden-path.md](../guides/opencode-stigmergy-golden-path.md)
- [bootstrap-opencode-stigmergy-stack.sh](../../scripts/bootstrap-opencode-stigmergy-stack.sh)
- [ADR-0012](../adr/0012-opencode-plugin-architecture.md), [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md)
