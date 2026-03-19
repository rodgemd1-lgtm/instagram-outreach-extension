import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  generateDMDraft,
  checkConstitution,
} from "@/lib/integrations/anthropic";

// ---------------------------------------------------------------------------
// Input validation schema — POST /api/dms/generate
// ---------------------------------------------------------------------------
const generateDMSchema = z.object({
  coachId: z.string().uuid("coachId must be a valid UUID"),
  templateType: z
    .enum(["intro", "follow_up", "camp_invite", "film_share"])
    .optional()
    .default("intro"),
  context: z.string().max(2000).optional().default(""),
});

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Tone descriptors used when generating each variation
// ---------------------------------------------------------------------------
const TONE_CONTEXTS: Record<
  "professional" | "casual" | "contextual",
  (templateType: string) => string
> = {
  professional: () =>
    "Use a professional and respectful tone. Keep it polished but genuine — like a well-prepared student-athlete introducing himself to a college program.",
  casual: () =>
    "Use a casual, genuine tone. Be personable and authentic — like a real high school athlete reaching out, not a form letter. Keep it natural.",
  contextual: (templateType: string) => {
    switch (templateType) {
      case "follow_up":
        return "This is a follow-up DM. Reference a prior interaction or engagement. Be brief, add value, and give the coach a reason to respond.";
      case "camp_invite":
        return "This DM is about attending a camp or visit. Express genuine interest in the program and ask about upcoming camp dates or visit opportunities.";
      case "film_share":
        return "This DM is sharing game film or highlights. Lead with a specific skill or play, mention the film link, and ask for feedback.";
      default:
        return "This is an introductory DM. Make a strong first impression — mention specific reasons for interest in their program.";
    }
  },
};

type Tone = "professional" | "casual" | "contextual";

interface DMVariation {
  content: string;
  tone: Tone;
  compliant: boolean;
  complianceNote: string;
}

// ---------------------------------------------------------------------------
// POST /api/dms/generate — Generate 3 AI-powered DM variations for a coach
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // --- Parse body ---
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // --- Validate input ---
  const parsed = generateDMSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { coachId, templateType, context } = parsed.data;

  // --- Require Supabase ---
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }

  try {
    const supabase = createAdminClient();

    // --- Look up coach ---
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select(
        "name, school_name, title, division, conference, priority_tier, x_handle, notes",
      )
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 },
      );
    }

    // --- Build enriched context for the AI ---
    const coachContext = [
      context,
      coach.title ? `Coach title: ${coach.title}` : "",
      coach.division ? `Division: ${coach.division}` : "",
      coach.conference ? `Conference: ${coach.conference}` : "",
      coach.priority_tier ? `Priority tier: ${coach.priority_tier}` : "",
      coach.x_handle ? `X handle: ${coach.x_handle}` : "",
      coach.notes ? `Notes: ${coach.notes}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    // --- Generate 3 variations in parallel ---
    const tones: Tone[] = ["professional", "casual", "contextual"];

    const drafts = await Promise.all(
      tones.map((tone) => {
        const toneInstruction = TONE_CONTEXTS[tone](templateType);
        const enrichedContext = `${toneInstruction}\n\n${coachContext}`;
        return generateDMDraft(
          coach.name,
          coach.school_name,
          templateType,
          enrichedContext,
        );
      }),
    );

    // --- Run constitution checks in parallel ---
    const complianceResults = await Promise.all(
      drafts.map((draft) => checkConstitution(draft)),
    );

    // --- Assemble response ---
    const variations: DMVariation[] = tones.map((tone, i) => ({
      content: drafts[i],
      tone,
      compliant: complianceResults[i].compliant,
      complianceNote: complianceResults[i].message,
    }));

    return NextResponse.json({
      coachId,
      coachName: coach.name,
      schoolName: coach.school_name,
      variations,
    });
  } catch (err) {
    console.error("[POST /api/dms/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate DM drafts" },
      { status: 500 },
    );
  }
}
