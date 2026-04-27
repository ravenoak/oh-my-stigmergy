# Crucible shell wrapper (FR-4.1 / NFR-S1)

**Deny-by-default** maintainer shim: only commands listed in [`policy.maintainer.json`](policy.maintainer.json) `allow` pass through. The policy file carries an **attestation** (`sha256` over the JSON body without the `attestation` key) so silent mutation is rejected by [`scripts/verify-shim-policy.sh`](../../scripts/verify-shim-policy.sh) (governance CI) and by `policy_gate.py` before each invocation.

See [`policy.schema.json`](policy.schema.json). [`policy.example.json`](policy.example.json) is a template — compute a new hash after editing (run `python3 devtools/crucible-shim/policy_gate.py --verify-attestation` on a candidate file until it passes locally, then commit).

## Install (maintainers)

1. Edit `policy.maintainer.json` (or set `POLICY_FILE` to your copy) and extend `allow` with `{ "command": "<basename>", "argv_prefix": [] }` rows as needed.
2. Recompute `attestation.sha256` over the canonical body (`json.dumps` without `attestation`, sorted keys, no extra spaces).
3. Call explicitly:

```bash
export POLICY_FILE="$(pwd)/devtools/crucible-shim/policy.maintainer.json"
devtools/crucible-shim/wrap.sh echo ok
```

## Safety

Not a security boundary for hostile code — a **local discipline + review-evidence** aid per [ADR-0006](../../docs/adr/0006-p4-crucible-execution.md).
