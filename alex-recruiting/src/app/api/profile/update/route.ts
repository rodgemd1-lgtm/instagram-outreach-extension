import { NextRequest, NextResponse } from "next/server";
import {
  updateProfileWithFeedback,
} from "@/lib/integrations/x-api";

interface ProfileUpdatePayload {
  displayName?: unknown;
  bio?: unknown;
  location?: unknown;
  websiteUrl?: unknown;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error("Profile fields must be strings");
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProfileUpdatePayload;

    const name = normalizeOptionalString(body.displayName);
    const description = normalizeOptionalString(body.bio);
    const location = normalizeOptionalString(body.location);
    const url = normalizeOptionalString(body.websiteUrl);

    if (
      name === undefined &&
      description === undefined &&
      location === undefined &&
      url === undefined
    ) {
      return NextResponse.json(
        { error: "Provide at least one profile field to update." },
        { status: 400 }
      );
    }

    const result = await updateProfileWithFeedback({
      name,
      description,
      location,
      url,
    });

    if (!result) {
      return NextResponse.json(
        { error: "X profile update failed. Verify the configured account tokens and try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: {
        displayName: result.skippedFields.includes("name") ? undefined : name,
        bio: description,
        location,
        websiteUrl: url,
      },
      skippedFields: result.skippedFields,
      warning: result.skippedFields.includes("name")
        ? "X accepted the bio, location, and website update, but skipped the display name because the account is currently under review."
        : undefined,
      profile: result.profile,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update X profile";
    const status =
      message === "Profile fields must be strings"
        ? 400
        : /profile-tools account|credentials are configured/i.test(message)
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
