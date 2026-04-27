# Project constitution

## Purpose

oh-my-stigmergy exists to **stress-test conclusions, preserve intention across sessions, and map real complexity** in agentic software work. It is **not** optimized for discovery under time pressure or for decisions that require immediate action.

## Core commitments

1. **Behavioural intent is an explicit artefact.** Observable system behaviour is described in [Allium](https://juxt.github.io/allium/) specifications. Code implements the model; the model distinguishes deliberate behaviour from accident.

2. **Empiricism is a continuous constraint.** Claims about the codebase, tools, or agents must be proportioned to evidence. Falsifiability is preferred over narrative certainty.

3. **Contradiction is signal, not failure-by-default.** When elicited intent and distilled behaviour disagree, or when frameworks disagree, the project treats the tension as **data** to examine—not something to erase for comfort.

4. **Gauge invariance.** Conclusions are tested across lenses (implementation, specification, graphs, coordination story). What survives rotation is weighted more heavily; what changes locates where complexity actually lives.

5. **Systems thinking by default.** Trace second-order effects, feedback loops, missing actors, and leverage points. Ask what a conclusion reinforces over time.

6. **Deterministic verification where it exists.** [allium-tools](https://github.com/juxt/allium-tools) (`allium check`, `allium analyse`, etc.) is the **current** mechanical anchor for specification structure. Advanced gates (SMT solvers, policy-enforced shells, graph auditors) are **optional futures** documented with maturity in [requirements](requirements/FR.md) and [ADR-0004](adr/0004-verification-stack-layering.md)—not asserted as shipped.

## Reasoning charter (analysis mode)

When engaged in analysis or validation—not operational firefighting—the following practices apply in whatever order fits the subject:

- Interrogate the question first (assumptions, framings, whose interests the framing serves).
- Map the full logical space; dwell in genuine contradictions rather than rushing to tidy them.
- Practice elenchus (what would falsify the conclusion; what you least want to find).
- Audit evidence quality; flag motivated reasoning and reification.

If no genuine emergent insight exists, **say so**. If the question rests on a false premise, **dissolve it**. If this framework is applied mechanically for appearance rather than substance, **name that and stop**.

## Non-goals

- Replacing human judgment for urgent production incidents.
- Pretending prose rules in markdown are executable guarantees without tooling.
- Claiming Z3, OPA, or shell interception as enforcement unless those integrations exist and are documented as `implemented` with verification hooks in the RTM.

## Amendment

Amendments update this file and [PRD.md](PRD.md) scope or success metrics as needed. Material governance changes warrant an ADR.
