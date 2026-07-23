# Orchestrator implementation plan — reconnaissance and staging decision

**Status:** planning record, not a normative requirements document. `docs/requirements/FR.md` +
`docs/traceability/RTM.md` remain the source of truth for what is committed; `docs/BACKLOG.md` for
what is parked. This document records *why* the staging below was chosen and *what the checkout
actually contains*, so later sessions don't re-derive it or re-trust the superseded assumptions in
`IMPLEMENTATION_BRIEF.md` / `stigmergy-stack-v2/`.

**Provenance:** produced 2026-07-23 per `IMPLEMENTATION_BRIEF.md` §3 ("Phase 0 — reconnaissance,
produce a report, no code"), via three parallel recon passes over the checkout, a four-lens
considerate-oracle analysis (Tetralemma, Evidence Auditor, Elenchus, Pre-mortem), one round of
maintainer-directed adversarial review against the resulting plan, and direct verification of the
disputed facts (spec file contents, npm provenance behavior, OpenCode plugin event API).

---

## 1. Confirmed identifiers (brief §3(a), §3(g))

- **Next-free ADR number: `0016`.** ADRs `0001`–`0015` exist contiguously in `docs/adr/`, all
  `Accepted`, no gaps. Naming: `NNNN-kebab-title.md`; template at `docs/adr/template.md`
  (`## Status` / `## Context` / `## Decision` / `## Consequences` / `## Verification`); add a row to
  `docs/adr/README.md`.
- **Next-free FR epic: `8`.** Epics 1–7 exist plus a derived `P0` governance epic (`FR-0.1`,
  `FR-0.2`) appended at the end of `FR.md`, not the start.
- **Workstream → identifier mapping actually used** (see §5 for why most workstreams are deferred):
  Stage 0 additions extend existing `FR-0.2` (no new ID minted). Stage 1 (A) → `FR-8.x`. Stage 2
  (B-reduced) → `FR-9.x` + ADR-0016. Stage 3 (F) → `FR-10.x`. Stage 4 (bridge + D, and C if
  triggered) → `FR-11.x` / `FR-12.x`. An orchestrator epic number is **not** pre-minted — it is
  assigned only if Stage 5 returns `Justified`.

## 2. Pheromone schema, routes, and store layer as they exist today (brief §3(b))

`packages/sbp-server/schemas/pheromone.json` — required `id, stanceTarget, baseIntensity,
decayRate`; optional `seq, inflations, payload`; **`additionalProperties: false`**. **Confirmed: no
`identity`/`agentId` field, no `kind` field.** Runtime validation is a **hand-rolled `validate()`**
in `server.mjs` — the JSON Schema is exported but not wired into the request path; **Zod is not used
server-side** (only in the plugin, via `@opencode-ai/plugin`'s re-exported `tool.schema`).

Routes (`server.mjs`): `GET /stream` (SSE), `GET /healthz` (200/503 via `store.healthPing()`),
`GET /pheromones`, `POST /pheromones` (201/400), `POST /pheromones/:id/claim` (**409 `"claimed"`** on
conflict — confirmed first-claim-wins), `POST /pheromones/:id/inflate` (404/200). **The server returns
bare tokens** (`"claimed"`, `"missing"`, `"stance_unknown"`, `"not found"`, a failing field name) —
**not** `sbp_error:`-prefixed strings; that wrapping convention belongs to the **plugin**
(`sbp_error:`, `validation_error:`, `graph_error:`, `claimed_conflict:409`), not the server.

Store layer: `MemoryLedgerStore` (default), `JsonlLedgerStore` (ADR-0008, append-only, exclusive
writer lock, `ELEDGERLOCKED`/exit 75 on conflict), `SqliteLedgerStore` (ADR-0011, `better-sqlite3`,
WAL). **Decay** (`intensity.mjs`): `intensity = baseIntensity * exp(-decayRate * dt_seconds) +
inflations`, computed lazily on read, never persisted — `decayRate` is a per-second exponential decay
constant bounded `[0,1]`; `inflations` is an additive, non-decaying floor. **GC**
(`compactJsonlLedger`/`compactSqliteLedger`): drops rows that are both claimed and below an intensity
floor (default `0.01`, override `1.0` on forced size-rotation); opt-in periodic scheduler via
`SBP_DECAY_GC_INTERVAL_MS`. camelCase confirmed at the wire boundary throughout.

## 3. `packages/transitions` real API/CLI surface (brief §3(c))

Python, **no dependencies**, no CLI/`__main__` — a library harness only. `TransitionTable`:
`from_allium_specs(spec_dir)` runs the vendored `allium model <file>` CLI over every `spec/*.allium`
and merges entities by name; `from_json`/`from_model_json` are a **deprecated, test-only** legacy
sidecar loader. **Confirmed: no committed `transitions.json` artifact exists, and the package defines
no single "phase" enum of its own** — the only state machines are the ones declared inline inside
entities in `spec/governance.allium` (verified by direct read, §7 below).

## 4. `packages/graph` SQLite schema as implemented (brief §3(d))

`SqliteCardStore` (`src/graph/store.py`): tables `cards(id, path, line, char_start, char_end, text,
sha256, language, role)` and `edges(src, dst, kind)`, `PRAGMA foreign_keys=ON`. **Confirmed: no
`user_version` pragma and no `schema_version` table** — migration is column-presence-driven
(`_migrate_cards()` reads `PRAGMA table_info(cards)` and additively `ALTER TABLE ADD COLUMN` for
`language`/`role` if absent). Stage 1 (A2) adds real schema versioning here.

## 5. Stance schema and JS consumers (brief §3(e))

Python + `jsonschema`. Schema (`stance-config.schema.json`): required `agent_id, stance_vector,
olfactory_threshold`; `stance_vector` keys pattern-constrained, values `[0,1]`;
`additionalProperties: false`. CLI `python -m stance.validate`. **JS consumer confirmed:** SBP
server's `loadStanceRegistry()` mirrors the same union-of-`stance_vector`-keys contract, exercised by
`stance-registry.test.mjs`. **Confirmed: one committed valid fixture** (`tests/fixtures/stance/
good.json`); **no committed invalid fixture** — invalid cases are constructed inline in tests. Stage 1
(A3) adds a shared valid/invalid corpus.

## 6. CI job structure and heavy-job budget headroom (brief §3(f))

Four jobs in `allium-specs.yml`: `filter` (5 min, path relevance) → `governance` (10 min, no
`cargo install`, all `verify-*.sh` doc/contract checks) and `specs-and-packages` (30 min, heavy:
Python/uv, Rust/cargo, all package unit tests, z3) → `check` (5 min, aggregate gate, `if: always()`).
**`tests/ci_contract.sh` is a hard-coded allow-list, not discovery** — a new `verify-*.sh` must be
added in three places (existence loop, `bash -n`, governance/heavy-block grep) plus the workflow YAML,
or it silently never runs. **Adopted now** (this PR) to close that gap:
`scripts/verify-ci-contract-coverage.sh` + `devtools/verify-script-waivers.json` — every
`scripts/verify-*.sh` must be referenced by a workflow or `ci_contract.sh`, or carry an explicit
waiver with a reason.

**Budget headroom: none documented.** `docs/guides/agent-session-budgets.md` (NFR-C1) is qualitative
only — no token/time numbers. The numeric budgets live in `devtools/ci-heavy-budget-seconds.txt`
(pinned `120` seconds for the graph-unittest step, NFR-P1) and `devtools/ci-job-timeouts.json`
(NFR-P2 job wall-clocks: filter 5 / governance 10 / specs-and-packages 30 / check 5). Any workstream
adding heavy-job time must raise the budget **explicitly in its PR** per brief §2 rule 4 — this
report does not pre-authorize any increase.

## 7. Contradictions the checkout resolves against the brief and v2 docs (brief §3, final clause)

Per brief §2 rule 3 ("the checkout wins"):

1. **No SDLC phase machine exists in `spec/`.** Direct read of `spec/governance.allium` (the only
   behavioral spec file besides the pointer `spec/project.allium`) confirms its 12 entities are all
   *governance* workflows (`TraceabilityRow`, `Pheromone`, `RepositoryGovernance`, `DistillationArtefact`,
   `WorkflowJob`, `OpenCodePluginTool`/`Event`, etc.) — none is an elicit/distill/propagate/implement/
   review-style SDLC phase taxonomy. **v2's `workorder.schema.json` `phase` enum
   (`elicit,distill,ratify,propagate,implement,review,tend,weed`) has no counterpart in this repo's
   specs today** — it is annotated "PROVISIONAL" in the v2 doc for exactly this reason, and the v2
   annotation is correct. Consequence: `transitions.json` (Stage 1, A1) will faithfully serialize the
   *governance* taxonomy, not an SDLC phase taxonomy; a real SDLC phase machine, if the bridge (Stage 4)
   shows it's needed, must be authored spec-first at that point.
2. **v2's citation of "ADR-0010 records no in-tree agent runtime" is a misattribution.** In this
   repo, ADR-0010 is `stance-configuration-schema.md`. The actual "no mega-orchestrator" position is
   ADR-0003 (`stigmergy-vs-orchestrator.md`); the "no in-tree agent runtime" language is a note under
   FR-1.4, citing ADR-0010 only for the stance-schema non-goal, not the orchestrator question.
3. **`stigmergy-stack-v2/` is a flat directory; its internal links assume subdirectories
   (`upstream-rfcs/`, `orchestrator-repo/`, `project-template/`) that do not exist on disk.** Relative
   links inside those 14 files will not resolve as written. Treated as source material to adapt (per
   `IMPLEMENTATION_BRIEF.md` header), not copied.
4. **The SBP server does not use `sbp_error:`-prefixed strings** (§2 above) — a v2/brief assumption
   corrected; that convention is plugin-side only.
5. **The `GitHub Repository Code Review.md` document's core empirical claims are false against this
   checkout:** it asserts no decay mechanism (contradicted by `intensity.mjs` + ADR-0009), no
   ACID-compliant store (contradicted by the SQLite/WAL store, ADR-0011), no Zod validation
   (contradicted by the plugin's `safeParse` boundary), and no NPM provenance (contradicted by
   `npm-publish.yml`'s OIDC trusted-publishing setup, which web-verified npm docs confirm
   auto-generates provenance for public repos as of npm ≥11.5.1 — no `--provenance` flag needed). It
   was evidently reverse-engineered from the npm registry page without reading source. Full
   claim-by-claim disposition: see `IMPLEMENTATION_BRIEF.md`-adjacent review notes preserved in
   PR history; net assessment ~60% factually wrong, ~30% off-charter (TypeScript migration, vector-DB
   embeddings, MCP bridging — each contradicts a deliberate architectural choice: `.mjs` convention,
   relation-first graph over embeddings per ADR-0002, SBP-as-coordination-medium per ADR-0012/0013),
   ~10% useful and adopted (see Stage-independent task: debounce `file.edited`).
6. **No fixture-PR test harness exists.** The co-touch scripts (`verify-governance-doc-cotouch.sh`
   etc.) are exercised only by real PRs at real CI time (`git diff` against `origin/$GITHUB_BASE_REF`,
   gated on `GITHUB_EVENT_NAME=pull_request`); no `git init`/staged-diff scaffolding drives them in
   tests today. Stage 3 (F) builds this net-new, since delivery floors need the same pattern.

## 8. The staging decision (why this repo does not build the brief's workstream E up front)

Full reasoning: four independent analytical lenses (Tetralemma, Evidence Auditor, Elenchus,
Pre-mortem) converged on the same finding, then survived one round of maintainer-directed adversarial
review. Summary:

- **The brief's stated core mission — "floor-bounded automated SDLC" — is achievable via delivery
  floors (F) + artifact treaties (A) + the one *verified* structural ledger gap (identity/kind, a
  reduced B) with no orchestrator at all.** Workstream E (`packages/orchestrator`) is imported from
  `stigmergy-stack-v2/`'s aspirational design (unratified `Proposed`-status ADRs written for a
  separate, never-built repo) and has **no demonstrated in-repo need**: nothing today produces or
  consumes `agentId`, `kind`, leases, or WorkOrders.
- **ADR-0003's rejection of a "mega-orchestrator" is about *centralization of coordination
  authority*, not LLM-in-the-loop.** "Deterministic / optional / no-LLM-in-control-flow" answers the
  token-furnace objection and is silent on the centralization objection. An orchestrator holding phase
  state in a **private** log (as the v2 ADR-0001 draft specifies) would be the rejected topology
  wearing a deterministic mask — regardless of determinism.
- **The positioning ADR (E0) cannot honestly precede the evidence that would justify it.** The
  question "does the medium already coordinate, or does something need to reach for a central
  controller?" is only answerable *after* the ledger-identity tier is built and *used*. A solo
  maintainer who is simultaneously the proposer, signer, and author of the original rejection cannot
  self-audit that motivated reasoning by writing the ADR first.
- Consequently: **this repo stages A → B(reduced) → F → a human-as-orchestrator bridge (the
  first real consumer, which unlocks the remaining ledger kinds and the WorkOrder profile D) → an
  unconditional metaprocess/synthesis stage (G/H, since most of their content doesn't depend on E) →
  a pre-registered, partitioned decision gate evaluated against the bridge's usage log.** Only a
  `Justified` verdict authors E0 and builds `packages/orchestrator`, under binding charter-fidelity
  constraints (ledger-as-sole-authority state-locality rule; standing replay/cold-start drill).
  `Rejected-for-window` is recorded as a valid, constitution-honoring negative result, not a failure.

Full stage-by-stage plan, the frozen-criteria design constraints, and the charter-fidelity
constraints for E if reached: see the plan artifact referenced by this PR's description and
`docs/BACKLOG.md`'s "Phase orchestrator experiment" row. The **pre-registration document itself**
(scaffolded now, criteria frozen in Stage 4 before the observation window opens) is
`docs/research/orchestrator-decision-preregistration.md`.

## 9. What this Stage-0 PR actually ships

- `scripts/verify-ci-contract-coverage.sh` + `devtools/verify-script-waivers.json`, wired into
  `tests/ci_contract.sh` and the `governance` job — closes the cited-but-never-run gap for all future
  stages.
- `docs/README.md` legend + `.claude/rules/traceability.md` amended: `planned`/`partial` maturity are
  explicitly first-class, and mislabeled `implemented` maturity is classified as a defect at drill-miss
  severity (rules-doc-tier operationalization of the already-constitutional "no invented enforcement"
  principle — not a constitutional amendment, since the principle itself is unchanged; see
  CONSTITUTION.md Core commitment 6).
- `docs/BACKLOG.md` "Phase orchestrator experiment" row.
- This report.
- `docs/research/orchestrator-decision-preregistration.md` scaffold (criteria sections marked
  not-yet-frozen; freezing happens in Stage 4 before data collection, per FR-7.x / ADR-0015 discipline).

No package behavior changes in this PR. FR/NFR rows: extended `FR-0.2`'s existing notes (no new ID
minted); `docs/traceability/RTM.md` co-touched in the same PR.

## References

- `IMPLEMENTATION_BRIEF.md` (repo root; source brief for this program)
- `stigmergy-stack-v2/` (repo root; adapted source material, superseded where this report and its
  staging decision disagree)
- [`docs/CONSTITUTION.md`](../CONSTITUTION.md), [ADR-0003](../adr/0003-stigmergy-vs-orchestrator.md),
  [ADR-0004](../adr/0004-verification-stack-layering.md)
- [`docs/BACKLOG.md`](../BACKLOG.md), [`docs/research/orchestrator-decision-preregistration.md`](../research/orchestrator-decision-preregistration.md)
