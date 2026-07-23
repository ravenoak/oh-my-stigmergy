# Stance configuration (FR-1.4)

Normative **JSON** for agent stance vectors: JSON Schema in [`schema/stance-config.schema.json`](schema/stance-config.schema.json), validation in [`src/stance/validate.py`](src/stance/validate.py), registry helpers in [`src/stance/registry.py`](src/stance/registry.py).

- **Validate:** `uv run python -m stance.validate <file.json>`
- **Registry:** union of `stance_vector` keys across one or more config files (see `load_registry`).

SBP may load a registry at startup via `SBP_STANCE_REGISTRY` ([ADR-0010](../../docs/adr/0010-stance-configuration-schema.md)). This package does **not** run agents.

## Shared fixture corpus (FR-8.3)

[`tests/fixtures/stance/good.json`](../../tests/fixtures/stance/good.json) (valid) and
[`tests/fixtures/stance/invalid/*.json`](../../tests/fixtures/stance/invalid/) (schema-invalid: missing
required field, out-of-range threshold, `additionalProperties`, absent `stance_vector`) are consumed by
**both** this package's tests (`tests/test_validate.py`, `tests/test_cli.py`) and the JS
`stance-registry` tests in [`packages/sbp-server/test/stance-registry.test.mjs`](../sbp-server/test/stance-registry.test.mjs).
The two consumers enforce different contracts on purpose: this package's `jsonschema` validation is
strict (rejects all four invalid fixtures); the JS `loadStanceRegistry` only requires a `stance_vector`
object and is otherwise permissive — it accepts three of the four invalid fixtures and rejects only
`no_stance_vector.json`. Add new invalid fixtures under `invalid/` when a new schema constraint needs
coverage on both sides.
