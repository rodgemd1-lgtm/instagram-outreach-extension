import type { ResearchDataType, IngestionResult } from "./types";

const DISALLOWED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0"];

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (DISALLOWED_DOMAINS.some(d => parsed.hostname.includes(d))) return false;
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function buildIngestionPayload(url: string, dataType: ResearchDataType) {
  return {
    url,
    data_type: dataType,
    company_id: "alex-recruiting",
  };
}

export async function ingestUrl(
  url: string,
  dataType: ResearchDataType
): Promise<IngestionResult> {
  if (!validateUrl(url)) {
    return { url, success: false, error: "Invalid URL" };
  }

  try {
    const response = await fetch("/api/research/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildIngestionPayload(url, dataType)),
    });

    if (!response.ok) {
      return { url, success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { url, success: true, chunksCreated: data.chunks_created };
  } catch (error) {
    return { url, success: false, error: String(error) };
  }
}
