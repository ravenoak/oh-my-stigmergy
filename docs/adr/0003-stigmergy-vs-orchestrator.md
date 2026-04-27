# ADR-0003: Stigmergic coordination versus mega-orchestrator

## Status

Accepted

## Context

Central orchestrators with enormous prompts risk **meaning drift** and **token furnaces**. Stigmergy coordinates through a shared medium (environmental signals) rather than routing everything through one conversational brain.

## Decision

- Architectural storytelling for multi-agent work favours **blackboard / pheromone** patterns (FR-3.x) over single-controller omniscience—**when building runtime**.
- Project documentation and Cursor setup avoid duplicating kiloline “master prompts”; instead link to specs and ADRs.

## Consequences

- SBP components remain optional until implemented; no claim that this repo runs a ledger today.
- Human architects remain in the loop for contradictions until automated sublation exists.

## Verification

- PR review checks that new coordination features align with FR-3.x phasing when introduced.
