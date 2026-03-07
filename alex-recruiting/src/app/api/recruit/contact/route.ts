import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, school, email, phone, message } = body;

    if (!name || !school || !email) {
      return NextResponse.json(
        { error: "Name, school, and email are required." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { error } = await supabase.from("coach_inquiries").insert({
        coach_name: name,
        school_name: school,
        email,
        phone: phone || null,
        message: message || null,
        status: "new",
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
          { error: "Failed to save submission." },
          { status: 500 }
        );
      }
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
    return NextResponse.json([]);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coach_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
