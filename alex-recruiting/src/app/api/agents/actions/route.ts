import { NextRequest, NextResponse } from "next/server";
import { getPendingActions, bulkUpdateActions } from "@/lib/agents/orchestrator";
import { AgentId } from "@/lib/agents/types";

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId") as AgentId | null;
    const actions = await getPendingActions(agentId ?? undefined);
    return NextResponse.json({ actions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionIds, status } = body as {
      actionIds: string[];
      status: "approved" | "rejected";
    };

    if (!actionIds?.length || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Required: actionIds (string[]) and status (approved|rejected)" },
        { status: 400 }
      );
    }

    const results = await bulkUpdateActions(actionIds, status);
    return NextResponse.json({ updated: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
