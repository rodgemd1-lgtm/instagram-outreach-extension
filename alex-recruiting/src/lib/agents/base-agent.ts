// Base Agent — Abstract class for all recruiting agents
// Flow: gatherContext → budget check → Claude call → record usage → parse skill calls → execute skills → store actions

import Anthropic from "@anthropic-ai/sdk";
import { db, isDbConfigured } from "@/lib/db";
import {
  agentRuns,
  agentActions,
  agentState,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { executeSkills } from "./skill-executor";
import {
  AgentId,
  AgentClaudeResponse,
  AgentRun,
  REQUIRES_APPROVAL,
  SkillDefinition,
  SkillResultAction,
} from "./types";
import { registerSkills } from "./skill-executor";
import { checkBudget, recordUsage } from "./token-budget";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export abstract class BaseAgent {
  abstract readonly agentId: AgentId;
  abstract readonly name: string;
  abstract readonly systemPrompt: string;
  abstract readonly skills: SkillDefinition[];

  private registered = false;

  private ensureRegistered(): void {
    if (!this.registered) {
      registerSkills(this.agentId, this.skills);
      this.registered = true;
    }
  }

  /** Gather context data for Claude to reason about */
  abstract gatherContext(): Promise<Record<string, unknown>>;

  /** Run the full agent cycle */
  async run(triggeredBy: "cron" | "manual" = "manual"): Promise<AgentRun> {
    this.ensureRegistered();

    const runId = crypto.randomUUID();
    const startedAt = new Date();

    // Pre-flight: check token budget before doing any work
    const budget = checkBudget(this.agentId);
    if (!budget.allowed) {
      console.warn(
        `[${this.agentId}] Skipping run — ${budget.reason} ` +
        `(daily: ${budget.daily.used.toLocaleString()}/${budget.daily.limit.toLocaleString()}, ` +
        `monthly: ${budget.monthly.used.toLocaleString()}/${budget.monthly.limit.toLocaleString()})`
      );
      return {
        id: runId,
        agentId: this.agentId,
        triggeredBy,
        status: "failed",
        startedAt,
        completedAt: new Date(),
        summary: null,
        tokensUsed: 0,
        actionsCreated: 0,
        errorMessage: budget.reason ?? "Token budget exceeded",
      };
    }

    // Record run start
    if (isDbConfigured()) {
      await db.insert(agentRuns).values({
        id: runId,
        agentId: this.agentId,
        triggeredBy,
        status: "running",
        startedAt,
        actionsCreated: 0,
        tokensUsed: 0,
      });
    }

    try {
      // Step 1: Gather context
      const context = await this.gatherContext();

      // Step 2: Call Claude for reasoning + track token usage
      const { response: claudeResponse, tokensUsed } = await this.callClaude(context);

      // Step 2b: Record token usage against budget
      recordUsage(this.agentId, tokensUsed);

      // Step 3: Execute skills based on Claude's decisions
      const skillCalls = claudeResponse.skillCalls.map((sc) => ({
        skillId: sc.skillId,
        parameters: sc.parameters,
      }));

      const { results } = await executeSkills(
        this.agentId,
        skillCalls,
        runId
      );

      // Step 4: Store actions in approval queue
      let actionsCreated = 0;
      for (const [, result] of results) {
        if (result.success && result.actions.length > 0) {
          actionsCreated += await this.storeActions(runId, result.actions);
        }
      }

      // Step 5: Build summary
      const skillSummaries: string[] = [];
      for (const [skillId, result] of results) {
        skillSummaries.push(
          `${skillId}: ${result.success ? "OK" : "FAILED"} (${result.actions.length} actions)`
        );
      }
      const summary = `${claudeResponse.analysis}\n\nSkills: ${skillSummaries.join(", ")}`;

      // Step 6: Update run record
      const completedAt = new Date();
      if (isDbConfigured()) {
        await db
          .update(agentRuns)
          .set({
            status: "completed",
            completedAt,
            summary,
            actionsCreated,
            tokensUsed,
          })
          .where(eq(agentRuns.id, runId));

        // Update agent state
        await db
          .insert(agentState)
          .values({
            agentId: this.agentId,
            lastRunAt: completedAt,
            consecutiveFailures: 0,
            metadata: {},
          })
          .onConflictDoUpdate({
            target: agentState.agentId,
            set: {
              lastRunAt: completedAt,
              consecutiveFailures: 0,
            },
          });
      }

      return {
        id: runId,
        agentId: this.agentId,
        triggeredBy,
        status: "completed",
        startedAt,
        completedAt,
        summary,
        tokensUsed,
        actionsCreated,
        errorMessage: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${this.agentId}] Run failed:`, errorMessage);

      if (isDbConfigured()) {
        await db
          .update(agentRuns)
          .set({
            status: "failed",
            completedAt: new Date(),
            summary: `Error: ${errorMessage}`,
          })
          .where(eq(agentRuns.id, runId));

        // Increment failure counter
        const existing = await db
          .select()
          .from(agentState)
          .where(eq(agentState.agentId, this.agentId));

        const failures = (existing[0]?.consecutiveFailures ?? 0) + 1;
        await db
          .insert(agentState)
          .values({
            agentId: this.agentId,
            lastRunAt: new Date(),
            consecutiveFailures: failures,
            metadata: {},
          })
          .onConflictDoUpdate({
            target: agentState.agentId,
            set: {
              lastRunAt: new Date(),
              consecutiveFailures: failures,
            },
          });
      }

      return {
        id: runId,
        agentId: this.agentId,
        triggeredBy,
        status: "failed",
        startedAt,
        completedAt: new Date(),
        summary: null,
        tokensUsed: 0,
        actionsCreated: 0,
        errorMessage,
      };
    }
  }

  private async callClaude(
    context: Record<string, unknown>
  ): Promise<{ response: AgentClaudeResponse; tokensUsed: number }> {
    const skillDescriptions = this.skills
      .map((s) => `- ${s.id}: ${s.description}`)
      .join("\n");

    const userMessage = `Current context:
${JSON.stringify(context, null, 2)}

Available skills:
${skillDescriptions}

Analyze the context and decide which skills to execute. Respond with valid JSON only:
{
  "analysis": "Brief analysis of current state and what needs to happen",
  "skillCalls": [
    { "skillId": "skill_name", "reasoning": "Why this skill", "parameters": {} }
  ]
}`;

    const apiResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: this.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract token usage from Claude API response
    const tokensUsed =
      (apiResponse.usage?.input_tokens ?? 0) +
      (apiResponse.usage?.output_tokens ?? 0);

    const text =
      apiResponse.content[0].type === "text" ? apiResponse.content[0].text : "";

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]!.trim()) as AgentClaudeResponse;

    return { response: parsed, tokensUsed };
  }

  private async storeActions(
    runId: string,
    actions: SkillResultAction[]
  ): Promise<number> {
    if (!isDbConfigured()) return actions.length;

    for (const action of actions) {
      const requiresApproval = REQUIRES_APPROVAL.includes(action.actionType);

      await db.insert(agentActions).values({
        id: crypto.randomUUID(),
        agentId: this.agentId,
        runId,
        actionType: action.actionType,
        title: action.title,
        description: action.description,
        payload: action.payload,
        status: requiresApproval ? "pending_approval" : "approved",
        priority: action.priority,
        expiresAt: action.expiresAt ?? null,
      });

      // Auto-execute actions that don't need approval
      if (!requiresApproval) {
        // These are informational — already stored as data
      }
    }

    return actions.length;
  }
}
