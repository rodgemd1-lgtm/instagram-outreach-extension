/**
 * POST /api/data/news-aggregate
 *
 * Aggregates college football recruiting news relevant to Jacob Rodgers' profile.
 * Searches multiple topics: CFB recruiting 2029, Big Ten OL, Wisconsin football,
 * MAC football, and FCS football recruiting.
 *
 * Request body (optional):
 *   { topics?: string[] }  — custom search topics (defaults to curated list)
 *
 * Response:
 *   { success: true, source: "live"|"mock", articles: Article[], count: number }
 *
 * All external calls are try/catch wrapped. Falls back to curated mock news items.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface NewsArticle {
  url: string;
  title: string;
  summary: string;
  source: string;
  publishedDate: string | null;
  relevanceScore: number;
  topics: string[];
  searchEngine: "brave" | "exa" | "mock";
}

const DEFAULT_SEARCH_TOPICS = [
  "college football recruiting 2029",
  "Big Ten offensive line recruiting",
  "Wisconsin football recruiting",
  "MAC football recruiting 2029",
  "FCS football recruiting offensive line",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const topics: string[] = body.topics ?? DEFAULT_SEARCH_TOPICS;

    let articles: NewsArticle[] = [];
    let source: "live" | "mock" = "mock";

    // Attempt live news aggregation
    const liveResults = await attemptLiveNewsScrape(topics);
    if (liveResults.length > 0) {
      articles = liveResults;
      source = "live";
    } else {
      articles = generateMockNews();
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    articles = articles.filter((a) => {
      const key = a.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by relevance score (highest first)
    articles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Persist to database if available
    if (isDbConfigured() && articles.length > 0) {
      try {
        for (const article of articles) {
          await db
            .insert(schema.researchArticles)
            .values({
              url: article.url,
              title: article.title,
              content: article.summary,
              dataType: "recruiting_news",
              source: article.searchEngine,
              wordCount: article.summary.split(/\s+/).length,
              scrapedAt: new Date(),
              aiRelevanceScore: article.relevanceScore,
              aiTags: article.topics,
            })
            .onConflictDoNothing(); // Skip duplicates by unique URL
        }
      } catch (dbError) {
        console.error("[news-aggregate] DB insert failed:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      source,
      articles,
      count: articles.length,
    });
  } catch (error) {
    console.error("[POST /api/data/news-aggregate]", error);
    return NextResponse.json(
      {
        error: `News aggregation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Attempt to fetch live news from Brave and Exa search engines.
 */
async function attemptLiveNewsScrape(topics: string[]): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  // Strategy 1: Brave search across all topics
  for (const topic of topics) {
    try {
      const brave = await import("@/lib/integrations/brave");
      const results = await brave.searchSchoolRecruitingNews(topic);

      for (const result of results) {
        articles.push({
          url: result.url,
          title: result.title,
          summary: result.description,
          source: extractDomain(result.url),
          publishedDate: result.age ? inferDateFromAge(result.age) : null,
          relevanceScore: scoreRelevance(result.title + " " + result.description),
          topics: [topic],
          searchEngine: "brave",
        });
      }
    } catch {
      // Brave unavailable for this topic
    }
  }

  // Strategy 2: Exa semantic search for deeper analysis articles
  const exaQueries = [
    "college football recruiting analysis offensive line Class of 2029",
    "Wisconsin Midwest high school football recruiting trends",
  ];

  for (const query of exaQueries) {
    try {
      const exa = await import("@/lib/integrations/exa");
      const results = await exa.searchSchoolOLNeeds(query);

      for (const result of results) {
        articles.push({
          url: result.url,
          title: result.title,
          summary: result.text.slice(0, 500),
          source: extractDomain(result.url),
          publishedDate: result.publishedDate ?? null,
          relevanceScore: scoreRelevance(result.title + " " + result.text.slice(0, 300)),
          topics: inferTopics(result.title + " " + result.text.slice(0, 300)),
          searchEngine: "exa",
        });
      }
    } catch {
      // Exa unavailable
    }
  }

  return articles;
}

/**
 * Compute a relevance score (0-100) based on keyword matches.
 */
function scoreRelevance(text: string): number {
  const lower = text.toLowerCase();
  let score = 30; // Base score

  // High-value keywords
  const highKeywords = ["2029", "offensive line", "ol recruiting", "wisconsin"];
  for (const kw of highKeywords) {
    if (lower.includes(kw)) score += 15;
  }

  // Medium-value keywords
  const medKeywords = [
    "big ten", "mac", "fcs", "recruiting", "prospect",
    "camp", "commitment", "offer", "midwest", "pewaukee",
  ];
  for (const kw of medKeywords) {
    if (lower.includes(kw)) score += 5;
  }

  // Bonus for Jacob-specific mentions
  if (lower.includes("jacob rodgers") || lower.includes("pewaukee")) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Infer topic tags from article text.
 */
function inferTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const topics: string[] = [];

  if (lower.includes("big ten")) topics.push("Big Ten");
  if (lower.includes("mac ") || lower.includes("mid-american")) topics.push("MAC");
  if (lower.includes("fcs")) topics.push("FCS");
  if (lower.includes("wisconsin")) topics.push("Wisconsin");
  if (lower.includes("offensive line") || lower.includes("ol ")) topics.push("Offensive Line");
  if (lower.includes("2029") || lower.includes("class of 2029")) topics.push("Class of 2029");
  if (lower.includes("camp") || lower.includes("prospect day")) topics.push("Camps");
  if (lower.includes("commitment") || lower.includes("commit")) topics.push("Commitments");
  if (lower.includes("ranking")) topics.push("Rankings");

  return topics.length > 0 ? topics : ["CFB Recruiting"];
}

/**
 * Extract domain name from a URL for source attribution.
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/**
 * Attempt to infer a date string from Brave's "age" field (e.g., "2 days ago").
 */
function inferDateFromAge(age: string): string | null {
  const now = new Date();
  const match = age.match(/(\d+)\s*(day|hour|week|month)/i);
  if (!match) return null;

  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "hour":
      now.setHours(now.getHours() - num);
      break;
    case "day":
      now.setDate(now.getDate() - num);
      break;
    case "week":
      now.setDate(now.getDate() - num * 7);
      break;
    case "month":
      now.setMonth(now.getMonth() - num);
      break;
  }

  return now.toISOString().split("T")[0];
}

/**
 * Generate curated mock news articles when live scraping is unavailable.
 * Titles and summaries reflect realistic CFB recruiting news content.
 */
function generateMockNews(): NewsArticle[] {
  const today = new Date();
  const articles: NewsArticle[] = [
    {
      url: "https://247sports.com/article/2029-ol-rankings-spring-update",
      title: "2029 Offensive Line Rankings: Spring Update Reveals New Contenders",
      summary:
        "The latest Class of 2029 offensive line rankings see significant movement after the spring camp circuit. Several Midwest prospects have climbed after strong showings at university camps throughout April and May.",
      source: "247sports.com",
      publishedDate: daysAgo(today, 2),
      relevanceScore: 90,
      topics: ["Class of 2029", "Offensive Line", "Rankings"],
      searchEngine: "mock",
    },
    {
      url: "https://rivals.com/news/big-ten-ol-recruiting-2029-targets",
      title: "Big Ten Programs Loading Up on 2029 OL Talent from the Midwest",
      summary:
        "Wisconsin, Iowa, and Northwestern are all actively evaluating Class of 2029 offensive linemen from Wisconsin and Illinois. Sources indicate multiple freshmen received camp invitations for the summer 2026 circuit.",
      source: "rivals.com",
      publishedDate: daysAgo(today, 3),
      relevanceScore: 88,
      topics: ["Big Ten", "Offensive Line", "Class of 2029", "Wisconsin"],
      searchEngine: "mock",
    },
    {
      url: "https://on3.com/news/mac-programs-aggressive-wisconsin-recruiting",
      title: "MAC Programs Taking Aggressive Approach to Wisconsin Recruiting Pipeline",
      summary:
        "Northern Illinois, Western Michigan, and Central Michigan have all increased their presence in Wisconsin. MAC coaching staffs are using X/Twitter DMs to connect with freshmen and sophomores earlier than ever before.",
      source: "on3.com",
      publishedDate: daysAgo(today, 5),
      relevanceScore: 85,
      topics: ["MAC", "Wisconsin", "Class of 2029"],
      searchEngine: "mock",
    },
    {
      url: "https://247sports.com/article/fcs-powerhouses-targeting-midwest-ol",
      title: "FCS Powerhouses NDSU, SDSU Targeting Midwest OL Prospects for 2029",
      summary:
        "North Dakota State and South Dakota State continue to mine the Wisconsin and Minnesota high school football pipeline. Both MVFC programs have offered multiple 2029 offensive linemen in the past month.",
      source: "247sports.com",
      publishedDate: daysAgo(today, 7),
      relevanceScore: 82,
      topics: ["FCS", "Offensive Line", "Class of 2029"],
      searchEngine: "mock",
    },
    {
      url: "https://footballscoop.com/news/spring-camp-results-ol-standouts",
      title: "Spring Camp Circuit: Top OL Performers from the Midwest Region",
      summary:
        "Several Wisconsin and Illinois offensive linemen turned heads at spring camp events hosted by Big Ten and MAC programs. Coaches praised the technical development and physicality of the 2029 class.",
      source: "footballscoop.com",
      publishedDate: daysAgo(today, 10),
      relevanceScore: 78,
      topics: ["Camps", "Offensive Line", "Class of 2029"],
      searchEngine: "mock",
    },
    {
      url: "https://collegefootballnews.com/2026/03/ncaa-recruiting-calendar-changes-2029",
      title: "NCAA Recruiting Calendar Updates: What Class of 2029 Prospects Need to Know",
      summary:
        "The NCAA has updated its recruiting calendar for the 2026-27 cycle. Evaluation periods have shifted and new contact rules affect how coaches can engage with Class of 2029 recruits. Here is what families need to know.",
      source: "collegefootballnews.com",
      publishedDate: daysAgo(today, 12),
      relevanceScore: 75,
      topics: ["Class of 2029", "NCAA Rules"],
      searchEngine: "mock",
    },
    {
      url: "https://badgerextra.com/2026/03/uw-football-spring-recruiting-update",
      title: "Wisconsin Badgers Spring Recruiting Update: OL Remains Top Priority",
      summary:
        "The University of Wisconsin coaching staff has identified offensive line as the top priority for the 2029 recruiting class. The program plans to host multiple prospect camps this summer targeting Wisconsin and Illinois linemen.",
      source: "badgerextra.com",
      publishedDate: daysAgo(today, 4),
      relevanceScore: 92,
      topics: ["Wisconsin", "Big Ten", "Offensive Line", "Camps"],
      searchEngine: "mock",
    },
    {
      url: "https://on3.com/news/social-media-recruiting-impact-2029-class",
      title: "How Social Media Is Reshaping Recruiting for the Class of 2029",
      summary:
        "X/Twitter has become the primary recruiting platform for college football. Coaches report spending 2-3 hours daily reviewing recruit profiles. Prospects with consistent, professional content see 3x more engagement from coaching staffs.",
      source: "on3.com",
      publishedDate: daysAgo(today, 8),
      relevanceScore: 80,
      topics: ["Class of 2029", "CFB Recruiting"],
      searchEngine: "mock",
    },
    {
      url: "https://rivals.com/news/gliac-nsic-d2-recruiting-trends",
      title: "GLIAC and NSIC Programs Expand Recruiting Footprint in Wisconsin",
      summary:
        "D2 programs in the GLIAC and NSIC conferences have ramped up their Wisconsin recruiting efforts. Ferris State, Saginaw Valley, and Minnesota State Mankato are actively pursuing Class of 2029 offensive linemen.",
      source: "rivals.com",
      publishedDate: daysAgo(today, 6),
      relevanceScore: 76,
      topics: ["Class of 2029", "Offensive Line", "Wisconsin"],
      searchEngine: "mock",
    },
    {
      url: "https://footballscoop.com/news/iowa-ol-development-factory",
      title: "Iowa Continues OL Factory Tradition, Eyes 2029 Wisconsin Prospects",
      summary:
        "The Iowa Hawkeyes have produced more NFL offensive linemen than almost any program in the past decade. Their 2029 recruiting board includes several Wisconsin prospects as they look to continue the pipeline.",
      source: "footballscoop.com",
      publishedDate: daysAgo(today, 9),
      relevanceScore: 83,
      topics: ["Big Ten", "Offensive Line", "Wisconsin", "Class of 2029"],
      searchEngine: "mock",
    },
  ];

  return articles;
}

/**
 * Utility to compute a date string N days ago from a reference date.
 */
function daysAgo(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
