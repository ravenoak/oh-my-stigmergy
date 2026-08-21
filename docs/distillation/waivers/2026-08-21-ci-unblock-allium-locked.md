# CI unblock — locked allium-cli install + actions-pinned regex fix

- **Reason:** `.github/workflows/allium-specs.yml` installed `allium-cli` via
  `cargo install allium-cli --version "${VERSION}"` without `--locked`. `allium-cli 3.5.0`
  declares `allium-parser ^3.0.0`; when upstream published `allium-parser 3.5.3` (2026-08-06) with
  a breaking change to `analyse_with_cross_module`'s arity, every subsequent install resolved the
  broken newest 3.x and failed `specs-and-packages` (see PR #74's CI run). Adds `--locked` so the
  install uses the `Cargo.lock` shipped in the `allium-cli` crate tarball, pinning `allium-parser`
  to the exact version `allium-cli` was built and tested against. `devtools/allium-cli.version`
  stays at `3.5.0` — the last version verified green on `main` (2026-07-23) — rather than bumping
  to 3.5.3: `allium-parser` 3.5.1–3.5.3 also stopped accepting the `module Name { ... }`
  block-wrapper syntax used by three fixtures under `tests/fixtures/crucible/` (`enums.allium`,
  `minimal.allium`, `transitions.allium`), confirmed by bisecting `allium model` locally across
  3.5.0/3.5.1/3.5.2/3.5.3. Migrating those fixtures off block-wrapper syntax is out of scope for a
  CI-unblock fix and is tracked as a follow-up. Also fixes
  `scripts/verify-actions-pinned.sh`'s regex, which matched zero real `uses:` lines in this repo
  (all carry a trailing `# vX` comment or use the bare, non-dashed form) and so reported `ok`
  unconditionally — a supply-chain gate that guarded nothing. No Allium behaviour in `spec/`
  changed; this is CI-install determinism and a dead-gate repair, not a behavioural obligation.
- **Follow-up:** separately evaluate migrating `tests/fixtures/crucible/{enums,minimal,transitions}.allium`
  off `module Name { ... }` block-wrapper syntax and bumping `devtools/allium-cli.version` past
  3.5.0, once the replacement syntax (if any) for language version 3 is confirmed against upstream
  `juxt/allium-tools` release notes.
