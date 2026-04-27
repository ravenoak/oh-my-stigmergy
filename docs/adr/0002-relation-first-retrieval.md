# ADR-0002: Relation-first, reference-grounded retrieval

## Status

Accepted

## Context

Cosine-similarity retrieval can return lookalike code that is topologically irrelevant, increasing context noise and belief errors (see inspiration essay on RAG vs graphs and Hound-style designs).

## Decision

- Prefer **graph- or reference-based** navigation for agent tooling in this project once implementation work begins.
- Embedding-only RAG is not forbidden for experiments, but it is **not** the assumed production path for deep navigation FRs (FR-2.x).

## Consequences

- FR-2.x remain `planned` until a concrete graph or card store exists.
- If a vendor or internal tool replaces a Hound-like approach, update this ADR rather than pretending the essay’s names are binding.

## Verification

- When FR-2.3 is implemented, contract tests cover `load_node` (or equivalent) slice correctness.
