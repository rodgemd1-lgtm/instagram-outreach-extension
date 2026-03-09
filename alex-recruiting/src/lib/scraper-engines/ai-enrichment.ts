/**
 * AI Article Enrichment Module
 *
 * Uses Claude Haiku to summarize and score research articles for
 * Jacob Rodgers' recruiting intelligence pipeline. Extracts summaries,
 * key insights, coach psychology notes, action items, relevance scores,
 * and tags from scraped article content.
 *
 * All public functions return null on failure (never throw).
 */

import Anthropic from "@anthropic-ai/sdk";

// ─── Exported Types ──────────────────────────────────────────────────────────

export interface ArticleEnrichment {
  summary: string;
  keyInsights: string[];
  coachPsychology: string[];
  actionItems: string[];
  relevanceScore: number;
  tags: string[];
}

// ─── Exported Schema ─────────────────────────────────────────────────────────

export const ENRICHMENT_SCHEMA = {
  summary: "string",
  keyInsights: "string[]",
  coachPsychology: "string[]",
  actionItems: "string[]",
  relevanceScore: "number (0-100)",
  tags: "string[]",
} as const;

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_ARTICLE_LENGTH = 8000;
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const BATCH_DELAY_MS = 1000;

// ─── Lazy Singleton Client ──────────────────────────────────────────────────

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

// ─── Prompt Builder ─────────────────────────────────────────────────────────

/**
 * Build the enrichment prompt for Claude.
 *
 * Truncates articles longer than 8000 characters and includes
 * context about Jacob Rodgers and the data type being analyzed.
 */
export function buildEnrichmentPrompt(
  articleText: string,
  dataType: string
): string {
  let text = articleText;
  if (text.length > MAX_ARTICLE_LENGTH) {
    text = text.slice(0, MAX_ARTICLE_LENGTH) + " [TRUNCATED]";
  }

  return `You are analyzing a recruiting research article for a Class of 2029 offensive line recruit (Jacob Rodgers, 6'4" 285 lbs, Pewaukee HS, Wisconsin).

Article category: ${dataType}

Analyze this article and return a JSON object with these exact fields:
- "summary": 2-3 sentence summary of the article
- "keyInsights": array of 3-5 actionable insights relevant to Jacob's recruiting
- "coachPsychology": array of 2-3 insights about how coaches evaluate recruits (based on this article)
- "actionItems": array of 2-3 specific things to implement on Jacob's recruiting website based on this research
- "relevanceScore": integer 0-100 (how relevant is this to an OL recruit's recruiting page)
- "tags": array of category tags (e.g., "coach-evaluation", "film-tips", "profile-optimization")

Return ONLY valid JSON. No markdown, no explanation.

ARTICLE:
${text}`;
}

// ─── Single Article Enrichment ──────────────────────────────────────────────

/**
 * Enrich a single article using Claude Haiku.
 *
 * Returns null if ANTHROPIC_API_KEY is not set or on any error.
 */
export async function enrichArticle(
  articleText: string,
  dataType: string
): Promise<ArticleEnrichment | null> {
  try {
    const client = getClient();
    if (!client) {
      return null;
    }

    const prompt = buildEnrichmentPrompt(articleText, dataType);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (!rawText) {
      return null;
    }

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate shape
    if (typeof parsed.summary !== "string") return null;
    if (!Array.isArray(parsed.keyInsights)) return null;
    if (typeof parsed.relevanceScore !== "number") return null;

    // Normalize optional arrays
    const enrichment: ArticleEnrichment = {
      summary: parsed.summary,
      keyInsights: parsed.keyInsights,
      coachPsychology: Array.isArray(parsed.coachPsychology)
        ? parsed.coachPsychology
        : [],
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems
        : [],
      relevanceScore: parsed.relevanceScore,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };

    return enrichment;
  } catch {
    return null;
  }
}

// ─── Batch Enrichment ───────────────────────────────────────────────────────

/**
 * Enrich a batch of articles with 1-second delays between calls.
 *
 * Returns a Map keyed by article URL with the enrichment result.
 * Articles that fail enrichment are omitted from the map.
 */
export async function enrichArticleBatch(
  articles: { url: string; content: string; dataType: string }[]
): Promise<Map<string, ArticleEnrichment>> {
  const results = new Map<string, ArticleEnrichment>();

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    const enrichment = await enrichArticle(article.content, article.dataType);

    if (enrichment) {
      results.set(article.url, enrichment);
      console.log(
        `[ai-enrichment] (${i + 1}/${articles.length}) ${article.url} — relevance: ${enrichment.relevanceScore}`
      );
    } else {
      console.log(
        `[ai-enrichment] (${i + 1}/${articles.length}) ${article.url} — enrichment failed`
      );
    }

    // 1-second delay between calls (skip after last item)
    if (i < articles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return results;
}
