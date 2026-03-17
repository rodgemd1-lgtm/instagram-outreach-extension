import { NextResponse } from "next/server";
import { verifyHandle } from "@/lib/integrations/x-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await verifyHandle("JacobRodge52987");
    if (!user) {
      return NextResponse.json(
        { error: "Could not fetch profile" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      description: user.description,
      profile_image_url: user.profile_image_url?.replace("_normal", "_400x400"),
      public_metrics: user.public_metrics,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("[profile/info] Failed to fetch X profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile", details }, { status: 500 });
  }
}
