"""JSON Schema validation for stance configuration files."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import jsonschema
from jsonschema import Draft202012Validator

_validator: Draft202012Validator | None = None


def _schema_path() -> Path:
    # packages/stance/schema/stance-config.schema.json (sibling of src/)
    return Path(__file__).resolve().parent.parent.parent / "schema" / "stance-config.schema.json"


def _get_validator() -> Draft202012Validator:
    global _validator
    if _validator is None:
        schema = json.loads(_schema_path().read_text(encoding="utf-8"))
        _validator = Draft202012Validator(schema)
    return _validator


def validate_instance(data: Any) -> None:
    """Raise jsonschema.ValidationError if *data* does not match the stance schema."""
    v = _get_validator()
    v.validate(data)


def validate_file(path: Path | str) -> dict[str, Any]:
    """Load JSON from *path*, validate, return the parsed object."""
    p = Path(path)
    raw = json.loads(p.read_text(encoding="utf-8"))
    validate_instance(raw)
    return raw


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Validate a stance config JSON file.")
    ap.add_argument("path", type=Path, help="Path to stance-config JSON")
    args = ap.parse_args(argv)
    try:
        validate_file(args.path)
    except (OSError, json.JSONDecodeError) as e:
        print(str(e), file=sys.stderr)
        return 2
    except jsonschema.ValidationError as e:
        print(e.message, file=sys.stderr)
        return 1
    print("ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
