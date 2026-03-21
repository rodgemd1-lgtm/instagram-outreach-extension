import { NextRequest, NextResponse } from "next/server";
import { and, gte, lte, ne } from "drizzle-orm";
import { getPostQueue } from "@/lib/content-engine/post-pipeline";
import { db, isDbConfigured } from "@/lib/db";
import { camps } from "@/lib/db/schema";
import {
  getDefaultReminderRecipients,
  isSmsConfigured,
  sendSmsBatch,
} from "@/lib/integrations/vonage";
import { getAllTasks } from "@/lib/rec/tasks";
import {
  buildTaskReminderMessage,
  type ReminderCamp,
  type ReminderPost,
  type ReminderTask,
} from "@/lib/reminders/task-reminders";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === cronSecret;
}

async function getUpcomingCamps(): Promise<ReminderCamp[]> {
  if (!isDbConfigured()) {
    return [];
  }

  const now = new Date();
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  const rows = await db
    .select({
      name: camps.name,
      school: camps.school,
      date: camps.date,
      registrationStatus: camps.registrationStatus,
    })
    .from(camps)
    .where(
      and(
        gte(camps.date, now),
        lte(camps.date, inTwoWeeks),
        ne(camps.registrationStatus, "completed")
      )
    )
    .limit(3);

  return rows.map((row) => ({
    name: row.name,
    school: row.school,
    date: row.date?.toISOString() ?? null,
    registrationStatus: row.registrationStatus,
  }));
}

async function getReminderPayload() {
  const tasks: ReminderTask[] = (await getAllTasks())
    .filter((task) => task.status !== "completed")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
    .map((task) => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
    }));

  const now = Date.now();
  const inTwoDays = now + 2 * 24 * 60 * 60 * 1000;
  const posts: ReminderPost[] = (await getPostQueue("pending"))
    .filter((post) => {
      const scheduledAt = new Date(post.scheduledAt).getTime();
      return scheduledAt >= now && scheduledAt <= inTwoDays;
    })
    .slice(0, 2)
    .map((post) => ({
      content: post.content,
      scheduledAt: post.scheduledAt,
      pillar: post.pillar,
    }));

  const upcomingCamps = await getUpcomingCamps();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    tasks,
    posts,
    camps: upcomingCamps,
    appUrl,
    message: buildTaskReminderMessage({
      tasks,
      posts,
      camps: upcomingCamps,
      appUrl,
    }),
  };
}

async function handleReminder(req: NextRequest, previewOnly: boolean) {
  if (!previewOnly && !isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getReminderPayload();
  if (previewOnly) {
    return NextResponse.json({ preview: true, ...payload });
  }

  if (!isSmsConfigured()) {
    return NextResponse.json(
      {
        error: "Vonage SMS is not configured",
        ...payload,
      },
      { status: 503 }
    );
  }

  const recipients = getDefaultReminderRecipients();
  if (recipients.length === 0) {
    return NextResponse.json(
      {
        error: "No reminder recipients configured",
        ...payload,
      },
      { status: 400 }
    );
  }

  const results = await sendSmsBatch(recipients, payload.message);
  return NextResponse.json({
    sent: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    recipients,
    results,
    ...payload,
  });
}

export async function GET(req: NextRequest) {
  const previewOnly = req.nextUrl.searchParams.get("preview") === "true";
  return handleReminder(req, previewOnly);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const previewOnly = body.preview === true;
  return handleReminder(req, previewOnly);
}
