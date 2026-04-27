## Summary

<!-- What does this PR change and why? -->

## Checklist

- [ ] If I changed **functional or non-functional requirements** or **maturity** labels, I updated [docs/requirements/FR.md](docs/requirements/FR.md) and/or [docs/requirements/NFR.md](docs/requirements/NFR.md) and [docs/traceability/RTM.md](docs/traceability/RTM.md) in the **same PR** when touching FR/NFR (CI: `verify-governance-doc-cotouch.sh`), or marked **Deferred** with rationale.
- [ ] If I edited files under `spec/`, I ran locally (with `allium` on `PATH`): `./scripts/check-allium-specs.sh` and `./scripts/analyse-allium-specs.sh`.
- [ ] If I changed paths under `scripts/`, `.github/workflows/`, or `devtools/` without updating `spec/`, I added a dated waiver under `docs/distillation/waivers/` (see [docs/distillation/waivers/README.md](docs/distillation/waivers/README.md)) or updated specs per [docs/guides/distillation-playbook.md](docs/guides/distillation-playbook.md).
- [ ] **Maintainers / repo bootstrap:** default branch protection requires the **`allium-specs`** workflow (job **`check`**) before merge, per [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md). (Check when setting up the repo or changing CI.)
