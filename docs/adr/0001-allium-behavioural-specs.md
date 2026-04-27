# ADR-0001: Allium behavioural specifications as durable intent

## Status

Accepted

## Context

Code alone cannot distinguish deliberate behaviour from expedient bugs. Markdown requirements scatter and hide contradictions. [Allium](https://juxt.github.io/allium/) provides structured rules where tensions surface mechanically.

## Decision

- Behavioural intent is authored and maintained in `.allium` files under `spec/` (and future domain paths).
- **Elicitation** (forward) and **distillation** (backward) are both legitimate; disagreements are triage inputs, not silent merges.
- The [allium-tools](https://github.com/juxt/allium-tools) CLI is the primary **deterministic** checker for spec structure and analysis commands available today.

## Consequences

- Duplication between prose docs and specs is minimized: FR/NFR reference specs where possible.
- Agents must run `allium check` after substantive `.allium` edits in environments without automatic post-edit hooks.

## Verification

- `allium check` passes on CI when CI is introduced.
- RTM links FR-1.x rows to concrete `.allium` paths as they appear.
