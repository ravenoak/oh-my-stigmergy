# ADR-0003: Stigmergic coordination versus mega-orchestrator

## Status

Accepted

## Context

Central orchestrators with enormous prompts risk **meaning drift** and **token furnaces**. Stigmergy coordinates through a shared medium (environmental signals) rather than routing everything through one conversational brain.

## Decision

- Architectural storytelling for multi-agent work favours **blackboard / pheromone** patterns (FR-3.x) over single-controller omniscience—**when building runtime**.
- Project documentation and Cursor setup avoid duplicating kiloline “master prompts”; instead link to specs and ADRs.

## Status update (2026-04-28)

A **reference SBP runtime** is shipped in-tree under [`packages/sbp-server`](../../packages/sbp-server/) (FR-3.1–FR-3.4): HTTP API, SSE, optional JSONL durability ([ADR-0008](0008-sbp-persistence.md)), compaction + decay GC ([ADR-0009](0009-sbp-ledger-compaction-decay-gc.md)), optional SQLite ([ADR-0011](0011-sbp-sqlite-store.md)). The architectural preference for blackboard coordination over a mega-orchestrator **still applies** when extending behaviour; maturity is governed by [RTM.md](../traceability/RTM.md), not by this ADR alone.

## Consequences

- New coordination features must align with FR-3.x and ADR-0005 / ADR-0008 / ADR-0009 / ADR-0011; **Redis is not pursued** ([BACKLOG.md](../BACKLOG.md)).
- Human architects remain in the loop for contradictions until any successor ADR permits automatic delegation ([ADR-0005](0005-conflict-resolution-governance.md)).

## Verification

- PR review checks that new coordination features align with FR-3.x phasing when introduced.
