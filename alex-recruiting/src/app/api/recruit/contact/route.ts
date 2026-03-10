import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

/* ─── Types ──────────────────────────────────────────────────── */

interface CoachInquiryRecord {
  coach_name: string;
  coach_title: string | null;
  school_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
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

  const subject = `🏈 New Coach Inquiry: ${inquiry.coach_name} — ${inquiry.school_name}`;
  const body = [
    `A coach just reached out through Jacob's recruiting page.`,
    ``,
    `Name: ${inquiry.coach_name}`,
    inquiry.coach_title ? `Title: ${inquiry.coach_title}` : null,
    `School: ${inquiry.school_name}`,
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
          from: "Jacob Rodgers Recruiting <notifications@jacobrodgers.com>",
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
    const { name, title, school, email, phone, message } = body;

    if (!name || !school || !email) {
      return NextResponse.json(
        { error: "Name, school, and email are required." },
        { status: 400 }
      );
    }

    const inquiry: CoachInquiryRecord = {
      coach_name: name,
      coach_title: title || null,
      school_name: school,
      email,
      phone: phone || null,
      message: message || null,
      status: "new",
      created_at: new Date().toISOString(),
    };

    // Store in Supabase
    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { error } = await supabase.from("coach_inquiries").insert(inquiry);

      if (error) {
        console.error("Supabase insert error:", error);
        // Don't fail the request — still send notification
      }
    }

    // Send email notification (async, non-blocking)
    sendNotificationEmail(inquiry).catch((err) =>
      console.error("Notification error:", err)
    );

    return NextResponse.json({ success: true });
  } catch {
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
