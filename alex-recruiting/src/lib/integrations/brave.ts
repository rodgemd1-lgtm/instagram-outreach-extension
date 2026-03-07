import axios from "axios";

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

async function braveSearch(query: string, count: number = 10): Promise<BraveSearchResult[]> {
  const response = await axios.get(BRAVE_API_URL, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": process.env.BRAVE_API_KEY,
    },
    params: { q: query, count },
  });

  return (response.data.web?.results || []).map((r: Record<string, string>) => ({
    title: r.title,
    url: r.url,
    description: r.description,
    age: r.age,
  }));
}

// Monitor trending recruiting hashtags
export async function searchTrendingHashtags(): Promise<BraveSearchResult[]> {
  return braveSearch("trending college football recruiting hashtags Twitter X 2025");
}

// Research Wisconsin-region programs
export async function searchWisconsinPrograms(): Promise<BraveSearchResult[]> {
  return braveSearch("Wisconsin high school football OL recruit Big Ten MAC GLIAC NSIC 2029");
}

// Monitor coaching staff changes at target schools
export async function searchCoachingChanges(schoolName: string): Promise<BraveSearchResult[]> {
  return braveSearch(`${schoolName} football coaching staff changes 2025`);
}

// Track Jacob's recruiting mentions
export async function searchJacobMentions(): Promise<BraveSearchResult[]> {
  return braveSearch("Jacob Rodgers Pewaukee football offensive line 2029 recruit");
}

// Monitor recruiting news for target schools
export async function searchSchoolRecruitingNews(schoolName: string): Promise<BraveSearchResult[]> {
  return braveSearch(`${schoolName} football recruiting 2029 offensive line class`);
}

// Research competitor recruits
export async function searchCompetitorRecruits(recruitName: string): Promise<BraveSearchResult[]> {
  return braveSearch(`${recruitName} football recruit 2029 offensive line`);
}

// Find school-specific hashtags
export async function searchSchoolHashtags(schoolName: string): Promise<BraveSearchResult[]> {
  return braveSearch(`${schoolName} football Twitter hashtag official`);
}

// Weekly content opportunity discovery
export async function searchContentOpportunities(): Promise<BraveSearchResult[]> {
  return braveSearch("college football recruiting trending topics offensive line this week");
}
