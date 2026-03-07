import { SkillDefinition, SkillResult } from "../types";
import type { Coach } from "@/lib/types";
import { db, isDbConfigured } from "@/lib/db";
import { coaches, coachBehaviorProfiles, offerEvents, competitorRecruits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserTweets, searchTweets, getFollowers, verifyHandle } from "@/lib/integrations/x-api";
import { analyzeTweets, extractOfferEvents, buildRecruitingSearchQuery } from "@/lib/intelligence/twitter-patterns";
import { analyzeCoachBehavior } from "@/lib/intelligence/coach-behavior";

const JACOB_HANDLE = "JacobRodge52987";

export const coachIntelligenceSkills: SkillDefinition[] = [
  {
    id: "scan_coach_tweets",
    name: "Scan Coach Tweets",
    description: "Fetch recent tweets from tracked coaches via X API",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured, skipping" } };
      }

      const allCoaches = await db.select().from(coaches);
      const coachesWithHandles = allCoaches.filter((c) => c.xHandle);
      const tweetsByCoach: Record<string, { coachName: string; tweets: unknown[] }> = {};

      for (const coach of coachesWithHandles.slice(0, 20)) {
        const user = await verifyHandle(coach.xHandle!);
        if (!user) continue;

        const tweets = await getUserTweets(user.id, 10);
        tweetsByCoach[coach.xHandle!] = {
          coachName: coach.name,
          tweets,
        };
      }

      return {
        success: true,
        actions: [],
        data: { coachTweets: tweetsByCoach, coachesScanned: Object.keys(tweetsByCoach).length },
      };
    },
  },
  {
    id: "detect_recruiting_signals",
    name: "Detect Recruiting Signals",
    description: "Analyze tweets for offer announcements, visits, camps, and interest signals",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      // Search for recruiting-related tweets about OL and 2029 class
      const queries = [
        buildRecruitingSearchQuery({ position: "OL", classYear: 2029, patternType: "offer_announcement" }),
        buildRecruitingSearchQuery({ position: "offensive line", classYear: 2029 }),
        "2029 OL offer blessed AGTG",
      ];

      const allPatterns: unknown[] = [];
      const newOffers: unknown[] = [];

      for (const query of queries) {
        const tweets = await searchTweets(query, 25);
        const patterns = analyzeTweets(tweets, "search", "Search Result");
        allPatterns.push(...patterns);

        const offers = extractOfferEvents(patterns);
        newOffers.push(...offers);
      }

      // Store new offer events
      if (isDbConfigured() && newOffers.length > 0) {
        for (const offer of newOffers as Array<{ athleteHandle: string; athleteName: string; schoolName: string; schoolHandle: string | null; coachName: string | null; coachHandle: string | null; offerDate: string; sourceTweetId: string; sourceTweetUrl: string; verified: boolean; division: string | null; conference: string | null }>) {
          await db.insert(offerEvents).values({
            athleteHandle: offer.athleteHandle,
            athleteName: offer.athleteName,
            schoolName: offer.schoolName,
            schoolHandle: offer.schoolHandle,
            coachName: offer.coachName,
            coachHandle: offer.coachHandle,
            offerDate: offer.offerDate ? new Date(offer.offerDate) : null,
            sourceTweetId: offer.sourceTweetId,
            sourceTweetUrl: offer.sourceTweetUrl,
            verified: offer.verified,
            division: offer.division,
            conference: offer.conference,
          }).onConflictDoNothing();
        }
      }

      const actions = [];
      // Fire alerts for signals involving Jacob's target schools
      if (newOffers.length > 0) {
        actions.push({
          actionType: "fire_alert" as const,
          title: `${newOffers.length} new recruiting signal(s) detected`,
          description: `Found ${newOffers.length} new offer/recruiting events for 2029 OL recruits`,
          payload: { offers: newOffers, patterns: allPatterns.length },
          priority: 3,
        });
      }

      return {
        success: true,
        actions,
        data: { patternsFound: allPatterns.length, offersDetected: newOffers.length },
      };
    },
  },
  {
    id: "detect_follow_changes",
    name: "Detect Follow Changes",
    description: "Check if coaches followed/unfollowed Jacob",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const jacobUser = await verifyHandle(JACOB_HANDLE);
      if (!jacobUser) {
        return { success: false, actions: [], error: "Could not verify Jacob's handle" };
      }

      const followers = await getFollowers(jacobUser.id, 200);
      const followerHandles = new Set(followers.map((f) => f.username.toLowerCase()));

      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { followerCount: followers.length } };
      }

      const allCoaches = await db.select().from(coaches);
      const changes: { coachName: string; change: string }[] = [];

      for (const coach of allCoaches) {
        if (!coach.xHandle) continue;
        const handle = coach.xHandle.replace("@", "").toLowerCase();
        const isFollowing = followerHandles.has(handle);
        const wasFollowing = coach.followStatus === "followed_back";

        if (isFollowing && !wasFollowing) {
          changes.push({ coachName: coach.name, change: "followed" });
          await db.update(coaches).set({ followStatus: "followed_back", updatedAt: new Date() }).where(eq(coaches.id, coach.id));
        } else if (!isFollowing && wasFollowing) {
          changes.push({ coachName: coach.name, change: "unfollowed" });
          await db.update(coaches).set({ followStatus: "unfollowed", updatedAt: new Date() }).where(eq(coaches.id, coach.id));
        }
      }

      const actions = [];
      if (changes.length > 0) {
        const followedCoaches = changes.filter((c) => c.change === "followed");
        const unfollowedCoaches = changes.filter((c) => c.change === "unfollowed");

        if (followedCoaches.length > 0) {
          actions.push({
            actionType: "fire_alert" as const,
            title: `${followedCoaches.length} coach(es) now following Jacob!`,
            description: followedCoaches.map((c) => c.coachName).join(", "),
            payload: { changes: followedCoaches },
            priority: 5,
          });
        }
        if (unfollowedCoaches.length > 0) {
          actions.push({
            actionType: "fire_alert" as const,
            title: `${unfollowedCoaches.length} coach(es) unfollowed Jacob`,
            description: unfollowedCoaches.map((c) => c.coachName).join(", "),
            payload: { changes: unfollowedCoaches },
            priority: 4,
          });
        }
      }

      return {
        success: true,
        actions,
        data: { totalFollowers: followers.length, changes },
      };
    },
  },
  {
    id: "update_behavior_profiles",
    name: "Update Behavior Profiles",
    description: "Recalculate engagement style, DM probability, peak hours for tracked coaches",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allCoaches = await db.select().from(coaches);
      const coachesWithHandles = allCoaches.filter((c) => c.xHandle);
      let updated = 0;

      for (const coach of coachesWithHandles.slice(0, 15)) {
        const user = await verifyHandle(coach.xHandle!);
        if (!user) continue;

        const tweets = await getUserTweets(user.id, 50);
        const jacobUser = await verifyHandle(JACOB_HANDLE);
        const followers = jacobUser ? await getFollowers(jacobUser.id, 200) : [];
        const followsJacob = followers.some((f) => f.username.toLowerCase() === coach.xHandle!.replace("@", "").toLowerCase());

        const coachPartial: Partial<Coach> = {
          id: coach.id,
          name: coach.name,
          schoolName: coach.schoolName,
          division: coach.division as Coach["division"],
          xHandle: coach.xHandle ?? "",
          dmOpen: coach.dmOpen ?? false,
          olNeedScore: coach.olNeedScore ?? 0,
          followStatus: (coach.followStatus ?? "not_followed") as Coach["followStatus"],
        };
        const profile = analyzeCoachBehavior(
          coachPartial,
          tweets,
          user,
          followsJacob,
          coach.dmStatus === "responded"
        );

        await db.insert(coachBehaviorProfiles).values({
          coachId: coach.id,
          coachName: profile.coachName,
          schoolName: profile.schoolName,
          division: profile.division,
          conference: profile.conference,
          engagementStyle: profile.engagementStyle,
          dmOpenProbability: profile.dmOpenProbability,
          followBackProbability: profile.followBackProbability,
          avgResponseTime: profile.avgResponseTime,
          tweetFrequency: profile.tweetFrequency,
          peakActivityHours: profile.peakActivityHours,
          commonHashtags: profile.commonHashtags,
          interactsWithRecruits: profile.interactsWithRecruits,
          bestApproachMethod: profile.bestApproachStrategy.method,
          bestApproachSteps: profile.bestApproachStrategy.steps,
          estimatedResponseRate: profile.bestApproachStrategy.estimatedResponseRate,
          optimalContactMonths: profile.optimalContactWindow.bestMonths,
          optimalContactHours: profile.optimalContactWindow.bestHourOfDay,
          lastUpdated: new Date(),
        }).onConflictDoNothing();

        updated++;
      }

      return {
        success: true,
        actions: [],
        data: { profilesUpdated: updated },
      };
    },
  },
  {
    id: "track_competitor_offers",
    name: "Track Competitor Offers",
    description: "Scan competitor recruits for new offers from target schools",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const competitors = await db.select().from(competitorRecruits);
      const competitorsWithHandles = competitors.filter((c) => c.xHandle);
      const newOffers: { competitor: string; school: string }[] = [];

      for (const comp of competitorsWithHandles.slice(0, 10)) {
        const query = buildRecruitingSearchQuery({
          athleteHandle: comp.xHandle!,
          patternType: "offer_announcement",
        });

        const tweets = await searchTweets(query, 10);
        const patterns = analyzeTweets(tweets, comp.xHandle!, comp.name);
        const offers = extractOfferEvents(patterns);

        for (const offer of offers) {
          newOffers.push({ competitor: comp.name, school: offer.schoolName });
        }
      }

      const actions = [];
      if (newOffers.length > 0) {
        actions.push({
          actionType: "fire_alert" as const,
          title: `${newOffers.length} competitor offer(s) detected`,
          description: newOffers.map((o) => `${o.competitor} → ${o.school}`).join("; "),
          payload: { competitorOffers: newOffers },
          priority: 3,
        });
      }

      return {
        success: true,
        actions,
        data: { competitorsScanned: competitorsWithHandles.length, offersFound: newOffers.length },
      };
    },
  },
  {
    id: "generate_engagement_alert",
    name: "Generate Engagement Alert",
    description: "Fire alerts when a coach shows interest in Jacob",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      // Search for tweets mentioning Jacob
      const jacobMentions = await searchTweets(`@${JACOB_HANDLE}`, 25);
      const jacobNameMentions = await searchTweets(`"Jacob Rodgers" OL`, 10);

      const allMentions = [...jacobMentions, ...jacobNameMentions];
      const actions = [];

      if (allMentions.length > 0) {
        actions.push({
          actionType: "fire_alert" as const,
          title: `${allMentions.length} mention(s) of Jacob detected`,
          description: "Coaches or accounts mentioning Jacob on X",
          payload: { mentions: allMentions.map((t) => ({ id: t.id, text: t.text, author: t.author_id })) },
          priority: 5,
        });
      }

      return {
        success: true,
        actions,
        data: { mentionsFound: allMentions.length },
      };
    },
  },
  {
    id: "recommend_dm_timing",
    name: "Recommend DM Timing",
    description: "Best time to DM a specific coach based on behavior profile",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const profiles = await db.select().from(coachBehaviorProfiles);

      // Sort by DM open probability + follow-back probability
      const sorted = [...profiles].sort((a, b) => {
        const scoreA = (a.dmOpenProbability ?? 0) * 0.5 + (a.followBackProbability ?? 0) * 0.3 + (a.estimatedResponseRate ?? 0) * 0.2;
        const scoreB = (b.dmOpenProbability ?? 0) * 0.5 + (b.followBackProbability ?? 0) * 0.3 + (b.estimatedResponseRate ?? 0) * 0.2;
        return scoreB - scoreA;
      });

      const recommendations = sorted.slice(0, 10).map((p) => ({
        coachName: p.coachName,
        schoolName: p.schoolName,
        dmProbability: p.dmOpenProbability,
        bestHours: p.optimalContactHours,
        bestMonths: p.optimalContactMonths,
        engagementStyle: p.engagementStyle,
        bestApproach: p.bestApproachMethod,
      }));

      return {
        success: true,
        actions: [],
        data: { dmTimingRecommendations: recommendations },
      };
    },
  },
];
