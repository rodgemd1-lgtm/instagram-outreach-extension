CREATE TABLE "ab_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid,
	"experiment_name" text NOT NULL,
	"variant_key" text NOT NULL,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ab_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_name" text NOT NULL,
	"variant_key" text NOT NULL,
	"variant_label" text NOT NULL,
	"config" jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"run_id" text NOT NULL,
	"action_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"priority" integer DEFAULT 3,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"triggered_by" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"summary" text,
	"tokens_used" integer DEFAULT 0,
	"actions_created" integer DEFAULT 0,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "agent_state" (
	"agent_id" text PRIMARY KEY NOT NULL,
	"last_run_at" timestamp,
	"consecutive_failures" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now(),
	"total_followers" integer DEFAULT 0,
	"coach_follows" integer DEFAULT 0,
	"dms_sent" integer DEFAULT 0,
	"dm_response_rate" real DEFAULT 0,
	"posts_published" integer DEFAULT 0,
	"avg_engagement_rate" real DEFAULT 0,
	"profile_visits" integer DEFAULT 0,
	"audit_score" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "camps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"school" text,
	"location" text,
	"camp_type" text DEFAULT 'school_camp' NOT NULL,
	"date" timestamp,
	"date_end" timestamp,
	"registration_deadline" timestamp,
	"registration_status" text DEFAULT 'not_registered' NOT NULL,
	"cost" real,
	"coaches_present" jsonb DEFAULT '[]'::jsonb,
	"results" jsonb,
	"coach_contacts" jsonb DEFAULT '[]'::jsonb,
	"follow_up_status" text DEFAULT 'none',
	"offer_correlation" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coach_behavior_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"division" text,
	"conference" text,
	"engagement_style" text,
	"dm_open_probability" real DEFAULT 0,
	"follow_back_probability" real DEFAULT 0,
	"avg_response_time" real,
	"tweet_frequency" real DEFAULT 0,
	"peak_activity_hours" jsonb DEFAULT '[]'::jsonb,
	"common_hashtags" jsonb DEFAULT '[]'::jsonb,
	"interacts_with_recruits" boolean DEFAULT false,
	"best_approach_method" text,
	"best_approach_steps" jsonb DEFAULT '[]'::jsonb,
	"estimated_response_rate" real DEFAULT 0,
	"optimal_contact_months" jsonb DEFAULT '[]'::jsonb,
	"optimal_contact_hours" jsonb DEFAULT '[]'::jsonb,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coach_personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"division" text,
	"conference" text,
	"title" text,
	"background" text,
	"communication_style" text,
	"recruiting_priorities" jsonb DEFAULT '[]'::jsonb,
	"program_philosophy" text,
	"best_approach" text,
	"optimal_dm_style" text,
	"conversation_topics" jsonb DEFAULT '[]'::jsonb,
	"best_contact_timing" text,
	"engagement_strategy" text,
	"x_behavior" jsonb,
	"completeness" real DEFAULT 0,
	"last_researched_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"school_id" text,
	"school_slug" text,
	"school_name" text NOT NULL,
	"division" text NOT NULL,
	"conference" text,
	"x_handle" text,
	"dm_open" boolean DEFAULT false,
	"follow_status" text DEFAULT 'not_followed',
	"dm_status" text DEFAULT 'not_sent',
	"priority_tier" text NOT NULL,
	"ol_need_score" integer DEFAULT 0,
	"dl_need_score" integer DEFAULT 0,
	"position_type" text DEFAULT 'OL',
	"x_activity_score" integer DEFAULT 0,
	"last_engaged" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_recruits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"x_handle" text,
	"position" text,
	"class_year" integer,
	"school" text,
	"state" text,
	"height" text,
	"weight" text,
	"follower_count" integer DEFAULT 0,
	"post_cadence" real DEFAULT 0,
	"engagement_rate" real DEFAULT 0,
	"top_content_types" jsonb DEFAULT '[]'::jsonb,
	"school_interest_signals" jsonb DEFAULT '[]'::jsonb,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dm_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"template_type" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'drafted',
	"sent_at" timestamp,
	"responded_at" timestamp,
	"response_content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dm_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" text NOT NULL,
	"coach_name" text NOT NULL,
	"school" text NOT NULL,
	"current_step" integer DEFAULT 1,
	"total_steps" integer DEFAULT 4,
	"status" text DEFAULT 'active',
	"next_send_at" timestamp,
	"last_sent_at" timestamp,
	"response_detected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_outreach" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" text,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"coach_email" text,
	"template_type" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'draft',
	"sent_at" timestamp,
	"opened_at" timestamp,
	"responded_at" timestamp,
	"sequence_id" text,
	"step_number" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "engagement_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_handle" text NOT NULL,
	"target_category" text,
	"action_type" text NOT NULL,
	"content" text,
	"result_follower_gain" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "engagement_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"coach_id" uuid,
	"coach_name" text,
	"school_name" text,
	"post_id" uuid,
	"details" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enriched_schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"conference" text,
	"division" text,
	"ol_roster_count" integer,
	"ol_graduating" integer,
	"recruiting_rank" integer,
	"talent_score" real,
	"coach_tenure_years" integer,
	"scholarships_available" integer,
	"last_synced" timestamp DEFAULT now(),
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "film_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid,
	"film_id" text NOT NULL,
	"played_at" timestamp DEFAULT now(),
	"watch_duration" integer,
	"completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "growth_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_count" integer NOT NULL,
	"coach_followers" integer,
	"following_count" integer,
	"engagement_rate" real,
	"posts_this_week" integer,
	"dms_this_week" integer,
	"snapshot_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hudl_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text NOT NULL,
	"profile_url" text NOT NULL,
	"athlete_name" text NOT NULL,
	"position" text,
	"position_details" jsonb DEFAULT '[]'::jsonb,
	"height" text,
	"weight" text,
	"grad_year" integer,
	"high_school" text,
	"city" text,
	"state" text,
	"jersey_number" text,
	"gpa" text,
	"sat_score" integer,
	"act_score" integer,
	"highlight_reels" jsonb DEFAULT '[]'::jsonb,
	"game_film_count" integer DEFAULT 0,
	"total_plays_tagged" integer DEFAULT 0,
	"recruiting_opt_in" boolean DEFAULT false,
	"contact_email" text,
	"contact_phone" text,
	"bio" text,
	"profile_views" integer,
	"scrape_source" text DEFAULT 'jina',
	"raw_markdown" text,
	"scraped_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hudl_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "intelligence_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" text NOT NULL,
	"athlete_name" text NOT NULL,
	"overall_score" integer DEFAULT 0,
	"film_score" integer DEFAULT 0,
	"social_presence_score" integer DEFAULT 0,
	"recruiting_momentum_score" integer DEFAULT 0,
	"academic_score" integer DEFAULT 0,
	"physical_profile_score" integer DEFAULT 0,
	"tier_projection" text,
	"projected_tier" text,
	"data_completeness" real DEFAULT 0,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "measurables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" text DEFAULT 'jacob-rodgers' NOT NULL,
	"measure_type" text NOT NULL,
	"value" real NOT NULL,
	"unit" text NOT NULL,
	"measured_at" timestamp DEFAULT now(),
	"source" text DEFAULT 'self_reported' NOT NULL,
	"camp_id" uuid,
	"verified" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text NOT NULL,
	"prompt_type" text NOT NULL,
	"platform" text NOT NULL,
	"prompt" text NOT NULL,
	"status" text DEFAULT 'generated',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ncaa_deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"deadline_date" timestamp NOT NULL,
	"period_type" text,
	"applies_to_class" text DEFAULT '2029',
	"division" text,
	"importance" text DEFAULT 'medium',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ncsa_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"division" text DEFAULT 'Unknown' NOT NULL,
	"conference" text DEFAULT 'Unknown' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"source_detail" text DEFAULT '' NOT NULL,
	"detected_at" timestamp DEFAULT now(),
	"x_handle" text,
	"outreach_status" text DEFAULT 'new' NOT NULL,
	"assigned_to" text DEFAULT 'nina' NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_handle" text NOT NULL,
	"athlete_name" text,
	"school_name" text NOT NULL,
	"school_handle" text,
	"coach_name" text,
	"coach_handle" text,
	"offer_date" timestamp,
	"source_tweet_id" text,
	"source_tweet_url" text,
	"verified" boolean DEFAULT false,
	"division" text,
	"conference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outreach_learnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_number" integer NOT NULL,
	"week_start" text NOT NULL,
	"week_end" text NOT NULL,
	"what_worked" jsonb DEFAULT '[]'::jsonb,
	"what_didnt" jsonb DEFAULT '[]'::jsonb,
	"what_to_try" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"strategy_adjustments" jsonb DEFAULT '[]'::jsonb,
	"ab_test_results" jsonb DEFAULT '[]'::jsonb,
	"generated_by" text DEFAULT 'ai',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outreach_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid,
	"coach_name" text NOT NULL,
	"school_name" text NOT NULL,
	"stage" text DEFAULT 'research' NOT NULL,
	"priority" integer DEFAULT 3,
	"next_action" text,
	"next_action_date" timestamp,
	"last_action" text,
	"last_action_date" timestamp,
	"days_since_contact" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"coach_id" uuid,
	"page" text NOT NULL,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"user_agent" text,
	"duration" integer,
	"max_scroll_depth" real,
	"visited_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "panel_coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid,
	"name" text NOT NULL,
	"school" text NOT NULL,
	"division" text NOT NULL,
	"role" text,
	"panel_round" integer,
	"status" text DEFAULT 'invited',
	"invited_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "panel_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_coach_id" uuid,
	"visit_id" uuid,
	"would_recruit" text NOT NULL,
	"what_convinced" text,
	"what_almost_made_leave" text,
	"comparison_score" integer,
	"would_share" boolean,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posting_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" integer NOT NULL,
	"hour_start" integer NOT NULL,
	"hour_end" integer NOT NULL,
	"score" real DEFAULT 0,
	"coach_overlap" real DEFAULT 0,
	"avg_engagement" real DEFAULT 0,
	"season" text DEFAULT 'general',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"pillar" text NOT NULL,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"media_url" text,
	"scheduled_for" timestamp,
	"best_time" text,
	"status" text DEFAULT 'draft',
	"x_post_id" text,
	"impressions" integer DEFAULT 0,
	"engagements" integer DEFAULT 0,
	"engagement_rate" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now(),
	"photo_quality" boolean DEFAULT false,
	"header_image" boolean DEFAULT false,
	"bio_completeness" boolean DEFAULT false,
	"pinned_post" boolean DEFAULT false,
	"post_cadence" boolean DEFAULT false,
	"pillar_distribution" boolean DEFAULT false,
	"engagement_rate_check" boolean DEFAULT false,
	"coach_follow_count" boolean DEFAULT false,
	"dm_log" boolean DEFAULT false,
	"constitution_compliance" boolean DEFAULT false,
	"total_score" integer DEFAULT 0,
	"recommendations" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_name" text NOT NULL,
	"school_id" text,
	"received_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"status" text DEFAULT 'received' NOT NULL,
	"response_data" jsonb,
	"notes" text DEFAULT '',
	"is_target_school" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rec_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"assigned_to" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '',
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"output" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recruiting_prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"position" text,
	"school" text,
	"state" text,
	"class_year" integer,
	"rating" real,
	"stars" integer,
	"committed_to" text,
	"source" text,
	"source_url" text,
	"last_synced" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "research_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"content" text,
	"data_type" text NOT NULL,
	"source" text NOT NULL,
	"word_count" integer,
	"scraped_at" timestamp DEFAULT now(),
	"ai_summary" text,
	"ai_insights" jsonb,
	"ai_action_items" jsonb,
	"ai_relevance_score" integer,
	"ai_tags" text[],
	"ai_processed_at" timestamp,
	CONSTRAINT "research_articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "research_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"engine" text DEFAULT 'exa' NOT NULL,
	"results" jsonb NOT NULL,
	"result_count" integer,
	"searched_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"media_type" text,
	"media_url" text,
	"scheduled_at" timestamp NOT NULL,
	"status" text DEFAULT 'pending',
	"posted_at" timestamp,
	"tweet_id" text,
	"pillar" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_fit_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" text,
	"school_name" text NOT NULL,
	"fit_score" real DEFAULT 0,
	"roster_need" real DEFAULT 0,
	"geography" real DEFAULT 0,
	"academics" real DEFAULT 0,
	"coach_engagement" real DEFAULT 0,
	"competitive_position" real DEFAULT 0,
	"offer_likelihood" real DEFAULT 0,
	"graduating_seniors_ol" integer DEFAULT 0,
	"notes" text,
	"calculated_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"division" text NOT NULL,
	"conference" text NOT NULL,
	"state" text,
	"priority_tier" text NOT NULL,
	"ol_need_score" integer DEFAULT 0,
	"why_jacob" text,
	"roster_url" text,
	"staff_url" text,
	"official_x_handle" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"mascot" text,
	"division" text NOT NULL,
	"conference" text,
	"city" text,
	"state" text,
	"logo_url" text,
	"athletics_url" text,
	"staff_url" text,
	"roster_url" text,
	"primary_color" text,
	"secondary_color" text,
	"ol_roster_count" integer DEFAULT 0,
	"dl_roster_count" integer DEFAULT 0,
	"ol_graduating" integer DEFAULT 0,
	"dl_graduating" integer DEFAULT 0,
	"ol_need_score" integer DEFAULT 0,
	"dl_need_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "schools_v2_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scrape_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"target_url" text NOT NULL,
	"status" text DEFAULT 'pending',
	"result" jsonb,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "section_engagement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid,
	"section_id" text NOT NULL,
	"entered_at" timestamp,
	"exited_at" timestamp,
	"dwell_time" integer,
	"interacted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "tweet_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tweet_id" text NOT NULL,
	"author_handle" text NOT NULL,
	"author_name" text,
	"tweet_text" text NOT NULL,
	"pattern_type" text NOT NULL,
	"confidence" real DEFAULT 0,
	"school_mentions" jsonb DEFAULT '[]'::jsonb,
	"coach_mentions" jsonb DEFAULT '[]'::jsonb,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"likes" integer DEFAULT 0,
	"retweets" integer DEFAULT 0,
	"replies" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"tweet_created_at" timestamp,
	"analyzed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"source_album" text,
	"file_path" text,
	"supabase_url" text,
	"storage_path" text,
	"file_size" integer,
	"duration" integer,
	"mime_type" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"thumbnail_url" text,
	"upload_status" text DEFAULT 'pending',
	"uploaded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"category" text,
	"optimized_file_path" text,
	"width" integer,
	"height" integer
);
--> statement-breakpoint
ALTER TABLE "ab_assignments" ADD CONSTRAINT "ab_assignments_visit_id_page_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."page_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_behavior_profiles" ADD CONSTRAINT "coach_behavior_profiles_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_personas" ADD CONSTRAINT "coach_personas_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_school_slug_schools_v2_slug_fk" FOREIGN KEY ("school_slug") REFERENCES "public"."schools_v2"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dm_messages" ADD CONSTRAINT "dm_messages_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_log" ADD CONSTRAINT "engagement_log_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_log" ADD CONSTRAINT "engagement_log_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film_views" ADD CONSTRAINT "film_views_visit_id_page_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."page_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurables" ADD CONSTRAINT "measurables_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_plans" ADD CONSTRAINT "outreach_plans_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_visits" ADD CONSTRAINT "page_visits_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_coaches" ADD CONSTRAINT "panel_coaches_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_surveys" ADD CONSTRAINT "panel_surveys_panel_coach_id_panel_coaches_id_fk" FOREIGN KEY ("panel_coach_id") REFERENCES "public"."panel_coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_surveys" ADD CONSTRAINT "panel_surveys_visit_id_page_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."page_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_fit_scores" ADD CONSTRAINT "school_fit_scores_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_engagement" ADD CONSTRAINT "section_engagement_visit_id_page_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."page_visits"("id") ON DELETE no action ON UPDATE no action;