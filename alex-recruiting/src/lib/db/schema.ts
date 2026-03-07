import { pgTable, text, integer, boolean, timestamp, real, jsonb, uuid } from "drizzle-orm/pg-core";

export const schools = pgTable("schools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  division: text("division").notNull(),
  conference: text("conference").notNull(),
  state: text("state"),
  priorityTier: text("priority_tier").notNull(),
  olNeedScore: integer("ol_need_score").default(0),
  whyJacob: text("why_jacob"),
  rosterUrl: text("roster_url"),
  staffUrl: text("staff_url"),
  officialXHandle: text("official_x_handle"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coaches = pgTable("coaches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  schoolId: text("school_id").references(() => schools.id),
  schoolName: text("school_name").notNull(),
  division: text("division").notNull(),
  conference: text("conference"),
  xHandle: text("x_handle"),
  dmOpen: boolean("dm_open").default(false),
  followStatus: text("follow_status").default("not_followed"),
  dmStatus: text("dm_status").default("not_sent"),
  priorityTier: text("priority_tier").notNull(),
  olNeedScore: integer("ol_need_score").default(0),
  xActivityScore: integer("x_activity_score").default(0),
  lastEngaged: timestamp("last_engaged"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  pillar: text("pillar").notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  mediaUrl: text("media_url"),
  scheduledFor: timestamp("scheduled_for"),
  bestTime: text("best_time"),
  status: text("status").default("draft"),
  xPostId: text("x_post_id"),
  impressions: integer("impressions").default(0),
  engagements: integer("engagements").default(0),
  engagementRate: real("engagement_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dmMessages = pgTable("dm_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: uuid("coach_id").references(() => coaches.id),
  coachName: text("coach_name").notNull(),
  schoolName: text("school_name").notNull(),
  templateType: text("template_type").notNull(),
  content: text("content").notNull(),
  status: text("status").default("drafted"),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
  responseContent: text("response_content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const engagementLog = pgTable("engagement_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  coachId: uuid("coach_id").references(() => coaches.id),
  coachName: text("coach_name"),
  schoolName: text("school_name"),
  postId: uuid("post_id").references(() => posts.id),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const profileAudits = pgTable("profile_audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").defaultNow(),
  photoQuality: boolean("photo_quality").default(false),
  headerImage: boolean("header_image").default(false),
  bioCompleteness: boolean("bio_completeness").default(false),
  pinnedPost: boolean("pinned_post").default(false),
  postCadence: boolean("post_cadence").default(false),
  pillarDistribution: boolean("pillar_distribution").default(false),
  engagementRate: boolean("engagement_rate_check").default(false),
  coachFollowCount: boolean("coach_follow_count").default(false),
  dmLog: boolean("dm_log").default(false),
  constitutionCompliance: boolean("constitution_compliance").default(false),
  totalScore: integer("total_score").default(0),
  recommendations: jsonb("recommendations").$type<string[]>().default([]),
});

export const competitorRecruits = pgTable("competitor_recruits", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  xHandle: text("x_handle"),
  position: text("position"),
  classYear: integer("class_year"),
  school: text("school"),
  state: text("state"),
  height: text("height"),
  weight: text("weight"),
  followerCount: integer("follower_count").default(0),
  postCadence: real("post_cadence").default(0),
  engagementRate: real("engagement_rate").default(0),
  topContentTypes: jsonb("top_content_types").$type<string[]>().default([]),
  schoolInterestSignals: jsonb("school_interest_signals").$type<string[]>().default([]),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").defaultNow(),
  totalFollowers: integer("total_followers").default(0),
  coachFollows: integer("coach_follows").default(0),
  dmsSent: integer("dms_sent").default(0),
  dmResponseRate: real("dm_response_rate").default(0),
  postsPublished: integer("posts_published").default(0),
  avgEngagementRate: real("avg_engagement_rate").default(0),
  profileVisits: integer("profile_visits").default(0),
  auditScore: integer("audit_score").default(0),
});

// ============ RECRUITING INTELLIGENCE TABLES ============

export const hudlProfiles = pgTable("hudl_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: text("profile_id").notNull().unique(),
  profileUrl: text("profile_url").notNull(),
  athleteName: text("athlete_name").notNull(),
  position: text("position"),
  positionDetails: jsonb("position_details").$type<string[]>().default([]),
  height: text("height"),
  weight: text("weight"),
  gradYear: integer("grad_year"),
  highSchool: text("high_school"),
  city: text("city"),
  state: text("state"),
  jerseyNumber: text("jersey_number"),
  gpa: text("gpa"),
  satScore: integer("sat_score"),
  actScore: integer("act_score"),
  highlightReels: jsonb("highlight_reels").$type<{ title: string; url: string; duration: string | null; viewCount: number | null; createdAt: string | null }[]>().default([]),
  gameFilmCount: integer("game_film_count").default(0),
  totalPlaysTagged: integer("total_plays_tagged").default(0),
  recruitingOptIn: boolean("recruiting_opt_in").default(false),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  bio: text("bio"),
  profileViews: integer("profile_views"),
  scrapeSource: text("scrape_source").default("jina"),
  rawMarkdown: text("raw_markdown"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tweetPatterns = pgTable("tweet_patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tweetId: text("tweet_id").notNull(),
  authorHandle: text("author_handle").notNull(),
  authorName: text("author_name"),
  tweetText: text("tweet_text").notNull(),
  patternType: text("pattern_type").notNull(),
  confidence: real("confidence").default(0),
  schoolMentions: jsonb("school_mentions").$type<string[]>().default([]),
  coachMentions: jsonb("coach_mentions").$type<string[]>().default([]),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  replies: integer("replies").default(0),
  impressions: integer("impressions").default(0),
  tweetCreatedAt: timestamp("tweet_created_at"),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const offerEvents = pgTable("offer_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  athleteHandle: text("athlete_handle").notNull(),
  athleteName: text("athlete_name"),
  schoolName: text("school_name").notNull(),
  schoolHandle: text("school_handle"),
  coachName: text("coach_name"),
  coachHandle: text("coach_handle"),
  offerDate: timestamp("offer_date"),
  sourceTweetId: text("source_tweet_id"),
  sourceTweetUrl: text("source_tweet_url"),
  verified: boolean("verified").default(false),
  division: text("division"),
  conference: text("conference"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachBehaviorProfiles = pgTable("coach_behavior_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: uuid("coach_id").references(() => coaches.id),
  coachName: text("coach_name").notNull(),
  schoolName: text("school_name").notNull(),
  division: text("division"),
  conference: text("conference"),
  engagementStyle: text("engagement_style"),
  dmOpenProbability: real("dm_open_probability").default(0),
  followBackProbability: real("follow_back_probability").default(0),
  avgResponseTime: real("avg_response_time"),
  tweetFrequency: real("tweet_frequency").default(0),
  peakActivityHours: jsonb("peak_activity_hours").$type<number[]>().default([]),
  commonHashtags: jsonb("common_hashtags").$type<string[]>().default([]),
  interactsWithRecruits: boolean("interacts_with_recruits").default(false),
  bestApproachMethod: text("best_approach_method"),
  bestApproachSteps: jsonb("best_approach_steps").$type<string[]>().default([]),
  estimatedResponseRate: real("estimated_response_rate").default(0),
  optimalContactMonths: jsonb("optimal_contact_months").$type<number[]>().default([]),
  optimalContactHours: jsonb("optimal_contact_hours").$type<number[]>().default([]),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const intelligenceScores = pgTable("intelligence_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  athleteId: text("athlete_id").notNull(),
  athleteName: text("athlete_name").notNull(),
  overallScore: integer("overall_score").default(0),
  filmScore: integer("film_score").default(0),
  socialPresenceScore: integer("social_presence_score").default(0),
  recruitingMomentumScore: integer("recruiting_momentum_score").default(0),
  academicScore: integer("academic_score").default(0),
  physicalProfileScore: integer("physical_profile_score").default(0),
  tierProjection: text("tier_projection"),
  projectedTier: text("projected_tier"),
  dataCompleteness: real("data_completeness").default(0),
  recommendations: jsonb("recommendations").$type<{ priority: string; category: string; title: string; description: string; actionItems: string[] }[]>().default([]),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoAssets = pgTable("video_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  source: text("source").notNull().default("manual"),
  sourceAlbum: text("source_album"),
  filePath: text("file_path"),
  supabaseUrl: text("supabase_url"),
  storagePath: text("storage_path"),
  fileSize: integer("file_size"),
  duration: integer("duration"),
  mimeType: text("mime_type"),
  tags: jsonb("tags").$type<string[]>().default([]),
  thumbnailUrl: text("thumbnail_url"),
  uploadStatus: text("upload_status").default("pending"),
  uploadedAt: timestamp("uploaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  category: text("category"),
  optimizedFilePath: text("optimized_file_path"),
  width: integer("width"),
  height: integer("height"),
});

export const scrapeJobs = pgTable("scrape_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  targetUrl: text("target_url").notNull(),
  status: text("status").default("pending"),
  result: jsonb("result"),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ AGENT SYSTEM TABLES ============

export const agentRuns = pgTable("agent_runs", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  triggeredBy: text("triggered_by").notNull(), // "cron" | "manual"
  status: text("status").notNull().default("running"), // "running" | "completed" | "failed"
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  summary: text("summary"),
  tokensUsed: integer("tokens_used").default(0),
  actionsCreated: integer("actions_created").default(0),
  errorMessage: text("error_message"),
});

export const agentActions = pgTable("agent_actions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  runId: text("run_id").notNull(),
  actionType: text("action_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  status: text("status").notNull().default("pending_approval"), // "pending_approval" | "approved" | "rejected" | "executed" | "expired"
  priority: integer("priority").default(3), // 1-5, 5 = highest
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentState = pgTable("agent_state", {
  agentId: text("agent_id").primaryKey(),
  lastRunAt: timestamp("last_run_at"),
  consecutiveFailures: integer("consecutive_failures").default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});

export const schoolFitScores = pgTable("school_fit_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: text("school_id").references(() => schools.id),
  schoolName: text("school_name").notNull(),
  fitScore: real("fit_score").default(0), // 0-100 composite
  rosterNeed: real("roster_need").default(0), // 0-100
  geography: real("geography").default(0), // 0-100
  academics: real("academics").default(0), // 0-100
  coachEngagement: real("coach_engagement").default(0), // 0-100
  competitivePosition: real("competitive_position").default(0), // 0-100
  offerLikelihood: real("offer_likelihood").default(0), // 0-100%
  graduatingSeniorsOL: integer("graduating_seniors_ol").default(0),
  notes: text("notes"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postingWindows = pgTable("posting_windows", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  hourStart: integer("hour_start").notNull(), // 0-23
  hourEnd: integer("hour_end").notNull(), // 0-23
  score: real("score").default(0), // 0-100 composite
  coachOverlap: real("coach_overlap").default(0), // % of tracked coaches active
  avgEngagement: real("avg_engagement").default(0), // historical avg engagement rate
  season: text("season").default("general"), // "in_season" | "off_season" | "camp" | "dead_period" | "general"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaPrompts = pgTable("media_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: text("agent_id").notNull(),
  promptType: text("prompt_type").notNull(), // "profile_photo" | "header" | "video" | "post_graphic"
  platform: text("platform").notNull(), // "kling" | "banana_pro" | "higgsfield"
  prompt: text("prompt").notNull(),
  status: text("status").default("generated"), // "generated" | "used" | "archived"
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ NCSA LEADS ============

export const ncsaLeads = pgTable("ncsa_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachName: text("coach_name").notNull(),
  schoolName: text("school_name").notNull(),
  division: text("division").notNull().default("Unknown"),
  conference: text("conference").notNull().default("Unknown"),
  source: text("source").notNull().default("manual"), // "profile_view" | "camp_invite" | "message" | "manual"
  sourceDetail: text("source_detail").notNull().default(""),
  detectedAt: timestamp("detected_at").defaultNow(),
  xHandle: text("x_handle"),
  outreachStatus: text("outreach_status").notNull().default("new"), // "new" | "researched" | "followed" | "dm_drafted" | "dm_sent" | "responded"
  assignedTo: text("assigned_to").notNull().default("nina"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ REC TEAM TASK MANAGEMENT ============

export const recTasks = pgTable("rec_tasks", {
  id: text("id").primaryKey(),
  assignedTo: text("assigned_to").notNull(),
  title: text("title").notNull(),
  description: text("description").default(""),
  status: text("status").notNull().default("pending"), // "pending" | "in_progress" | "completed" | "blocked"
  priority: integer("priority").notNull().default(3), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  output: text("output"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ CONVERSATION HISTORY ============

export const conversationHistory = pgTable("conversation_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: text("member_id").notNull(), // persona id: "nina", "marcus", etc.
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ DATA PIPELINE ============

export const enrichedSchools = pgTable("enriched_schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  conference: text("conference"),
  division: text("division"),
  olRosterCount: integer("ol_roster_count"),
  olGraduating: integer("ol_graduating"),
  recruitingRank: integer("recruiting_rank"),
  talentScore: real("talent_score"),
  coachTenure: integer("coach_tenure_years"),
  scholarshipsAvailable: integer("scholarships_available"),
  lastSynced: timestamp("last_synced").defaultNow(),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recruitingProspects = pgTable("recruiting_prospects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  position: text("position"),
  school: text("school"),
  state: text("state"),
  classYear: integer("class_year"),
  rating: real("rating"),
  stars: integer("stars"),
  committedTo: text("committed_to"),
  source: text("source"),
  sourceUrl: text("source_url"),
  lastSynced: timestamp("last_synced").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// CONTENT ENGINE
export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  mediaType: text("media_type"),
  mediaUrl: text("media_url"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").default("pending"),
  postedAt: timestamp("posted_at"),
  tweetId: text("tweet_id"),
  pillar: text("pillar"),
  createdAt: timestamp("created_at").defaultNow(),
});

// DM OUTREACH
export const dmSequences = pgTable("dm_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: text("coach_id").notNull(),
  coachName: text("coach_name").notNull(),
  school: text("school").notNull(),
  currentStep: integer("current_step").default(1),
  totalSteps: integer("total_steps").default(4),
  status: text("status").default("active"),
  nextSendAt: timestamp("next_send_at"),
  lastSentAt: timestamp("last_sent_at"),
  responseDetected: boolean("response_detected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FOLLOWER GROWTH
export const engagementActions = pgTable("engagement_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  targetHandle: text("target_handle").notNull(),
  targetCategory: text("target_category"),
  actionType: text("action_type").notNull(),
  content: text("content"),
  resultFollowerGain: integer("result_follower_gain"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const growthSnapshots = pgTable("growth_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerCount: integer("follower_count").notNull(),
  coachFollowers: integer("coach_followers"),
  followingCount: integer("following_count"),
  engagementRate: real("engagement_rate"),
  postsThisWeek: integer("posts_this_week"),
  dmsThisWeek: integer("dms_this_week"),
  snapshotDate: timestamp("snapshot_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ CAMP TRACKER ============

export const camps = pgTable("camps", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  school: text("school"),
  location: text("location"),
  campType: text("camp_type").notNull().default("school_camp"), // "school_camp" | "prospect_day" | "combine" | "showcase" | "satellite"
  date: timestamp("date"),
  dateEnd: timestamp("date_end"),
  registrationDeadline: timestamp("registration_deadline"),
  registrationStatus: text("registration_status").notNull().default("not_registered"), // "not_registered" | "registered" | "waitlisted" | "confirmed"
  cost: real("cost"),
  coachesPresent: jsonb("coaches_present").$type<{ name: string; title: string; school: string; contacted: boolean }[]>().default([]),
  results: jsonb("results").$type<{
    measurables: { name: string; value: string; unit: string }[];
    drills: { name: string; score: string; notes: string }[];
    feedback: string[];
  }>(),
  coachContacts: jsonb("coach_contacts").$type<{
    coachName: string;
    school: string;
    title: string;
    businessCard: boolean;
    followUpNeeded: boolean;
    followUpDone: boolean;
    notes: string;
  }[]>().default([]),
  followUpStatus: text("follow_up_status").default("none"), // "none" | "pending" | "in_progress" | "completed"
  offerCorrelation: text("offer_correlation"), // track if camp led to offer interest
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ MEASURABLES TRACKER ============

export const measurables = pgTable("measurables", {
  id: uuid("id").defaultRandom().primaryKey(),
  athleteId: text("athlete_id").notNull().default("jacob-rodgers"),
  measureType: text("measure_type").notNull(), // "40yd" | "shuttle" | "broad_jump" | "vertical" | "bench" | "squat" | "clean" | "height" | "weight"
  value: real("value").notNull(),
  unit: text("unit").notNull(), // "seconds" | "inches" | "lbs" | "feet"
  measuredAt: timestamp("measured_at").defaultNow(),
  source: text("source").notNull().default("self_reported"), // "camp" | "training" | "self_reported" | "combine"
  campId: uuid("camp_id").references(() => camps.id),
  verified: boolean("verified").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ QUESTIONNAIRE TRACKING ============

export const questionnaires = pgTable("questionnaires", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolName: text("school_name").notNull(),
  schoolId: text("school_id"),
  receivedAt: timestamp("received_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  status: text("status").notNull().default("received"), // "received" | "in_progress" | "submitted" | "confirmed"
  responseData: jsonb("response_data"),
  notes: text("notes").default(""),
  isTargetSchool: boolean("is_target_school").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ EMAIL OUTREACH ============

export const emailOutreach = pgTable("email_outreach", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: text("coach_id"),
  coachName: text("coach_name").notNull(),
  schoolName: text("school_name").notNull(),
  coachEmail: text("coach_email"),
  templateType: text("template_type").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("draft"), // "draft" | "queued" | "sent" | "opened" | "responded"
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  respondedAt: timestamp("responded_at"),
  sequenceId: text("sequence_id"),
  stepNumber: integer("step_number"),
  createdAt: timestamp("created_at").defaultNow(),
});
