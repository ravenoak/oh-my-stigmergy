# Crucible shell wrapper (FR-4.1 partial)

Prototype **PATH shim** for experiments only. Not enabled in CI and not required for contributors.

## Install (maintainers)

1. Copy [`policy.example.json`](policy.example.json) to `policy.json` and edit the `deny` list (command basenames).
2. Prepend this directory ahead of tools you want gated, **or** call `wrap.sh` explicitly:

```bash
export POLICY_FILE="$(pwd)/devtools/crucible-shim/policy.json"
devtools/crucible-shim/wrap.sh curl --version   # allowed if curl not denied
```

3. If the first token matches a `deny` entry, the wrapper exits `1` and prints `crucible-shim: blocked: <name>`.

## Safety

This is not a security boundary for hostile code. It is a **local discipline aid** aligned with [ADR-0006](../../docs/adr/0006-p4-crucible-execution.md).
