import { NextResponse } from "next/server";

import {
  X_DEFAULT_SCOPES,
  getXOAuthConnectionStatus,
} from "@/lib/integrations/x-oauth";
import { isLegacyXWriteConfigured } from "@/lib/integrations/x-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getXOAuthConnectionStatus(X_DEFAULT_SCOPES);

    return NextResponse.json({
      ...status,
      legacyProfileToolsAvailable:
        status.legacyProfileConnected || isLegacyXWriteConfigured(),
    });
  } catch (error) {
    console.error("Failed to load X connection status:", error);
    return NextResponse.json(
      { error: "Failed to load X connection status" },
      { status: 500 }
    );
  }
}
