import { SkillDefinition, SkillContext, SkillResult } from "../types";
import { db, isDbConfigured } from "@/lib/db";
import { schools, coaches, coachBehaviorProfiles, offerEvents, competitorRecruits, schoolFitScores } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const CONFERENCE_GEO: Record<string, number> = {
  "Big Ten": 90, "MAC": 85, "GLIAC": 90, "NSIC": 85, "Missouri Valley": 80,
  "Big 12": 60, "CCIW": 75, "WIAC": 95, "default": 50,
};

export const placementAnalystSkills: SkillDefinition[] = [
  {
    id: "analyze_roster_gaps",
    name: "Analyze Roster Gaps",
    description: "Count graduating OL seniors at target schools to estimate roster need",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allSchools = await db.select().from(schools);

      // Estimate roster needs based on OL need score and typical graduation patterns
      const rosterAnalysis = allSchools.map((school) => {
        const olNeed = school.olNeedScore ?? 0;
        // Estimate graduating seniors: higher need score = more seniors leaving
        const estimatedGraduating = Math.round(olNeed * 1.5);
        const rosterNeedScore = Math.min(100, olNeed * 20);

        return {
          schoolId: school.id,
          schoolName: school.name,
          division: school.division,
          olNeedScore: olNeed,
          estimatedGraduatingSeniors: estimatedGraduating,
          rosterNeedScore,
          rosterUrl: school.rosterUrl,
        };
      });

      return {
        success: true,
        actions: [],
        data: {
          schools: rosterAnalysis.sort((a, b) => b.rosterNeedScore - a.rosterNeedScore),
          totalSchools: allSchools.length,
        },
      };
    },
  },
  {
    id: "calculate_fit_scores",
    name: "Calculate Fit Scores",
    description: "Composite fit score: roster need (30%) + coach engagement (25%) + geography (15%) + academics (15%) + competitive position (15%)",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allSchools = await db.select().from(schools);
      const allCoaches = await db.select().from(coaches);
      const behaviorProfiles = await db.select().from(coachBehaviorProfiles);
      const scores: Array<{ schoolName: string; fitScore: number; breakdown: Record<string, number> }> = [];

      for (const school of allSchools) {
        // 1. Roster Need (30%)
        const rosterNeed = Math.min(100, (school.olNeedScore ?? 0) * 20);

        // 2. Coach Engagement (25%)
        const schoolCoaches = allCoaches.filter((c) => c.schoolId === school.id);
        const followBacks = schoolCoaches.filter((c) => c.followStatus === "followed_back").length;
        const dmResponses = schoolCoaches.filter((c) => c.dmStatus === "responded").length;
        const profiles = behaviorProfiles.filter((p) => p.schoolName === school.name);
        const avgDmProb = profiles.length > 0 ? profiles.reduce((s, p) => s + (p.dmOpenProbability ?? 0), 0) / profiles.length : 0.3;
        const coachEngagement = Math.min(100,
          followBacks * 25 + dmResponses * 30 + avgDmProb * 30 + schoolCoaches.length * 5
        );

        // 3. Geography (15%)
        const geography = CONFERENCE_GEO[school.conference] ?? CONFERENCE_GEO["default"];

        // 4. Academics (15%) — Jacob is a strong student, most schools are a fit
        const divisionAcademic: Record<string, number> = {
          "D1 FBS": 65, "D1 FCS": 75, "D2": 85, "D3": 90, "NAIA": 85,
        };
        const academics = divisionAcademic[school.division] ?? 70;

        // 5. Competitive Position (15%) — fewer competitors = better
        const competitivePosition = school.division === "D2" ? 75 :
          school.division === "D1 FCS" ? 60 :
          school.division === "D1 FBS" ? 35 : 70;

        // Composite
        const fitScore = Math.round(
          rosterNeed * 0.30 + coachEngagement * 0.25 + geography * 0.15 + academics * 0.15 + competitivePosition * 0.15
        );

        // Store
        await db.insert(schoolFitScores).values({
          schoolId: school.id,
          schoolName: school.name,
          fitScore,
          rosterNeed,
          geography,
          academics,
          coachEngagement,
          competitivePosition,
          graduatingSeniorsOL: Math.round((school.olNeedScore ?? 0) * 1.5),
        }).onConflictDoNothing();

        scores.push({
          schoolName: school.name,
          fitScore,
          breakdown: { rosterNeed, coachEngagement, geography, academics, competitivePosition },
        });
      }

      scores.sort((a, b) => b.fitScore - a.fitScore);

      return {
        success: true,
        actions: [{
          actionType: "update_fit_scores" as const,
          title: "School fit scores updated",
          description: `Calculated fit scores for ${scores.length} schools. Top: ${scores[0]?.schoolName} (${scores[0]?.fitScore})`,
          payload: { topSchools: scores.slice(0, 5) },
          priority: 2,
        }],
        data: { scores },
      };
    },
  },
  {
    id: "project_offer_likelihood",
    name: "Project Offer Likelihood",
    description: "Estimate offer probability per school (0-100%)",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allSchools = await db.select().from(schools);
      const allCoaches = await db.select().from(coaches);
      const fitScoresData = await db.select().from(schoolFitScores);
      const fitMap = new Map(fitScoresData.map((f) => [f.schoolId, f]));

      const projections = allSchools.map((school) => {
        // Base probability by division
        const divisionBase: Record<string, number> = {
          "D2": 40, "NAIA": 45, "D3": 35, "D1 FCS": 25, "D1 FBS": 5,
        };
        let likelihood = divisionBase[school.division] ?? 20;

        // Modifiers
        const schoolCoaches = allCoaches.filter((c) => c.schoolId === school.id);
        const hasFollowBack = schoolCoaches.some((c) => c.followStatus === "followed_back");
        const hasDmResponse = schoolCoaches.some((c) => c.dmStatus === "responded");
        const highNeed = (school.olNeedScore ?? 0) >= 4;

        if (hasFollowBack) likelihood += 15;
        if (hasDmResponse) likelihood += 20;
        if (highNeed) likelihood += 10;

        // Fit score bonus
        const fit = fitMap.get(school.id);
        if (fit && (fit.fitScore ?? 0) > 70) likelihood += 10;

        likelihood = Math.min(95, Math.max(0, likelihood));

        return {
          schoolName: school.name,
          division: school.division,
          tier: school.priorityTier,
          offerLikelihood: likelihood,
          signals: {
            followBack: hasFollowBack,
            dmResponse: hasDmResponse,
            highNeed,
            fitScore: fit?.fitScore ?? 0,
          },
        };
      });

      projections.sort((a, b) => b.offerLikelihood - a.offerLikelihood);

      return {
        success: true,
        actions: [],
        data: { projections },
      };
    },
  },
  {
    id: "track_commitment_trends",
    name: "Track Commitment Trends",
    description: "Where are other 2029 OL recruits committing?",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const offers = await db.select().from(offerEvents);
      const competitors = await db.select().from(competitorRecruits);

      // Group offers by school
      const offersBySchool: Record<string, number> = {};
      for (const offer of offers) {
        offersBySchool[offer.schoolName] = (offersBySchool[offer.schoolName] || 0) + 1;
      }

      const trends = Object.entries(offersBySchool)
        .map(([school, count]) => ({ school, offerCount: count }))
        .sort((a, b) => b.offerCount - a.offerCount)
        .slice(0, 15);

      return {
        success: true,
        actions: [],
        data: {
          commitmentTrends: trends,
          totalOffers: offers.length,
          totalCompetitors: competitors.length,
        },
      };
    },
  },
  {
    id: "identify_opportunity_schools",
    name: "Identify Opportunity Schools",
    description: "Find schools not yet tracked with emerging OL needs",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      // Suggest schools that might be good additions based on common patterns
      const opportunitySchools = [
        { name: "Wayne State (MI)", division: "D2", conference: "GLIAC", reason: "GLIAC school near Michigan, typically needs OL" },
        { name: "Davenport University", division: "NAIA", conference: "WHAC", reason: "Growing program in Michigan, recruits Wisconsin athletes" },
        { name: "UW-Whitewater", division: "D3", conference: "WIAC", reason: "Top D3 program in Wisconsin, strong OL tradition" },
        { name: "UW-Oshkosh", division: "D3", conference: "WIAC", reason: "Wisconsin D3, good OL development program" },
        { name: "Augustana (SD)", division: "D2", conference: "NSIC", reason: "NSIC school with rising program, recruits Midwest" },
        { name: "St. Cloud State", division: "D2", conference: "NSIC", reason: "Minnesota D2, actively recruits Wisconsin OL" },
      ];

      return {
        success: true,
        actions: [],
        data: { opportunitySchools },
      };
    },
  },
  {
    id: "recommend_focus_shift",
    name: "Recommend Focus Shift",
    description: "Suggest changing priority tiers based on new data",
    requiresApproval: true,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allSchools = await db.select().from(schools);
      const fitScoresData = await db.select().from(schoolFitScores).orderBy(desc(schoolFitScores.fitScore));
      const allCoaches = await db.select().from(coaches);

      const recommendations: Array<{ school: string; currentTier: string; suggestedTier: string; reason: string }> = [];

      for (const school of allSchools) {
        const fit = fitScoresData.find((f) => f.schoolId === school.id);
        const schoolCoaches = allCoaches.filter((c) => c.schoolId === school.id);
        const hasEngagement = schoolCoaches.some((c) => c.followStatus === "followed_back" || c.dmStatus === "responded");

        // Suggest tier upgrades for schools showing interest
        if (school.priorityTier === "Tier 3" && hasEngagement && (fit?.fitScore ?? 0) > 60) {
          recommendations.push({
            school: school.name,
            currentTier: school.priorityTier,
            suggestedTier: "Tier 2",
            reason: `Coach engagement detected + fit score ${fit?.fitScore}. Upgrade to increase DM priority.`,
          });
        }

        // Suggest tier downgrades for unresponsive schools
        if (school.priorityTier === "Tier 1" && !hasEngagement && (fit?.fitScore ?? 0) < 40) {
          recommendations.push({
            school: school.name,
            currentTier: school.priorityTier,
            suggestedTier: "Tier 2",
            reason: `No engagement signals + low fit score. Focus resources on more responsive programs.`,
          });
        }
      }

      const actions = recommendations.map((r) => ({
        actionType: "change_priority_tier" as const,
        title: `Move ${r.school} from ${r.currentTier} to ${r.suggestedTier}`,
        description: r.reason,
        payload: { schoolName: r.school, currentTier: r.currentTier, newTier: r.suggestedTier },
        priority: 3,
      }));

      return {
        success: true,
        actions,
        data: { recommendations },
      };
    },
  },
  {
    id: "generate_school_report",
    name: "Generate School Report",
    description: "Detailed fit report for a specific school",
    requiresApproval: false,
    execute: async (context: SkillContext): Promise<SkillResult> => {
      const params = context.parameters as { schoolId?: string } | undefined;

      if (!isDbConfigured() || !params?.schoolId) {
        return { success: true, actions: [], data: { message: "DB not configured or no schoolId provided" } };
      }

      const [school] = await db.select().from(schools).where(eq(schools.id, params.schoolId));
      if (!school) return { success: false, actions: [], error: `School ${params.schoolId} not found` };

      const schoolCoaches = await db.select().from(coaches).where(eq(coaches.schoolId, school.id));
      const fitData = await db.select().from(schoolFitScores).where(eq(schoolFitScores.schoolId, school.id));

      const report = {
        school: {
          name: school.name,
          division: school.division,
          conference: school.conference,
          state: school.state,
          tier: school.priorityTier,
          olNeed: school.olNeedScore,
          whyJacob: school.whyJacob,
        },
        coaches: schoolCoaches.map((c) => ({
          name: c.name,
          title: c.title,
          handle: c.xHandle,
          followStatus: c.followStatus,
          dmStatus: c.dmStatus,
        })),
        fitScore: fitData[0] ?? null,
      };

      return {
        success: true,
        actions: [],
        data: { report },
      };
    },
  },
];
