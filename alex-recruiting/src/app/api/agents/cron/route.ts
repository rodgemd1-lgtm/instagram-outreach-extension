import { NextRequest, NextResponse } from "next/server";
import { triggerAgent } from "@/lib/agents/orchestrator";
import { AgentId, AGENT_CONFIGS } from "@/lib/agents/types";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = request.nextUrl.searchParams.get("agent") as AgentId | null;

  if (!agentId || !AGENT_CONFIGS[agentId]) {
    return NextResponse.json(
      { error: `Invalid agent. Valid: ${Object.keys(AGENT_CONFIGS).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = await triggerAgent(agentId, "cron");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
