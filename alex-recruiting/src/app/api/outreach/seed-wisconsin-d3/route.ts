import { NextRequest, NextResponse } from "next/server";
import { WISCONSIN_D3_OUTREACH } from "@/lib/data/wisconsin-d3-outreach";
import { generateEmail, listEmails } from "@/lib/outreach/email-sequences";
import { insertPost } from "@/lib/posts/store";
import { insertDM } from "@/lib/outreach/dm-store";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Post } from "@/lib/types";

// ---------------------------------------------------------------------------
// POST /api/outreach/seed-wisconsin-d3 — Seed Wisconsin D3 outreach campaign
// Creates email drafts, DM drafts, and X callout posts for all 10 schools
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = {
    emails: [] as { coachName: string; schoolName: string; status: string }[],
    dms: [] as { coachName: string; schoolName: string; status: string }[],
    posts: [] as { schoolName: string; status: string }[],
    errors: [] as string[],
  };

  for (const coach of WISCONSIN_D3_OUTREACH) {
    // 1. Create email draft — prefer Supabase, fallback to in-memory
    try {
      let emailInserted = false;

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();
          const now = new Date().toISOString();

          // Check for existing in Supabase
          const { data: existing } = await supabase
            .from("email_outreach")
            .select("id")
            .ilike("coach_name", coach.coachName)
            .limit(1);

          if (existing && existing.length > 0) {
            results.emails.push({
              coachName: coach.coachName,
              schoolName: coach.schoolName,
              status: "already_exists",
            });
            emailInserted = true;
          } else {
            const { error } = await supabase.from("email_outreach").insert({
              coach_name: coach.coachName,
              school_name: coach.schoolName,
              coach_email: coach.email ?? null,
              template_type: "initial_introduction",
              subject: coach.emailDraft.subject,
              body: coach.emailDraft.body,
              status: "draft",
              created_at: now,
            });
            if (!error) {
              results.emails.push({
                coachName: coach.coachName,
                schoolName: coach.schoolName,
                status: "created",
              });
              emailInserted = true;
            }
          }
        } catch {
          // Supabase failed — fall through to in-memory
        }
      }

      if (!emailInserted) {
        const existing = await listEmails({ coachName: coach.coachName });
        if (existing.length === 0) {
          await generateEmail({
            coachName: coach.coachName,
            schoolName: coach.schoolName,
            coachEmail: coach.email ?? undefined,
            templateType: "initial_introduction",
            status: "draft",
            mergeVars: {
              CUSTOM_BODY: coach.emailDraft.body,
              CUSTOM_SUBJECT: coach.emailDraft.subject,
            },
          });
          results.emails.push({
            coachName: coach.coachName,
            schoolName: coach.schoolName,
            status: "created",
          });
        } else {
          results.emails.push({
            coachName: coach.coachName,
            schoolName: coach.schoolName,
            status: "already_exists",
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Email for ${coach.coachName}: ${msg}`);
      results.emails.push({
        coachName: coach.coachName,
        schoolName: coach.schoolName,
        status: "error",
      });
    }

    // 2. Create X callout post
    try {
      const post: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
        content: coach.xCallout,
        pillar: "character" as const,
        hashtags: ["D3Football", "RecruitJacob", "WisconsinD3"],
        mediaUrl: null,
        scheduledFor: "",
        bestTime: "Tuesday 7:00 AM",
        status: "draft",
        xPostId: null,
        impressions: 0,
        engagements: 0,
        engagementRate: 0,
      };
      insertPost(post);
      results.posts.push({ schoolName: coach.schoolName, status: "created" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Post for ${coach.schoolName}: ${msg}`);
      results.posts.push({ schoolName: coach.schoolName, status: "error" });
    }

    // 3. Create DM draft — prefer Supabase, fallback to in-memory
    try {
      let dmInserted = false;

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();
          const now = new Date().toISOString();
          const { error } = await supabase.from("dm_messages").insert({
            coach_id: null,
            coach_name: coach.coachName,
            school_name: coach.schoolName,
            template_type: "wisconsin_d3_outreach",
            content: coach.dmDraft,
            status: "drafted",
            sent_at: null,
            responded_at: null,
            response_content: null,
            created_at: now,
          });
          if (!error) dmInserted = true;
        } catch {
          // Supabase failed — fall through to in-memory
        }
      }

      if (!dmInserted) {
        insertDM({
          coachId: "",
          coachName: coach.coachName,
          schoolName: coach.schoolName,
          templateType: "wisconsin_d3_outreach",
          content: coach.dmDraft,
          status: "drafted",
          sentAt: null,
          respondedAt: null,
          responseContent: null,
        });
      }

      results.dms.push({
        coachName: coach.coachName,
        schoolName: coach.schoolName,
        status: "created",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`DM for ${coach.coachName}: ${msg}`);
      results.dms.push({
        coachName: coach.coachName,
        schoolName: coach.schoolName,
        status: "error",
      });
    }
  }

  const summary = {
    emailsCreated: results.emails.filter((e) => e.status === "created").length,
    dmsCreated: results.dms.filter((d) => d.status === "created").length,
    postsCreated: results.posts.filter((p) => p.status === "created").length,
    totalErrors: results.errors.length,
  };

  return NextResponse.json(
    {
      message: `Wisconsin D3 campaign seeded: ${summary.emailsCreated} emails, ${summary.dmsCreated} DMs, ${summary.postsCreated} X posts`,
      summary,
      details: results,
    },
    { status: 201 }
  );
}
