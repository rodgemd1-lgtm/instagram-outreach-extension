/**
 * Supabase Storage Layer for Scraped Data
 *
 * Persists scraped coaches, research articles, discovery results, and AI
 * enrichment data to Supabase via Drizzle ORM. Every function checks for
 * database availability first and degrades gracefully (logs and returns)
 * when the DB is not configured.
 *
 * Part of the scraper CLI engine suite.
 */

import type { ParsedCoach } from "./firecrawl-engine";
import type { UnifiedScrapeResult } from "./orchestrator";
import type { DiscoveryResult } from "./exa-engine";
import type { ArticleEnrichment } from "./ai-enrichment";

// ─── DB Availability Guard ──────────────────────────────────────────────────

function isDatabaseAvailable(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.DATABASE_URL);
}

async function getDb() {
  const { db } = await import("@/lib/db");
  return db;
}

// ─── Coach Storage ──────────────────────────────────────────────────────────

/**
 * Upsert a coach record by name + schoolName.
 *
 * If the coach already exists, updates title, xHandle, and updatedAt.
 * If new, inserts with priorityTier derived from division:
 *   D1_FBS -> "tier_1", D1_FCS -> "tier_2", else "tier_3"
 */
export async function storeCoach(
  schoolName: string,
  division: string,
  conference: string,
  coach: ParsedCoach
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(
      `[storage] DB not configured, skipping: ${coach.name} at ${schoolName}`
    );
    return;
  }

  try {
    const db = await getDb();
    const { coaches } = await import("@/lib/db/schema");
    const { eq, and } = await import("drizzle-orm");

    // Upsert: check if coach exists by name + school
    const existing = await db
      .select()
      .from(coaches)
      .where(
        and(eq(coaches.name, coach.name), eq(coaches.schoolName, schoolName))
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(coaches)
        .set({
          title: coach.title,
          xHandle: coach.xHandle,
          updatedAt: new Date(),
        })
        .where(eq(coaches.id, existing[0].id));
    } else {
      await db.insert(coaches).values({
        name: coach.name,
        title: coach.title,
        schoolName,
        division,
        conference,
        xHandle: coach.xHandle,
        priorityTier:
          division === "D1_FBS"
            ? "tier_1"
            : division === "D1_FCS"
              ? "tier_2"
              : "tier_3",
      });
    }
  } catch (err) {
    console.error(
      `[storage] Failed to store coach ${coach.name} at ${schoolName}:`,
      err
    );
  }
}

// ─── Research Article Storage ───────────────────────────────────────────────

/**
 * Insert or update a research article using Drizzle onConflictDoUpdate on
 * the url unique constraint.
 */
export async function storeResearchArticle(
  result: UnifiedScrapeResult,
  dataType: string
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(
      `[storage] DB not configured, skipping article: ${result.url}`
    );
    return;
  }

  try {
    const db = await getDb();
    const { researchArticles } = await import("@/lib/db/schema");

    await db
      .insert(researchArticles)
      .values({
        url: result.url,
        title: result.title,
        content: result.markdown,
        dataType,
        source: result.source,
        wordCount: result.wordCount,
      })
      .onConflictDoUpdate({
        target: researchArticles.url,
        set: {
          content: result.markdown,
          wordCount: result.wordCount,
          scrapedAt: new Date(),
        },
      });
  } catch (err) {
    console.error(`[storage] Failed to store article ${result.url}:`, err);
  }
}

// ─── Discovery Result Storage ───────────────────────────────────────────────

/**
 * Insert an Exa discovery result into the researchFindings table.
 */
export async function storeDiscoveryResult(
  result: DiscoveryResult
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(
      `[storage] DB not configured, skipping discovery: ${result.query}`
    );
    return;
  }

  try {
    const db = await getDb();
    const { researchFindings } = await import("@/lib/db/schema");

    await db.insert(researchFindings).values({
      query: result.query,
      engine: result.engine,
      results: result.results,
      resultCount: result.resultCount,
    });
  } catch (err) {
    console.error(
      `[storage] Failed to store discovery result for "${result.query}":`,
      err
    );
  }
}

// ─── Article Enrichment Update ──────────────────────────────────────────────

/**
 * Update AI enrichment columns on an existing research article by URL.
 */
export async function updateArticleEnrichment(
  url: string,
  enrichment: ArticleEnrichment
): Promise<void> {
  if (!isDatabaseAvailable()) return;

  try {
    const db = await getDb();
    const { researchArticles } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(researchArticles)
      .set({
        aiSummary: enrichment.summary,
        aiInsights: enrichment.keyInsights,
        aiActionItems: enrichment.actionItems,
        aiRelevanceScore: enrichment.relevanceScore,
        aiTags: enrichment.tags,
        aiProcessedAt: new Date(),
      })
      .where(eq(researchArticles.url, url));
  } catch (err) {
    console.error(
      `[storage] Failed to update enrichment for ${url}:`,
      err
    );
  }
}

// ─── Scraping Stats ─────────────────────────────────────────────────────────

/**
 * Get aggregate counts of scraped data.
 *
 * Returns all zeros if the database is not available.
 */
export async function getScrapingStats(): Promise<{
  coaches: number;
  articles: number;
  enrichedArticles: number;
  discoveries: number;
}> {
  if (!isDatabaseAvailable()) {
    return { coaches: 0, articles: 0, enrichedArticles: 0, discoveries: 0 };
  }

  try {
    const db = await getDb();
    const {
      coaches,
      researchArticles,
      researchFindings,
    } = await import("@/lib/db/schema");
    const { count, isNotNull } = await import("drizzle-orm");

    const [coachCount] = await db.select({ count: count() }).from(coaches);
    const [articleCount] = await db
      .select({ count: count() })
      .from(researchArticles);
    const [enrichedCount] = await db
      .select({ count: count() })
      .from(researchArticles)
      .where(isNotNull(researchArticles.aiProcessedAt));
    const [discoveryCount] = await db
      .select({ count: count() })
      .from(researchFindings);

    return {
      coaches: coachCount.count,
      articles: articleCount.count,
      enrichedArticles: enrichedCount.count,
      discoveries: discoveryCount.count,
    };
  } catch (err) {
    console.error("[storage] Failed to get scraping stats:", err);
    return { coaches: 0, articles: 0, enrichedArticles: 0, discoveries: 0 };
  }
}
