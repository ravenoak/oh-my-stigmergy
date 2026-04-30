# Contributing

## GitHub Flow (branching and merging)

This repository follows **GitHub Flow** with a **linear `main`**: work happens on **feature branches**, commits are **atomic**, and integration into `main` is **pull requests only**, merged with **Squash** or **Rebase** (not merge commits). Use the **[GitHub CLI (`gh`)](https://cli.github.com/)** for PRs and merges when possible so steps stay reproducible.

**Canonical guide:** [docs/guides/github-flow.md](docs/guides/github-flow.md) — includes `git` / `gh` commands, branch protection expectations, and agent notes.

## OpenCode plugin + SBP smoke

Before opening a PR that touches [`packages/opencode-plugin`](packages/opencode-plugin), [`packages/sbp-server`](packages/sbp-server), or [`packages/graph`](packages/graph), run [docs/guides/opencode-stigmergy-golden-path.md](docs/guides/opencode-stigmergy-golden-path.md) locally. If the bridge fails, use [docs/operations/opencode-stigmergy-troubleshooting.md](docs/operations/opencode-stigmergy-troubleshooting.md) before filing unrelated bugs. Orchestration policy and migration from OMO: [ADR-0013](docs/adr/0013-stigmergic-opencode-orchestration.md), [docs/guides/migration-from-oh-my-openagent.md](docs/guides/migration-from-oh-my-openagent.md). Operator docs (routing playbook, compatibility matrix, npm release): [docs/guides/opencode-model-routing-playbook.md](docs/guides/opencode-model-routing-playbook.md), [docs/operations/opencode-compatibility.md](docs/operations/opencode-compatibility.md), [docs/operations/opencode-plugin-release.md](docs/operations/opencode-plugin-release.md).

Bootstrap script (repo root): `bash scripts/bootstrap-opencode-stigmergy-stack.sh` (optional `--print-opencode-snippet`).

## Restore AI skills from lockfile

After clone, reinstall JUXT Allium skills so `.agents/skills/` matches [skills-lock.json](skills-lock.json):

```bash
npx skills@latest add juxt/allium --agent cursor -y
```

Symlinks under [`.cursor/skills/`](.cursor/skills/) point at `.agents/skills/*`. Recreate them if broken:

```bash
mkdir -p .cursor/skills
for s in allium distill elicit propagate tend weed; do
  ln -sf "../../.agents/skills/$s" ".cursor/skills/$s"
done
```

Optional: `npx skills experimental_install` when your skills CLI version documents restore-from-lock behaviour.

## Maintainer bootstrap (once per repository)

After the first green `allium-specs` run on `main`, enable **branch protection** so merges require that workflow.

1. **Preferred (repeatable):** with `gh`, `jq`, and an admin-capable token, run `./scripts/apply-branch-protection-main.sh` from the repo root, then `./scripts/verify-branch-protection-remote.sh`. See [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md).
2. **Manual:** same document describes the GitHub UI path if you cannot use the API.
3. Record the date in the **Enablement record** table in that doc after protection is live.

## Python version

Use **Python 3.13** for local runs of `packages/graph`, `packages/crucible`, `packages/transitions`, and `packages/stance` (see [`.python-version`](.python-version)). **Do not** use Python 3.14 or newer for those packages: `pyproject.toml` files require `>=3.13,<3.14`. In CI, both `governance` and `specs-and-packages` jobs use [`actions/setup-python`](https://github.com/actions/setup-python) with `3.13`.

### Python environments ([uv](https://docs.astral.sh/uv/))

The repo root defines a **`uv` workspace** ([`pyproject.toml`](pyproject.toml); lockfile [`uv.lock`](uv.lock)). Install [**uv**](https://docs.astral.sh/uv/getting-started/) once, then from the repository root recreate or refresh your local `.venv` (extras, dependency groups, upgrades, and pinned interpreter):

```bash
uv sync -U --all-extras --all-groups -p "$(which python3.13)"
```

Commit `uv.lock` whenever dependency pins change (`uv lock` updates it after editing member `pyproject.toml` files). CI uses [`astral-sh/setup-uv`](https://github.com/astral-sh/setup-uv) with the version in [`devtools/uv.version`](devtools/uv.version) and runs `uv sync --frozen --all-extras --all-groups` before package tests.

Run tests through the synced environment, for example:

```bash
uv run python -m unittest discover -s packages/graph/tests -p 'test_*.py' -v
uv run python -m unittest discover -s packages/stance/tests -p 'test_*.py' -v
```

## Allium CLI and local validation

1. Install [allium-tools](https://github.com/juxt/allium-tools) (`brew tap juxt/allium && brew install allium` or `cargo install allium-cli`). The **CI-pinned** version lives in [`devtools/allium-cli.version`](devtools/allium-cli.version); match it when debugging CI-only failures.

2. Before pushing spec or requirements changes, run:

```bash
bash tests/ci_contract.sh
bash scripts/verify-requirement-traceability.sh
# On a PR branch (simulates CI): GITHUB_BASE_REF=main GITHUB_EVENT_NAME=pull_request bash scripts/verify-governance-doc-cotouch.sh
./scripts/check-allium-specs.sh
./scripts/analyse-allium-specs.sh
```

Single-file spot checks (optional):

```bash
allium check spec/project.allium
allium analyse spec/project.allium
```

The workflow [`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml) runs the contract test, RTM ID sync, **governance doc co-touch on pull requests** ([FR-0.1](docs/requirements/FR.md)), then (when the diff is not doc-only on PRs) pinned `allium-cli` with **Cargo cache**, `allium check` / `allium analyse`, package tests, and Z3/shim checks (see [FR-0.2](docs/requirements/FR.md), [NFR-D1](docs/requirements/NFR.md), [NFR-O1](docs/requirements/NFR.md)).

### CI cost model (Actions minutes)

To conserve GitHub Actions quota, the workflow uses a **`governance`** job on every run and a **`specs-and-packages`** job only when PR diffs touch “heavy” paths (`spec/`, `packages/`, `scripts/`, `tests/`, `devtools/`, `.github/workflows/`, `docs/requirements/`, `docs/traceability/`, `docs/adr/`). Pull requests that change only other `docs/**` files or root `*.md` still get traceability and co-touch gates, but skip Allium install and package tests until something substantive changes. **Pushes to `main` always run the full heavy job.** The required merge check name remains **`allium-specs / check`** (it aggregates job results).

Cursor does not run post-edit hooks like Claude Code; run checks explicitly after changing `.allium` files.

## Agent session budgets (NFR-C1)

See [docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md) for token and parallelism guidance.

## Distillation (FR-1.2)

See [docs/guides/distillation-playbook.md](docs/guides/distillation-playbook.md) for when and how to run `/allium:distill` and update traceability.

## Long tend / weed sessions

Iterative spec editing can exhaust context. If a session grows large, open a **new chat** dedicated to spec work and paste a short resume prompt (see upstream discussion in [juxt/allium#16](https://github.com/juxt/allium/issues/16)).

## Documentation changes

If you change requirements or maturity:

1. Update [docs/requirements/FR.md](docs/requirements/FR.md) and/or [NFR.md](docs/requirements/NFR.md).
2. Update [docs/traceability/RTM.md](docs/traceability/RTM.md) or mark **Deferred** with reason.
3. Architectural shifts need an ADR in [docs/adr/](docs/adr/).

## References

- [docs/CONSTITUTION.md](docs/CONSTITUTION.md)
- [.skills.json](.skills.json) manifest and lockfile pairing
