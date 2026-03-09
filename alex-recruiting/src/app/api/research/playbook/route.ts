import { NextResponse } from "next/server";
import {
  PLAYBOOK_QUESTIONS,
  COACH_PERSONAS,
  AB_VARIANT_SPECS,
  buildPlaybookPrompt,
} from "@/lib/research/playbook";

/**
 * POST /api/research/playbook
 *
 * Generates the Coach Decision Playbook prompt and returns structured metadata.
 * In production, this would call Susan's run_agent MCP tool with the prompt
 * for agents: freya, flow, and recruiting-strategy-studio.
 * For now, returns the structured prompt and metadata for manual use.
 */
export async function POST() {
  const prompt = buildPlaybookPrompt();

  return NextResponse.json({
    prompt,
    questions: PLAYBOOK_QUESTIONS,
    personas: COACH_PERSONAS,
    variants: AB_VARIANT_SPECS,
    agents: ["freya", "flow", "recruiting-strategy-studio"],
    status: "ready",
  });
}
