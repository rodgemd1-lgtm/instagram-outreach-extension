import { NextResponse } from "next/server";
import { isDbConfigured, db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getAllAssets } from "@/lib/video/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isDbConfigured()) {
      const assets = await db
        .select()
        .from(videoAssets)
        .orderBy(desc(videoAssets.createdAt));

      return NextResponse.json({ assets, total: assets.length });
    }

    // In-memory fallback
    const assets = getAllAssets();
    return NextResponse.json({ assets, total: assets.length });
  } catch (error) {
    console.error("Failed to fetch video assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch video assets" },
      { status: 500 }
    );
  }
}
