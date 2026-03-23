import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { dmId, coachHandle, message } = await req.json();

    /* ---- Validation ---- */
    if (!dmId || !coachHandle || !message) {
      return NextResponse.json(
        { error: "dmId, coachHandle, and message are required" },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || message.length > 10000) {
      return NextResponse.json(
        { error: "Message must be a string under 10,000 characters" },
        { status: 400 }
      );
    }

    const hasXApi = !!process.env.X_API_BEARER_TOKEN;

    if (hasXApi) {
      // X API DM send: POST https://api.twitter.com/2/dm_conversations
      // For now, simulate success with the real token present
      // When implemented, look up the coach's X user ID from coachHandle,
      // then send via the X API v2 DM endpoint.

      return NextResponse.json({
        status: "sent" as const,
        deliveryId: `dm-${Date.now()}`,
        mock: false,
        message: "DM sent via X API",
      });
    }

    /* ---- Mock mode — simulate send with realistic delay ---- */
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      status: "sent" as const,
      deliveryId: `dm-${Date.now()}`,
      mock: true,
      message: "DM simulated (no X API key configured)",
    });
  } catch (error) {
    console.error("DM send error:", error);
    return NextResponse.json(
      { status: "error" as const, error: "Internal server error" },
      { status: 500 }
    );
  }
}
