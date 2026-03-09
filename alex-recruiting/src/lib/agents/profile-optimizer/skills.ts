import { SkillDefinition, SkillContext, SkillResult } from "../types";
import type { Post } from "@/lib/types";
import { db, isDbConfigured } from "@/lib/db";
import { profileAudits, posts, coaches, dmMessages, competitorRecruits, mediaPrompts } from "@/lib/db/schema";
import { desc, gte } from "drizzle-orm";
import { runProfileAudit, getScoreInterpretation } from "@/lib/alex/profile-audit";
import { verifyHandle } from "@/lib/integrations/x-api";

const JACOB_HANDLE = "JacobRodge52987";

export const profileOptimizerSkills: SkillDefinition[] = [
  {
    id: "audit_profile",
    name: "Audit Profile",
    description: "Run 10-point profile audit scoring photo, header, bio, pinned post, cadence, pillars, engagement, coach follows, DMs, constitution",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const jacobUser = await verifyHandle(JACOB_HANDLE);
      const hasPhoto = !!jacobUser?.profile_image_url && !jacobUser.profile_image_url.includes("default_profile");

      let recentPosts: Array<{ pillar: string; engagementRate: number | null }> = [];
      let coachList: Array<{ followStatus: string | null }> = [];
      let recentDMs: Array<Record<string, unknown>> = [];

      if (isDbConfigured()) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        recentPosts = await db.select({ pillar: posts.pillar, engagementRate: posts.engagementRate }).from(posts).where(gte(posts.createdAt, thirtyDaysAgo));
        coachList = await db.select({ followStatus: coaches.followStatus }).from(coaches);
        recentDMs = await db.select().from(dmMessages).where(gte(dmMessages.createdAt, thirtyDaysAgo));
      }

      const bioElements = jacobUser?.description || "";
      const bioHasAll = ["OL", "6'4", "285", "Pewaukee", "2029"].every((el) => bioElements.includes(el));

      const audit = runProfileAudit({
        hasProfilePhoto: hasPhoto,
        hasHeaderImage: true, // Can't check via API, assume true
        bioHasAllElements: bioHasAll,
        hasPinnedPost: true, // Can't check via API easily
        pinnedPostAge: 30,
        postsLast30Days: recentPosts.map((p) => ({
          id: "", content: "", pillar: p.pillar as Post["pillar"], hashtags: [], mediaUrl: null,
          scheduledFor: "", bestTime: "", status: "posted" as const,
          xPostId: null, impressions: 0, engagements: 0,
          engagementRate: p.engagementRate ?? 0, createdAt: "", updatedAt: "",
        })),
        coaches: coachList.map((c) => ({
          id: "", name: "", title: "", schoolId: "", schoolName: "", division: "D2" as const,
          conference: "", xHandle: "", dmOpen: false, followStatus: (c.followStatus || "not_followed") as "not_followed" | "followed" | "followed_back" | "unfollowed",
          dmStatus: "not_sent" as const, priorityTier: "Tier 1" as const,
          olNeedScore: 0, xActivityScore: 0, lastEngaged: null, notes: "", createdAt: "", updatedAt: "",
        })),
        dmsLast30Days: recentDMs.map((d) => ({
          id: "", coachId: "", coachName: (d as { coachName?: string }).coachName ?? "", schoolName: "",
          templateType: "", content: "", status: "sent" as const,
          sentAt: new Date().toISOString(), respondedAt: null, responseContent: null, createdAt: "",
        })),
        constitutionViolations: 0,
      });

      const interpretation = getScoreInterpretation(audit.totalScore);

      // Store audit result
      if (isDbConfigured()) {
        await db.insert(profileAudits).values({
          photoQuality: audit.photoQuality,
          headerImage: audit.headerImage,
          bioCompleteness: audit.bioCompleteness,
          pinnedPost: audit.pinnedPost,
          postCadence: audit.postCadence,
          pillarDistribution: audit.pillarDistribution,
          engagementRate: audit.engagementRate,
          coachFollowCount: audit.coachFollowCount,
          dmLog: audit.dmLog,
          constitutionCompliance: audit.constitutionCompliance,
          totalScore: audit.totalScore,
          recommendations: audit.recommendations,
        });
      }

      return {
        success: true,
        actions: [{
          actionType: "fire_alert" as const,
          title: `Profile Audit: ${audit.totalScore}/10 (${interpretation.label})`,
          description: audit.recommendations.join("\n"),
          payload: { score: audit.totalScore, interpretation, recommendations: audit.recommendations },
          priority: audit.totalScore < 6 ? 4 : 2,
        }],
        data: { audit, interpretation },
      };
    },
  },
  {
    id: "generate_bio_variants",
    name: "Generate Bio Variants",
    description: "Produce 3-5 bio options for current recruiting phase",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const currentMonth = new Date().getMonth();

      // Determine recruiting phase
      let phase = "general";
      if (currentMonth >= 5 && currentMonth <= 7) phase = "camp_season";
      else if (currentMonth >= 8 && currentMonth <= 11) phase = "in_season";
      else if (currentMonth >= 0 && currentMonth <= 1) phase = "signing_period";
      else phase = "offseason";

      const bios: { variant: string; bio: string; reasoning: string }[] = [
        {
          variant: "Standard",
          bio: "OL | 6'4\" 285 | Pewaukee HS, WI | Class of 2029 | IMG Academy | Film: hudl.com/jacobrodgers",
          reasoning: "Clean, professional format with all required elements",
        },
        {
          variant: "Achievement-Led",
          bio: "Offensive Lineman | 6'4\" 285 | Class of '29 | Pewaukee HS | IMG Academy Trained | Film below",
          reasoning: "Leads with position detail, emphasizes IMG training",
        },
        {
          variant: "Metrics-Forward",
          bio: "OL #79 | 6'4\" 285 lbs | Squat: 405 | Bench: 265 | 5.1 40 | Pewaukee '29 | WI | Film & Hudl in link",
          reasoning: "Leads with measurables — coaches love numbers",
        },
      ];

      if (phase === "camp_season") {
        bios.push({
          variant: "Camp Season",
          bio: "OL | 6'4\" 285 | Pewaukee HS, WI | '29 | Camp schedule in pinned | IMG Academy | Film in link",
          reasoning: "Directs coaches to camp schedule while keeping the bio professional and film-led",
        });
      }

      if (phase === "in_season") {
        bios.push({
          variant: "In-Season",
          bio: "OL #79 | 6'4\" 285 | Pewaukee Pirates | Class of 2029 | Game film updated weekly | hudl.com/jacobrodgers",
          reasoning: "Emphasizes active season and fresh film availability",
        });
      }

      return {
        success: true,
        actions: [],
        data: { phase, variants: bios },
      };
    },
  },
  {
    id: "recommend_bio_update",
    name: "Recommend Bio Update",
    description: "Select best bio variant and queue for approval",
    requiresApproval: true,
    execute: async (context: SkillContext): Promise<SkillResult> => {
      const params = context.parameters as { bio?: string; reasoning?: string } | undefined;
      const bio = params?.bio || "OL | 6'4\" 285 | Pewaukee HS, WI | Class of 2029 | IMG Academy | Film: hudl.com/jacobrodgers";
      const reasoning = params?.reasoning || "Standard recruiting bio with all required elements";

      return {
        success: true,
        actions: [{
          actionType: "update_bio",
          title: "Update X Bio",
          description: reasoning,
          payload: { bio },
          priority: 3,
        }],
      };
    },
  },
  {
    id: "generate_profile_photo_prompt",
    name: "Generate Profile Photo Prompt",
    description: "Create AI image prompt for recruiting headshot (Kling 3.0, 400x400)",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const prompt = "Professional sports recruiting headshot. Teenage male athlete, 6'4\" tall, broad shoulders, wearing red and white football jersey #79. Clean neutral gray background. Studio lighting from the left. Confident, approachable expression. High resolution, sharp focus on face.";

      if (isDbConfigured()) {
        await db.insert(mediaPrompts).values({
          agentId: "profile-optimizer",
          promptType: "profile_photo",
          platform: "kling",
          prompt,
          metadata: { dimensions: "400x400", version: "3.0" },
        });
      }

      return {
        success: true,
        actions: [{
          actionType: "generate_media_prompt",
          title: "Profile Photo Prompt (Kling 3.0)",
          description: "AI-generated prompt for recruiting headshot",
          payload: { prompt, platform: "kling", dimensions: "400x400" },
          priority: 2,
        }],
      };
    },
  },
  {
    id: "generate_header_prompt",
    name: "Generate Header Prompt",
    description: "Create AI image prompt for 1500x500 header (Banana Pro)",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const prompt = "Wide-format football header banner. Left side: action shot of a large offensive lineman driving a defender backward under bright stadium lights. Right side: dark navy overlay with white text 'JACOB RODGERS | OL | 6'4\" 285 | PEWAUKEE HS | CLASS OF 2029'. Red accent stripe separating photo and text. Professional recruiting graphic style.";

      if (isDbConfigured()) {
        await db.insert(mediaPrompts).values({
          agentId: "profile-optimizer",
          promptType: "header",
          platform: "banana_pro",
          prompt,
          metadata: { dimensions: "1500x500" },
        });
      }

      return {
        success: true,
        actions: [{
          actionType: "generate_media_prompt",
          title: "Header Image Prompt (Banana Pro)",
          description: "AI-generated prompt for X header image",
          payload: { prompt, platform: "banana_pro", dimensions: "1500x500" },
          priority: 2,
        }],
      };
    },
  },
  {
    id: "generate_video_prompt",
    name: "Generate Video Prompt",
    description: "Create AI video prompt for 15-sec highlight intro (Higgsfield)",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const prompt = "15-second highlight intro video. Open with dynamic text reveal: 'JACOB RODGERS | #79'. Quick cuts of offensive line gameplay — drive blocks, pass protection, pulling. Close with stats card: 6'4\" 285 | Class of 2029 | Pewaukee, WI. Dark cinematic grade, dramatic music beat sync.";

      if (isDbConfigured()) {
        await db.insert(mediaPrompts).values({
          agentId: "profile-optimizer",
          promptType: "video",
          platform: "higgsfield",
          prompt,
          metadata: { duration: "15s", dimensions: "1080x1080" },
        });
      }

      return {
        success: true,
        actions: [{
          actionType: "generate_media_prompt",
          title: "Highlight Intro Video Prompt (Higgsfield)",
          description: "AI-generated prompt for 15-sec recruiting intro video",
          payload: { prompt, platform: "higgsfield", duration: "15s" },
          priority: 2,
        }],
      };
    },
  },
  {
    id: "analyze_competitor_profiles",
    name: "Analyze Competitor Profiles",
    description: "Compare Jake's profile setup vs top competitor recruits",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const competitors = await db.select().from(competitorRecruits).limit(10);
      const jacobUser = await verifyHandle(JACOB_HANDLE);

      const comparison = {
        jacob: {
          followers: jacobUser?.public_metrics?.followers_count ?? 0,
          tweets: jacobUser?.public_metrics?.tweet_count ?? 0,
          bio: jacobUser?.description ?? "",
          hasPhoto: !!jacobUser?.profile_image_url,
        },
        competitors: competitors.map((c) => ({
          name: c.name,
          handle: c.xHandle,
          followers: c.followerCount,
          engagementRate: c.engagementRate,
          postCadence: c.postCadence,
        })),
        insights: [] as string[],
      };

      const avgFollowers = competitors.reduce((s, c) => s + (c.followerCount ?? 0), 0) / (competitors.length || 1);
      if ((comparison.jacob.followers) < avgFollowers) {
        comparison.insights.push(`Jacob has ${comparison.jacob.followers} followers vs competitor avg of ${Math.round(avgFollowers)} — need to grow`);
      }

      return {
        success: true,
        actions: [],
        data: comparison,
      };
    },
  },
  {
    id: "recommend_pinned_post",
    name: "Recommend Pinned Post",
    description: "Analyze which post to pin based on engagement data",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const topPosts = await db.select().from(posts).orderBy(desc(posts.engagementRate)).limit(5);

      const recommendation = topPosts.length > 0
        ? {
            postId: topPosts[0].id,
            content: topPosts[0].content,
            engagementRate: topPosts[0].engagementRate,
            reason: "Highest engagement rate among recent posts",
          }
        : {
            postId: null,
            content: null,
            reason: "No posts found — create a highlight reel post with full vitals to pin",
          };

      return {
        success: true,
        actions: recommendation.postId ? [{
          actionType: "update_pinned_post" as const,
          title: "Pin Top-Performing Post",
          description: recommendation.reason,
          payload: { postId: recommendation.postId, content: recommendation.content },
          priority: 3,
        }] : [],
        data: { recommendation, topPosts: topPosts.slice(0, 3) },
      };
    },
  },
];
