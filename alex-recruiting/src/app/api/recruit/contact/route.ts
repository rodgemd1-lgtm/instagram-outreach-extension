import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

const FALLBACK_PATH = path.join(process.cwd(), ".coach-inquiries.json");

interface CoachInquiryRecord {
  coach_name: string;
  school_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

async function readFallbackInquiries(): Promise<CoachInquiryRecord[]> {
  try {
    return JSON.parse(await fs.readFile(FALLBACK_PATH, "utf8")) as CoachInquiryRecord[];
  } catch {
    return [];
  }
}

async function appendFallbackInquiry(inquiry: CoachInquiryRecord) {
  const existing = await readFallbackInquiries();
  existing.unshift(inquiry);
  await fs.writeFile(FALLBACK_PATH, JSON.stringify(existing, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, school, email, phone, message } = body;
    const inquiry: CoachInquiryRecord = {
      coach_name: name,
      school_name: school,
      email,
      phone: phone || null,
      message: message || null,
      status: "new",
      created_at: new Date().toISOString(),
    };

    if (!name || !school || !email) {
      return NextResponse.json(
        { error: "Name, school, and email are required." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { error } = await supabase.from("coach_inquiries").insert(inquiry);

      if (error) {
        console.error("Supabase insert error:", error);
        await appendFallbackInquiry(inquiry);
      }
    } else {
      await appendFallbackInquiry(inquiry);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission." },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(await readFallbackInquiries());
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coach_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(await readFallbackInquiries());
  }

  return NextResponse.json(data);
}
