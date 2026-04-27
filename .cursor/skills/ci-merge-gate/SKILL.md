---
name: ci-merge-gate
description: >-
  Apply FR-0.2 and NFR-O1 CI expectations: spec/ is checked and analysed in Actions; run the repo scripts locally before push; keep FR/NFR/RTM IDs aligned.
---

# CI merge gate (Allium)

Use when editing **`spec/**/*.allium`**, **[`.github/workflows/allium-specs.yml`](../../../.github/workflows/allium-specs.yml)**, or any **[`scripts/`](../../../scripts/)** merge-gate script.

## Expectations

1. **CI:** Workflow `allium-specs` runs [`tests/ci_contract.sh`](../../../tests/ci_contract.sh), [`scripts/verify-requirement-traceability.sh`](../../../scripts/verify-requirement-traceability.sh), on pull requests [`scripts/verify-governance-doc-cotouch.sh`](../../../scripts/verify-governance-doc-cotouch.sh), installs pinned `allium-cli` from [`devtools/allium-cli.version`](../../../devtools/allium-cli.version), then [`scripts/check-allium-specs.sh`](../../../scripts/check-allium-specs.sh) and [`scripts/analyse-allium-specs.sh`](../../../scripts/analyse-allium-specs.sh).
2. **Local:** From the repository root, run the same scripts (see [CONTRIBUTING.md](../../../CONTRIBUTING.md)).
3. **Traceability:** [FR-0.1](../../../docs/requirements/FR.md), [FR-0.2](../../../docs/requirements/FR.md), [NFR-D1](../../../docs/requirements/NFR.md), [NFR-O1](../../../docs/requirements/NFR.md), [RTM](../../../docs/traceability/RTM.md).

## Repository anchors

- Branch protection: [docs/operations/github-branch-protection.md](../../../docs/operations/github-branch-protection.md)
- Session budgets (NFR-C1): [docs/guides/agent-session-budgets.md](../../../docs/guides/agent-session-budgets.md)
