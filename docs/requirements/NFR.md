# Non-functional requirements

**Phase** and **maturity** follow the same scheme as [FR.md](FR.md).

## Determinism and honesty

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-D1 | No requirement is marked `implemented` without a cited verification path in [RTM.md](../traceability/RTM.md). | P0 | partial | Doc / review |
| NFR-D2 | Claims about Z3, OPA, or shell shims appear only as `planned` or ADR-gated milestones, not as ambient rules. | P0 | implemented | Peer review / ADR-0004 |

## Observability

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-O1 | Specification edits produce CLI diagnostics where `allium` is installed. | P1 | partial | Manual / editor LSP; CI workflow `allium-specs` on default branch and PRs ([FR-0.2](FR.md)) |
| NFR-O2 | Coordination runtime (when built) emits audit logs for pheromone lifecycle. | P3 | planned | TBD |

## Cost and ergonomics

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-C1 | Prefer stigmergy and specs over unbounded orchestrator prompts; document token-expensive workflows. | P1 | partial | Review |
| NFR-C2 | Long Allium tend/weed sessions may use a fresh chat tab to limit context exhaustion (Cursor). | P1 | implemented | CONTRIBUTING |

## Security

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-S1 | Generated policy or SMT tooling must not execute unreviewed LLM-produced evaluators as the sole safety gate. | P4 | planned | ADR |

## Accessibility of process

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-A1 | New contributors can follow [docs/README.md](../README.md) to find Constitution, PRD, FR/NFR, RTM. | P0 | implemented | Onboarding drill |
