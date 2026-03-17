export type ResearchDataType =
  | "coach_psychology"
  | "competitive_profiles"
  | "coach_contacts"
  | "recruiting_rules"
  | "film_effectiveness"
  | "forum_insights";

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  dataType: ResearchDataType;
  scrapedAt: string;
}

export interface IngestionResult {
  url: string;
  success: boolean;
  chunksCreated?: number;
  error?: string;
}

export interface ResearchSource {
  name: string;
  urls: string[];
  dataType: ResearchDataType;
  scrapeStrategy: "static" | "playwright" | "susan_ingest";
}
