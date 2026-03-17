import type { ResearchDataType } from "./types";

export interface ResearchStream {
  name: string;
  dataType: ResearchDataType;
  scrapeStrategy: "static" | "playwright" | "susan_ingest";
  urls: string[];
}

const STREAMS: ResearchStream[] = [
  // ── Stream 1: Coach Decision Psychology ────────────────────────────
  {
    name: "Coach Decision Psychology",
    dataType: "coach_psychology",
    scrapeStrategy: "susan_ingest",
    urls: [
      "https://www.ncsasports.org/recruiting/how-to-get-recruited",
      "https://www.ncsasports.org/recruiting/how-to-get-recruited/college-recruiting-process",
      "https://www.ncsasports.org/recruiting/how-to-get-recruited/recruiting-guidelines",
      "https://www.ncsasports.org/football/recruiting-guidelines",
      "https://www.ncsasports.org/recruiting/contacting-college-coaches",
      "https://www.ncsasports.org/recruiting/contacting-college-coaches/when-to-contact",
      "https://www.ncsasports.org/recruiting/contacting-college-coaches/sample-emails",
      "https://www.hudl.com/blog/how-college-coaches-evaluate-recruits",
      "https://www.hudl.com/blog/what-college-coaches-look-for-in-film",
      "https://www.hudl.com/blog/the-recruiting-timeline-for-high-school-athletes",
      "https://www.scholarshipstats.com/football.html",
      "https://www.athnet.com/blog/what-college-coaches-want-to-see-in-recruits",
      "https://www.stack.com/a/what-college-coaches-look-for-when-evaluating-recruits",
      "https://www.prepredzone.com/articles/what-do-college-coaches-look-for",
      "https://www.footballscoop.com/news/recruiting-tips-what-coaches-look-for",
      "https://www.maxpreps.com/news/recruiting-guide-what-coaches-look-for",
      "https://www.si.com/college/recruiting/football/how-college-coaches-evaluate-recruits",
    ],
  },

  // ── Stream 2: Competitive Profile Analysis ─────────────────────────
  {
    name: "Competitive Profile Analysis",
    dataType: "competitive_profiles",
    scrapeStrategy: "susan_ingest",
    urls: [
      "https://247sports.com/sport/football/recruiting/",
      "https://247sports.com/article/how-recruiting-rankings-work/",
      "https://247sports.com/college/wisconsin/season/2029-football/commits/",
      "https://n.rivals.com/content/prospects/football",
      "https://n.rivals.com/news/how-rivals-rankings-are-determined",
      "https://www.on3.com/db/rankings/industry/football/2029/",
      "https://www.on3.com/news/nil-valuations-explained/",
      "https://www.on3.com/news/how-recruiting-rankings-work/",
      "https://www.ncsasports.org/recruiting/create-a-recruiting-profile",
      "https://www.prepredzone.com/rankings/football/2029",
      "https://www.maxpreps.com/rankings/football/",
      "https://www.hudl.com/blog/building-your-recruiting-profile",
    ],
  },

  // ── Stream 3: Coach Contact Database ───────────────────────────────
  {
    name: "Coach Contact Database",
    dataType: "coach_contacts",
    scrapeStrategy: "playwright",
    urls: [
      "https://uwbadgers.com/sports/football/coaches",
      "https://gophersports.com/sports/football/coaches",
      "https://hawkeyesports.com/sports/football/coaches",
      "https://mgoblue.com/sports/football/coaches",
      "https://ohiostatebuckeyes.com/sports/football/coaches",
      "https://purduesports.com/sports/football/coaches",
      "https://msuspartans.com/sports/football/coaches",
      "https://huskers.com/sports/football/coaches",
      "https://iuhoosiers.com/sports/football/coaches",
      "https://fightingillini.com/sports/football/coaches",
      "https://gomarquette.com/sports/football/coaches",
      "https://ndsu.edu/athletics/football/coaches",
    ],
  },

  // ── Stream 4: Reddit/Forum Coach Insights ──────────────────────────
  {
    name: "Reddit/Forum Coach Insights",
    dataType: "forum_insights",
    scrapeStrategy: "playwright",
    urls: [
      "https://www.reddit.com/r/footballcoach/top/?t=year",
      "https://www.reddit.com/r/footballcoach/comments/recruiting_tips",
      "https://www.reddit.com/r/CFB/search/?q=recruiting+process",
      "https://www.reddit.com/r/CFB/search/?q=coach+film+review",
      "https://www.reddit.com/r/coaching/top/?t=year",
      "https://www.reddit.com/r/coaching/search/?q=recruiting",
      "https://www.reddit.com/r/footballstrategy/top/?t=year",
      "https://www.reddit.com/r/footballstrategy/search/?q=offensive+line+recruiting",
      "https://www.reddit.com/r/hsfoot/top/?t=year",
      "https://www.reddit.com/r/hsfoot/search/?q=recruiting+tips",
      "https://coachad.com/articles/category/recruiting/",
      "https://footballscoop.com/forums/recruiting",
      "https://www.operationsports.com/forums/ncaa-football/",
    ],
  },

  // ── Stream 5: Film Effectiveness Research ──────────────────────────
  {
    name: "Film Effectiveness Research",
    dataType: "film_effectiveness",
    scrapeStrategy: "susan_ingest",
    urls: [
      "https://www.hudl.com/blog/how-to-make-a-highlight-film",
      "https://www.hudl.com/blog/highlight-video-mistakes",
      "https://www.hudl.com/blog/football-highlight-tips",
      "https://www.hudl.com/blog/what-coaches-want-to-see-in-highlights",
      "https://www.ncsasports.org/recruiting/media-and-video/highlight-video-tips",
      "https://www.ncsasports.org/recruiting/media-and-video/creating-a-highlight-video",
      "https://www.stack.com/a/how-to-make-a-recruiting-highlight-video",
      "https://www.athnet.com/blog/how-to-make-a-recruiting-highlight-video",
      "https://www.prepredzone.com/articles/film-review-tips-for-recruits",
      "https://www.sports-reference.com/blog/highlight-film-best-practices",
      "https://www.footballscoop.com/news/how-to-make-the-best-recruiting-film",
      "https://www.maxpreps.com/news/highlight-video-guide-for-recruits",
    ],
  },
];

/**
 * Returns all 5 research streams.
 */
export function getAllStreams(): ResearchStream[] {
  return STREAMS;
}

/**
 * Finds a research stream by exact name match.
 */
export function getStreamByName(name: string): ResearchStream | undefined {
  return STREAMS.find((s) => s.name === name);
}

/**
 * Returns a flat list of every URL across all streams,
 * annotated with the parent stream name and data type.
 */
export function getStreamUrls(): {
  url: string;
  streamName: string;
  dataType: ResearchDataType;
}[] {
  return STREAMS.flatMap((stream) =>
    stream.urls.map((url) => ({
      url,
      streamName: stream.name,
      dataType: stream.dataType,
    }))
  );
}
