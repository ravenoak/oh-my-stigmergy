import { tool } from "@opencode-ai/plugin";
import { appendAudit, classifyPluginToolReturn } from "./auditLog.mjs";
import {
  filterActionablePheromones,
  resolveActionableToolParams,
  resolveModelForStance,
} from "./orchestration.mjs";

/**
 * @param {string} p
 */
function truncateRoot(p) {
  const s = String(p || "");
  return s.length <= 512 ? s : `${s.slice(0, 509)}...`;
}

/**
 * @param {string} toolName
 * @param {(ctx: any) => string} getRoot
 * @param {(args: any, context: any) => Promise<string>} fn
 */
function withAudit(toolName, getRoot, fn) {
  return async function execute(args, context) {
    const t0 = Date.now();
    const result = await fn(args, context);
    const durationMs = Date.now() - t0;
    const cls = classifyPluginToolReturn(String(result), toolName);
    const ok =
      cls === "ok" ||
      (toolName === "stigmergy_pheromones" && !String(result).startsWith("sbp_error:"));
    appendAudit({
      event: "tool_execute",
      tool: toolName,
      ok,
      class: cls,
      durationMs,
      repoRoot: truncateRoot(getRoot(context)),
    });
    return result;
  };
}

/**
 * @param {{ sbp: ReturnType<import("./sbpClient.mjs").createSbpClient>; client: any; $: any; repoRoot: string; orchestrationPolicy: object }} opts
 */
export function buildTools({ sbp, client, $, repoRoot, orchestrationPolicy }) {
  const z = tool.schema;

  const publishSchema = z.object({
    id: z.string().min(1),
    stanceTarget: z.string().min(1),
    baseIntensity: z.number(),
    decayRate: z.number(),
    kind: z.string().min(1).optional(),
    payloadJson: z.string().optional(),
  });
  const idSchema = z.object({ id: z.string().min(1) });
  const loadNodeSchema = z.object({
    node_id: z.string().min(1),
    depth: z.number().int().min(0).max(3).optional(),
    edge_kind: z.string().optional(),
  });
  const aspectSchema = z.object({ kinds: z.string().optional() });
  const actionableSchema = z.object({
    olfactory_threshold: z.number().min(0).max(1).optional(),
    stance_target: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  });
  const resolveModelSchema = z.object({
    stance_target: z.string().min(1),
  });

  async function slog(level, message, extra = {}) {
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
      /* ignore */
    }
  }

  /** @param {import("@opencode-ai/plugin").ToolContext} context */
  function rootDir(context) {
    return (repoRoot || context.worktree || context.directory || process.cwd()).trim();
  }

  return {
    stigmergy_publish: tool({
      description:
        "Publish a pheromone to the SBP ledger (POST /pheromones). Requires SBP_URL and a running sbp-server.",
      args: {
        id: z.string().min(1),
        stanceTarget: z.string().min(1),
        baseIntensity: z.number(),
        decayRate: z.number(),
        kind: z.string().min(1).optional(),
        payloadJson: z.string().optional(),
      },
      execute: withAudit("stigmergy_publish", rootDir, async (args, _context) => {
        const parsed = publishSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        const a = parsed.data;
        try {
          /** @type {Record<string, unknown>} */
          const body = {
            id: a.id,
            stanceTarget: a.stanceTarget,
            baseIntensity: a.baseIntensity,
            decayRate: a.decayRate,
          };
          if (a.kind) body.kind = a.kind;
          if (a.payloadJson) {
            try {
              body.payload = JSON.parse(a.payloadJson);
            } catch (e) {
              return `payloadJson_invalid:${String(e?.message || e)}`;
            }
          }
          const { ok, status, text } = await sbp.publish(body);
          if (!ok) {
            if (text?.startsWith("auth_error:") || text === "kind_unregistered") return text;
            return `sbp_error:${status}:${text?.slice(0, 2000) || ""}`;
          }
          await slog("info", "stigmergy_publish_ok", { id: a.id });
          return "ok";
        } catch (e) {
          await slog("warn", "stigmergy_publish_exception", { err: String(e?.message || e) });
          return `sbp_error:${String(e?.message || e)}`;
        }
      }),
    }),

    stigmergy_pheromones: tool({
      description: "List current pheromones from SBP (GET /pheromones).",
      args: {},
      execute: withAudit("stigmergy_pheromones", rootDir, async (_args, _context) => {
        try {
          const { ok, status, text } = await sbp.listPheromones();
          if (!ok) return `sbp_error:${status}:${text?.slice(0, 2000) || ""}`;
          return text || "[]";
        } catch (e) {
          return `sbp_error:${String(e?.message || e)}`;
        }
      }),
    }),

    stigmergy_claim: tool({
      description: "Claim a pheromone id (POST /pheromones/:id/claim).",
      args: { id: z.string().min(1) },
      execute: withAudit("stigmergy_claim", rootDir, async (args, _context) => {
        const parsed = idSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        try {
          const { ok, status, text } = await sbp.claim(parsed.data.id);
          if (status === 409) return "claimed_conflict:409";
          if (!ok) {
            if (text?.startsWith("auth_error:")) return text;
            return `sbp_error:${status}:${text?.slice(0, 2000) || ""}`;
          }
          return "ok";
        } catch (e) {
          return `sbp_error:${String(e?.message || e)}`;
        }
      }),
    }),

    stigmergy_inflate: tool({
      description: "Inflate a pheromone (POST /pheromones/:id/inflate).",
      args: { id: z.string().min(1) },
      execute: withAudit("stigmergy_inflate", rootDir, async (args, _context) => {
        const parsed = idSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        try {
          const { ok, status, text } = await sbp.inflate(parsed.data.id);
          if (!ok) {
            if (text?.startsWith("auth_error:")) return text;
            return `sbp_error:${status}:${text?.slice(0, 2000) || ""}`;
          }
          return "ok";
        } catch (e) {
          return `sbp_error:${String(e?.message || e)}`;
        }
      }),
    }),

    graph_load_node: tool({
      description:
        "Run graph.load_node (uv run python -m graph.load_node). Args: node_id, optional depth (0–3), optional edge_kind (IMPORTS,SOURCES,CALLS).",
      args: {
        node_id: z.string().min(1),
        depth: z.number().int().min(0).max(3).optional(),
        edge_kind: z.string().optional(),
      },
      execute: withAudit("graph_load_node", rootDir, async (args, context) => {
        const parsed = loadNodeSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        const a = parsed.data;
        const root = rootDir(context);
        if (typeof $ !== "function") {
          return "graph_error:shell_$ unavailable in this context";
        }
        try {
          const d = a.depth;
          const ek = a.edge_kind?.trim();
          /** Bun / OpenCode shell template */
          if (d !== undefined && d !== null && ek) {
            const out = await $`uv run python -m graph.load_node ${root} ${a.node_id} --depth ${d} --edge-kind ${ek}`.cwd(root);
            return typeof out.text === "function" ? await out.text() : String(out);
          }
          if (d !== undefined && d !== null) {
            const out = await $`uv run python -m graph.load_node ${root} ${a.node_id} --depth ${d}`.cwd(root);
            return typeof out.text === "function" ? await out.text() : String(out);
          }
          if (ek) {
            const out = await $`uv run python -m graph.load_node ${root} ${a.node_id} --edge-kind ${ek}`.cwd(root);
            return typeof out.text === "function" ? await out.text() : String(out);
          }
          const out = await $`uv run python -m graph.load_node ${root} ${a.node_id}`.cwd(root);
          return typeof out.text === "function" ? await out.text() : String(out);
        } catch (e) {
          return `graph_error:${String(e?.message || e)}`;
        }
      }),
    }),

    graph_aspect: tool({
      description:
        "Run graph.aspect (uv run python -m graph.aspect). Optional kinds: comma-separated IMPORTS,SOURCES,CALLS.",
      args: {
        kinds: z.string().optional(),
      },
      execute: withAudit("graph_aspect", rootDir, async (args, context) => {
        const parsed = aspectSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        const a = parsed.data;
        const root = rootDir(context);
        if (typeof $ !== "function") {
          return "graph_error:shell_$ unavailable in this context";
        }
        try {
          const k = a.kinds?.trim();
          if (k) {
            const out = await $`uv run python -m graph.aspect ${root} --kind ${k}`.cwd(root);
            return typeof out.text === "function" ? await out.text() : String(out);
          }
          const out = await $`uv run python -m graph.aspect ${root}`.cwd(root);
          return typeof out.text === "function" ? await out.text() : String(out);
        } catch (e) {
          return `graph_error:${String(e?.message || e)}`;
        }
      }),
    }),

    stigmergy_resolve_model: tool({
      description:
        "Resolve OpenCode model id for a stanceTarget using stigmergy orchestration policy (STIGMERGY_ORCHESTRATION_CONFIG or built-in defaults). Returns one line: model:<id> or local_preferred:true|false.",
      args: {
        stance_target: z.string().min(1),
      },
      execute: withAudit("stigmergy_resolve_model", rootDir, async (args, _context) => {
        const parsed = resolveModelSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        const stance = parsed.data.stance_target.trim();
        const model = resolveModelForStance(stance, orchestrationPolicy);
        const local =
          orchestrationPolicy.localPreferredStances?.includes(stance) === true ? "true" : "false";
        return `model:${model}\nlocal_preferred:${local}`;
      }),
    }),

    stigmergy_actionable: tool({
      description:
        "List pheromones from SBP at or above an olfactory threshold (computed intensity). Omit olfactory_threshold/limit to use orchestration policy defaults (STIGMERGY_ORCHESTRATION_CONFIG: defaultOlfactoryThreshold, defaultActionableLimit, maxActionable). Optional stance_target filter; returns JSON array subset sorted by intensity.",
      args: {
        olfactory_threshold: z.number().min(0).max(1).optional(),
        stance_target: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
      execute: withAudit("stigmergy_actionable", rootDir, async (args, _context) => {
        const parsed = actionableSchema.safeParse(args);
        if (!parsed.success) {
          return `validation_error:${parsed.error.message}`;
        }
        const a = parsed.data;
        try {
          const { ok, status, text } = await sbp.listPheromones();
          if (!ok) return `sbp_error:${status}:${text?.slice(0, 2000) || ""}`;
          const { olfactoryThreshold, limit: lim, stanceTarget } = resolveActionableToolParams(
            orchestrationPolicy,
            a,
          );
          const json = filterActionablePheromones(text || "[]", {
            olfactoryThreshold,
            stanceTarget,
            limit: lim,
          });
          return json;
        } catch (e) {
          const msg = String(e?.message || e);
          if (msg.startsWith("actionable_parse:")) return msg;
          return `sbp_error:${msg}`;
        }
      }),
    }),
  };
}
