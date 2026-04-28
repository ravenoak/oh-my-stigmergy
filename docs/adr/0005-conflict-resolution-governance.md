# ADR-0005: Conflict resolution — delegation, sublation, and open risks

## Status

Accepted (human-resolution stance for this repository; automatic delegation **not pursued** until a successor ADR ships with mitigations and tests)

## Context

Agents with different stance vectors can bid for incompatible changes (e.g. security vs latency). Liquid-style delegation can **concentrate voting weight** on a few nodes, reintroducing centralized control under a decentralization story (see inspiration essay).

## Decision

- Until a coordination runtime exists in-tree, **human architects** resolve irreconcilable spec conflicts using the constitution’s reasoning charter and documented trade-offs.
- Any future **automatic** conflict handler (delegation markets, auction, solver-only merge) requires:
  - Power-concentration mitigations documented,
  - Test and audit story,
  - ADR superseding or tightening this one.

## Consequences

- FR-3.x and coordination epics stay decoupled from automated governance claims.
- If sublation via Z3/OPA is adopted, pairing with ADR-0004 is mandatory.

## Verification

- Open design reviews when multi-agent coordination code is proposed.
- Revisit this ADR when automation or delegation changes are proposed for merged specs or ledger policy.
