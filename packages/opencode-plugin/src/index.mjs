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
  const agentToken = (process.env.STIGMERGY_AGENT_TOKEN || "").trim() || undefined;

  const sbp = createSbpClient({ baseUrl, token: agentToken });
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

/**
 * PluginModule shape required by @opencode-ai/plugin 1.14.x hosts
 * (opencode >= 1.14 expects `{ server: Plugin }` on the module when resolved
 * by package name). Exposed both as a named `server` export and as the
 * module default. Kept alongside the named `StigmergyPlugin` export for
 * backward compatibility with older hosts and this package's own tests.
 */
export const server = StigmergyPlugin;
export default {
  id: "@oh-my-stigmergy/opencode-plugin",
  server: StigmergyPlugin,
};
