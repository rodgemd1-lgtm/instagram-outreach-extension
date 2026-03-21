import { NextRequest, NextResponse } from "next/server";
import { ensureBuckets } from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureBuckets();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Storage init failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize storage buckets" },
      { status: 500 }
    );
  }
}
