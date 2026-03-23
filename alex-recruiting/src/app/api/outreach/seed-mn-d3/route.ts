import { NextRequest, NextResponse } from "next/server";
import { MN_D3_OUTREACH } from "@/lib/data/mn-d3-outreach";
import { generateEmail, listEmails } from "@/lib/outreach/email-sequences";
import { insertPost } from "@/lib/posts/store";
import { insertDM } from "@/lib/outreach/dm-store";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Post } from "@/lib/types";

// ---------------------------------------------------------------------------
// POST /api/outreach/seed-mn-d3 — Seed Minnesota D3 outreach campaign
// Creates email drafts, DM drafts, and X callout posts for MIAC + UMAC programs
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const waveFilter = searchParams.get("wave") ? parseInt(searchParams.get("wave")!) : null;
  const conferenceFilter = searchParams.get("conference") as "MIAC" | "UMAC" | null;

  let coaches = MN_D3_OUTREACH;
  if (waveFilter) coaches = coaches.filter((c) => c.wave === waveFilter);
  if (conferenceFilter) coaches = coaches.filter((c) => c.conference === conferenceFilter);

  const results = {
    emails: [] as { coachName: string; schoolName: string; status: string }[],
    dms: [] as { coachName: string; schoolName: string; status: string }[],
    posts: [] as { schoolName: string; status: string }[],
    errors: [] as string[],
  };

  for (const coach of coaches) {
    // 1. Email draft
    try {
      let emailInserted = false;
      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();
          const { data: existing } = await supabase
            .from("email_outreach").select("id").ilike("coach_name", coach.coachName).limit(1);
          if (existing && existing.length > 0) {
            results.emails.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "already_exists" });
            emailInserted = true;
          } else {
            const { error } = await supabase.from("email_outreach").insert({
              coach_name: coach.coachName, school_name: coach.schoolName,
              coach_email: coach.email ?? null, template_type: "initial_introduction",
              subject: coach.emailDraft.subject, body: coach.emailDraft.body,
              status: "draft", created_at: new Date().toISOString(),
            });
            if (!error) {
              results.emails.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "created" });
              emailInserted = true;
            }
          }
        } catch { /* fall through */ }
      }
      if (!emailInserted) {
        const existing = await listEmails({ coachName: coach.coachName });
        if (existing.length === 0) {
          await generateEmail({
            coachName: coach.coachName, schoolName: coach.schoolName,
            coachEmail: coach.email ?? undefined, templateType: "initial_introduction",
            status: "draft",
            mergeVars: { CUSTOM_BODY: coach.emailDraft.body, CUSTOM_SUBJECT: coach.emailDraft.subject },
          });
          results.emails.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "created" });
        } else {
          results.emails.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "already_exists" });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Email for ${coach.coachName}: ${msg}`);
      results.emails.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "error" });
    }

    // 2. X callout post draft
    try {
      const post: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
        content: coach.xCallout, pillar: "character" as const,
        hashtags: ["D3Football", "RecruitJacob", "MinnesotaD3"],
        mediaUrl: null, scheduledFor: "", bestTime: "Tuesday 7:00 AM",
        status: "draft", xPostId: null,
        impressions: 0, engagements: 0, engagementRate: 0,
      };
      insertPost(post);
      results.posts.push({ schoolName: coach.schoolName, status: "created" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Post for ${coach.schoolName}: ${msg}`);
      results.posts.push({ schoolName: coach.schoolName, status: "error" });
    }

    // 3. DM draft
    try {
      let dmInserted = false;
      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();
          const { data: existing } = await supabase
            .from("dms").select("id").ilike("coach_name", coach.coachName).limit(1);
          if (existing && existing.length > 0) {
            results.dms.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "already_exists" });
            dmInserted = true;
          } else {
            const { error } = await supabase.from("dms").insert({
              coach_name: coach.coachName, school_name: coach.schoolName,
              coach_handle: coach.xHandle ?? null, message: coach.dmDraft,
              status: "draft", created_at: new Date().toISOString(),
            });
            if (!error) {
              results.dms.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "created" });
              dmInserted = true;
            }
          }
        } catch { /* fall through */ }
      }
      if (!dmInserted) {
        insertDM({
          coachId: "",
          coachName: coach.coachName,
          schoolName: coach.schoolName,
          templateType: "mn_d3_outreach",
          content: coach.dmDraft,
          status: "drafted",
          sentAt: null,
          respondedAt: null,
          responseContent: null,
        });
        results.dms.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "created" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`DM for ${coach.coachName}: ${msg}`);
      results.dms.push({ coachName: coach.coachName, schoolName: coach.schoolName, status: "error" });
    }
  }

  return NextResponse.json({
    campaign: "Minnesota D3 (MIAC + UMAC)",
    wave: waveFilter ?? "all",
    conference: conferenceFilter ?? "all",
    coaches: coaches.length,
    results,
    confirmedEmails: coaches.filter((c) => c.emailConfirmed).map((c) => ({
      name: c.coachName, school: c.schoolName, email: c.email,
    })),
  });
}
