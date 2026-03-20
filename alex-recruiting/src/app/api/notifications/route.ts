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
const notifications: Notification[] = [
  {
    id: "notif-1",
    type: "coach_view",
    title: "Profile View",
    message: "Coach Mike Smith viewed your profile",
    read: false,
    actionUrl: "/coaches",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
  },
  {
    id: "notif-2",
    type: "dm_response",
    title: "DM Response",
    message: "DM response from Coach Johnson at UW-Whitewater",
    read: false,
    actionUrl: "/outreach",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
  },
  {
    id: "notif-3",
    type: "deadline",
    title: "Registration Deadline",
    message: "Camp registration deadline: UW-Platteville Prospect Day in 3 days",
    read: false,
    actionUrl: "/camps",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
  },
  {
    id: "notif-4",
    type: "camp_reminder",
    title: "Camp Reminder",
    message: "Reminder: Carthage College Camp this Saturday",
    read: false,
    actionUrl: "/camps",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
  },
  {
    id: "notif-5",
    type: "content_approved",
    title: "Content Approved",
    message: "Weekly content batch approved — 5 posts scheduled",
    read: true,
    actionUrl: "/content",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
  },
  {
    id: "notif-6",
    type: "email_opened",
    title: "Email Opened",
    message: "Coach Davis opened your email",
    read: true,
    actionUrl: "/outreach",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
  },
  {
    id: "notif-7",
    type: "coach_view",
    title: "Profile View",
    message: "Coach Rivera at Carroll University viewed your highlights",
    read: true,
    actionUrl: "/coaches",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5d ago
  },
];

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
