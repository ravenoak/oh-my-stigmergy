@AGENTS.md

# Claude Code — oh-my-stigmergy

Claude Code reads this file; the `@AGENTS.md` import above brings in the shared agent instructions
(Allium skills, CI/contracts, OpenCode plugin, "do not invent enforcement"). This file adds the
Claude-Code-specific operating posture only.

---

## Always-on posture

### Constitution (condensed)

Behavioural intent lives in Allium specs (`spec/**/*.allium`) and linked docs — code is not the
sole source of "should." Proportion all claims to evidence; prefer falsifiable statements.

**Do not** claim Z3 gates, OPA shell interception, or Allium→SMT compilation unless
[`docs/traceability/RTM.md`](docs/traceability/RTM.md) lists them as `implemented` with code in
tree. See [`docs/adr/0004-verification-stack-layering.md`](docs/adr/0004-verification-stack-layering.md)
and the full text in [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md).

This project is not optimised for snap operational decisions; when urgency dominates, switch to
concise operational guidance rather than analysis.

### Git policy

Work on **`feature/<short-description>`** branches created from updated `main`. **Never commit on
`main`.** Integrate only via **pull request** with green **`allium-specs / check`**. Merge with
**squash or rebase only** (never merge commits). Prefer `gh` for PRs; `git` for branch/commit.

→ Canonical guide: [`docs/guides/github-flow.md`](docs/guides/github-flow.md)
→ Full procedure (branch → commit → PR → merge → cleanup): invoke the **`git-workflow`** skill.

### Reasoning discipline

For design critique, stress-testing conclusions, falsifiability analysis, validation
(non-operational), dialectical/tetralemma/Socratic/systems reasoning, mapping complexity,
second-order effects, or `stigmergy-validation` requests — invoke the **`integrated-reasoning`**
skill before producing the substantive answer.

For **any external fact** (versions, releases, API behaviour, breaking changes, current events):
search or fetch first; do not rely on training data alone; cite sources.

---

## Path-scoped rules (auto-attach)

- **`.allium` files, CI workflows, `scripts/`** → `.claude/rules/allium.md` attaches: spec-authoring
  discipline, CI pipeline steps, FR/NFR traceability. The `PostToolUse` hook in
  `.claude/settings.json` also runs `allium check` automatically on every `.allium` save.
- **`docs/**/*.md`** → `.claude/rules/traceability.md` attaches: FR/NFR ↔ RTM alignment, ADR
  requirements, maturity-gating rules.

---

## Skills

Home-grown skills (`.claude/skills/`):

| Skill | When to invoke |
|---|---|
| `git-workflow` | Starting/finishing feature work, committing, PRs, branch cleanup |
| `integrated-reasoning` | Deep analysis, stress-testing, validation, complexity mapping |

Vendored JUXT Allium skills (symlinked from `.agents/skills/`): `allium`, `elicit`, `distill`,
`propagate`, `tend`, `weed`. Invoke as `/allium`, `/allium:elicit`, etc.
