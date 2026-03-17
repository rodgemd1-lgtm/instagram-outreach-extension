import { NextResponse } from "next/server";
import { getAgentStatus } from "@/lib/agents/orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getAgentStatus();
    return NextResponse.json({ agents: status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
