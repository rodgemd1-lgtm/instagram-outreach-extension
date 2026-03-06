import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export interface ExaSearchResult {
  url: string;
  title: string;
  text: string;
  publishedDate?: string;
  author?: string;
}

// Coach Handle Discovery — search for OL coaching staff X handles
export async function searchCoachHandles(query?: string): Promise<ExaSearchResult[]> {
  const searchQuery = query || "D1 D2 OL recruiting coordinator Twitter X handle college football 2025";

  const result = await exa.searchAndContents(searchQuery, {
    type: "neural",
    numResults: 25,
    text: true,
  });

  return result.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
    author: r.author || undefined,
  }));
}

// Search for specific school's OL recruiting needs
export async function searchSchoolOLNeeds(schoolName: string): Promise<ExaSearchResult[]> {
  const result = await exa.searchAndContents(
    `${schoolName} offensive line recruiting needs 2025 2026 2027 2029`,
    {
      type: "neural",
      numResults: 10,
      text: true,
    }
  );

  return result.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
  }));
}

// Monitor Jacob's name in recruiting coverage
export async function searchJacobMentions(): Promise<ExaSearchResult[]> {
  const result = await exa.searchAndContents(
    "Jacob Rodgers Pewaukee football 2029 offensive line recruit",
    {
      type: "neural",
      numResults: 10,
      text: true,
    }
  );

  return result.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
  }));
}

// Search for competitor recruits
export async function searchCompetitorRecruits(): Promise<ExaSearchResult[]> {
  const result = await exa.searchAndContents(
    "2029 offensive line recruit Wisconsin Midwest high school football Twitter",
    {
      type: "neural",
      numResults: 15,
      text: true,
    }
  );

  return result.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
  }));
}

// Search for recruiting analyst X handles
export async function searchRecruitingAnalysts(): Promise<ExaSearchResult[]> {
  const result = await exa.searchAndContents(
    "recruiting analyst Wisconsin Midwest Big Ten offensive line Twitter 247Sports Rivals",
    {
      type: "neural",
      numResults: 10,
      text: true,
    }
  );

  return result.results.map((r) => ({
    url: r.url,
    title: r.title || "",
    text: r.text || "",
    publishedDate: r.publishedDate || undefined,
  }));
}
