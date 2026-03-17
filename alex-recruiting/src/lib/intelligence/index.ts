// Recruiting Intelligence System — Public API
// Central entry point for all intelligence features.

export {
  scrapeHudlProfile,
  batchScrapeHudlProfiles,
  isValidHudlUrl,
  extractHudlUrl,
  parseHudlMarkdown,
  createScrapeJob,
} from "./hudl-scraper";

export {
  analyzeTweet,
  analyzeTweets,
  extractOfferEvents,
  extractCommitmentEvents,
  buildRecruitingSearchQuery,
  buildCompetitorMonitorQuery,
} from "./twitter-patterns";

export {
  calculateIntelligenceScore,
  calculateRecruitingTimeline,
} from "./scoring-engine";

export {
  analyzeCoachBehavior,
  rankCoachesByResponseLikelihood,
  getCoachInsights,
} from "./coach-behavior";
