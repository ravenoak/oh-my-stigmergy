// Human-as-orchestrator bridge (FR-11.2): small CLIs by which a maintainer manually
// publishes workOrder/phaseTransition pheromones and checks phase-close, logging every
// action with per-session wall-clock — the instrument the orchestrator decision
// pre-registration (docs/research/orchestrator-decision-preregistration.md) reads from.
// Deliberately .mjs, not Python — see "Deliberate choices" in the implementation plan.
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function sbpBaseUrl() {
  return (process.env.SBP_URL || "http://127.0.0.1:3847").replace(/\/$/, "");
}

export function agentToken() {
  return (process.env.STIGMERGY_AGENT_TOKEN || "").trim() || undefined;
}

function logPath() {
  return (process.env.STIGMERGY_BRIDGE_LOG_FILE || ".stigmergy/bridge-log.ndjson").trim();
}

function statePath() {
  return (process.env.STIGMERGY_BRIDGE_STATE_FILE || ".stigmergy/bridge-session.json").trim();
}

/** @param {Record<string, unknown>} obj */
export function appendLog(obj) {
  const p = path.resolve(logPath());
  const dir = path.dirname(p);
  if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
  const row = { ts: Date.now(), sessionId: currentSessionId(), ...obj };
  fs.appendFileSync(p, `${JSON.stringify(row)}\n`, "utf8");
  return row;
}

function readState() {
  const p = path.resolve(statePath());
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  const p = path.resolve(statePath());
  const dir = path.dirname(p);
  if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(state), "utf8");
}

function clearState() {
  const p = path.resolve(statePath());
  fs.rmSync(p, { force: true });
}

export function currentSessionId() {
  return readState()?.sessionId ?? null;
}

/** @returns {{ sessionId: string, startedAt: number } | null} */
export function currentSession() {
  return readState();
}

/** Starts a new bridge session; errors (does not silently overwrite) if one is already open. */
export function startSession() {
  const existing = readState();
  if (existing) {
    throw new Error(
      `a bridge session (${existing.sessionId}) is already open (started ${new Date(existing.startedAt).toISOString()}); run session-end first`,
    );
  }
  const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();
  writeState({ sessionId, startedAt });
  return { sessionId, startedAt };
}

/** Ends the open bridge session, returning its duration. Errors if none is open. */
export function endSession() {
  const existing = readState();
  if (!existing) {
    throw new Error("no bridge session is open (run session-start first)");
  }
  const endedAt = Date.now();
  clearState();
  return { sessionId: existing.sessionId, startedAt: existing.startedAt, endedAt, durationMs: endedAt - existing.startedAt };
}

/**
 * @param {string} method
 * @param {string} pathname
 * @param {object | null} jsonBody
 */
export async function sbpRequest(method, pathname, jsonBody) {
  const url = `${sbpBaseUrl()}${pathname}`;
  const token = agentToken();
  const init = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(jsonBody ? { "Content-Type": "application/json" } : {}),
    },
    body: jsonBody !== null && jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
  };
  const res = await fetch(url, init);
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

/** Prints a warning to stderr (not the log) when a mutating action runs outside an open session. */
export function warnIfNoSession() {
  if (!currentSessionId()) {
    process.stderr.write(
      "bridge: WARNING — no session open (run session-start first); this action's toil will not be measurable.\n",
    );
  }
}

/**
 * Publish a workOrder-kind pheromone per the WorkOrder profile (FR-11.1).
 * @param {{ orderId: string, goal: string, createdBy: string, phase?: string, stance?: string }} opts
 */
export async function publishWorkOrder({ orderId, goal, createdBy, phase, stance }) {
  const payload = { profileVersion: "1.0", orderId, goal, provenance: { createdBy } };
  if (phase) payload.phase = phase;
  const body = {
    id: randomUUID(),
    stanceTarget: stance || "feature_implementation",
    baseIntensity: 1,
    decayRate: 0.02,
    kind: "workOrder",
    payload,
  };
  const t0 = Date.now();
  const result = await sbpRequest("POST", "/pheromones", body);
  appendLog({ event: "publish_workorder", orderId, ok: result.ok, status: result.status, durationMs: Date.now() - t0 });
  return result;
}

/**
 * Publish a phaseTransition-kind pheromone. phase is free-form — no SDLC phase taxonomy
 * has been established yet (docs/planning/orchestrator-implementation-plan.md §7).
 * @param {{ orderId: string, phase: string }} opts
 */
export async function markPhase({ orderId, phase }) {
  const body = {
    id: randomUUID(),
    stanceTarget: "feature_implementation",
    baseIntensity: 1,
    decayRate: 0.02,
    kind: "phaseTransition",
    payload: { orderId, phase },
  };
  const t0 = Date.now();
  const result = await sbpRequest("POST", "/pheromones", body);
  appendLog({ event: "mark_phase", orderId, phase, ok: result.ok, status: result.status, durationMs: Date.now() - t0 });
  return result;
}

/**
 * Fetch the phaseTransition history for a work order, sorted oldest-first.
 * @param {string} orderId
 */
export async function checkClose(orderId) {
  const result = await sbpRequest("GET", "/pheromones", null);
  if (!result.ok) {
    return { ok: false, status: result.status, text: result.text, marks: [] };
  }
  const rows = JSON.parse(result.text);
  const marks = rows
    .filter((r) => r.kind === "phaseTransition" && r.payload && r.payload.orderId === orderId)
    .sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));
  appendLog({ event: "check_close", orderId, markCount: marks.length });
  return { ok: true, marks };
}
