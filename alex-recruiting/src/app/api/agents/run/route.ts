import { NextRequest, NextResponse } from "next/server";
import { triggerAgent } from "@/lib/agents/orchestrator";
import { AgentId, AGENT_CONFIGS } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId } = body as { agentId: string };

    if (!agentId || !AGENT_CONFIGS[agentId as AgentId]) {
      return NextResponse.json(
        { error: `Invalid agentId. Valid: ${Object.keys(AGENT_CONFIGS).join(", ")}` },
        { status: 400 }
      );
    }

    const result = await triggerAgent(agentId as AgentId, "manual");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
