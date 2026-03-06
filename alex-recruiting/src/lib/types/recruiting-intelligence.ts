// Recruiting Intelligence System — Core Types
// Extends the Alex Recruiting system with Hudl scraping, Twitter pattern analysis,
// coach behavior prediction, and recruiting intelligence scoring.

// ============ HUDL PROFILE DATA ============

export interface HudlProfile {
  profileId: string; // Numeric Hudl ID
  profileUrl: string; // Full URL: hudl.com/profile/<id>/<slug>
  athleteName: string;
  position: string;
  positionDetails: string[]; // e.g., ["OT", "OG"]
  height: string;
  weight: string;
  gradYear: number;
  highSchool: string;
  city: string;
  state: string;
  jerseyNumber: string | null;

  // Academic
  gpa: string | null;
  satScore: number | null;
  actScore: number | null;

  // Film
  highlightReels: HudlHighlight[];
  gameFilmCount: number;
  totalPlaysTagged: number;

  // Recruiting
  recruitingOptIn: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  bio: string | null;

  // Engagement (when visible)
  profileViews: number | null;

  // Metadata
  scrapedAt: number;
  scrapeSource: "jina" | "firecrawl" | "manual";
  rawMarkdown: string | null;
}

export interface HudlHighlight {
  title: string;
  url: string;
  duration: string | null;
  viewCount: number | null;
  createdAt: string | null;
}

// ============ TWITTER/X PATTERN ANALYSIS ============

export interface TweetPattern {
  id: string;
  tweetId: string;
  authorHandle: string;
  authorName: string;
  tweetText: string;
  createdAt: string;
  patternType: TweetPatternType;
  confidence: number; // 0-1

  // Extracted entities
  schoolMentions: string[];
  coachMentions: string[];
  hashtags: string[];
  mediaUrls: string[];

  // Engagement
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;

  analyzedAt: number;
}

export type TweetPatternType =
  | "offer_announcement" // "#AGTG Blessed to receive an offer from..."
  | "commitment" // "I am committed to..."
  | "decommitment" // "I have decommitted from..."
  | "top_schools_list" // "My Top 5/10 schools..."
  | "visit_announcement" // "Had a great visit at..."
  | "camp_attendance" // "Great time at [school] camp..."
  | "coach_engagement" // Coach liking/retweeting/replying to recruit
  | "film_share" // Sharing Hudl/film link
  | "measurables_update" // Height/weight/speed updates
  | "training_content" // Workout/training posts
  | "game_performance" // Game highlights/stats
  | "academic_achievement" // GPA, test scores, awards
  | "generic_recruiting"; // Other recruiting-related content

export interface PatternMatch {
  type: TweetPatternType;
  regex: RegExp;
  keywords: string[];
  weight: number; // Higher = stronger signal
}

// ============ OFFER TRACKING ============

export interface OfferEvent {
  id: string;
  athleteHandle: string;
  athleteName: string;
  schoolName: string;
  schoolHandle: string | null;
  coachName: string | null;
  coachHandle: string | null;
  offerDate: string;
  sourceTweetId: string;
  sourceTweetUrl: string;
  verified: boolean; // Cross-referenced with school/coach confirmation
  division: string | null;
  conference: string | null;
}

export interface CommitmentEvent {
  id: string;
  athleteHandle: string;
  athleteName: string;
  schoolName: string;
  commitDate: string;
  decommitDate: string | null;
  sourceTweetId: string;
  isDecommitment: boolean;
  previousSchool: string | null;
}

// ============ RECRUITING INTELLIGENCE SCORES ============

export interface RecruitingIntelligenceScore {
  athleteId: string;
  athleteName: string;
  overallScore: number; // 0-100

  // Sub-scores
  filmScore: FilmScore;
  socialPresenceScore: SocialPresenceScore;
  recruitingMomentumScore: RecruitingMomentumScore;
  academicScore: AcademicScore;
  physicalProfileScore: PhysicalProfileScore;

  // Composite insights
  tierProjection: TierProjection;
  recommendations: IntelligenceRecommendation[];

  calculatedAt: number;
  dataCompleteness: number; // 0-1, how much data we have
}

export interface FilmScore {
  score: number; // 0-100
  hasHudlProfile: boolean;
  highlightCount: number;
  gameFilmAvailable: boolean;
  totalTaggedPlays: number;
  filmQualityIndicators: string[];
}

export interface SocialPresenceScore {
  score: number; // 0-100
  followerCount: number;
  coachFollowerCount: number; // How many coaches follow this recruit
  postFrequency: number; // Posts per week
  engagementRate: number;
  contentPillarBalance: Record<string, number>;
  profileCompleteness: number; // 0-1
}

export interface RecruitingMomentumScore {
  score: number; // 0-100
  totalOffers: number;
  d1Offers: number;
  fcsOffers: number;
  d2Offers: number;
  recentOfferVelocity: number; // Offers in last 30 days
  campAttendance: number;
  officialVisits: number;
  uncommitted: boolean;
  trendDirection: "rising" | "stable" | "cooling";
}

export interface AcademicScore {
  score: number; // 0-100
  gpaAvailable: boolean;
  gpa: number | null;
  testScoresAvailable: boolean;
  satScore: number | null;
  actScore: number | null;
  academicHighlights: string[];
}

export interface PhysicalProfileScore {
  score: number; // 0-100
  height: string;
  weight: string;
  meetsD1Threshold: boolean;
  meetsD2Threshold: boolean;
  growthProjection: string | null; // Based on class year and current size
  positionFit: string[];
}

export interface TierProjection {
  currentTier: "Elite" | "High" | "Mid" | "Developmental" | "Unknown";
  projectedTier: "Elite" | "High" | "Mid" | "Developmental" | "Unknown";
  confidence: number; // 0-1
  rationale: string;
  comparableRecruits: string[]; // Names of similar-profile recruits
}

export interface IntelligenceRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: "film" | "social" | "engagement" | "academics" | "timing" | "content";
  title: string;
  description: string;
  actionItems: string[];
  deadline: string | null;
}

// ============ COACH BEHAVIOR PREDICTION ============

export interface CoachBehaviorProfile {
  coachId: string;
  coachName: string;
  schoolName: string;
  division: string;
  conference: string;

  // Engagement patterns
  avgResponseTime: number | null; // Hours to respond to DMs
  dmOpenProbability: number; // 0-1
  followBackProbability: number; // 0-1
  engagementStyle: CoachEngagementStyle;

  // Recruiting patterns
  recruitingSeasonality: MonthlyActivity[];
  preferredContactMethod: "dm" | "reply" | "camp_invite" | "unknown";
  typicalOfferTimeline: string; // e.g., "Junior spring" or "After camp"
  positionNeedLevel: number; // 1-5 for OL specifically

  // X/Twitter behavior
  tweetFrequency: number; // Tweets per week
  peakActivityHours: number[]; // Hours of day (0-23) with most activity
  commonHashtags: string[];
  interactsWithRecruits: boolean;
  interactionTypes: ("like" | "retweet" | "reply" | "follow")[];

  // Prediction
  bestApproachStrategy: ApproachStrategy;
  optimalContactWindow: ContactWindow;

  lastUpdated: number;
}

export type CoachEngagementStyle =
  | "highly_responsive" // Responds to most DMs, likes recruit posts
  | "selective" // Only engages with top prospects
  | "broadcast_only" // Posts but rarely interacts 1:1
  | "quiet_evaluator" // Low social activity, evaluates behind scenes
  | "unknown";

export interface MonthlyActivity {
  month: number; // 1-12
  activityLevel: number; // 0-5
  typicalActions: string[];
}

export interface ApproachStrategy {
  method: "dm_first" | "engage_first" | "camp_invite" | "mutual_connection" | "film_share";
  reasoning: string;
  steps: string[];
  estimatedResponseRate: number; // 0-1
  timeToFirstResponse: string; // e.g., "3-7 days"
}

export interface ContactWindow {
  bestMonths: number[]; // 1-12
  bestDayOfWeek: number[]; // 0-6 (Sunday-Saturday)
  bestHourOfDay: number[]; // 0-23
  reasoning: string;
}

// ============ RECRUITING TIMELINE ============

export interface RecruitingTimeline {
  athleteClassYear: number;
  division: string;

  // Key dates
  firstContactAllowed: string; // Date string
  firstPhoneCallAllowed: string;
  officialVisitsOpen: string;
  earlySigningPeriod: string;
  nationalSigningDay: string;

  // Current phase
  currentPhase: RecruitingPhase;
  nextMilestone: string;
  daysToNextMilestone: number;

  // Recommended actions for current phase
  currentPhaseActions: string[];
}

export type RecruitingPhase =
  | "pre_contact" // Before coaches can contact
  | "evaluation" // Coaches evaluating, limited contact
  | "active_recruiting" // Full contact period
  | "official_visits" // OV period
  | "decision" // Commitment period
  | "signed"; // After signing

// ============ COMPETITOR INTELLIGENCE ============

export interface CompetitorAnalysis {
  recruitName: string;
  recruitHandle: string;
  position: string;
  classYear: number;
  state: string;

  // How they compare
  physicalComparison: {
    height: string;
    weight: string;
    advantage: "ours" | "theirs" | "even";
    notes: string;
  };

  // Social strategy comparison
  socialComparison: {
    followerCount: number;
    postFrequency: number;
    engagementRate: number;
    contentQuality: "superior" | "comparable" | "inferior";
    strategy: string;
  };

  // Recruiting status
  offers: string[];
  committed: boolean;
  committedSchool: string | null;

  // Actionable insights
  whatTheyDoWell: string[];
  opportunities: string[];
  lessonsToApply: string[];
}

// ============ SCRAPE JOB MANAGEMENT ============

export interface ScrapeJob {
  id: string;
  type: "hudl_profile" | "twitter_analysis" | "coach_research" | "roster_scrape";
  targetUrl: string;
  status: "pending" | "running" | "completed" | "failed";
  result: unknown | null;
  error: string | null;
  createdAt: number;
  completedAt: number | null;
  retryCount: number;
}

// ============ INTELLIGENCE DASHBOARD ============

export interface IntelligenceDashboard {
  lastUpdated: number;

  // Quick stats
  totalSchoolsTracked: number;
  totalCoachesTracked: number;
  activeOffers: number;
  upcomingDeadlines: { label: string; date: string; urgency: "high" | "medium" | "low" }[];

  // Recruiting funnel
  funnel: {
    awareness: number; // Schools aware of athlete
    interest: number; // Schools showing interest
    evaluation: number; // Schools actively evaluating
    offer: number; // Schools with offers
    committed: number; // Committed (0 or 1)
  };

  // Recent activity feed
  recentActivity: ActivityFeedItem[];

  // Alerts
  alerts: IntelligenceAlert[];
}

export interface ActivityFeedItem {
  id: string;
  type: "offer" | "coach_follow" | "coach_like" | "dm_response" | "profile_view" | "film_view" | "camp_invite";
  title: string;
  description: string;
  coachName: string | null;
  schoolName: string | null;
  timestamp: string;
  actionRequired: boolean;
  actionLabel: string | null;
}

export interface IntelligenceAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  category: "timing" | "engagement" | "content" | "competitor" | "recruiting";
  createdAt: string;
  dismissed: boolean;
  actionUrl: string | null;
}
