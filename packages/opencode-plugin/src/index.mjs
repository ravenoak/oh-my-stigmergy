import { createSbpClient } from "./sbpClient.mjs";
import { appendAudit, auditLogEnabled } from "./auditLog.mjs";
import { buildEventHandler } from "./events.mjs";
import { buildTools } from "./tools.mjs";

const DEFAULT_SBP = "http://127.0.0.1:3847";

/** OpenCode plugin entry — wires sessions to SBP + graph CLIs (FR-5.x). */
export async function StigmergyPlugin(ctx) {
  const { client, $, directory, worktree } = ctx;
  const raw = (process.env.SBP_URL || DEFAULT_SBP).trim();
  const baseUrl = raw || DEFAULT_SBP;
  const repoRoot = (worktree || directory || process.cwd()).trim();
  const defaultStance = (process.env.STIGMERGY_DEFAULT_STANCE || "feature_implementation").trim();

  const sbp = createSbpClient({ baseUrl });
  const event = buildEventHandler({ sbp, client, defaultStance });
  const tool = buildTools({ sbp, client, $, repoRoot });

  if (client?.app?.log) {
    try {
      await client.app.log({
        body: {
          service: "@oh-my-stigmergy/opencode-plugin",
          level: "info",
          message: "StigmergyPlugin_initialized",
          extra: { baseUrl, repoRoot },
        },
      });
    } catch {
      /* ignore */
    }
  }

  appendAudit({
    event: "plugin_initialized",
    baseUrl,
    repoRoot,
    auditEnabled: auditLogEnabled(),
  });

  return { event, tool };
}
