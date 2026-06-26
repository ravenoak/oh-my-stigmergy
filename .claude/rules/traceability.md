---
paths:
  - "docs/**/*.md"
---

# Documentation traceability

When editing functional or non-functional commitments under `docs/requirements/`, or changing
phased maturity anywhere in `docs/`:

1. **Update [`docs/traceability/RTM.md`](docs/traceability/RTM.md)** for all affected FR/NFR IDs,
   or explicitly mark them **Deferred** with a rationale in the RTM row.

2. **Architectural direction shifts** → add or supersede an ADR in
   [`docs/adr/`](docs/adr/) (see existing ADRs for format and `Status:` field conventions).

3. **Do not upgrade maturity to `implemented`** without a cited verification path — a concrete
   script, test, or tool invocation that a reviewer can reproduce — as required by
   [ADR-0004](docs/adr/0004-verification-stack-layering.md).

When changing `docs/requirements/FR.md` or `NFR.md`, include `docs/traceability/RTM.md` in
the same commit/PR ([FR-0.1](docs/requirements/FR.md)) — the CI co-touch gate enforces this.
