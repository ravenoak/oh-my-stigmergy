# Human-as-orchestrator bridge (FR-11.2)

Small `.mjs` CLIs by which a maintainer manually publishes work orders and phase marks and
checks phase-close against a real SBP ledger, logging every action (with per-session
wall-clock) to feed the [orchestrator decision pre-registration](../../docs/research/orchestrator-decision-preregistration.md).
This is the **first real consumer** of the `workOrder`/`phaseTransition` kinds — see
[ADR-0016](../../docs/adr/0016-sbp-ledger-identity-and-kind.md) and
[the implementation plan](../../docs/planning/orchestrator-implementation-plan.md).

**Deliberately `.mjs`, not Python.** The bridge's language is a house-style choice, not a
prejudgment of the orchestrator's eventual runtime — that question belongs to workstream E,
where its actual justifications (uv workspace, an SSE client) live.

## Setup

1. Run an SBP server in identity mode (`SBP_AUTH_TOKENS_FILE` set — see
   [`sbp-auth-tokens.example.json`](sbp-auth-tokens.example.json) for the shape; replace the
   placeholder token/agentId with your own before using it against a real server). Register the
   `workOrder`/`phaseTransition`/`verificationMark` kinds via `SBP_KIND_REGISTRY_FILE` — see
   [`sbp-kind-registry.example.json`](sbp-kind-registry.example.json).
2. Point the bridge at it: `SBP_URL`, `STIGMERGY_AGENT_TOKEN` (must resolve to an identity in
   the server's token file), `STIGMERGY_AGENT_ID` (must equal that identity's `agentId` — the
   server cross-checks `provenance.createdBy` against it and rejects a mismatch).
3. Optional: `STIGMERGY_BRIDGE_LOG_FILE` (default `.stigmergy/bridge-log.ndjson`),
   `STIGMERGY_BRIDGE_STATE_FILE` (default `.stigmergy/bridge-session.json`).

## Commands

| Command | Purpose |
|---|---|
| `node session-start.mjs` | Opens a bridge session (records `startedAt`); errors if one is already open rather than silently overwriting it. |
| `node session-end.mjs` | Closes the open session, logging its wall-clock `durationMs` — the toil signal the pre-registration criteria read. |
| `node publish-workorder.mjs <orderId> <goal> [--phase <phase>] [--stance <stanceTarget>]` | Publishes a `workOrder`-kind pheromone. `orderId` must match `^wo-[a-z0-9]{8,}$`. Requires `STIGMERGY_AGENT_ID`. |
| `node mark-phase.mjs <orderId> <phase>` | Publishes a `phaseTransition`-kind pheromone. `phase` is a **free-form label** — no SDLC phase taxonomy exists yet; see [the implementation plan](../../docs/planning/orchestrator-implementation-plan.md) §7. |
| `node check-close.mjs <orderId>` | Prints the `phaseTransition` history for a work order (a read aid for the operator's own judgment — no terminal-phase semantics are enforced). |

Every `publish-workorder`/`mark-phase`/`check-close` invocation outside an open session prints a
warning to stderr: that action's toil can't be measured. `session-start`/`session-end` are the
unit the pre-registration's toil metric is built from — run real work between them.

## Testing note

Tests exercise the network-touching logic (`publishWorkOrder`, `markPhase`, `checkClose` in
[`lib.mjs`](lib.mjs)) in-process against a real, in-process SBP server, and only spawn the CLI
scripts as subprocesses for their pure argv-validation paths (session start/end, malformed
`orderId`, missing `STIGMERGY_AGENT_ID`). Spawning a child process that itself makes a network
call — even `http.get` to loopback — hangs in at least one sandboxed local dev environment; this
is unrelated to bridge logic (reproduced with a two-line script containing no bridge code) but is
why the network-touching tests call the exported functions directly rather than the CLI binaries.
