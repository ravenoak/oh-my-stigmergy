# Crucible shell wrapper (FR-4.1 / NFR-S1)

**Deny-by-default** maintainer shim: only commands listed in [`policy.maintainer.json`](policy.maintainer.json) `allow` pass through. The policy file carries an **attestation** (`sha256` over the JSON body without the `attestation` key) so silent mutation is rejected by [`scripts/verify-shim-policy.sh`](../../scripts/verify-shim-policy.sh) (governance CI) and by `policy_gate.py` before each invocation.

Pull requests that touch `policy.maintainer.json` must **co-touch this README** (enforced by [`scripts/verify-shim-policy-diff.sh`](../../scripts/verify-shim-policy-diff.sh) on `pull_request`).

See [`policy.schema.json`](policy.schema.json). [`policy.example.json`](policy.example.json) is a template — compute a new hash after editing (run `python3 devtools/crucible-shim/policy_gate.py --verify-attestation` on a candidate file until it passes locally, then commit).

### Optional `args_regex`

Each `allow` row may set **`args_regex`**: a Python `re` pattern matched with **`fullmatch`** against the **tail** of argv after `argv_prefix`, **space-joined** into a single line (anchored, single-line discipline). Omit it to allow any tail matching the prefix.

### Denied-call audit log

Set **`CRUCIBLE_SHIM_AUDIT_LOG`** to a path; on **deny**, `wrap.sh` appends one **NDJSON** object per line: `{ "ts": <epoch_ms>, "event": "shim_denied", "argv": [...] }` (same leading-field shape as SBP `sbpLog`).

## Install (maintainers)

1. Edit `policy.maintainer.json` (or set `POLICY_FILE` to your copy) and extend `allow` with `{ "command": "<basename>", "argv_prefix": [] }` rows as needed (add `args_regex` when tightening argument surface).
2. Recompute `attestation.sha256` over the canonical body (`json.dumps` without `attestation`, sorted keys, no extra spaces).
3. Call explicitly:

```bash
export POLICY_FILE="$(pwd)/devtools/crucible-shim/policy.maintainer.json"
devtools/crucible-shim/wrap.sh echo ok
```

## Safety

Not a security boundary for hostile code — a **local discipline + review-evidence** aid per [ADR-0006](../../docs/adr/0006-p4-crucible-execution.md).
