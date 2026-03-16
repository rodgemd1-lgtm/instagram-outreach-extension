import { NextResponse } from "next/server";
import { verifyHandle } from "@/lib/integrations/x-api";

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
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
