# ADR-0010: Agent stance configuration — normative schema

## Status

Accepted

## Context

[`docs/TDD.md`](../TDD.md) previously noted that serialisation of agent stance configuration was not fixed until an implementation ADR existed. Pheromone records in SBP already carry a free-form `stanceTarget` string ([`packages/sbp-server/schemas/pheromone.json`](../../packages/sbp-server/schemas/pheromone.json)).

## Decision

1. **Normative schema:** [`packages/stance/schema/stance-config.schema.json`](../../packages/stance/schema/stance-config.schema.json) (JSON Schema draft 2020-12). Required top-level keys: `agent_id`, `stance_vector` (map of stance name → number in `[0,1]`), `olfactory_threshold` (number in `[0,1]`). `additionalProperties: false` on the root object; `stance_vector` keys are constrained to a safe identifier-like pattern.

2. **Validator:** [`packages/stance/src/stance/validate.py`](../../packages/stance/src/stance/validate.py) using `jsonschema` (stdlib entry: `uv run python -m stance.validate <file>`).

3. **Registry:** [`packages/stance/src/stance/registry.py`](../../packages/stance/src/stance/registry.py) — `load_registry(path)` returns the union of `stance_vector` keys from one JSON file or all `*.json` in a directory (each file validated). Loaded **once** at SBP process start when `SBP_STANCE_REGISTRY` is set; restart to refresh.

4. **SBP boundary:** When `SBP_STANCE_REGISTRY` is set, [`packages/sbp-server/server.mjs`](../../packages/sbp-server/server.mjs) rejects `POST /pheromones` bodies whose `stanceTarget` is not in the registry with HTTP **400** and logs `stance_unknown`. When unset, behaviour is unchanged (back-compat).

## Non-goals

- **No in-tree agent runtime** that consumes stance files for autonomous behaviour (`NFR-D1` / honesty).
- **No** executing stance JSON as code; files are data only.

## Consequences

- FR-1.4 maturity depends on CI running the Python validator tests and optional SBP registry tests.
- Operators may maintain stance allow-lists as versioned JSON next to deployment config.

## Verification

- `packages/stance/tests/test_validate.py`
- `packages/sbp-server/test/stance-registry.test.mjs`
