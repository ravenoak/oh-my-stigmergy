# Agent session budgets (NFR-C1)

This project prefers **stigmergy and durable specs** over unbounded orchestrator-style prompts. Token-heavy work is acceptable when it buys traceability; it is wasteful when it repeats work the repo already captured.

## Defaults

1. **One primary goal per session.** If the task drifts (new epic mid-stream), start a new chat and paste a five-line resume: goal, files touched, open decisions, next command.
2. **Parallel agents only when isolation is real.** Run parallel subagents for disjoint file trees or read-only exploration; avoid two writers on the same spec without a merge plan.
3. **Long Allium tend or weed:** follow [CONTRIBUTING.md](../../CONTRIBUTING.md): open a **fresh chat** dedicated to spec work when context grows large (see upstream [juxt/allium#16](https://github.com/juxt/allium/issues/16)).
4. **Urgent production incidents** are out of charter for this workspace per [CONSTITUTION.md](../CONSTITUTION.md); do not optimize these guides for firefighting.

## When to escalate to humans

Escalate when urgency dominates analysis: merges blocked by policy disagreements, security events, or contractual deadlines that need a named owner, not another model pass.

## Evidence

Prefer short, testable artefacts (scripts, specs, RTM updates) over long chat reasoning alone. If a conclusion cannot point at a file or a command output, treat it as provisional.
