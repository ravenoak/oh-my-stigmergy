# Stigmergic SDLC workflow patterns

Operator patterns for **automating the software lifecycle** using the **stigmergic medium** in this repository: Stigmergic Blackboard Protocol (SBP), Allium specs, the relation-first graph, and the OpenCode plugin. Start with [opencode-stigmergy-golden-path.md](opencode-stigmergy-golden-path.md) for environment setup. **Positioning and boundaries:** [project-positioning-and-boundaries.md](project-positioning-and-boundaries.md).

## Workflow: Pheromone trail from work item to claimed implementation

Use this when a **work item** (issue, task, or stance target) should move through **publish → claim → implement** on the **ledger** without a central star-topology orchestrator.

1. Run **SBP** ([`packages/sbp-server`](../../packages/sbp-server/)) and point the plugin at `SBP_URL` (see golden path).
2. **Publish** a pheromone for the work item (stance target, description, initial intensity) via `POST /pheromones` or the plugin’s `stigmergy_publish` tool.
3. **List actionable** work with `stigmergy_actionable` (or `GET /pheromones` with your filter); use **olfactory threshold** and policy caps from [orchestration.schema.json](../../packages/opencode-plugin/schema/orchestration.schema.json) / [opencode-model-routing-playbook.md](opencode-model-routing-playbook.md).
4. **Claim** a pheromone when starting execution (`stigmergy_claim` or `POST .../claim`); first claim wins ([FR-3.3](../requirements/FR.md)).
5. **Implement** in the OpenCode session; use **graph** context with `graph_load_node` or `uv run python -m graph.load_node` for **relation-first** slices ([FR-2.3](../requirements/FR.md)).
6. Use **`stigmergy_resolve_model`** so **stance** maps to the correct **OpenCode model id** when multiple providers are configured.

**Pheromone** records are the shared **signal**; the **OpenCode plugin** and **SBP** are the **mechanism**. This pattern scales to **one** or **many** human or agent sessions writing to the same **ledger**.

## Workflow: Spec and intent change with Allium and repository gates

Use this when **behavioural intent** changes: new rules, new FR text, or spec drift.

1. Edit or add **Allium** under `spec/`; run `allium check` and `allium analyse` locally.
2. Update **FR / NFR / RTM** in the same change set when requirements move ([FR-0.1](../requirements/FR.md)); CI runs [verify-fr-spec-anchors.sh](../../scripts/verify-fr-spec-anchors.sh), traceability, and governance co-touch scripts on pull requests.
3. Where applicable, extend **crucible** fixtures and golden tests ([FR-4.2](../requirements/FR.md), [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh)); **Z3** runs on committed goldens ([FR-4.3](../requirements/FR.md)).
4. Merge only when **`allium-specs / check`** is green and **distillation / constitution** co-touch rules pass for your paths.

**Allium** and **`spec/`** are the **intent** surface; **CI** is the **mechanical** gate for what is claimed as verified.

## Workflow: OpenCode plugin release and npm publish discipline

Use this when cutting a release of **`@oh-my-stigmergy/opencode-plugin`**.

1. Follow [opencode-plugin-release.md](../operations/opencode-plugin-release.md): version bump, `npm pack`, **npm publish** (maintainer-run; not CI-automated).
2. Keep **peer** `@opencode-ai/plugin` aligned with [opencode-compatibility.md](../operations/opencode-compatibility.md) and [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json); CI enforces doc drift via [verify-opencode-operator-docs.sh](../../scripts/verify-opencode-operator-docs.sh).
3. After publish, operators refresh **OpenCode** config per [opencode-stigmergy-golden-path.md](opencode-stigmergy-golden-path.md).

**Graph** and **SBP** versioning are independent of the plugin semver; document breaking changes in PR descriptions and runbooks.
