import { NextResponse } from "next/server";
import { ensureBuckets } from "@/lib/supabase/storage";

export async function POST() {
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
