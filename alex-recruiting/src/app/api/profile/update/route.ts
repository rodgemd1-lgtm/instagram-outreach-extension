import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/integrations/x-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bio, displayName, location, websiteUrl } = body as {
      bio?: string;
      displayName?: string;
      location?: string;
      websiteUrl?: string;
    };

    const updatedData = await updateProfile({
      description: bio,
      name: displayName,
      location,
      url: websiteUrl,
    });

    if (!updatedData) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: updatedData });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
