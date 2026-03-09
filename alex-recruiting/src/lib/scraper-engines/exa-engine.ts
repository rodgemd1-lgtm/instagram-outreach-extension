/**
 * Exa Semantic Discovery Engine
 *
 * Wraps the exa-js SDK for neural/semantic search across recruiting topics.
 * Consolidates the five search functions from src/lib/integrations/exa.ts
 * into the unified scraper engine pattern with structured DiscoveryResult output
 * matching the researchFindings DB table shape.
 *
 * Part of the scraper CLI engine suite.
 */

import Exa from "exa-js";

// ─── Exported Types ─────────────────────────────────────────────────────────

export interface DiscoveryResult {
  query: string;
  engine: "exa";
  results: {
    url: string;
    title: string;
    text: string;
    publishedDate?: string;
    author?: string;
  }[];
  resultCount: number;
  searchedAt: string;
}

// ─── Exported Constants ─────────────────────────────────────────────────────

export const DISCOVERY_QUERIES = [
  {
    name: "coachHandles",
    query:
      "D1 D2 OL recruiting coordinator Twitter X handle college football 2025 2026",
    numResults: 25,
  },
  {
    name: "schoolNeeds",
    query:
      "offensive line recruiting needs 2025 2026 2027 2029 college football Big Ten MAC",
    numResults: 15,
  },
  {
    name: "jacobMentions",
    query:
      "Jacob Rodgers Pewaukee football 2029 offensive line recruit Wisconsin",
    numResults: 10,
  },
  {
    name: "competitors",
    query:
      "2029 offensive line recruit Wisconsin Midwest high school football",
    numResults: 15,
  },
  {
    name: "analysts",
    query:
      "recruiting analyst Wisconsin Midwest Big Ten offensive line 247Sports Rivals",
    numResults: 10,
  },
];

// ─── Lazy Singleton Client ──────────────────────────────────────────────────

let _exa: Exa | null = null;

function getExa(): Exa {
  if (!_exa) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error(
        "EXA_API_KEY is not set. Please set the environment variable."
      );
    }
    _exa = new Exa(apiKey);
  }
  return _exa;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

async function runQuery(
  query: string,
  numResults: number
): Promise<DiscoveryResult> {
  const exa = getExa();
  const response = await exa.searchAndContents(query, {
    type: "neural",
    numResults,
    text: true,
  });

  const results = response.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
    author: r.author || undefined,
  }));

  return {
    query,
    engine: "exa",
    results,
    resultCount: results.length,
    searchedAt: new Date().toISOString(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Search for D1/D2 OL coaching staff X handles.
 */
export async function discoverCoachHandles(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES.find((d) => d.name === "coachHandles")!;
  return runQuery(q.query, q.numResults);
}

/**
 * Search for school OL recruiting needs.
 * Accepts optional schoolName to customize the query.
 */
export async function discoverSchoolNeeds(
  schoolName?: string
): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES.find((d) => d.name === "schoolNeeds")!;
  const query = schoolName ? `${schoolName} ${q.query}` : q.query;
  return runQuery(query, q.numResults);
}

/**
 * Monitor Jacob Rodgers recruiting coverage.
 */
export async function discoverJacobMentions(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES.find((d) => d.name === "jacobMentions")!;
  return runQuery(q.query, q.numResults);
}

/**
 * Search for 2029 OL competitors.
 */
export async function discoverCompetitors(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES.find((d) => d.name === "competitors")!;
  return runQuery(q.query, q.numResults);
}

/**
 * Search for recruiting analysts.
 */
export async function discoverAnalysts(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES.find((d) => d.name === "analysts")!;
  return runQuery(q.query, q.numResults);
}

/**
 * Run all 5 discovery queries sequentially with 2-second delays between each.
 * Each query is wrapped in try/catch so failures don't stop subsequent queries.
 */
export async function runAllDiscovery(): Promise<
  { name: string; result: DiscoveryResult | null; error?: string }[]
> {
  const outcomes: {
    name: string;
    result: DiscoveryResult | null;
    error?: string;
  }[] = [];

  for (let i = 0; i < DISCOVERY_QUERIES.length; i++) {
    const q = DISCOVERY_QUERIES[i];

    try {
      const result = await runQuery(q.query, q.numResults);
      outcomes.push({ name: q.name, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[exa] Discovery query "${q.name}" failed: ${message}`);
      outcomes.push({ name: q.name, result: null, error: message });
    }

    // 2-second delay between queries (skip after the last one)
    if (i < DISCOVERY_QUERIES.length - 1) {
      await delay(2000);
    }
  }

  return outcomes;
}
