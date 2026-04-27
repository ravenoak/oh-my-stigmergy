# Requirements traceability matrix (RTM)

**How to read:** **Deterministic today** means [allium-tools](https://github.com/juxt/allium-tools) CLI (`allium check`, `allium analyse`) on committed `.allium` files. **Future deterministic** means Z3/OPA/shims—**do not treat as enforced** until maturity is upgraded and code exists.

| ID | Epic / doc | Spec anchor | Verification (deterministic vs other) | Owner | Phase | Maturity |
|----|----------------|-------------|----------------------------------------|-------|-------|----------|
| FR-0.1 | Governance / [CONSTITUTION.md](../CONSTITUTION.md) | [spec/project.allium](../../spec/project.allium) | **Other:** human + agent review; optional `allium check` on spec | Maintainers | P0 | partial |
| FR-0.2 | Governance | `spec/**/*.allium` | **Deterministic today:** GitHub Actions workflow `allium-specs` runs [`scripts/check-allium-specs.sh`](../../scripts/check-allium-specs.sh) (`allium check spec/`). Contract: [`tests/ci_contract.sh`](../../tests/ci_contract.sh). | Maintainers | P0 | partial |
| FR-1.1 | Intent / Allium | `spec/project.allium` + future domain specs | **Deterministic today:** `allium check` / `allium analyse` on specs. **Other:** JUXT skills workflow | Maintainers | P1 | partial |
| FR-1.2 | Intent / Allium | — | **Other:** `/allium:distill` skill; manual architect review | Maintainers | P1 | partial |
| FR-1.3 | Intent / Allium | TBD domain `.allium` | **Future:** spec-to-code alignment tests + `allium analyse` | TBD | P2 | planned |
| FR-2.1 | Graph navigation | — | **Future:** unit tests on card store (not in repo) | TBD | P2 | planned |
| FR-2.2 | Graph navigation | — | **Future:** graph build pipeline tests | TBD | P2 | planned |
| FR-2.3 | Graph navigation | — | **Future:** tool contract tests for `load_node` | TBD | P2 | planned |
| FR-3.1 | SBP | — | **Future:** load/contract tests on ledger + SSE | TBD | P3 | planned |
| FR-3.2 | SBP | — | **Future:** schema validation tests | TBD | P3 | planned |
| FR-3.3 | SBP | — | **Future:** concurrency/idempotency tests | TBD | P3 | planned |
| FR-3.4 | SBP | — | **Future:** simulation or property tests | TBD | P3 | planned |
| FR-4.1 | Crucible | — | **Future:** shim + OPA policy tests | TBD | P4 | planned |
| FR-4.2 | Crucible | — | **Future:** golden SMT outputs from fixture `.allium` — **not** LLM translation | TBD | P4 | planned |
| FR-4.3 | Crucible | — | **Future:** Z3 sat/unsat regression suite | TBD | P4 | planned |
| NFR-D1 | Docs | RTM + FR/NFR | **Other:** review | Maintainers | P0 | partial |
| NFR-D2 | Docs | [ADR-0004](../adr/0004-verification-stack-layering.md) | **Other:** ADR + PR review | Maintainers | P0 | implemented |
| NFR-O1 | Tooling | Editor + CLI | **Deterministic today:** `allium check` where installed | Contributors | P1 | partial |
| NFR-O2 | SBP runtime | — | **Future:** structured logging tests | TBD | P3 | planned |
| NFR-C1 | Economics | CONTRIBUTING | **Other:** review | Maintainers | P1 | partial |
| NFR-C2 | Cursor UX | CONTRIBUTING | **Other:** contributor experience | Maintainers | P1 | implemented |
| NFR-S1 | Safety | ADR | **Future:** security review on any policy synth | TBD | P4 | planned |
| NFR-A1 | Onboarding | docs/README.md | **Other:** onboarding walkthrough | Maintainers | P0 | implemented |

**Maintenance rule:** Changing an FR/NFR row without updating this table must call out **Deferred** with a ticket or note in the PR.
