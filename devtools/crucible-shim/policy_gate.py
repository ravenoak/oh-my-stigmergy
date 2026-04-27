#!/usr/bin/env python3
"""Deny-by-default policy gate + attestation verification for crucible-shim."""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any


def canonical_body_bytes(policy: dict[str, Any]) -> bytes:
    body = {k: v for k, v in policy.items() if k != "attestation"}
    return json.dumps(body, sort_keys=True, separators=(",", ":")).encode("utf-8")


def verify_attestation_data(data: dict[str, Any]) -> None:
    att = data.get("attestation")
    if not isinstance(att, dict):
        raise ValueError("policy_gate: missing attestation block")
    sha = att.get("sha256")
    if not sha or not isinstance(sha, str):
        raise ValueError("policy_gate: attestation.sha256 missing")
    h = hashlib.sha256(canonical_body_bytes(data)).hexdigest()
    if h != sha:
        raise ValueError(f"policy_gate: attestation mismatch (expected {sha}, got {h})")


def verify_attestation_file(policy_path: Path) -> None:
    data = json.loads(policy_path.read_text(encoding="utf-8"))
    verify_attestation_data(data)


def is_allowed(policy: dict[str, Any], argv: list[str]) -> bool:
    if policy.get("default") != "deny":
        return False
    if len(argv) < 1:
        return False
    base = os.path.basename(argv[0])
    rest = argv[1:]
    for rule in policy.get("allow", []):
        if rule.get("command") != base:
            continue
        prefix = list(rule.get("argv_prefix") or [])
        if rest[: len(prefix)] == prefix:
            return True
    return False


def main() -> int:
    if len(sys.argv) >= 3 and sys.argv[1] == "--verify-attestation":
        try:
            verify_attestation_file(Path(sys.argv[2]))
        except (ValueError, OSError, json.JSONDecodeError) as e:
            print(str(e), file=sys.stderr)
            return 1
        print("policy_gate: attestation ok")
        return 0
    if len(sys.argv) < 3:
        print("usage: policy_gate.py --verify-attestation <policy.json>", file=sys.stderr)
        print("   or: policy_gate.py <policy.json> <command> [args…]", file=sys.stderr)
        return 2
    policy_path = Path(sys.argv[1])
    argv = sys.argv[2:]
    try:
        data = json.loads(policy_path.read_text(encoding="utf-8"))
        verify_attestation_data(data)
    except (ValueError, OSError, json.JSONDecodeError) as e:
        print(str(e), file=sys.stderr)
        return 2
    if is_allowed(data, argv):
        return 0
    print(f"policy_gate: denied: {argv[0]!r}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
