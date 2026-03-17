/**
 * Recruit Page ISR Data Fetcher
 *
 * Pulls enriched recruiting data from Supabase for the recruit page.
 * All functions check for database availability first and return empty
 * arrays if the DB is not configured or on any error — never throws.
 */

// ─── Exported Interfaces ──────────────────────────────────────────────────

export interface EnrichedSchoolData {
  name: string;
  conference: string | null;
  division: string | null;
  olGraduating: number | null;
  scholarshipGapScore: number;
  hasViewedProfile: boolean;
}

export interface CoachSignal {
  coachName: string;
  schoolName: string;
  division: string;
  signalType: "profile_view" | "camp_invite" | "message";
  date: string;
}

export interface ResearchInsight {
  category: string;
  insight: string;
  actionItem: string;
  relevanceScore: number;
}

// ─── DB Availability Guard ────────────────────────────────────────────────

function isDatabaseAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.DATABASE_URL
  );
}

// ─── getEnrichedSchools ───────────────────────────────────────────────────

/**
 * Query enrichedSchools where olGraduating is not null,
 * ordered by talentScore desc, limit 50.
 *
 * scholarshipGapScore is derived from scholarshipsAvailable (default 0).
 * hasViewedProfile is always false here (requires cross-referencing leads).
 */
export async function getEnrichedSchools(): Promise<EnrichedSchoolData[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { enrichedSchools } = await import("@/lib/db/schema");
    const { isNotNull, desc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(enrichedSchools)
      .where(isNotNull(enrichedSchools.olGraduating))
      .orderBy(desc(enrichedSchools.talentScore))
      .limit(50);

    return rows.map((row) => ({
      name: row.name,
      conference: row.conference,
      division: row.division,
      olGraduating: row.olGraduating,
      scholarshipGapScore: row.scholarshipsAvailable ?? 0,
      hasViewedProfile: false,
    }));
  } catch (err) {
    console.error("[data-fetcher] getEnrichedSchools error:", err);
    return [];
  }
}

// ─── getCoachSignals ──────────────────────────────────────────────────────

/**
 * Query ncsaLeads, ordered by createdAt desc, limit 100.
 * Maps the source field to signalType. Sources that don't match a known
 * signal type are mapped to "message" as a fallback.
 */
export async function getCoachSignals(): Promise<CoachSignal[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { ncsaLeads } = await import("@/lib/db/schema");
    const { desc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(ncsaLeads)
      .orderBy(desc(ncsaLeads.createdAt))
      .limit(100);

    return rows.map((row) => ({
      coachName: row.coachName,
      schoolName: row.schoolName,
      division: row.division,
      signalType: mapSourceToSignalType(row.source),
      date: row.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[data-fetcher] getCoachSignals error:", err);
    return [];
  }
}

function mapSourceToSignalType(
  source: string
): "profile_view" | "camp_invite" | "message" {
  switch (source) {
    case "profile_view":
      return "profile_view";
    case "camp_invite":
      return "camp_invite";
    case "message":
      return "message";
    default:
      return "message";
  }
}

// ─── getResearchInsights ──────────────────────────────────────────────────

/**
 * Query researchArticles where aiProcessedAt is not null,
 * ordered by aiRelevanceScore desc, limit 20.
 *
 * For each article, extract up to 2 keyInsights with their actionItems.
 * Return a flat array limited to 15 insights.
 */
export async function getResearchInsights(): Promise<ResearchInsight[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { researchArticles } = await import("@/lib/db/schema");
    const { isNotNull, desc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(researchArticles)
      .where(isNotNull(researchArticles.aiProcessedAt))
      .orderBy(desc(researchArticles.aiRelevanceScore))
      .limit(20);

    const insights: ResearchInsight[] = [];

    for (const row of rows) {
      const keyInsights = Array.isArray(row.aiInsights)
        ? (row.aiInsights as string[])
        : [];
      const actionItems = Array.isArray(row.aiActionItems)
        ? (row.aiActionItems as string[])
        : [];
      const relevanceScore = row.aiRelevanceScore ?? 0;
      const category = row.dataType;

      // Extract up to 2 insights per article
      const insightCount = Math.min(keyInsights.length, 2);
      for (let i = 0; i < insightCount; i++) {
        insights.push({
          category,
          insight: keyInsights[i],
          actionItem: actionItems[i] ?? "",
          relevanceScore,
        });
      }

      // Stop early if we already have enough
      if (insights.length >= 15) break;
    }

    return insights.slice(0, 15);
  } catch (err) {
    console.error("[data-fetcher] getResearchInsights error:", err);
    return [];
  }
}
