# CI unblock — locked allium-cli install + actions-pinned regex fix

- **Reason:** `.github/workflows/allium-specs.yml` installed `allium-cli` via
  `cargo install allium-cli --version "${VERSION}"` without `--locked`. `allium-cli 3.5.0`
  declares `allium-parser ^3.0.0`; when upstream published `allium-parser 3.5.3` (2026-08-06) with
  a breaking change to `analyse_with_cross_module`'s arity, every subsequent install resolved the
  broken newest 3.x and failed `specs-and-packages` (see PR #74's CI run). Adds `--locked` so the
  install uses the `Cargo.lock` shipped in the `allium-cli` crate tarball, and bumps
  `devtools/allium-cli.version` 3.5.0 → 3.5.3 to match the already-verified working version (zero
  diagnostics/findings on `spec/governance.allium` and `spec/project.allium`). Also fixes
  `scripts/verify-actions-pinned.sh`'s regex, which matched zero real `uses:` lines in this repo
  (all carry a trailing `# vX` comment or use the bare, non-dashed form) and so reported `ok`
  unconditionally — a supply-chain gate that guarded nothing. No Allium behaviour in `spec/`
  changed; this is CI-install determinism and a dead-gate repair, not a behavioural obligation.
- **Follow-up:** none.
