/**
 * /api/notifications — Notification center API
 * GET  — Return all notifications (supports ?unread=true filter)
 * PATCH — Mark notification as read (body: { id } or { markAllRead: true })
 *
 * Uses an in-memory store until a notifications table is added.
 */

import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: string;
  type:
    | "coach_view"
    | "dm_response"
    | "deadline"
    | "camp_reminder"
    | "content_approved"
    | "email_opened";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// In-memory seed data (replaced by DB later)
// ---------------------------------------------------------------------------
// Empty default — notifications are populated by real events (coach views,
// DM responses, deadlines).  No hardcoded fake data.
const notifications: Notification[] = [];

// ---------------------------------------------------------------------------
// GET  /api/notifications?unread=true
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  let results = [...notifications];

  if (unreadOnly) {
    results = results.filter((n) => !n.read);
  }

  // Sort by createdAt descending (newest first)
  results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ notifications: results });
}

// ---------------------------------------------------------------------------
// PATCH  /api/notifications  — mark read
// Body: { id: string } | { markAllRead: true }
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.markAllRead === true) {
      notifications.forEach((n) => {
        n.read = true;
      });
      return NextResponse.json({ success: true, markedRead: notifications.length });
    }

    if (typeof body.id === "string") {
      const target = notifications.find((n) => n.id === body.id);
      if (!target) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      target.read = true;
      return NextResponse.json({ success: true, notification: target });
    }

    return NextResponse.json(
      { error: "Request body must include { id: string } or { markAllRead: true }" },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[notifications] PATCH error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
