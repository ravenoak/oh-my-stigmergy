# Stance configuration (FR-1.4)

Normative **JSON** for agent stance vectors: JSON Schema in [`schema/stance-config.schema.json`](schema/stance-config.schema.json), validation in [`src/stance/validate.py`](src/stance/validate.py), registry helpers in [`src/stance/registry.py`](src/stance/registry.py).

- **Validate:** `uv run python -m stance.validate <file.json>`
- **Registry:** union of `stance_vector` keys across one or more config files (see `load_registry`).

SBP may load a registry at startup via `SBP_STANCE_REGISTRY` ([ADR-0010](../../docs/adr/0010-stance-configuration-schema.md)). This package does **not** run agents.
