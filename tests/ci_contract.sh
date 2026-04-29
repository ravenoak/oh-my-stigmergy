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

for f in "$workflow" "$actions_pinned_workflow" "$actions_pinned_script" "$check_script" "$analyse_script" "$trace_script" "$cotouch_script" "$const_amend_script" "$fr_anchor_script" "$distill_script" "$crucible_compile_script" "$shim_policy_script" "$shim_policy_diff_script" "$smt_script" "$heavy_budget_script" "$no_secrets_script" "$job_timeouts_script" "$job_timeouts_json" "$crucible_contract" "$version_file" "devtools/uv.version" "devtools/fr-anchor-allow.json" "devtools/ci-heavy-budget-seconds.txt" "devtools/secret-allowlist.txt" ".python-version" "pyproject.toml" "uv.lock" \
  "LICENSE" \
  "docs/guides/opencode-stigmergy-golden-path.md" \
  "docs/guides/opencode-model-routing-playbook.md" \
  "docs/operations/opencode-compatibility.md" \
  "docs/operations/opencode-plugin-release.md" \
  "docs/guides/migration-from-oh-my-openagent.md" \
  "docs/adr/0013-stigmergic-opencode-orchestration.md" \
  "$opencode_golden_path_script" \
  "$stigmergy_orch_doc_script" \
  "$bootstrap_stack_script" \
  "$opencode_operator_docs_script" \
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
  "tests/fixtures/stance/good.json"; do
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
