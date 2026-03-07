// Orchestrator — Triggers agents, resolves conflicts, executes approved actions

import { db, isDbConfigured } from "@/lib/db";
import { agentActions, agentRuns, agentState } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { AgentId, AgentActionStatus, AGENT_CONFIGS } from "./types";
import { updateProfile, postTweet, sendDM } from "@/lib/integrations/x-api";
import { validateDM, validatePost } from "./compliance-guardian";
import type { Division } from "./compliance-guardian";

// Lazy-load agents to avoid circular imports
async function getAgent(agentId: AgentId) {
  switch (agentId) {
    case "coach-intelligence": {
      const { CoachIntelligenceAgent } = await import("./coach-intelligence/agent");
      return new CoachIntelligenceAgent();
    }
    case "profile-optimizer": {
      const { ProfileOptimizerAgent } = await import("./profile-optimizer/agent");
      return new ProfileOptimizerAgent();
    }
    case "timing-optimizer": {
      const { TimingOptimizerAgent } = await import("./timing-optimizer/agent");
      return new TimingOptimizerAgent();
    }
    case "placement-analyst": {
      const { PlacementAnalystAgent } = await import("./placement-analyst/agent");
      return new PlacementAnalystAgent();
    }
  }
}

/** Trigger a specific agent run */
export async function triggerAgent(
  agentId: AgentId,
  triggeredBy: "cron" | "manual" = "manual"
) {
  const config = AGENT_CONFIGS[agentId];
  if (!config) throw new Error(`Unknown agent: ${agentId}`);

  // Check for consecutive failures — skip if 3+ recent failures
  if (isDbConfigured()) {
    const state = await db
      .select()
      .from(agentState)
      .where(eq(agentState.agentId, agentId));

    if (state[0]?.consecutiveFailures && state[0].consecutiveFailures >= 3) {
      console.warn(`[orchestrator] Skipping ${agentId}: ${state[0].consecutiveFailures} consecutive failures`);
      return {
        skipped: true,
        reason: `${state[0].consecutiveFailures} consecutive failures. Reset agent state to retry.`,
      };
    }
  }

  const agent = await getAgent(agentId);
  return agent.run(triggeredBy);
}

/** Get pending actions for review */
export async function getPendingActions(agentId?: AgentId) {
  if (!isDbConfigured()) return [];

  const conditions = [eq(agentActions.status, "pending_approval")];
  if (agentId) {
    conditions.push(eq(agentActions.agentId, agentId));
  }

  return db
    .select()
    .from(agentActions)
    .where(and(...conditions))
    .orderBy(desc(agentActions.priority), desc(agentActions.createdAt));
}

/** Approve or reject an action */
export async function updateActionStatus(
  actionId: string,
  newStatus: "approved" | "rejected"
) {
  if (!isDbConfigured()) return null;

  const [action] = await db
    .select()
    .from(agentActions)
    .where(eq(agentActions.id, actionId));

  if (!action) throw new Error(`Action ${actionId} not found`);
  if (action.status !== "pending_approval") {
    throw new Error(`Action ${actionId} is ${action.status}, not pending_approval`);
  }

  await db
    .update(agentActions)
    .set({ status: newStatus })
    .where(eq(agentActions.id, actionId));

  // Execute if approved
  if (newStatus === "approved") {
    await executeAction(action);
  }

  return { ...action, status: newStatus };
}

/** Bulk approve/reject actions */
export async function bulkUpdateActions(
  actionIds: string[],
  newStatus: "approved" | "rejected"
) {
  if (!isDbConfigured()) return [];

  const actions = await db
    .select()
    .from(agentActions)
    .where(
      and(
        inArray(agentActions.id, actionIds),
        eq(agentActions.status, "pending_approval")
      )
    );

  for (const action of actions) {
    await db
      .update(agentActions)
      .set({ status: newStatus })
      .where(eq(agentActions.id, action.id));

    if (newStatus === "approved") {
      await executeAction(action);
    }
  }

  return actions.map((a) => ({ ...a, status: newStatus }));
}

/** Execute an approved action — the bridge to real X API calls.
 *  All outbound DMs and posts pass through the Compliance Guardian
 *  before reaching the X API. If compliance fails, the action is
 *  rejected and never sent.
 */
async function executeAction(action: typeof agentActions.$inferSelect) {
  const payload = action.payload as Record<string, unknown>;

  try {
    switch (action.actionType) {
      case "update_bio": {
        await updateProfile({
          description: payload.bio as string,
          name: payload.name as string | undefined,
          location: payload.location as string | undefined,
        });
        break;
      }
      case "schedule_post": {
        // --- Compliance Guardian gate ---
        const postCheck = await validatePost({
          content: payload.content as string,
          mentionsCoach: !!(payload.mentionsCoach as boolean | undefined),
          mentionsSchool: !!(payload.mentionsSchool as boolean | undefined),
          platform: (payload.platform as "x" | "instagram") || "x",
        });

        if (!postCheck.allowed) {
          console.warn(
            `[orchestrator] Compliance Guardian BLOCKED post (action ${action.id}): ${postCheck.reason}`,
            postCheck.violations
          );
          await db
            .update(agentActions)
            .set({ status: "rejected" as AgentActionStatus })
            .where(eq(agentActions.id, action.id));
          return;
        }

        await postTweet(payload.content as string);
        break;
      }
      case "send_dm": {
        // --- Compliance Guardian gate ---
        const dmCheck = await validateDM({
          coachName: (payload.coachName as string) || "Unknown Coach",
          schoolName: (payload.schoolName as string) || "Unknown School",
          division: ((payload.division as string) || "D2") as Division,
          messageContent: payload.content as string,
          athleteClassYear: (payload.athleteClassYear as number) || 2029,
        });

        if (!dmCheck.allowed) {
          console.warn(
            `[orchestrator] Compliance Guardian BLOCKED DM (action ${action.id}): ${dmCheck.reason}`,
            dmCheck.rule
          );
          await db
            .update(agentActions)
            .set({ status: "rejected" as AgentActionStatus })
            .where(eq(agentActions.id, action.id));
          return;
        }

        if (dmCheck.reason) {
          // Advisory warning — log but allow sending
          console.info(
            `[orchestrator] Compliance Guardian advisory (action ${action.id}): ${dmCheck.reason}`
          );
        }

        await sendDM(
          payload.recipientId as string,
          payload.content as string
        );
        break;
      }
      // Media prompts, scores, alerts — no external action needed
      default:
        break;
    }

    await db
      .update(agentActions)
      .set({ status: "executed" as AgentActionStatus })
      .where(eq(agentActions.id, action.id));
  } catch (error) {
    console.error(`[orchestrator] Failed to execute action ${action.id}:`, error);
    // Keep as approved — can retry later
  }
}

/** Get agent health status */
export async function getAgentStatus() {
  if (!isDbConfigured()) {
    return Object.values(AGENT_CONFIGS).map((config) => ({
      ...config,
      lastRunAt: null,
      consecutiveFailures: 0,
      lastRunStatus: null,
      pendingActions: 0,
    }));
  }

  const states = await db.select().from(agentState);
  const stateMap = new Map(states.map((s) => [s.agentId, s]));

  const recentRuns = await db
    .select()
    .from(agentRuns)
    .orderBy(desc(agentRuns.startedAt))
    .limit(20);

  const pendingCounts = await db
    .select()
    .from(agentActions)
    .where(eq(agentActions.status, "pending_approval"));

  const pendingByAgent = new Map<string, number>();
  for (const action of pendingCounts) {
    pendingByAgent.set(
      action.agentId,
      (pendingByAgent.get(action.agentId) ?? 0) + 1
    );
  }

  return Object.values(AGENT_CONFIGS).map((config) => {
    const state = stateMap.get(config.id);
    const lastRun = recentRuns.find((r) => r.agentId === config.id);

    return {
      ...config,
      lastRunAt: state?.lastRunAt ?? null,
      consecutiveFailures: state?.consecutiveFailures ?? 0,
      lastRunStatus: lastRun?.status ?? null,
      lastRunSummary: lastRun?.summary ?? null,
      pendingActions: pendingByAgent.get(config.id) ?? 0,
    };
  });
}
