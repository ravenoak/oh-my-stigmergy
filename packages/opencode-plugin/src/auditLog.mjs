import fs from "node:fs";
import path from "node:path";

/** @returns {string} */
export function resolveAuditLogPath() {
  const canonical = (process.env.STIGMERGY_AUDIT_LOG_FILE || "").trim();
  if (canonical) return canonical;
  return (process.env.STIGMERGY_PLUGIN_AUDIT_LOG_FILE || "").trim();
}

export function auditLogEnabled() {
  return Boolean(resolveAuditLogPath());
}

/**
 * Append one NDJSON audit line. Never throws into callers.
 * Path is re-read from env each call so tests can enable logging after import.
 * @param {Record<string, unknown>} obj
 */
export function appendAudit(obj) {
  const filePath = resolveAuditLogPath();
  if (!filePath) return;
  const row = { ts: Date.now(), ...obj };
  const line = `${JSON.stringify(row)}\n`;
  try {
    const abs = path.resolve(filePath);
    const dir = path.dirname(abs);
    if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(abs, line, "utf8");
  } catch {
    /* ignore */
  }
  if (process.env.STIGMERGY_AUDIT_LOG_STDERR === "1") {
    try {
      process.stderr.write(line);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Classify tool return strings (prefix convention in tools.mjs).
 * @param {string} s
 * @param {string} toolName
 * @returns {"ok"|"validation_error"|"payload_json_invalid"|"sbp_error"|"graph_error"|"claimed_conflict"|"auth_error"|"kind_unregistered"|"other"}
 */
export function classifyPluginToolReturn(s, toolName) {
  const str = String(s ?? "");
  if (str.startsWith("validation_error:")) return "validation_error";
  if (str.startsWith("actionable_parse:")) return "other";
  if (str.startsWith("payloadJson_invalid:")) return "payload_json_invalid";
  if (str.startsWith("sbp_error:")) return "sbp_error";
  if (str.startsWith("graph_error:")) return "graph_error";
  if (str.startsWith("claimed_conflict:")) return "claimed_conflict";
  if (str.startsWith("auth_error:")) return "auth_error";
  if (str === "kind_unregistered") return "kind_unregistered";
  if (toolName === "stigmergy_pheromones") {
    if (str.startsWith("sbp_error:")) return "sbp_error";
    return "ok";
  }
  if (str === "ok") return "ok";
  if (toolName === "graph_load_node" || toolName === "graph_aspect") {
    if (str.startsWith("graph_error:")) return "graph_error";
    return "ok";
  }
  if (str.startsWith("sbp_error:")) return "sbp_error";
  return "ok";
}
