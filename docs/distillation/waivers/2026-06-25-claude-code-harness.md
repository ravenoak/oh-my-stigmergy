# PR 55 — Claude Code harness + allium-cli pin bump

- **Reason:** This PR adds the `.claude/` harness (CLAUDE.md, skills, rules, hook, settings) and
  bumps `devtools/allium-cli.version` from 3.2.3 to 3.5.0. The version pin change fixes a
  Cargo compilation breakage caused by `allium-parser` upgrading to 3.5.0 on crates.io; it is a
  tooling sync with no behavioural obligation change. No Allium entities in `spec/` were added or
  modified; the `.claude/` tooling is agent-guidance documentation, not normative Allium spec.
- **Follow-up:** none.
