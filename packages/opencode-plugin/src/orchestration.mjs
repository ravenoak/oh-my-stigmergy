import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {{
 *   defaultModel: string;
 *   stanceModels?: Record<string, string>;
 *   localPreferredStances?: string[];
 *   defaultOlfactoryThreshold?: number;
 *   defaultActionableLimit?: number;
 *   maxActionable?: number;
 * }} OrchestrationPolicy
 */

/** Example defaults — replace via `STIGMERGY_ORCHESTRATION_CONFIG` for your OpenCode providers. */
export const DEFAULT_ORCHESTRATION_POLICY = /** @type {OrchestrationPolicy} */ ({
  defaultModel: "opencode/gpt-5.4",
  stanceModels: {
    feature_implementation: "opencode/claude-sonnet-4.6",
    security_auditing: "opencode/claude-opus-4-7",
    dependency_refactoring: "opencode/gpt-5.4",
  },
  localPreferredStances: ["feature_implementation", "dependency_refactoring"],
  defaultOlfactoryThreshold: 0,
  defaultActionableLimit: 10,
  maxActionable: 100,
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

  let defaultOlfactoryThreshold = 0;
  if (o.defaultOlfactoryThreshold !== undefined && o.defaultOlfactoryThreshold !== null) {
    if (typeof o.defaultOlfactoryThreshold !== "number" || !Number.isFinite(o.defaultOlfactoryThreshold)) {
      throw new Error("orchestration_policy: defaultOlfactoryThreshold must be a finite number");
    }
    if (o.defaultOlfactoryThreshold < 0 || o.defaultOlfactoryThreshold > 1) {
      throw new Error("orchestration_policy: defaultOlfactoryThreshold must be between 0 and 1");
    }
    defaultOlfactoryThreshold = o.defaultOlfactoryThreshold;
  }

  let maxActionable = 100;
  if (o.maxActionable !== undefined && o.maxActionable !== null) {
    if (!Number.isInteger(o.maxActionable) || o.maxActionable < 1 || o.maxActionable > 100) {
      throw new Error("orchestration_policy: maxActionable must be an integer from 1 to 100");
    }
    maxActionable = o.maxActionable;
  }

  let defaultActionableLimit = 10;
  if (o.defaultActionableLimit !== undefined && o.defaultActionableLimit !== null) {
    if (!Number.isInteger(o.defaultActionableLimit) || o.defaultActionableLimit < 1 || o.defaultActionableLimit > 100) {
      throw new Error("orchestration_policy: defaultActionableLimit must be an integer from 1 to 100");
    }
    defaultActionableLimit = o.defaultActionableLimit;
  }

  if (defaultActionableLimit > maxActionable) {
    throw new Error("orchestration_policy: defaultActionableLimit must be <= maxActionable");
  }

  return {
    defaultModel: o.defaultModel.trim(),
    stanceModels,
    localPreferredStances,
    defaultOlfactoryThreshold,
    defaultActionableLimit,
    maxActionable,
  };
}

/**
 * Load policy from `STIGMERGY_ORCHESTRATION_CONFIG` or defaults.
 * @returns {OrchestrationPolicy}
 */
export function loadOrchestrationPolicy() {
  const raw = process.env.STIGMERGY_ORCHESTRATION_CONFIG?.trim();
  if (!raw) {
    return {
      ...DEFAULT_ORCHESTRATION_POLICY,
      stanceModels: { ...DEFAULT_ORCHESTRATION_POLICY.stanceModels },
    };
  }
  const resolved = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
  const text = fs.readFileSync(resolved, "utf8");
  const json = JSON.parse(text);
  return validateOrchestrationPolicy(json);
}

/**
 * Merge tool args with policy defaults for stigmergy_actionable (deterministic caps).
 * @param {OrchestrationPolicy} policy
 * @param {{ olfactory_threshold?: number; limit?: number; stance_target?: string }} args
 */
export function resolveActionableToolParams(policy, args) {
  const threshold =
    args.olfactory_threshold !== undefined && args.olfactory_threshold !== null
      ? args.olfactory_threshold
      : (policy.defaultOlfactoryThreshold ?? 0);
  const maxCap = policy.maxActionable ?? 100;
  let lim =
    args.limit !== undefined && args.limit !== null ? args.limit : (policy.defaultActionableLimit ?? 10);
  lim = Math.min(Math.max(1, lim), maxCap, 100);
  const stanceTarget = args.stance_target?.trim();
  return {
    olfactoryThreshold: threshold,
    limit: lim,
    stanceTarget: stanceTarget || undefined,
  };
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
