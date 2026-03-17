// Twitter/X Pattern Analysis Engine
// Identifies recruiting signals from tweets: offer announcements, commitments,
// coach engagement patterns, film shares, and recruiting timeline events.

import type {
  TweetPattern,
  TweetPatternType,
  PatternMatch,
  OfferEvent,
  CommitmentEvent,
} from "../types/recruiting-intelligence";
import type { XTweet } from "../integrations/x-api";

// ============ PATTERN DEFINITIONS ============

const OFFER_PATTERNS: PatternMatch[] = [
  {
    type: "offer_announcement",
    regex: /(?:#AGTG|blessed|honored|excited)\s.*(?:receive|got|earned)\s.*(?:an?\s)?offer\s.*(?:from|by)\s/i,
    keywords: ["offer", "blessed", "AGTG", "receive"],
    weight: 0.95,
  },
  {
    type: "offer_announcement",
    regex: /(?:offer(?:ed)?|scholarship)\s.*(?:from|by|at)\s+(?:@?\w+|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i,
    keywords: ["offer", "scholarship"],
    weight: 0.8,
  },
  {
    type: "offer_announcement",
    regex: /after\s.*(?:great|amazing|awesome)\s.*(?:talk|conversation|call)\s.*(?:with|from)\s.*(?:coach|staff)/i,
    keywords: ["great", "talk", "coach", "offer"],
    weight: 0.7,
  },
];

const COMMITMENT_PATTERNS: PatternMatch[] = [
  {
    type: "commitment",
    regex: /(?:i(?:'m|\sam)\s)?commit(?:ted|ting)\s(?:to|at)\s/i,
    keywords: ["committed", "commit", "decision"],
    weight: 0.95,
  },
  {
    type: "commitment",
    regex: /(?:100%?\s)?commit(?:ted|ment)\s/i,
    keywords: ["committed", "100%"],
    weight: 0.9,
  },
  {
    type: "commitment",
    regex: /(?:i(?:'ve|\shave)\s)?made\s(?:my\s)?decision/i,
    keywords: ["decision", "made"],
    weight: 0.75,
  },
];

const DECOMMITMENT_PATTERNS: PatternMatch[] = [
  {
    type: "decommitment",
    regex: /(?:de-?commit(?:ted|ting)?|open(?:ing|ed)?\s(?:my\s)?recruitment|re-?open(?:ing|ed)?)/i,
    keywords: ["decommit", "reopen", "recruitment"],
    weight: 0.95,
  },
];

const TOP_SCHOOLS_PATTERNS: PatternMatch[] = [
  {
    type: "top_schools_list",
    regex: /(?:my\s)?top\s(?:\d+|five|ten)\s(?:school|program|list)/i,
    keywords: ["top", "schools", "list"],
    weight: 0.9,
  },
  {
    type: "top_schools_list",
    regex: /(?:final|narrowed|cutting)\s.*(?:\d+|down\sto)/i,
    keywords: ["final", "narrowed", "cutting"],
    weight: 0.75,
  },
];

const VISIT_PATTERNS: PatternMatch[] = [
  {
    type: "visit_announcement",
    regex: /(?:great|amazing|awesome|incredible)\s(?:visit|time|day|weekend)\s(?:at|with)\s/i,
    keywords: ["visit", "great", "time"],
    weight: 0.85,
  },
  {
    type: "visit_announcement",
    regex: /(?:official|unofficial)\s(?:visit|OV|UV)/i,
    keywords: ["official visit", "OV", "UV"],
    weight: 0.9,
  },
];

const CAMP_PATTERNS: PatternMatch[] = [
  {
    type: "camp_attendance",
    regex: /(?:great|amazing)\s.*(?:camp|combine|showcase)/i,
    keywords: ["camp", "combine", "showcase"],
    weight: 0.8,
  },
];

const FILM_SHARE_PATTERNS: PatternMatch[] = [
  {
    type: "film_share",
    regex: /(?:hudl\.com|film|highlights?|check\s(?:out|it)|watch|tape)\b/i,
    keywords: ["hudl", "film", "highlight", "tape", "watch"],
    weight: 0.85,
  },
];

const MEASURABLES_PATTERNS: PatternMatch[] = [
  {
    type: "measurables_update",
    regex: /(?:now\s)?(?:\d['′]\d{1,2}["″]?\s*\d{2,3}\s*(?:lbs?|pounds?)|\d{2,3}\s*(?:lbs?|pounds?)\s*\d['′]\d{1,2}["″]?)/i,
    keywords: ["lbs", "height", "weight"],
    weight: 0.8,
  },
  {
    type: "measurables_update",
    regex: /(?:new\s)?(?:40|bench|squat|clean|deadlift)[:\s]*\d/i,
    keywords: ["40", "bench", "squat", "clean"],
    weight: 0.7,
  },
];

const TRAINING_PATTERNS: PatternMatch[] = [
  {
    type: "training_content",
    regex: /(?:grind|work|train(?:ing)?|lift|offseason|putting in work)/i,
    keywords: ["grind", "work", "training", "lift", "offseason"],
    weight: 0.6,
  },
];

const GAME_PATTERNS: PatternMatch[] = [
  {
    type: "game_performance",
    regex: /(?:game\s?day|friday\s?night|let'?s?\s?go|dub|W\b|victory|won)/i,
    keywords: ["gameday", "friday night", "victory", "won"],
    weight: 0.6,
  },
];

const ACADEMIC_PATTERNS: PatternMatch[] = [
  {
    type: "academic_achievement",
    regex: /(?:gpa|honor\s?roll|academic|dean'?s?\s?list|scholar|SAT|ACT)\b/i,
    keywords: ["GPA", "honor roll", "academic", "scholar"],
    weight: 0.75,
  },
];

const ALL_PATTERNS: PatternMatch[] = [
  ...OFFER_PATTERNS,
  ...COMMITMENT_PATTERNS,
  ...DECOMMITMENT_PATTERNS,
  ...TOP_SCHOOLS_PATTERNS,
  ...VISIT_PATTERNS,
  ...CAMP_PATTERNS,
  ...FILM_SHARE_PATTERNS,
  ...MEASURABLES_PATTERNS,
  ...TRAINING_PATTERNS,
  ...GAME_PATTERNS,
  ...ACADEMIC_PATTERNS,
];

// ============ ANALYSIS ENGINE ============

// Analyze a single tweet for recruiting patterns
export function analyzeTweet(
  tweet: XTweet,
  authorHandle: string,
  authorName: string
): TweetPattern | null {
  const text = tweet.text;
  let bestMatch: { type: TweetPatternType; confidence: number } | null = null;

  for (const pattern of ALL_PATTERNS) {
    if (pattern.regex.test(text)) {
      const keywordBoost = pattern.keywords.reduce((boost, kw) => {
        return text.toLowerCase().includes(kw.toLowerCase()) ? boost + 0.05 : boost;
      }, 0);

      const confidence = Math.min(pattern.weight + keywordBoost, 1.0);

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { type: pattern.type, confidence };
      }
    }
  }

  if (!bestMatch) return null;

  return {
    id: crypto.randomUUID(),
    tweetId: tweet.id,
    authorHandle,
    authorName,
    tweetText: text,
    createdAt: tweet.created_at,
    patternType: bestMatch.type,
    confidence: bestMatch.confidence,
    schoolMentions: extractSchoolMentions(text),
    coachMentions: extractCoachMentions(text),
    hashtags: extractHashtags(text),
    mediaUrls: [],
    likes: tweet.public_metrics?.like_count || 0,
    retweets: tweet.public_metrics?.retweet_count || 0,
    replies: tweet.public_metrics?.reply_count || 0,
    impressions: tweet.public_metrics?.impression_count || 0,
    analyzedAt: Date.now(),
  };
}

// Analyze a batch of tweets
export function analyzeTweets(
  tweets: XTweet[],
  authorHandle: string,
  authorName: string
): TweetPattern[] {
  return tweets
    .map((tweet) => analyzeTweet(tweet, authorHandle, authorName))
    .filter((p): p is TweetPattern => p !== null);
}

// Extract offer events from analyzed patterns
export function extractOfferEvents(patterns: TweetPattern[]): OfferEvent[] {
  return patterns
    .filter((p) => p.patternType === "offer_announcement")
    .map((p) => ({
      id: crypto.randomUUID(),
      athleteHandle: p.authorHandle,
      athleteName: p.authorName,
      schoolName: p.schoolMentions[0] || "Unknown",
      schoolHandle: extractFirstHandle(p.tweetText, p.authorHandle),
      coachName: null,
      coachHandle: p.coachMentions[0] || null,
      offerDate: p.createdAt,
      sourceTweetId: p.tweetId,
      sourceTweetUrl: `https://x.com/${p.authorHandle}/status/${p.tweetId}`,
      verified: p.confidence > 0.9,
      division: null,
      conference: null,
    }));
}

// Extract commitment events from analyzed patterns
export function extractCommitmentEvents(patterns: TweetPattern[]): CommitmentEvent[] {
  return patterns
    .filter((p) => p.patternType === "commitment" || p.patternType === "decommitment")
    .map((p) => ({
      id: crypto.randomUUID(),
      athleteHandle: p.authorHandle,
      athleteName: p.authorName,
      schoolName: p.schoolMentions[0] || "Unknown",
      commitDate: p.createdAt,
      decommitDate: p.patternType === "decommitment" ? p.createdAt : null,
      sourceTweetId: p.tweetId,
      isDecommitment: p.patternType === "decommitment",
      previousSchool: null,
    }));
}

// ============ ENTITY EXTRACTION ============

// Known school names and variations for matching
const SCHOOL_NAMES: Record<string, string[]> = {
  Wisconsin: ["Wisconsin", "UW", "Badgers", "@BadgerFootball"],
  Iowa: ["Iowa", "Hawkeyes", "@HawkeyeFootball"],
  "Iowa State": ["Iowa State", "Cyclones", "@CycloneFB"],
  Northwestern: ["Northwestern", "Wildcats", "@NUFBFamily"],
  "Northern Illinois": ["Northern Illinois", "NIU", "Huskies", "@NIU_Football"],
  "Western Michigan": ["Western Michigan", "WMU", "Broncos", "@WMU_Football"],
  "Ball State": ["Ball State", "@BallStateFB"],
  "Central Michigan": ["Central Michigan", "CMU", "Chippewas", "@CMU_Football"],
  "South Dakota State": ["South Dakota State", "SDSU", "Jackrabbits", "@GoJacksFB"],
  "North Dakota State": ["North Dakota State", "NDSU", "Bison", "@NDSUfootball"],
  "Illinois State": ["Illinois State", "Redbirds", "@RedbirdFB"],
  "Youngstown State": ["Youngstown State", "Penguins", "@ysabordfb"],
  "Saginaw Valley": ["Saginaw Valley", "SVSU", "@SVSUFootball"],
  "Michigan Tech": ["Michigan Tech", "MTU", "@MTUFootball"],
  "Ferris State": ["Ferris State", "Bulldogs", "@FerrisFootball"],
  "Winona State": ["Winona State", "@WinonaStateFB"],
  "Minnesota State": ["Minnesota State", "Mankato", "Mavericks", "@MNMavsFootball"],
};

function extractSchoolMentions(text: string): string[] {
  const mentions: string[] = [];

  for (const [school, aliases] of Object.entries(SCHOOL_NAMES)) {
    for (const alias of aliases) {
      if (text.includes(alias)) {
        mentions.push(school);
        break;
      }
    }
  }

  // Also look for generic university patterns
  const uniPattern = /(?:University of|Univ\.?\s)([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g;
  let match;
  while ((match = uniPattern.exec(text)) !== null) {
    if (!mentions.includes(match[1])) {
      mentions.push(match[1]);
    }
  }

  return mentions;
}

function extractCoachMentions(text: string): string[] {
  // Extract @handles that follow "Coach" or coaching title patterns
  const coachHandlePattern = /@(\w+)(?=\s|$)/g;
  const handles: string[] = [];
  let match;

  while ((match = coachHandlePattern.exec(text)) !== null) {
    // Filter out known school handles
    const handle = match[1];
    const isSchoolHandle = Object.values(SCHOOL_NAMES).some((aliases) =>
      aliases.some((a) => a === `@${handle}`)
    );
    if (!isSchoolHandle && handle.toLowerCase().includes("coach")) {
      handles.push(`@${handle}`);
    }
  }

  // Also look for "Coach [Name]" patterns
  const coachNamePattern = /Coach\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g;
  while ((match = coachNamePattern.exec(text)) !== null) {
    handles.push(match[1]);
  }

  return handles;
}

function extractHashtags(text: string): string[] {
  const hashtagPattern = /#(\w+)/g;
  const tags: string[] = [];
  let match;

  while ((match = hashtagPattern.exec(text)) !== null) {
    tags.push(`#${match[1]}`);
  }

  return tags;
}

function extractFirstHandle(text: string, excludeHandle: string): string | null {
  const handlePattern = /@(\w+)/g;
  let match;

  while ((match = handlePattern.exec(text)) !== null) {
    if (match[1].toLowerCase() !== excludeHandle.replace("@", "").toLowerCase()) {
      return `@${match[1]}`;
    }
  }

  return null;
}

// ============ SEARCH QUERIES ============

// Generate X/Twitter search queries for finding recruiting activity
export function buildRecruitingSearchQuery(options: {
  athleteHandle?: string;
  schoolName?: string;
  position?: string;
  classYear?: number;
  patternType?: TweetPatternType;
}): string {
  const parts: string[] = [];

  if (options.athleteHandle) {
    parts.push(`from:${options.athleteHandle.replace("@", "")}`);
  }

  if (options.schoolName) {
    const aliases = SCHOOL_NAMES[options.schoolName];
    if (aliases && aliases.length > 0) {
      parts.push(`(${aliases.slice(0, 3).join(" OR ")})`);
    } else {
      parts.push(`"${options.schoolName}"`);
    }
  }

  if (options.position) {
    parts.push(options.position);
  }

  if (options.classYear) {
    parts.push(`(${options.classYear} OR '${String(options.classYear).slice(-2)})`);
  }

  if (options.patternType === "offer_announcement") {
    parts.push("(offer OR blessed OR AGTG)");
  } else if (options.patternType === "commitment") {
    parts.push("(committed OR commitment OR decision)");
  } else if (options.patternType === "film_share") {
    parts.push("(hudl OR highlights OR film)");
  }

  return parts.join(" ");
}

// Generate a monitoring query for tracking competitor recruits
export function buildCompetitorMonitorQuery(
  handles: string[],
  position: string = "OL"
): string {
  const handleList = handles.map((h) => `from:${h.replace("@", "")}`).join(" OR ");
  return `(${handleList}) (${position} OR offer OR committed OR camp)`;
}
