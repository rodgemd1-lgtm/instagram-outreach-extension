import { FirecrawlClient } from "@mendable/firecrawl-js";

const firecrawl = new FirecrawlClient({ apiKey: process.env.FIRECRAWL_API_KEY || "" });

export interface ScrapedCoach {
  name: string;
  title: string;
  school: string;
  xHandle?: string;
  email?: string;
  imageUrl?: string;
}

export interface ScrapedRosterPlayer {
  name: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
  hometown: string;
}

// Scrape a school's coaching staff page for OL coaches and recruiting coordinators
export async function scrapeCoachingStaff(staffUrl: string): Promise<{
  content: string;
  coaches: ScrapedCoach[];
}> {
  const result = await firecrawl.scrape(staffUrl, {
    formats: ["markdown"],
  });

  const content = result.markdown || "";
  const coaches = parseCoachesFromMarkdown(content);

  return { content, coaches };
}

// Scrape a school's football roster to identify OL graduation gaps
export async function scrapeRoster(rosterUrl: string): Promise<{
  content: string;
  players: ScrapedRosterPlayer[];
}> {
  const result = await firecrawl.scrape(rosterUrl, {
    formats: ["markdown"],
  });

  const content = result.markdown || "";
  const players = parseRosterFromMarkdown(content);

  return { content, players };
}

// Scrape 247Sports coaching staff directory
export async function scrape247SportsStaff(schoolSlug: string): Promise<string> {
  const url = `https://247sports.com/college/${schoolSlug}/Season/2025-Football/Coaches/`;
  const result = await firecrawl.scrape(url, {
    formats: ["markdown"],
  });

  return result.markdown || "";
}

// Scrape RecruitingMasterList for coach X handles with open DMs
export async function scrapeRecruitingMasterList(): Promise<string> {
  const result = await firecrawl.scrape(
    "https://recruitingmasterlist.com",
    { formats: ["markdown"] }
  );

  return result.markdown || "";
}

// Scrape recent posts from a school's football Twitter to identify active hashtags
export async function scrapeSchoolRecentPosts(url: string): Promise<string> {
  const result = await firecrawl.scrape(url, {
    formats: ["markdown"],
  });

  return result.markdown || "";
}

function parseCoachesFromMarkdown(markdown: string): ScrapedCoach[] {
  const coaches: ScrapedCoach[] = [];
  const lines = markdown.split("\n");

  // Look for patterns like "Name - Title" or "Name | Title" in staff pages
  const titlePatterns = [
    /offensive line/i,
    /OL coach/i,
    /recruiting coordinator/i,
    /head coach/i,
    /assistant.*coach/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    for (const pattern of titlePatterns) {
      if (pattern.test(line) || (i + 1 < lines.length && pattern.test(lines[i + 1]))) {
        // Extract name from the line or surrounding context
        const nameMatch = line.match(/^[#*]*\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
        if (nameMatch) {
          const titleLine = pattern.test(line) ? line : lines[i + 1]?.trim() || "";
          coaches.push({
            name: nameMatch[1],
            title: titleLine.replace(/^[#*\s]+/, ""),
            school: "",
          });
        }
        break;
      }
    }
  }

  return coaches;
}

function parseRosterFromMarkdown(markdown: string): ScrapedRosterPlayer[] {
  const players: ScrapedRosterPlayer[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // Look for OL/OT/OG/C position markers
    if (/\b(OL|OT|OG|C)\b/.test(line)) {
      const parts = line.split(/[|,\t]+/).map((p) => p.trim());
      if (parts.length >= 3) {
        players.push({
          name: parts[0] || "Unknown",
          position: parts.find((p) => /^(OL|OT|OG|C)$/.test(p)) || "OL",
          classYear: parts.find((p) => /^(Fr|So|Jr|Sr|RS)/.test(p)) || "",
          height: parts.find((p) => /^\d+-\d+$/.test(p)) || "",
          weight: parts.find((p) => /^\d{3}$/.test(p)) || "",
          hometown: parts[parts.length - 1] || "",
        });
      }
    }
  }

  return players;
}
