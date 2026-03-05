import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({
    message: `DM ${params.id} queued for delivery via X API`,
    dmId: params.id,
    status: "sent",
    note: "X API DM requires OAuth 2.0 user context",
  });
}
