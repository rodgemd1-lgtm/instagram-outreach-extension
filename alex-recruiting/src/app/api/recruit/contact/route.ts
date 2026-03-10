import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

/* ─── Types ──────────────────────────────────────────────────── */

interface CoachInquiryRecord {
  coach_name: string;
  coach_title: string;
  school: string;
  coaching_position: string;
  email: string;
  phone: string | null;
  message: string | null;
  ncaa_compliant: boolean;
  status: string;
  created_at: string;
}

function getTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/* ─── Email notification ─────────────────────────────────────── */

const NOTIFICATION_EMAILS = [
  "rodgemd1@gmail.com",
  "rodgersjen15@gmail.com",
];

/**
 * Send email notification via Resend (if configured) or log for later pickup.
 * Falls back gracefully — never blocks the form submission.
 */
async function sendNotificationEmail(inquiry: CoachInquiryRecord) {
  const resendKey = process.env.RESEND_API_KEY;

  const subject = `🏈 New Coach Inquiry: ${inquiry.coach_name} — ${inquiry.school}`;
  const body = [
    `A coach just reached out through Jacob's recruiting page.`,
    ``,
    `Name: ${inquiry.coach_name}`,
    inquiry.coach_title ? `Title: ${inquiry.coach_title}` : null,
    `School: ${inquiry.school}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    ``,
    inquiry.message ? `Message:\n${inquiry.message}` : `(No message included)`,
    ``,
    `Submitted: ${new Date(inquiry.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
    ``,
    `---`,
    `Reply directly to ${inquiry.email} to continue the conversation.`,
  ]
    .filter(Boolean)
    .join("\n");

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Jacob Rodgers Recruiting <onboarding@resend.dev>",
          to: NOTIFICATION_EMAILS,
          reply_to: inquiry.email,
          subject,
          text: body,
        }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "unknown");
        console.error("Resend send error:", err);
      }
    } catch (err) {
      console.error("Resend notification failed:", err);
    }
  } else {
    // No email service configured — log the inquiry for manual review
    console.log("═══ NEW COACH INQUIRY (no email service configured) ═══");
    console.log(body);
    console.log("═══════════════════════════════════════════════════════");
  }
}

/* ─── POST — receive form submission ─────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = getTrimmedString(body.name);
    const title = getTrimmedString(body.title);
    const school = getTrimmedString(body.school);
    const email = getTrimmedString(body.email);
    const phone = getTrimmedString(body.phone);
    const message = getTrimmedString(body.message);

    if (!name || !title || !school || !email) {
      return NextResponse.json(
        { error: "Name, title, school, and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Recruit contact storage is unavailable." },
        { status: 503 }
      );
    }

    const inquiry: CoachInquiryRecord = {
      coach_name: name,
      coach_title: title,
      school,
      coaching_position: title,
      email,
      phone,
      message,
      ncaa_compliant: false,
      status: "new",
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("coach_inquiries").insert(inquiry);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save inquiry. Please email us directly." },
        { status: 500 }
      );
    }

    // Send email notification (async, non-blocking)
    sendNotificationEmail(inquiry).catch((err) =>
      console.error("Notification error:", err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recruit contact submission failed:", error);
    return NextResponse.json(
      { error: "Failed to process submission." },
      { status: 500 }
    );
  }
}

/* ─── GET — list inquiries ───────────────────────────────────── */

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
    console.error("Supabase read error:", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}
