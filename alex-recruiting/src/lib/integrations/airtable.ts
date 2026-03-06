// Airtable API Integration for Content Management
// Uses Airtable REST API with personal access token
// Docs: https://airtable.com/developers/web/api/introduction

import type { AirtablePostRecord } from "../data/airtable-export";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

// ─── Configuration ──────────────────────────────────────────────────────────

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  postsTableId: string;
  dmsTableId: string;
  coachesTableId: string;
}

export function getConfig(): AirtableConfig {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || "";
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "";
  const postsTableId =
    process.env.AIRTABLE_POSTS_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_POSTS_TABLE_ID || "Posts";
  const dmsTableId =
    process.env.AIRTABLE_DMS_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_DMS_TABLE_ID || "DMs";
  const coachesTableId =
    process.env.AIRTABLE_COACHES_TABLE_ID ||
    process.env.NEXT_PUBLIC_AIRTABLE_COACHES_TABLE_ID ||
    "Coaches";

  return { apiKey, baseId, postsTableId, dmsTableId, coachesTableId };
}

export function isConfigured(): boolean {
  const config = getConfig();
  return Boolean(config.apiKey && config.baseId);
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface AirtableFieldsMap {
  [key: string]: string | number | boolean | string[] | null;
}

interface AirtableRecord {
  id: string;
  fields: AirtableFieldsMap;
  createdTime: string;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableCreateResponse {
  id: string;
  fields: AirtableFieldsMap;
  createdTime: string;
}

interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 210; // Airtable allows ~5 requests/sec

async function rateLimitedFetch(
  url: string,
  options: RequestInit
): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url, options);
}

// ─── Core API Helpers ───────────────────────────────────────────────────────

function getHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function buildTableUrl(baseId: string, tableId: string): string {
  return `${AIRTABLE_API_URL}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as AirtableError | null;
    const message = errorBody?.error?.message || response.statusText;
    throw new Error(
      `Airtable API error (${response.status}): ${message}`
    );
  }
  return response.json() as Promise<T>;
}

// ─── Post Record Mapping ────────────────────────────────────────────────────

function postToAirtableFields(record: AirtablePostRecord): AirtableFieldsMap {
  return {
    "Post ID": record.id,
    "Week Number": record.weekNumber,
    "Day of Week": record.dayOfWeek,
    "Post Date": record.postDate,
    "Post Time": record.postTime,
    Pillar: record.pillar,
    Content: record.content,
    Hashtags: record.hashtags,
    "Media Type": record.mediaType,
    "Media Description": record.mediaDescription,
    Status: record.status,
    "Constitution Check": record.constitutionCheck,
    Notes: record.notes,
    "X Post URL": record.xPostUrl,
    "Engagement: Likes": record.engagementLikes,
    "Engagement: Retweets": record.engagementRetweets,
    "Engagement: Replies": record.engagementReplies,
    "Engagement: Impressions": record.engagementImpressions,
  };
}

function airtableFieldsToPost(
  recordId: string,
  fields: AirtableFieldsMap
): AirtablePostRecord & { airtableRecordId: string } {
  return {
    airtableRecordId: recordId,
    id: String(fields["Post ID"] || ""),
    weekNumber: Number(fields["Week Number"] || 0),
    dayOfWeek: String(fields["Day of Week"] || ""),
    postDate: String(fields["Post Date"] || ""),
    postTime: String(fields["Post Time"] || ""),
    pillar: String(fields["Pillar"] || ""),
    content: String(fields["Content"] || ""),
    hashtags: String(fields["Hashtags"] || ""),
    mediaType: String(fields["Media Type"] || ""),
    mediaDescription: String(fields["Media Description"] || ""),
    status: (fields["Status"] as AirtablePostRecord["status"]) || "Draft",
    constitutionCheck:
      (fields["Constitution Check"] as AirtablePostRecord["constitutionCheck"]) || "Pending",
    notes: String(fields["Notes"] || ""),
    xPostUrl: String(fields["X Post URL"] || ""),
    engagementLikes: Number(fields["Engagement: Likes"] || 0),
    engagementRetweets: Number(fields["Engagement: Retweets"] || 0),
    engagementReplies: Number(fields["Engagement: Replies"] || 0),
    engagementImpressions: Number(fields["Engagement: Impressions"] || 0),
  };
}

// ─── CRUD Operations ────────────────────────────────────────────────────────

export async function createPostRecord(
  record: AirtablePostRecord,
  config?: AirtableConfig
): Promise<AirtableCreateResponse> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.");
  }

  const url = buildTableUrl(cfg.baseId, cfg.postsTableId);
  const response = await rateLimitedFetch(url, {
    method: "POST",
    headers: getHeaders(cfg.apiKey),
    body: JSON.stringify({ fields: postToAirtableFields(record) }),
  });

  return handleResponse<AirtableCreateResponse>(response);
}

export async function createPostRecordsBatch(
  records: AirtablePostRecord[],
  config?: AirtableConfig
): Promise<AirtableCreateResponse[]> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.");
  }

  const url = buildTableUrl(cfg.baseId, cfg.postsTableId);
  const results: AirtableCreateResponse[] = [];

  // Airtable allows max 10 records per batch create
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const response = await rateLimitedFetch(url, {
      method: "POST",
      headers: getHeaders(cfg.apiKey),
      body: JSON.stringify({
        records: batch.map((r) => ({ fields: postToAirtableFields(r) })),
      }),
    });

    const data = await handleResponse<{ records: AirtableCreateResponse[] }>(response);
    results.push(...data.records);
  }

  return results;
}

export async function updatePostStatus(
  recordId: string,
  status: AirtablePostRecord["status"],
  config?: AirtableConfig
): Promise<AirtableCreateResponse> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const url = `${buildTableUrl(cfg.baseId, cfg.postsTableId)}/${encodeURIComponent(recordId)}`;
  const response = await rateLimitedFetch(url, {
    method: "PATCH",
    headers: getHeaders(cfg.apiKey),
    body: JSON.stringify({ fields: { Status: status } }),
  });

  return handleResponse<AirtableCreateResponse>(response);
}

export async function getUpcomingPosts(
  days: number = 7,
  config?: AirtableConfig
): Promise<(AirtablePostRecord & { airtableRecordId: string })[]> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const todayStr = today.toISOString().split("T")[0];
  const futureStr = futureDate.toISOString().split("T")[0];

  const formula = `AND(IS_AFTER({Post Date}, '${todayStr}'), IS_BEFORE({Post Date}, '${futureStr}'))`;
  const url = `${buildTableUrl(cfg.baseId, cfg.postsTableId)}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Post Date&sort[0][direction]=asc`;

  const response = await rateLimitedFetch(url, {
    method: "GET",
    headers: getHeaders(cfg.apiKey),
  });

  const data = await handleResponse<AirtableListResponse>(response);
  return data.records.map((r) => airtableFieldsToPost(r.id, r.fields));
}

export async function syncPostEngagement(
  recordId: string,
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  },
  config?: AirtableConfig
): Promise<AirtableCreateResponse> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const url = `${buildTableUrl(cfg.baseId, cfg.postsTableId)}/${encodeURIComponent(recordId)}`;
  const response = await rateLimitedFetch(url, {
    method: "PATCH",
    headers: getHeaders(cfg.apiKey),
    body: JSON.stringify({
      fields: {
        "Engagement: Likes": metrics.likes,
        "Engagement: Retweets": metrics.retweets,
        "Engagement: Replies": metrics.replies,
        "Engagement: Impressions": metrics.impressions,
      },
    }),
  });

  return handleResponse<AirtableCreateResponse>(response);
}

export async function createDMRecord(
  record: {
    id: string;
    name: string;
    template: string;
    sequence: string;
    tier: string;
    trigger: string;
    coachName?: string;
    schoolName?: string;
    status?: string;
  },
  config?: AirtableConfig
): Promise<AirtableCreateResponse> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const url = buildTableUrl(cfg.baseId, cfg.dmsTableId);
  const response = await rateLimitedFetch(url, {
    method: "POST",
    headers: getHeaders(cfg.apiKey),
    body: JSON.stringify({
      fields: {
        "DM ID": record.id,
        Name: record.name,
        Template: record.template,
        Sequence: record.sequence,
        Tier: record.tier,
        Trigger: record.trigger,
        "Coach Name": record.coachName || "",
        "School Name": record.schoolName || "",
        Status: record.status || "Draft",
      },
    }),
  });

  return handleResponse<AirtableCreateResponse>(response);
}

export async function getPostsReadyToPublish(
  config?: AirtableConfig
): Promise<(AirtablePostRecord & { airtableRecordId: string })[]> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const formula = `{Status} = 'Ready'`;
  const url = `${buildTableUrl(cfg.baseId, cfg.postsTableId)}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Post Date&sort[0][direction]=asc`;

  const response = await rateLimitedFetch(url, {
    method: "GET",
    headers: getHeaders(cfg.apiKey),
  });

  const data = await handleResponse<AirtableListResponse>(response);
  return data.records.map((r) => airtableFieldsToPost(r.id, r.fields));
}

export async function markAsPosted(
  recordId: string,
  xPostUrl: string,
  config?: AirtableConfig
): Promise<AirtableCreateResponse> {
  const cfg = config || getConfig();
  if (!cfg.apiKey || !cfg.baseId) {
    throw new Error("Airtable is not configured.");
  }

  const url = `${buildTableUrl(cfg.baseId, cfg.postsTableId)}/${encodeURIComponent(recordId)}`;
  const response = await rateLimitedFetch(url, {
    method: "PATCH",
    headers: getHeaders(cfg.apiKey),
    body: JSON.stringify({
      fields: {
        Status: "Posted",
        "X Post URL": xPostUrl,
      },
    }),
  });

  return handleResponse<AirtableCreateResponse>(response);
}
