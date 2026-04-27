---
name: ci-merge-gate
description: >-
  Apply FR-0.2 Allium CI expectations: spec/ is validated in GitHub Actions; run the repo check script locally before push.
---

# CI merge gate (Allium)

Use when editing **`.allium`** files, **`.github/workflows/allium-specs.yml`**, or **[`scripts/check-allium-specs.sh`](../../../scripts/check-allium-specs.sh)**.

## Expectations

1. **CI:** Workflow `allium-specs` runs [`tests/ci_contract.sh`](../../../tests/ci_contract.sh) then installs pinned `allium-cli` and runs [`scripts/check-allium-specs.sh`](../../../scripts/check-allium-specs.sh). See [`.github/workflows/allium-specs.yml`](../../../.github/workflows/allium-specs.yml).
2. **Local:** With `allium` on `PATH`, run `./scripts/check-allium-specs.sh` from the repository root before pushing spec changes.
3. **Traceability:** [FR-0.2](../../../docs/requirements/FR.md), [RTM](../../../docs/traceability/RTM.md) row FR-0.2.

## Repository anchors

- Requirement: [docs/requirements/FR.md](../../../docs/requirements/FR.md) (FR-0.2)
- RTM: [docs/traceability/RTM.md](../../../docs/traceability/RTM.md)
