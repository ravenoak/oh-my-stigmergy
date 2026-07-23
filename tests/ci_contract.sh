#!/usr/bin/env bash
# Lightweight contract checks for the Allium CI merge gate (no allium binary required).
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

workflow=".github/workflows/allium-specs.yml"
actions_pinned_workflow=".github/workflows/actions-pinned.yml"
actions_pinned_script="scripts/verify-actions-pinned.sh"
check_script="scripts/check-allium-specs.sh"
analyse_script="scripts/analyse-allium-specs.sh"
trace_script="scripts/verify-requirement-traceability.sh"
cotouch_script="scripts/verify-governance-doc-cotouch.sh"
const_amend_script="scripts/verify-constitution-amendment-cotouch.sh"
fr_anchor_script="scripts/verify-fr-spec-anchors.sh"
distill_script="scripts/verify-distillation-contract.sh"
crucible_compile_script="scripts/verify-crucible-compile.sh"
shim_policy_script="scripts/verify-shim-policy.sh"
shim_policy_diff_script="scripts/verify-shim-policy-diff.sh"
smt_script="scripts/verify-smt-golden.sh"
crucible_contract="tests/crucible_shim_contract.sh"
version_file="devtools/allium-cli.version"
heavy_budget_script="scripts/verify-heavy-budget.sh"
no_secrets_script="scripts/verify-no-secrets.sh"
job_timeouts_script="scripts/verify-job-timeouts.sh"
job_timeouts_json="devtools/ci-job-timeouts.json"
opencode_plugin_contract_script="scripts/verify-opencode-plugin-contract.sh"
opencode_golden_path_script="scripts/verify-opencode-golden-path.sh"
stigmergy_orch_doc_script="scripts/verify-stigmergy-orchestration-doc.sh"
bootstrap_stack_script="scripts/bootstrap-opencode-stigmergy-stack.sh"
opencode_operator_docs_script="scripts/verify-opencode-operator-docs.sh"
project_positioning_doc_script="scripts/verify-project-positioning-doc.sh"
sdlc_workflows_doc_script="scripts/verify-stigmergic-sdlc-workflows-doc.sh"
opencode_stigmergy_troubleshooting_doc_script="scripts/verify-opencode-stigmergy-troubleshooting-doc.sh"
opencode_stigmergy_sbp_supervision_doc_script="scripts/verify-stigmergy-sbp-supervision-doc.sh"
opencode_plugin_publishable_script="scripts/verify-opencode-plugin-publishable.sh"
stigmergy_evaluation_discipline_doc_script="scripts/verify-stigmergy-evaluation-discipline-doc.sh"
opencode_evaluation_protocol_script="scripts/verify-opencode-evaluation-protocol.sh"
ci_contract_coverage_script="scripts/verify-ci-contract-coverage.sh"
verify_script_waivers_json="devtools/verify-script-waivers.json"
transitions_golden_script="scripts/verify-transitions-golden.sh"
frozen_test_manifest_script="scripts/verify-frozen-test-manifest.sh"
lockfile_freeze_script="scripts/verify-lockfile-freeze.sh"
dependency_allowlist_script="scripts/verify-dependency-allowlist.sh"
delivery_floors_contract="tests/delivery_floors_contract.sh"
delivery_floors_doc_script="scripts/verify-delivery-floors-doc.sh"

for f in "$workflow" "$actions_pinned_workflow" ".github/workflows/npm-publish.yml" "$actions_pinned_script" "$check_script" "$analyse_script" "$trace_script" "$cotouch_script" "$const_amend_script" "$fr_anchor_script" "$distill_script" "$crucible_compile_script" "$shim_policy_script" "$shim_policy_diff_script" "$smt_script" "$heavy_budget_script" "$no_secrets_script" "$job_timeouts_script" "$job_timeouts_json" "$crucible_contract" "$version_file" "devtools/uv.version" "devtools/fr-anchor-allow.json" "devtools/ci-heavy-budget-seconds.txt" "devtools/secret-allowlist.txt" ".python-version" "pyproject.toml" "uv.lock" \
  "LICENSE" \
  "docs/adr/0014-sbp-project-supervision.md" \
  "docs/guides/opencode-stigmergy-golden-path.md" \
  "docs/guides/opencode-model-routing-playbook.md" \
  "docs/guides/project-positioning-and-boundaries.md" \
  "docs/guides/stigmergic-sdlc-workflows.md" \
  "docs/inspiration-errata.md" \
  "docs/operations/opencode-compatibility.md" \
  "docs/operations/opencode-stigmergy-troubleshooting.md" \
  "docs/operations/opencode-plugin-release.md" \
  "docs/guides/migration-from-oh-my-openagent.md" \
  "docs/adr/0013-stigmergic-opencode-orchestration.md" \
  "$opencode_golden_path_script" \
  "$stigmergy_orch_doc_script" \
  "$bootstrap_stack_script" \
  "$opencode_operator_docs_script" \
  "$project_positioning_doc_script" \
  "$sdlc_workflows_doc_script" \
  "$opencode_stigmergy_troubleshooting_doc_script" \
  "$opencode_stigmergy_sbp_supervision_doc_script" \
  "$opencode_plugin_publishable_script" \
  "scripts/publish-sbp-server-npm.sh" \
  "scripts/publish-opencode-plugin-npm.sh" \
  ".env.example" \
  "docs/guides/stigmergy-evaluation-discipline.md" \
  "$stigmergy_evaluation_discipline_doc_script" \
  "docs/adr/0015-empirical-evaluation-study-claims.md" \
  "docs/research/opencode-effectiveness-study-protocol.md" \
  "docs/research/README.md" \
  "devtools/evaluation/README.md" \
  "devtools/evaluation/summarize-audit.mjs" \
  "$opencode_evaluation_protocol_script" \
  "$opencode_plugin_contract_script" \
  "packages/opencode-plugin/schema/orchestration.schema.json" \
  "packages/opencode-plugin/src/orchestration.mjs" \
  "packages/opencode-plugin/test/orchestration.test.mjs" \
  "packages/opencode-plugin/package.json" "packages/opencode-plugin/package-lock.json" "packages/opencode-plugin/README.md" \
  "packages/opencode-plugin/src/auditLog.mjs" \
  "packages/opencode-plugin/bin/metrics.mjs" \
  "packages/opencode-plugin/test/metrics.test.mjs" \
  "tests/fixtures/crucible/enums.allium" "tests/fixtures/crucible/enums.smt2" \
  "tests/fixtures/crucible/required_fields.model.json" "tests/fixtures/crucible/required_fields.smt2" \
  "tests/fixtures/crucible/invariants.allium" "tests/fixtures/crucible/invariants.overlay.json" "tests/fixtures/crucible/invariants.smt2" \
  "tests/fixtures/crucible/invariants_bad.model.json" "tests/fixtures/crucible/invariants_bad.smt2" \
  "tests/fixtures/crucible/workflow_timeouts.model.json" "tests/fixtures/crucible/workflow_timeouts.smt2" \
  "tests/fixtures/crucible/workflow_timeouts_bad.model.json" "tests/fixtures/crucible/workflow_timeouts_bad.smt2" \
  "tests/fixtures/crucible/opencode_plugin.model.json" "tests/fixtures/crucible/opencode_plugin.smt2" \
  "tests/fixtures/crucible/opencode_plugin_bad.model.json" "tests/fixtures/crucible/opencode_plugin_bad.smt2" \
  "packages/stance/schema/stance-config.schema.json" "packages/stance/src/stance/validate.py" "packages/stance/src/stance/registry.py" \
  "tests/fixtures/stance/good.json" \
  "tests/fixtures/stance/invalid/missing_required.json" \
  "tests/fixtures/stance/invalid/no_stance_vector.json" \
  "tests/fixtures/stance/invalid/threshold_out_of_range.json" \
  "tests/fixtures/stance/invalid/extra_property.json" \
  "$ci_contract_coverage_script" "$verify_script_waivers_json" \
  "$transitions_golden_script" \
  "spec/transitions.json" "packages/transitions/schema/transitions.schema.json" \
  "packages/transitions/src/transitions/artifact.py" "packages/transitions/src/transitions/__main__.py" \
  "packages/graph/tests/test_schema_version.py" \
  "docs/adr/0016-sbp-ledger-identity-and-kind.md" \
  "packages/sbp-server/test/auth.test.mjs" \
  "$frozen_test_manifest_script" "$lockfile_freeze_script" "$dependency_allowlist_script" \
  "$delivery_floors_contract" "tests/lib/fixture_pr.sh" \
  "devtools/frozen-test-manifest.json" "devtools/lockfile-freeze.json" "devtools/dependency-allowlist.json" \
  "$delivery_floors_doc_script" "docs/operations/delivery-floors.md"; do
  test -f "$f" || {
    echo "ci_contract: missing $f" >&2
    exit 1
  }
done
grep -qE '^3\.13$' .python-version || {
  echo "ci_contract: .python-version must be 3.13 (not 3.14+)" >&2
  exit 1
}

bash -n "$check_script"
bash -n "$analyse_script"
bash -n "$trace_script"
bash -n "$cotouch_script"
bash -n "$const_amend_script"
bash -n "$fr_anchor_script"
bash -n "$distill_script"
bash -n "$crucible_compile_script"
grep -q 'compile_model_fixture' "$crucible_compile_script" || {
  echo "ci_contract: $crucible_compile_script must compile fixtures via compile_model_fixture" >&2
  exit 1
}
grep -q 'minimal.allium' "$crucible_compile_script" || {
  echo "ci_contract: $crucible_compile_script must exclude minimal.allium (hand golden pair)" >&2
  exit 1
}
grep -q 'model.json' "$crucible_compile_script" || {
  echo "ci_contract: $crucible_compile_script must include JSON model fixtures (*.model.json)" >&2
  exit 1
}
bash -n "$shim_policy_script"
bash -n "$shim_policy_diff_script"
bash -n "$smt_script"
bash -n "$heavy_budget_script"
bash -n "$no_secrets_script"
bash -n "$job_timeouts_script"
bash -n "$opencode_plugin_contract_script"
bash -n "$opencode_golden_path_script"
bash -n "$stigmergy_orch_doc_script"
bash -n "$bootstrap_stack_script"
bash -n "$opencode_operator_docs_script"
bash -n "$opencode_stigmergy_sbp_supervision_doc_script"
bash -n "$opencode_plugin_publishable_script"
bash -n "scripts/publish-sbp-server-npm.sh"
bash -n "scripts/publish-opencode-plugin-npm.sh"
bash -n "$stigmergy_evaluation_discipline_doc_script"
bash -n "$opencode_evaluation_protocol_script"
bash -n "$ci_contract_coverage_script"
bash -n "$transitions_golden_script"
bash -n "$frozen_test_manifest_script"
bash -n "$lockfile_freeze_script"
bash -n "$dependency_allowlist_script"
bash -n "$delivery_floors_contract"
bash -n "tests/lib/fixture_pr.sh"
bash -n "$delivery_floors_doc_script"
bash -n "$crucible_contract"
bash -n "$actions_pinned_script"

grep -q 'allium check' "$check_script" || {
  echo "ci_contract: $check_script must contain allium check" >&2
  exit 1
}
grep -q 'allium analyse' "$analyse_script" || {
  echo "ci_contract: $analyse_script must contain allium analyse" >&2
  exit 1
}

grep -q '^  filter:' "$workflow" || {
  echo "ci_contract: $workflow must define filter job" >&2
  exit 1
}
grep -q '^  governance:' "$workflow" || {
  echo "ci_contract: $workflow must define governance job" >&2
  exit 1
}
grep -q '^  specs-and-packages:' "$workflow" || {
  echo "ci_contract: $workflow must define specs-and-packages job" >&2
  exit 1
}
grep -q '^  check:' "$workflow" || {
  echo "ci_contract: $workflow must define check merge gate job" >&2
  exit 1
}
grep -q 'FORCE_JAVASCRIPT_ACTIONS_TO_NODE24' "$workflow" || {
  echo "ci_contract: $workflow must set FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 for Node-on-Actions policy" >&2
  exit 1
}
for wf in .github/workflows/*.yml; do
  grep -q 'FORCE_JAVASCRIPT_ACTIONS_TO_NODE24' "$wf" || {
    echo "ci_contract: $wf must set FORCE_JAVASCRIPT_ACTIONS_TO_NODE24" >&2
    exit 1
  }
done
grep -q 'needs: \[filter, governance, specs-and-packages\]' "$workflow" || {
  echo "ci_contract: $workflow check job must need filter, governance, specs-and-packages" >&2
  exit 1
}
grep -q 'if: always()' "$workflow" || {
  echo "ci_contract: $workflow check job must use if: always() for skipped heavy job" >&2
  exit 1
}

governance_block="$(awk '/^  governance:/,/^  specs-and-packages:/' "$workflow")"
echo "$governance_block" | grep -q 'cargo install' && {
  echo "ci_contract: governance job must not run cargo install (keep PR minutes low)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-transitions-sync.sh' && {
  echo "ci_contract: governance job must not run removed verify-transitions-sync.sh" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-shim-policy.sh' || {
  echo "ci_contract: governance job must run scripts/verify-shim-policy.sh" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-shim-policy-diff.sh' || {
  echo "ci_contract: governance job must run scripts/verify-shim-policy-diff.sh (PR policy co-touch)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-heavy-budget.sh' || {
  echo "ci_contract: governance job must run scripts/verify-heavy-budget.sh (NFR-P1)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-actions-pinned.sh' || {
  echo "ci_contract: governance job must run scripts/verify-actions-pinned.sh (NFR-P2 / supply chain)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-job-timeouts.sh' || {
  echo "ci_contract: governance job must run scripts/verify-job-timeouts.sh (NFR-P2)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-no-secrets.sh' || {
  echo "ci_contract: governance job must run scripts/verify-no-secrets.sh (NFR-S2)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-plugin-contract.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-plugin-contract.sh (FR-5.1 / Phase 11)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-plugin-publishable.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-plugin-publishable.sh (P19-a)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-golden-path.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-golden-path.sh (FR-5.4 / Phase 12)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-stigmergy-orchestration-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-stigmergy-orchestration-doc.sh (FR-6.2)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-operator-docs.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-operator-docs.sh (FR-6.3)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-project-positioning-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-project-positioning-doc.sh (FR-6.4 / Phase 16)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-stigmergic-sdlc-workflows-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-stigmergic-sdlc-workflows-doc.sh (FR-6.4 / Phase 16)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-stigmergy-troubleshooting-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-stigmergy-troubleshooting-doc.sh (FR-6.5 / Phase 17)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-stigmergy-sbp-supervision-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-stigmergy-sbp-supervision-doc.sh (FR-5.5 / Phase 18)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-stigmergy-evaluation-discipline-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-stigmergy-evaluation-discipline-doc.sh (FR-7.1 / Phase 19)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-opencode-evaluation-protocol.sh' || {
  echo "ci_contract: governance job must run scripts/verify-opencode-evaluation-protocol.sh (FR-7.2 / Phase 20)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-ci-contract-coverage.sh' || {
  echo "ci_contract: governance job must run scripts/verify-ci-contract-coverage.sh (FR-0.2)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-frozen-test-manifest.sh' || {
  echo "ci_contract: governance job must run scripts/verify-frozen-test-manifest.sh (FR-10.1)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-lockfile-freeze.sh' || {
  echo "ci_contract: governance job must run scripts/verify-lockfile-freeze.sh (FR-10.2)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-dependency-allowlist.sh' || {
  echo "ci_contract: governance job must run scripts/verify-dependency-allowlist.sh (FR-10.3)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'delivery_floors_contract.sh' || {
  echo "ci_contract: governance job must run tests/delivery_floors_contract.sh (FR-10.4)" >&2
  exit 1
}
echo "$governance_block" | grep -q 'verify-delivery-floors-doc.sh' || {
  echo "ci_contract: governance job must run scripts/verify-delivery-floors-doc.sh (FR-10.x)" >&2
  exit 1
}
echo "$governance_block" | grep -q "python-version: '3.13'" || {
  echo "ci_contract: governance job must pin Python 3.13 (setup-python)" >&2
  exit 1
}

heavy_block="$(awk '/^  specs-and-packages:/,/^  check:/' "$workflow")"
echo "$heavy_block" | grep -q 'actions/cache@' || {
  echo "ci_contract: specs-and-packages job must cache cargo (actions/cache@<sha>)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'devtools/allium-cli.version' || {
  echo "ci_contract: specs-and-packages must reference devtools/allium-cli.version" >&2
  exit 1
}
echo "$heavy_block" | grep -q "python-version: '3.13'" || {
  echo "ci_contract: specs-and-packages job must pin Python 3.13 (setup-python)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'verify-crucible-compile.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/verify-crucible-compile.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/crucible/tests' || {
  echo "ci_contract: specs-and-packages must run packages/crucible/tests unittest" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'uv sync' || {
  echo "ci_contract: specs-and-packages must sync the uv workspace (uv sync)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'frozen' || {
  echo "ci_contract: specs-and-packages must use locked uv sync (--frozen)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'astral-sh/setup-uv' || {
  echo "ci_contract: specs-and-packages must install uv (astral-sh/setup-uv)" >&2
  exit 1
}

actions_pinned_block="$(awk '/^name: actions-pinned/,0' "$actions_pinned_workflow")"
echo "$actions_pinned_block" | grep -q '^jobs:' || {
  echo "ci_contract: $actions_pinned_workflow must define jobs" >&2
  exit 1
}
echo "$actions_pinned_block" | grep -q '^  check:' || {
  echo "ci_contract: $actions_pinned_workflow must define check job" >&2
  exit 1
}
echo "$actions_pinned_block" | grep -q 'verify-actions-pinned.sh' || {
  echo "ci_contract: $actions_pinned_workflow must run scripts/verify-actions-pinned.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/graph/tests' || {
  echo "ci_contract: specs-and-packages must run graph unit tests under packages/graph/tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/transitions/tests' || {
  echo "ci_contract: specs-and-packages must run transitions unit tests under packages/transitions/tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/stance/tests' || {
  echo "ci_contract: specs-and-packages must run stance unit tests under packages/stance/tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'command -v allium' || {
  echo "ci_contract: specs-and-packages must assert allium is on PATH before transitions tests" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'packages/sbp-server' || {
  echo "ci_contract: specs-and-packages must run SBP tests under packages/sbp-server" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'cd packages/opencode-plugin' || {
  echo "ci_contract: specs-and-packages must run OpenCode plugin tests (cd packages/opencode-plugin)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'compaction.test.mjs' || {
  echo "ci_contract: SBP npm test must cover compaction (compaction.test.mjs)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'decay-gc.test.mjs' || {
  echo "ci_contract: SBP npm test must cover decay GC scheduler (decay-gc.test.mjs)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'stance-registry.test.mjs' || {
  echo "ci_contract: SBP npm test must mention stance-registry.test.mjs" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'auth.test.mjs' || {
  echo "ci_contract: SBP npm test must mention auth.test.mjs (FR-9.1)" >&2
  exit 1
}
grep -q 'better-sqlite3' packages/sbp-server/package.json || {
  echo "ci_contract: packages/sbp-server/package.json must depend on better-sqlite3" >&2
  exit 1
}
grep -q 'better-sqlite3' packages/sbp-server/package-lock.json || {
  echo "ci_contract: packages/sbp-server/package-lock.json must lock better-sqlite3" >&2
  exit 1
}
test -f packages/sbp-server/test/sqlite-store.test.mjs || {
  echo "ci_contract: missing packages/sbp-server/test/sqlite-store.test.mjs" >&2
  exit 1
}
test -f packages/sbp-server/test/healthz.test.mjs || {
  echo "ci_contract: missing packages/sbp-server/test/healthz.test.mjs" >&2
  exit 1
}
test -f packages/sbp-server/test/multi-writer.test.mjs || {
  echo "ci_contract: missing packages/sbp-server/test/multi-writer.test.mjs" >&2
  exit 1
}
grep -qr 'CALLS' packages/graph/tests || {
  echo "ci_contract: graph tests must reference CALLS edges" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'npm test' || {
  echo "ci_contract: specs-and-packages must run SBP via npm test (bounded node:test script)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'verify-smt-golden.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/verify-smt-golden.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'crucible.cli solve' || {
  echo "ci_contract: specs-and-packages must run crucible.cli solve on spec/ (via uv run python -m)" >&2
  exit 1
}
grep -q 'tree-sitter-typescript' packages/graph/pyproject.toml || {
  echo "ci_contract: packages/graph/pyproject.toml must depend on tree-sitter-typescript" >&2
  exit 1
}
grep -q 'tree-sitter-typescript' uv.lock || {
  echo "ci_contract: uv.lock must resolve tree-sitter-typescript for graph TS symbols" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'crucible_shim_contract.sh' || {
  echo "ci_contract: specs-and-packages must run tests/crucible_shim_contract.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'check-allium-specs.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/check-allium-specs.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'analyse-allium-specs.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/analyse-allium-specs.sh" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'verify-transitions-golden.sh' || {
  echo "ci_contract: specs-and-packages must run scripts/verify-transitions-golden.sh (FR-8.1)" >&2
  exit 1
}
echo "$heavy_block" | grep -q 'timeout-minutes: 2' || {
  echo "ci_contract: specs-and-packages graph unittest step must set timeout-minutes: 2 (NFR-P1)" >&2
  exit 1
}

gov_spec="spec/governance.allium"
inv_overlay="tests/fixtures/crucible/invariants.overlay.json"
for ent in RepositoryGovernance DistillationArtefact ShimAllowEntry WorkflowJob OpenCodePluginTool OpenCodePluginEvent; do
  grep -q "entity ${ent}" "$gov_spec" || {
    echo "ci_contract: ${gov_spec} must declare entity ${ent} (Phase 8 governance slices)" >&2
    exit 1
  }
  grep -q "\"entity\": \"${ent}\"" "$inv_overlay" || {
    echo "ci_contract: ${inv_overlay} must include default overlay for ${ent}" >&2
    exit 1
  }
done

grep -q 'tests/ci_contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run tests/ci_contract.sh" >&2
  exit 1
}
grep -q 'verify-requirement-traceability.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-requirement-traceability.sh" >&2
  exit 1
}
grep -q 'verify-governance-doc-cotouch.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-governance-doc-cotouch.sh" >&2
  exit 1
}
grep -q 'verify-constitution-amendment-cotouch.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-constitution-amendment-cotouch.sh" >&2
  exit 1
}
grep -q 'verify-fr-spec-anchors.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-fr-spec-anchors.sh" >&2
  exit 1
}
grep -q 'verify-distillation-contract.sh' "$workflow" || {
  echo "ci_contract: $workflow must run scripts/verify-distillation-contract.sh" >&2
  exit 1
}

bash "$job_timeouts_script"

echo "ci_contract: ok"
