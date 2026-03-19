import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { generateDMDraft } from "@/lib/integrations/anthropic";

// ---------------------------------------------------------------------------
// Input validation schema — POST /api/dms/generate-batch
// ---------------------------------------------------------------------------
const batchSchema = z.object({
  coachIds: z
    .array(z.string().uuid())
    .min(1, "At least 1 coachId is required")
    .max(10, "Maximum 10 coachIds per batch"),
  templateType: z.string().max(100).optional().default("intro"),
  context: z.string().max(5000).optional().default(""),
});

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// In-memory fallback store (mirrors pattern from /api/dms)
// ---------------------------------------------------------------------------
interface DraftResult {
  coachId: string;
  coachName: string;
  schoolName: string;
  content: string;
  dmId: string;
  status: "drafted";
}

interface DraftError {
  coachId: string;
  error: string;
}

// ---------------------------------------------------------------------------
// POST /api/dms/generate-batch
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = batchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { coachIds, templateType, context } = parsed.data;
  const drafts: DraftResult[] = [];
  const errors: DraftError[] = [];

  // -------------------------------------------------------------------------
  // Supabase path
  // -------------------------------------------------------------------------
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      // 1. Look up all coaches in one query
      const { data: coachRows, error: lookupError } = await supabase
        .from("coaches")
        .select("id, name, school_name")
        .in("id", coachIds);

      if (lookupError) {
        console.error("[POST /api/dms/generate-batch] Coach lookup error:", lookupError.message);
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }

      // Build a map for quick access
      const coachMap = new Map(
        (coachRows ?? []).map((c: { id: string; name: string; school_name: string }) => [c.id, c]),
      );

      // 2. Generate DMs sequentially to avoid rate limits
      for (const coachId of coachIds) {
        const coach = coachMap.get(coachId);

        if (!coach) {
          errors.push({ coachId, error: "Coach not found" });
          continue;
        }

        try {
          const content = await generateDMDraft(
            coach.name,
            coach.school_name,
            templateType,
            context,
          );

          // 3. Save draft to dm_messages
          const now = new Date().toISOString();
          const { data: inserted, error: insertError } = await supabase
            .from("dm_messages")
            .insert({
              coach_id: coachId,
              coach_name: coach.name,
              school_name: coach.school_name,
              template_type: templateType,
              content,
              status: "drafted",
              sent_at: null,
              responded_at: null,
              response_content: null,
              created_at: now,
            })
            .select("id")
            .single();

          if (insertError) {
            errors.push({ coachId, error: insertError.message });
            continue;
          }

          drafts.push({
            coachId,
            coachName: coach.name,
            schoolName: coach.school_name,
            content,
            dmId: inserted.id as string,
            status: "drafted",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown generation error";
          console.error(`[POST /api/dms/generate-batch] Generation failed for ${coachId}:`, message);
          errors.push({ coachId, error: message });
        }
      }

      return NextResponse.json({
        success: true,
        generated: drafts.length,
        drafts,
        errors,
      });
    } catch (err) {
      console.error("[POST /api/dms/generate-batch]", err);
      // fall through to in-memory path
    }
  }

  // -------------------------------------------------------------------------
  // In-memory fallback (no Supabase configured)
  // -------------------------------------------------------------------------
  for (const coachId of coachIds) {
    try {
      const coachName = `Coach ${coachId.slice(0, 6)}`;
      const schoolName = "Unknown School";

      const content = await generateDMDraft(coachName, schoolName, templateType, context);

      const dmId = `dm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      drafts.push({
        coachId,
        coachName,
        schoolName,
        content,
        dmId,
        status: "drafted",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown generation error";
      console.error(`[POST /api/dms/generate-batch] In-memory fallback error for ${coachId}:`, message);
      errors.push({ coachId, error: message });
    }
  }

  return NextResponse.json({
    success: true,
    generated: drafts.length,
    drafts,
    errors,
  });
}
