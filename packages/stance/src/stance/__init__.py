"""Agent stance configuration schema + validation (FR-1.4)."""

from stance.registry import load_registry
from stance.validate import validate_file, validate_instance

__all__ = ["load_registry", "validate_file", "validate_instance"]
