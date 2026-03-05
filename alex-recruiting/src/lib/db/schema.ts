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
