import { createSbpClient } from "./sbpClient.mjs";
import { appendAudit, auditLogEnabled } from "./auditLog.mjs";
import { buildEventHandler } from "./events.mjs";
import { buildTools } from "./tools.mjs";
import { loadOrchestrationPolicy } from "./orchestration.mjs";
import { resolveSbpBaseUrl } from "./superviseSbp.mjs";

/** OpenCode plugin entry — wires sessions to SBP + graph CLIs (FR-5.x). */
export async function StigmergyPlugin(ctx) {
  const { client, $, directory, worktree } = ctx;
  const repoRoot = (worktree || directory || process.cwd()).trim();
  const baseUrl = await resolveSbpBaseUrl({ repoRoot });
  const defaultStance = (process.env.STIGMERGY_DEFAULT_STANCE || "feature_implementation").trim();

  const sbp = createSbpClient({ baseUrl });
  const orchestrationPolicy = loadOrchestrationPolicy();
  const event = buildEventHandler({ sbp, client, defaultStance });
  const tool = buildTools({ sbp, client, $, repoRoot, orchestrationPolicy });

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
