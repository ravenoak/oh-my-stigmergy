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
   [ADR-0004](docs/adr/0004-verification-stack-layering.md). `planned` and `partial` are
   first-class values, not placeholders to avoid — use them honestly when the cited path doesn't
   exist yet or only covers part of the row's claim. **A mislabeled `implemented` row (the
   verification path doesn't actually run, or doesn't cover the claim) is a defect at the same
   severity as a missed drill** — it is the "no invented enforcement" constitutional rule made
   concrete in a single table cell.

When changing `docs/requirements/FR.md` or `NFR.md`, include `docs/traceability/RTM.md` in
the same commit/PR ([FR-0.1](docs/requirements/FR.md)) — the CI co-touch gate enforces this.
