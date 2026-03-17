import type { ResearchDataType, ResearchSource } from "./types";

const URL_PATTERNS: [RegExp, ResearchDataType][] = [
  [/ncsa|berecruited|how-to-get-recruited|recruiting-guide/i, "coach_psychology"],
  [/hudl\.com\/profile|247sports|rivals\.com\/player|on3\.com/i, "competitive_profiles"],
  [/reddit\.com\/r\/(footballcoach|CFB|coaching)/i, "forum_insights"],
  [/ncaa\.org|naia\.org|eligibilitycenter/i, "recruiting_rules"],
  [/highlight|film|reel|clip|video-length/i, "film_effectiveness"],
];

export function categorizeUrl(url: string): ResearchDataType {
  for (const [pattern, dataType] of URL_PATTERNS) {
    if (pattern.test(url)) return dataType;
  }
  return "coach_psychology"; // default
}

export function buildResearchSources(): ResearchSource[] {
  return [
    {
      name: "NCSA Recruiting Guides",
      urls: [
        "https://www.ncsasports.org/how-to-get-recruited",
        "https://www.ncsasports.org/recruiting/how-to-get-recruited/football",
        "https://www.ncsasports.org/football-recruiting",
      ],
      dataType: "coach_psychology",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Hudl Recruiting Resources",
      urls: [
        "https://www.hudl.com/blog/recruiting",
      ],
      dataType: "coach_psychology",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Reddit Coach Forums",
      urls: [
        "https://www.reddit.com/r/footballcoach/",
        "https://www.reddit.com/r/CFB/",
      ],
      dataType: "forum_insights",
      scrapeStrategy: "playwright",
    },
    {
      name: "NCAA Eligibility & Rules",
      urls: [
        "https://www.ncaa.org/sports/2021/2/10/recruiting.aspx",
        "https://web3.ncaa.org/ecwr3/",
      ],
      dataType: "recruiting_rules",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Film Effectiveness Research",
      urls: [
        "https://www.hudl.com/blog/how-to-make-a-highlight-video",
      ],
      dataType: "film_effectiveness",
      scrapeStrategy: "susan_ingest",
    },
  ];
}
