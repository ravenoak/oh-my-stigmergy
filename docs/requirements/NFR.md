# Non-functional requirements

**Phase** and **maturity** follow the same scheme as [FR.md](FR.md).

## Determinism and honesty

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-D1 | No requirement is marked `implemented` without a cited verification path in [RTM.md](../traceability/RTM.md). | P0 | implemented | Deterministic: [`scripts/verify-requirement-traceability.sh`](../../scripts/verify-requirement-traceability.sh) in CI; **Other:** human review for semantic coherence |
| NFR-D2 | Claims about Z3, OPA, or shell shims appear only as `planned` or ADR-gated milestones, not as ambient rules. | P0 | implemented | Peer review / ADR-0004 |

## CI performance

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-P1 | Heavy-job graph ingestion on GitHub-hosted runners stays within the wall-clock budget recorded for relation-first retrieval (ADR-0002). | P2 | implemented | [`devtools/ci-heavy-budget-seconds.txt`](../../devtools/ci-heavy-budget-seconds.txt); **`timeout-minutes`** on the graph unittest step in [`.github/workflows/allium-specs.yml`](../../.github/workflows/allium-specs.yml); deterministic gate [`scripts/verify-heavy-budget.sh`](../../scripts/verify-heavy-budget.sh) in `allium-specs` **`governance`** job |

## Observability

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-O1 | Specification edits produce CLI diagnostics where `allium` is installed. | P1 | implemented | CI: `allium-specs` runs `allium check` and `allium analyse` on `spec/` ([`.github/workflows/allium-specs.yml`](../../.github/workflows/allium-specs.yml)); local / editor LSP still encouraged |
| NFR-O2 | Coordination runtime (when built) emits audit logs for pheromone lifecycle. | P3 | implemented | [`packages/sbp-server/server.mjs`](../../packages/sbp-server/server.mjs), [`docs/operations/sbp-slo.md`](../operations/sbp-slo.md) | SSE events + **NDJSON** `sbpLog` (`SBP_LOG_FILE`, optional `SBP_LOG_STDERR=1`); contract [`log-contract.test.mjs`](../../packages/sbp-server/test/log-contract.test.mjs); load SLOs in [`load.test.mjs`](../../packages/sbp-server/test/load.test.mjs); JSONL compaction + opt-in decay GC ([ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md), [`compaction.test.mjs`](../../packages/sbp-server/test/compaction.test.mjs), [`decay-gc.test.mjs`](../../packages/sbp-server/test/decay-gc.test.mjs)). |

## Cost and ergonomics

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-C1 | Prefer stigmergy and specs over unbounded orchestrator prompts; document token-expensive workflows. | P1 | implemented | [docs/guides/agent-session-budgets.md](../guides/agent-session-budgets.md); [CONTRIBUTING.md](../../CONTRIBUTING.md) |
| NFR-C2 | Long Allium tend/weed sessions may use a fresh chat tab to limit context exhaustion (Cursor). | P1 | implemented | CONTRIBUTING |

## Security

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-S1 | Generated policy or SMT tooling must not execute unreviewed LLM-produced evaluators as the sole safety gate. | P4 | implemented | [`devtools/crucible-shim/policy.maintainer.json`](../../devtools/crucible-shim/policy.maintainer.json), [`scripts/verify-shim-policy.sh`](../../scripts/verify-shim-policy.sh) | **Deterministic today:** policy body SHA-256 attestation verified in CI + before wrap; [`scripts/verify-shim-policy-diff.sh`](../../scripts/verify-shim-policy-diff.sh) on PRs; [`tests/crucible_shim_contract.sh`](../../tests/crucible_shim_contract.sh) exercises allow/deny/`args_regex`/audit/tamper/missing-attestation. |
| NFR-S2 | Pull requests must not add obvious secret/token patterns without allow-listed justification. | P1 | implemented | [`scripts/verify-no-secrets.sh`](../../scripts/verify-no-secrets.sh) on PR diffs (substring [`devtools/secret-allowlist.txt`](../../devtools/secret-allowlist.txt)); **fail-loud in CI** when diff refs cannot be resolved; complements OSS **`gitleaks`** scan in [`security.yml`](../../.github/workflows/security.yml) |

## Accessibility of process

| ID | Requirement | Phase | Maturity | Verification |
|----|-------------|-------|----------|--------------|
| NFR-A1 | New contributors can follow [docs/README.md](../README.md) to find Constitution, PRD, FR/NFR, RTM. | P0 | implemented | Onboarding drill |
