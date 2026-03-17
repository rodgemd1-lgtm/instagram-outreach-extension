// Skill Executor — Maps skill IDs to functions and runs them

import { SkillDefinition, SkillContext, SkillResult, AgentId } from "./types";

type SkillRegistry = Map<string, SkillDefinition>;

const registries = new Map<AgentId, SkillRegistry>();

export function registerSkills(agentId: AgentId, skills: SkillDefinition[]): void {
  const registry: SkillRegistry = new Map();
  for (const skill of skills) {
    registry.set(skill.id, skill);
  }
  registries.set(agentId, registry);
}

export function getSkill(agentId: AgentId, skillId: string): SkillDefinition | undefined {
  return registries.get(agentId)?.get(skillId);
}

export function getAgentSkills(agentId: AgentId): SkillDefinition[] {
  const registry = registries.get(agentId);
  return registry ? Array.from(registry.values()) : [];
}

export async function executeSkill(
  agentId: AgentId,
  skillId: string,
  context: SkillContext
): Promise<SkillResult> {
  const skill = getSkill(agentId, skillId);
  if (!skill) {
    return {
      success: false,
      actions: [],
      error: `Skill "${skillId}" not found for agent "${agentId}"`,
    };
  }

  try {
    const result = await skill.execute(context);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${agentId}] Skill "${skillId}" failed:`, message);
    return {
      success: false,
      actions: [],
      error: message,
    };
  }
}

export async function executeSkills(
  agentId: AgentId,
  skillIds: { skillId: string; parameters?: Record<string, unknown> }[],
  runId: string
): Promise<{ results: Map<string, SkillResult>; totalActions: number }> {
  const results = new Map<string, SkillResult>();
  let totalActions = 0;

  for (const { skillId, parameters } of skillIds) {
    const context: SkillContext = { runId, agentId, parameters };
    const result = await executeSkill(agentId, skillId, context);
    results.set(skillId, result);
    totalActions += result.actions.length;
  }

  return { results, totalActions };
}
