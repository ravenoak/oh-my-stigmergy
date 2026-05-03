# Feasibility pilot — execution status

This file makes **human feasibility pilot** state **explicit** for the repo. It is **not** a merge gate and does not substitute for registered study runs ([ADR-0015](../adr/0015-empirical-evaluation-study-claims.md)). Update in the **same change set** as the first results doc when the pilot completes, or when status changes.

| Field | Value |
|-------|--------|
| **Status** | `NotStarted` |
| **Last updated** | 2026-04-29 |
| **Protocol version in scope** | 1.1.0 — [opencode-effectiveness-study-protocol.md](opencode-effectiveness-study-protocol.md) |
| **Notes** | No operator-run A/B1/B2 sessions recorded in-repo yet. Run [pilot-runbook.md](pilot-runbook.md); commit a dated summary under [results/](results/) when available, then set **Status** to `Complete` and link the file below. Use **Declined** + one concrete reason if the team explicitly defers the pilot. |

| Results (when Complete) | |
|-------------------------|---|
| **Dated summary** | *(add path, e.g. `results/YYYY-MM-DD-feasibility-pilot.md`)* |

## Allowed `Status` values

- `NotStarted` — no sessions completed under the in-scope protocol.
- `InProgress` — at least one session started; no committed summary yet.
- `Complete` — at least one dated write-up under `docs/research/results/`; link in this file.
- `Declined` — team records a **single falsifiable reason** (e.g. no operator capacity this quarter); no implied claims of effectiveness.
