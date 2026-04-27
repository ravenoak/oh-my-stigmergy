# Contributing

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

## Allium CLI

Install [allium-tools](https://github.com/juxt/allium-tools) (`brew tap juxt/allium && brew install allium` or `cargo install allium-cli`). Validate specs before merge:

```bash
./scripts/check-allium-specs.sh
allium check spec/project.allium
allium analyse spec/project.allium   # optional deeper analysis
```

The repository workflow [`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml) runs the same `allium check spec/` step on pushes to `main`/`master` and on pull requests (see [FR-0.2](docs/requirements/FR.md)).

Cursor does not run post-edit hooks like Claude Code; run checks explicitly after changing `.allium` files.

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
