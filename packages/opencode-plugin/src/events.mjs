import { randomUUID } from "node:crypto";
import { appendAudit } from "./auditLog.mjs";

/**
 * @param {object} ev
 * @returns {string}
 */
function pickPath(ev) {
  if (!ev || typeof ev !== "object") return "";
  const p = ev.path ?? ev.file ?? ev.filePath ?? ev.uri ?? ev.relativePath;
  return typeof p === "string" ? p : "";
}

/**
 * @param {{ sbp: ReturnType<import("./sbpClient.mjs").createSbpClient>; client: any; defaultStance: string }} opts
 */
export function buildEventHandler({ sbp, client, defaultStance }) {
  const stance = defaultStance || "feature_implementation";

  async function log(level, message, extra = {}) {
    try {
      if (client?.app?.log) {
        await client.app.log({
          body: {
            service: "@oh-my-stigmergy/opencode-plugin",
            level,
            message,
            extra,
          },
        });
      }
    } catch {
      /* ignore logging failures */
    }
  }

  async function publishFailSoft(body, reason) {
    appendAudit({
      event: "sbp_publish_attempt",
      reason,
      id: body.id,
    });
    try {
      const { ok, status, text } = await sbp.publish(body);
      if (!ok) {
        appendAudit({
          event: "sbp_publish_failed",
          reason,
          id: body.id,
          status,
        });
        await log("warn", `sbp_publish_failed:${reason}`, { status, text: text?.slice(0, 500) });
      } else {
        appendAudit({
          event: "sbp_publish_ok",
          reason,
          id: body.id,
        });
        await log("info", `sbp_publish_ok:${reason}`, { id: body.id });
      }
    } catch (e) {
      appendAudit({
        event: "sbp_publish_error",
        reason,
        id: body.id,
        err: String(e?.message || e),
      });
      await log("warn", `sbp_publish_error:${reason}`, { err: String(e?.message || e) });
    }
  }

  /**
   * OpenCode `event` hook.
   * @param {{ event?: object }} input
   */
  return async function event(input) {
    const ev = input?.event;
    const type = ev && typeof ev.type === "string" ? ev.type : "";

    const publishReason =
      type === "session.idle"
        ? "session_idle"
        : type === "file.edited"
          ? "file_edited"
          : "unknown";
    appendAudit({
      event: "plugin_event_received",
      openCodeEventType: type || "(missing)",
      publishReason,
    });

    if (type === "session.idle") {
      await publishFailSoft(
        {
          id: randomUUID(),
          stanceTarget: stance,
          baseIntensity: 0.35,
          decayRate: 0.04,
          payload: { source: "opencode-plugin", event: "session.idle" },
        },
        "session_idle",
      );
      return;
    }

    if (type === "file.edited") {
      const path = pickPath(ev);
      await publishFailSoft(
        {
          id: randomUUID(),
          stanceTarget: stance,
          baseIntensity: 0.45,
          decayRate: 0.05,
          payload: { source: "opencode-plugin", event: "file.edited", path },
        },
        "file_edited",
      );
    }
  };
}
