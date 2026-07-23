# ADR-0016: SBP ledger identity and kind (reduced scope)

## Status

Accepted

## Context

The pheromone schema had no identity (`agentId`) or `kind` field; the ledger operated in a
single-operator, fully-open mode (ADR-0008, ADR-0011). `IMPLEMENTATION_BRIEF.md` workstream B
proposed identity tokens, privileged pheromone classes, and new kinds (`workOrder`,
`phaseTransition`, `verificationMark`) as groundwork for later multi-agent coordination.

Per [`docs/planning/orchestrator-implementation-plan.md`](../planning/orchestrator-implementation-plan.md),
this ADR intentionally **reduces** that scope: only identity, the `kind` *mechanism*, and the
`signal` kind ship now. `workOrder`/`phaseTransition`/`verificationMark` are deferred until a real
consumer exists (the human-as-orchestrator bridge, planned for a later stage), so this repo does
not carry ledger fields or routes with no live consumer.

## Decision

1. Identity tokens are **opt-in** via `SBP_AUTH_TOKENS_FILE` (`{ "tokens": { "<token>": { "agentId", "class": "worker"|"privileged" } } }`).
   Absent it, the server is in **open mode** and every mutating route behaves exactly as before
   this ADR (single-operator, unauthenticated) — verified by an explicit open-mode regression
   suite, not just the absence of new test failures.
2. When `SBP_AUTH_TOKENS_FILE` is configured, `POST /pheromones`, `.../claim`, and `.../inflate`
   all require a valid `Authorization: Bearer <token>` resolving to a known identity
   (`401 auth_error:401:missing_token` / `403 auth_error:403:unknown_token` otherwise). The server
   stamps `agentId` on published records from the resolved identity, **overriding** any
   client-supplied value (anti-spoofing).
3. `kind` is a new optional pheromone field, defaulting to `"signal"`. A separate, optional
   `SBP_KIND_REGISTRY_FILE` (`{ "kinds": { "<kind>": { "publishableBy": [...] } } }`) gates which
   identity classes may publish which kind. Class-gating on `kind` only activates when **both**
   `SBP_AUTH_TOKENS_FILE` and `SBP_KIND_REGISTRY_FILE` are configured — a kind registry configured
   without identity is inert (there is no class to check against), never a fallback restriction.
   The baseline registry shipped in this repo registers **`signal` only**, publishable by both
   classes — no kind is actually restricted yet.
4. Per-identity inflate budgets (`SBP_INFLATE_MAX_PER_WINDOW` / `SBP_INFLATE_WINDOW_SECONDS`) are
   an independent, ledger-self-protection mechanism bounding abuse of the existing `/inflate`
   route; they activate only when identity is configured, and are not tied to `kind`.
5. Migration: on replay (JSONL and SQLite), records that predate the `kind` field are backstamped
   to `kind: "signal"` in memory, so a mixed-history ledger is uniformly kind-tagged going forward.
6. `workOrder`, `phaseTransition`, and `verificationMark` kinds are **explicitly not registered**
   by this ADR.

## Consequences

- **Positive:** existing single-operator deployments are unaffected (open mode unchanged); a
  multi-agent deployment gains a testable, opt-in identity layer with no speculative machinery
  ahead of a real consumer.
- **Negative:** `schemas/pheromone.json`'s `additionalProperties: false` was already not enforced
  at the request path (`validate()` in `server.mjs` is hand-rolled, not schema-driven — see
  reconnaissance in the orchestrator implementation plan). This ADR adds `agentId`/`kind` to that
  schema for documentation only, consistent with the pre-existing gap rather than introducing a new
  one.
- **Follow-up:** additional kinds register only when a real consumer exists (per the
  no-forward-reference discipline); leases/quiescence (a separate, conditional mechanism) trigger
  only on observed claim-lifecycle pain, tracked separately from this ADR.

## Verification

- `packages/sbp-server/test/auth.test.mjs` — auth matrix (missing/unknown token, valid identity,
  `agentId` stamping/anti-spoofing), kind-registry class gating, inflate budget (exceed + window
  reset), and an explicit open-mode regression suite (publish/claim/inflate with no Authorization
  header at all; kind-registry-without-auth-tokens inertness).
- `packages/sbp-server/test/compaction.test.mjs` — migration backstamp survives compaction rewrite.
- `packages/opencode-plugin/test/plugin.test.mjs` — `STIGMERGY_AGENT_TOKEN` end-to-end against a
  real, auth-enabled SBP server (success and missing-token cases).
- `packages/opencode-plugin/test/tools-schema.test.mjs` — `kind` pass-through, `auth_error:`
  pass-through (not double-wrapped by the plugin's generic `sbp_error:` prefix).

## References

- [`docs/planning/orchestrator-implementation-plan.md`](../planning/orchestrator-implementation-plan.md)
- [ADR-0008](0008-sbp-persistence.md), [ADR-0009](0009-sbp-ledger-compaction-decay-gc.md), [ADR-0011](0011-sbp-sqlite-store.md) — ledger persistence/decay, unmodified by this ADR
- `IMPLEMENTATION_BRIEF.md` workstream B (source material, adapted and reduced)
