import { NextRequest, NextResponse } from "next/server";
import { targetSchools, getSchoolById } from "@/lib/data/target-schools";
import {
  schoolNeeds,
  getSchoolNeedById,
} from "@/lib/rec/knowledge/school-needs";
import { db, isDbConfigured } from "@/lib/db";
import { coachBehaviorProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface CoachPersona {
  schoolId: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  communicationStyle: string;
  recruitingPriorities: string[];
  bestApproachMethod: string;
  bestApproachSteps: string[];
  engagementStrategy: string;
  dmOpenProbability: number;
  followBackProbability: number;
  estimatedResponseRate: number;
  optimalContactMonths: number[];
  optimalContactHours: number[];
  personaSource: "ai" | "deterministic";
}

// Generate a deterministic persona profile from static data
function generateDeterministicPersona(
  schoolId: string
): CoachPersona | null {
  const school = getSchoolById(schoolId);
  if (!school) return null;

  const need = getSchoolNeedById(schoolId);

  // Communication style based on tier + division
  const communicationStyleMap: Record<string, string> = {
    "Tier 1": "formal",
    "Tier 2": "professional_casual",
    "Tier 3": "casual_direct",
  };

  // Approach method based on tier
  const approachMethodMap: Record<string, string> = {
    "Tier 1":
      "Long-term engagement: follow, like/repost content weekly, attend camps. Do NOT DM until junior year.",
    "Tier 2":
      "Follow, engage 2-4 weeks, then send a personalized DM referencing their program.",
    "Tier 3":
      "DM immediately after establishing profile. D2 coaches respond quickly and often follow back.",
  };

  const approachStepsMap: Record<string, string[]> = {
    "Tier 1": [
      "Follow the school's football account",
      "Like and repost 2-3 posts per week",
      "Attend school camps and prospect days",
      "Post high-quality film tagging the program",
      "Wait for coach engagement signals before any DM",
    ],
    "Tier 2": [
      "Follow the school's football account",
      "Engage with 3-4 posts over 2 weeks",
      "Post film tagging the program's hashtag",
      "Send personalized DM after 2-4 weeks of engagement",
      "Reference specific program details in DM",
    ],
    "Tier 3": [
      "Follow the school's football account",
      "Send personalized DM within the first week",
      "Include Hudl link and key measurables",
      "Reference the school's conference and recent success",
      "Follow up after 7 days if no response",
    ],
  };

  // Recruiting priorities from school needs
  const recruitingPriorities: string[] = [];
  if (need) {
    if (need.olNeedLevel === "high") {
      recruitingPriorities.push(
        `High OL need: ${need.seniorsGraduating2026} seniors graduating in 2026`
      );
    } else {
      recruitingPriorities.push(
        `Medium OL need: ${need.seniorsGraduating2026} seniors graduating in 2026`
      );
    }
    recruitingPriorities.push(need.recruitingEmphasis);
    recruitingPriorities.push(need.jacobFitNotes);
  }

  // Engagement strategy
  const engagementStrategyMap: Record<string, string> = {
    "Tier 1":
      "Visibility-first approach. Be seen, not heard. Let Jacob's content do the talking. Coaches at this level scout X passively — consistent, high-quality film posts will earn attention.",
    "Tier 2":
      "Active engagement approach. Build a digital relationship through consistent interaction. FCS/MAC coaches are active on X and appreciate genuine interest. DM after establishing engagement pattern.",
    "Tier 3":
      "Direct outreach approach. D2 coaches actively seek prospects on X. A well-crafted DM with measurables and film link will get a response. These coaches follow back strong freshmen.",
  };

  // Probabilities based on tier
  const probabilityMap: Record<
    string,
    { dm: number; followBack: number; response: number }
  > = {
    "Tier 1": { dm: 0.1, followBack: 0.05, response: 0.1 },
    "Tier 2": { dm: 0.5, followBack: 0.35, response: 0.4 },
    "Tier 3": { dm: 0.85, followBack: 0.7, response: 0.7 },
  };

  const probs = probabilityMap[school.priorityTier];

  // Optimal contact months based on NCAA calendar for Class of 2029
  // September-November (fall season), January-February (evaluation), June-July (camps)
  const optimalContactMonths =
    school.priorityTier === "Tier 1"
      ? [6, 7, 9, 10] // camp season + fall for Tier 1
      : school.priorityTier === "Tier 2"
        ? [1, 2, 6, 7, 9, 10]
        : [1, 2, 3, 6, 7, 9, 10, 11]; // wider window for Tier 3

  return {
    schoolId: school.id,
    schoolName: school.name,
    division: school.division,
    conference: school.conference,
    priorityTier: school.priorityTier,
    communicationStyle: communicationStyleMap[school.priorityTier],
    recruitingPriorities,
    bestApproachMethod: approachMethodMap[school.priorityTier],
    bestApproachSteps: approachStepsMap[school.priorityTier],
    engagementStrategy: engagementStrategyMap[school.priorityTier],
    dmOpenProbability: probs.dm,
    followBackProbability: probs.followBack,
    estimatedResponseRate: probs.response,
    optimalContactMonths,
    optimalContactHours:
      school.priorityTier === "Tier 3" ? [8, 12, 16, 21] : [10, 14, 18],
    personaSource: "deterministic",
  };
}

// POST /api/coaches/personas
// Generates AI persona profiles for coaches
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { schoolId } = body as { schoolId?: string };

    const schools = schoolId
      ? [getSchoolById(schoolId)].filter(Boolean)
      : targetSchools;

    if (schools.length === 0) {
      return NextResponse.json(
        { error: "School not found", schoolId },
        { status: 404 }
      );
    }

    const personas: CoachPersona[] = [];

    for (const school of schools) {
      if (!school) continue;

      let persona: CoachPersona | null = null;

      // Try AI-powered persona generation via Claude
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
          throw new Error("ANTHROPIC_API_KEY not configured");
        }

        const client = new Anthropic({ apiKey });
        const need = getSchoolNeedById(school.id);

        const prompt = `Analyze this college football program and generate a coach persona profile for recruiting outreach purposes.

School: ${school.name}
Division: ${school.division}
Conference: ${school.conference}
Priority Tier: ${school.priorityTier}
X Handle: ${school.officialXHandle}
OL Need Level: ${need?.olNeedLevel || "unknown"}
Seniors Graduating 2026: ${need?.seniorsGraduating2026 || "unknown"}
Recruiting Emphasis: ${need?.recruitingEmphasis || "unknown"}
Why This School for Jacob: ${school.whyJacob}

Respond in JSON only (no markdown). Use this exact schema:
{
  "communicationStyle": "formal | professional_casual | casual_direct",
  "recruitingPriorities": ["string array of 3-4 priorities"],
  "bestApproachMethod": "1-2 sentence strategy",
  "bestApproachSteps": ["string array of 4-5 concrete steps"],
  "engagementStrategy": "2-3 sentence strategy overview",
  "dmOpenProbability": 0.0-1.0,
  "followBackProbability": 0.0-1.0,
  "estimatedResponseRate": 0.0-1.0,
  "optimalContactMonths": [array of month numbers 1-12],
  "optimalContactHours": [array of hour numbers 0-23]
}`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        });

        const text =
          response.content[0].type === "text" ? response.content[0].text : "";

        // Parse the JSON response
        const parsed = JSON.parse(text);

        persona = {
          schoolId: school.id,
          schoolName: school.name,
          division: school.division,
          conference: school.conference,
          priorityTier: school.priorityTier,
          communicationStyle: parsed.communicationStyle,
          recruitingPriorities: parsed.recruitingPriorities,
          bestApproachMethod: parsed.bestApproachMethod,
          bestApproachSteps: parsed.bestApproachSteps,
          engagementStrategy: parsed.engagementStrategy,
          dmOpenProbability: parsed.dmOpenProbability,
          followBackProbability: parsed.followBackProbability,
          estimatedResponseRate: parsed.estimatedResponseRate,
          optimalContactMonths: parsed.optimalContactMonths,
          optimalContactHours: parsed.optimalContactHours,
          personaSource: "ai",
        };
      } catch (aiErr) {
        console.error(
          `[personas] Claude AI failed for ${school.name}, using deterministic:`,
          aiErr
        );
        persona = generateDeterministicPersona(school.id);
      }

      if (!persona) {
        persona = generateDeterministicPersona(school.id);
      }

      if (persona) {
        // Store in coachBehaviorProfiles if db is configured
        if (isDbConfigured()) {
          try {
            // Check if a profile already exists for this school
            const existing = await db
              .select()
              .from(coachBehaviorProfiles)
              .where(eq(coachBehaviorProfiles.schoolName, school.name))
              .limit(1);

            if (existing.length > 0) {
              await db
                .update(coachBehaviorProfiles)
                .set({
                  engagementStyle: persona.communicationStyle,
                  bestApproachMethod: persona.bestApproachMethod,
                  bestApproachSteps: persona.bestApproachSteps,
                  dmOpenProbability: persona.dmOpenProbability,
                  followBackProbability: persona.followBackProbability,
                  estimatedResponseRate: persona.estimatedResponseRate,
                  optimalContactMonths: persona.optimalContactMonths,
                  optimalContactHours: persona.optimalContactHours,
                  lastUpdated: new Date(),
                })
                .where(eq(coachBehaviorProfiles.schoolName, school.name));
            } else {
              await db.insert(coachBehaviorProfiles).values({
                coachName: `Staff — ${school.name}`,
                schoolName: school.name,
                division: school.division,
                conference: school.conference,
                engagementStyle: persona.communicationStyle,
                bestApproachMethod: persona.bestApproachMethod,
                bestApproachSteps: persona.bestApproachSteps,
                dmOpenProbability: persona.dmOpenProbability,
                followBackProbability: persona.followBackProbability,
                estimatedResponseRate: persona.estimatedResponseRate,
                optimalContactMonths: persona.optimalContactMonths,
                optimalContactHours: persona.optimalContactHours,
                lastUpdated: new Date(),
              });
            }
          } catch (dbErr) {
            console.error(
              `[personas] Failed to store persona for ${school.name}:`,
              dbErr
            );
          }
        }

        personas.push(persona);
      }
    }

    return NextResponse.json({
      success: true,
      personas,
    });
  } catch (err) {
    console.error("[personas] Unexpected error:", err);
    return NextResponse.json(
      { error: "Persona generation failed", details: String(err) },
      { status: 500 }
    );
  }
}

// GET /api/coaches/personas?schoolId=xyz
// Retrieve persona for a specific school
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  if (!schoolId) {
    // Return all personas
    const personas = targetSchools
      .map((s) => generateDeterministicPersona(s.id))
      .filter(Boolean);
    return NextResponse.json({ success: true, personas });
  }

  // Try DB first
  if (isDbConfigured()) {
    try {
      const school = getSchoolById(schoolId);
      if (school) {
        const results = await db
          .select()
          .from(coachBehaviorProfiles)
          .where(eq(coachBehaviorProfiles.schoolName, school.name))
          .limit(1);

        if (results.length > 0) {
          const row = results[0];
          const persona: CoachPersona = {
            schoolId: school.id,
            schoolName: school.name,
            division: school.division,
            conference: school.conference,
            priorityTier: school.priorityTier,
            communicationStyle: row.engagementStyle || "professional_casual",
            recruitingPriorities: [],
            bestApproachMethod: row.bestApproachMethod || "",
            bestApproachSteps: (row.bestApproachSteps as string[]) || [],
            engagementStrategy: "",
            dmOpenProbability: row.dmOpenProbability || 0,
            followBackProbability: row.followBackProbability || 0,
            estimatedResponseRate: row.estimatedResponseRate || 0,
            optimalContactMonths: (row.optimalContactMonths as number[]) || [],
            optimalContactHours: (row.optimalContactHours as number[]) || [],
            personaSource: "ai",
          };
          return NextResponse.json({ success: true, persona });
        }
      }
    } catch (dbErr) {
      console.error("[personas/GET] DB lookup failed:", dbErr);
    }
  }

  // Fall back to deterministic
  const persona = generateDeterministicPersona(schoolId);
  if (!persona) {
    return NextResponse.json(
      { error: "School not found", schoolId },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, persona });
}
