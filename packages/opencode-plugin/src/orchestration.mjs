import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @typedef {{ defaultModel: string, stanceModels?: Record<string, string>, localPreferredStances?: string[] }} OrchestrationPolicy */

/** Example defaults — replace via `STIGMERGY_ORCHESTRATION_CONFIG` for your OpenCode providers. */
export const DEFAULT_ORCHESTRATION_POLICY = /** @type {OrchestrationPolicy} */ ({
  defaultModel: "opencode/gpt-5.4",
  stanceModels: {
    feature_implementation: "opencode/claude-sonnet-4.6",
    security_auditing: "opencode/claude-opus-4-7",
    dependency_refactoring: "opencode/gpt-5.4",
  },
  localPreferredStances: ["feature_implementation", "dependency_refactoring"],
});

/**
 * @param {unknown} obj
 * @returns {OrchestrationPolicy}
 */
export function validateOrchestrationPolicy(obj) {
  if (!obj || typeof obj !== "object") {
    throw new Error("orchestration_policy: expected object");
  }
  const o = /** @type {Record<string, unknown>} */ (obj);
  if (typeof o.defaultModel !== "string" || !o.defaultModel.trim()) {
    throw new Error("orchestration_policy: defaultModel required");
  }
  /** @type {Record<string, string>} */
  const stanceModels = {};
  if (o.stanceModels != null) {
    if (typeof o.stanceModels !== "object" || Array.isArray(o.stanceModels)) {
      throw new Error("orchestration_policy: stanceModels must be object");
    }
    for (const [k, v] of Object.entries(o.stanceModels)) {
      if (typeof v !== "string" || !v.trim()) {
        throw new Error(`orchestration_policy: invalid stanceModels[${k}]`);
      }
      stanceModels[k] = v.trim();
    }
  }
  /** @type {string[]} */
  let localPreferredStances = [];
  if (o.localPreferredStances != null) {
    if (!Array.isArray(o.localPreferredStances)) {
      throw new Error("orchestration_policy: localPreferredStances must be array");
    }
    localPreferredStances = o.localPreferredStances.map((s) => {
      if (typeof s !== "string" || !s.trim()) {
        throw new Error("orchestration_policy: localPreferredStances entries must be non-empty strings");
      }
      return s.trim();
    });
  }
  return {
    defaultModel: o.defaultModel.trim(),
    stanceModels,
    localPreferredStances,
  };
}

/**
 * Load policy from `STIGMERGY_ORCHESTRATION_CONFIG` or defaults.
 * @returns {OrchestrationPolicy}
 */
export function loadOrchestrationPolicy() {
  const raw = process.env.STIGMERGY_ORCHESTRATION_CONFIG?.trim();
  if (!raw) {
    return { ...DEFAULT_ORCHESTRATION_POLICY, stanceModels: { ...DEFAULT_ORCHESTRATION_POLICY.stanceModels } };
  }
  const resolved = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
  const text = fs.readFileSync(resolved, "utf8");
  const json = JSON.parse(text);
  return validateOrchestrationPolicy(json);
}

/**
 * @param {string} stanceTarget
 * @param {OrchestrationPolicy} policy
 */
export function resolveModelForStance(stanceTarget, policy) {
  const s = String(stanceTarget || "").trim();
  if (!s) return policy.defaultModel;
  const m = policy.stanceModels?.[s];
  return m && m.trim() ? m.trim() : policy.defaultModel;
}

/**
 * @param {string} pheromonesJson — JSON array from GET /pheromones
 * @param {{ olfactoryThreshold: number; stanceTarget?: string; limit: number }} opts
 * @returns {string} JSON array string of actionable rows (intensity >= threshold)
 */
export function filterActionablePheromones(pheromonesJson, opts) {
  const { olfactoryThreshold, stanceTarget, limit } = opts;
  let rows;
  try {
    rows = JSON.parse(pheromonesJson);
  } catch (e) {
    throw new Error(`actionable_parse:${String(e?.message || e)}`);
  }
  if (!Array.isArray(rows)) {
    throw new Error("actionable_parse: expected JSON array");
  }
  const st = stanceTarget?.trim();
  /** @type {any[]} */
  const out = [];
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    const intensity = typeof r.intensity === "number" ? r.intensity : NaN;
    if (!Number.isFinite(intensity) || intensity < olfactoryThreshold) continue;
    if (st && String(r.stanceTarget || "") !== st) continue;
    out.push(r);
  }
  out.sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));
  const sliced = out.slice(0, Math.max(1, Math.min(limit, 100)));
  return JSON.stringify(sliced);
}
