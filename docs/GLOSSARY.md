# Glossary

| Term | Meaning |
|------|---------|
| **Allium** | LLM-native behavioural specification language (entities, rules, transitions). See [juxt.github.io/allium](https://juxt.github.io/allium/). |
| **Belief collapse** | Loss of retained architectural belief across long agent runs (see Theory of Code Space / inspiration essay). |
| **Belief inertia** | Failure to update internal map when the environment changes. |
| **Context drift** | Model output tracking prior outputs more than ground truth (code + specs). |
| **Distillation** | Inferring spec from code (Allium `/allium:distill` skill family). |
| **Elicitation** | Building spec through structured conversation (`/allium:elicit`). |
| **Gauge invariance** | Stability of a conclusion under change of analytical framework; instability is informative. |
| **Hound (concept)** | Relation-first, reference-grounded retrieval; inspiration uses it as contrast to naive embedding RAG. |
| **Intent-first** | Intent artefact can contradict code; contradictions are investigated. |
| **Liquid democracy** | Delegation-style voting; constitution warns of weight concentration (see ADR-0005). |
| **Meaning drift** | Orchestrator or model drifting from codebase and specs toward self-referential completions. |
| **Pheromone (digital)** | Structured signal left on a shared ledger for indirect coordination (stigmergy). |
| **Reality gap** | Divergence between what runs and what was intended. |
| **SBP** | Stigmergic Blackboard Protocol—coordination via shared environment rather than central messaging only. |
| **Stance vector** | Weighted priorities governing which signals an agent attends to. |
| **Sublation (Crucible)** | Formal reconciliation layer; **in this repo** may be aspirational until implemented (ADR-0004). |
| **Token furnace** | Runaway orchestration cost and context growth from mega-prompt hierarchies. |
