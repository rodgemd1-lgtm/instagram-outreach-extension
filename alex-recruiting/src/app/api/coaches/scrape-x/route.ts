import { NextRequest, NextResponse } from "next/server";
import { targetSchools } from "@/lib/data/target-schools";
import { db, isDbConfigured } from "@/lib/db";
import { coachBehaviorProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface XAnalysis {
  schoolId: string;
  schoolName: string;
  xHandle: string;
  tweetFrequency: number;
  contentThemes: string[];
  engagementRate: number;
  interactsWithRecruits: boolean;
  peakActivityHours: number[];
  commonHashtags: string[];
  analysisStatus: string;
}

// Deterministic mock analysis based on static school data
function generateMockAnalysis(school: (typeof targetSchools)[0]): XAnalysis {
  const tierDefaults = {
    "Tier 1": {
      tweetFrequency: 4.2,
      engagementRate: 2.8,
      interactsWithRecruits: false,
      peakActivityHours: [10, 14, 18],
      themes: ["game highlights", "recruiting announcements", "program culture"],
    },
    "Tier 2": {
      tweetFrequency: 3.5,
      engagementRate: 3.4,
      interactsWithRecruits: true,
      peakActivityHours: [9, 13, 17, 20],
      themes: ["recruit interactions", "camp invites", "game recaps", "player spotlights"],
    },
    "Tier 3": {
      tweetFrequency: 2.8,
      engagementRate: 4.1,
      interactsWithRecruits: true,
      peakActivityHours: [8, 12, 16, 21],
      themes: ["recruit engagement", "camp promotions", "player development", "community"],
    },
  };

  const defaults = tierDefaults[school.priorityTier];

  const conferenceHashtags: Record<string, string[]> = {
    "Big Ten": ["#B1G", "#BigTenFootball"],
    "Big 12": ["#Big12FB", "#Big12"],
    MAC: ["#MACtion", "#MACFootball"],
    "Missouri Valley": ["#MVFC", "#FCSFootball"],
    GLIAC: ["#GLIAC", "#D2Football"],
    NSIC: ["#NSIC", "#D2FB"],
  };

  return {
    schoolId: school.id,
    schoolName: school.name,
    xHandle: school.officialXHandle,
    tweetFrequency: defaults.tweetFrequency,
    contentThemes: defaults.themes,
    engagementRate: defaults.engagementRate,
    interactsWithRecruits: defaults.interactsWithRecruits,
    peakActivityHours: defaults.peakActivityHours,
    commonHashtags: [
      ...(conferenceHashtags[school.conference] || []),
      "#CollegeFootball",
      "#Recruiting",
    ],
    analysisStatus: "mock",
  };
}

// POST /api/coaches/scrape-x
// Accepts { xHandle?: string } to scrape one or all coach X accounts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { xHandle } = body as { xHandle?: string };

    const schools = xHandle
      ? targetSchools.filter(
          (s) =>
            s.officialXHandle.toLowerCase() === xHandle.toLowerCase() ||
            s.officialXHandle.toLowerCase() === `@${xHandle.toLowerCase()}`
        )
      : targetSchools;

    if (xHandle && schools.length === 0) {
      return NextResponse.json(
        { error: "No school found with that X handle", xHandle },
        { status: 404 }
      );
    }

    const analyses: XAnalysis[] = [];

    for (const school of schools) {
      let analysis: XAnalysis;

      // Attempt live X API analysis
      try {
        const { verifyHandle, getUserTweets } = await import(
          "@/lib/integrations/x-api"
        );

        const handle = school.officialXHandle.replace("@", "");
        const user = await verifyHandle(handle);

        if (user) {
          const tweets = await getUserTweets(user.id, 20);

          // Analyze posting patterns
          const tweetDates = tweets
            .filter((t) => t.created_at)
            .map((t) => new Date(t.created_at));

          let tweetFrequency = 0;
          if (tweetDates.length >= 2) {
            const daySpan =
              (tweetDates[0].getTime() -
                tweetDates[tweetDates.length - 1].getTime()) /
              (1000 * 60 * 60 * 24);
            tweetFrequency =
              daySpan > 0 ? Math.round((tweets.length / daySpan) * 10) / 10 : 0;
          }

          // Extract peak activity hours
          const hourCounts = new Map<number, number>();
          for (const d of tweetDates) {
            const h = d.getUTCHours();
            hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
          }
          const sortedHours = [...hourCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([h]) => h);

          // Calculate engagement rate
          let totalEngagements = 0;
          let totalImpressions = 0;
          for (const t of tweets) {
            if (t.public_metrics) {
              totalEngagements +=
                t.public_metrics.like_count +
                t.public_metrics.retweet_count +
                t.public_metrics.reply_count;
              totalImpressions += t.public_metrics.impression_count || 0;
            }
          }
          const engagementRate =
            totalImpressions > 0
              ? Math.round((totalEngagements / totalImpressions) * 1000) / 10
              : 0;

          // Detect recruit interactions
          const recruitKeywords =
            /recruit|commit|offer|prospect|class of|c\/o|camp/i;
          const interactsWithRecruits = tweets.some((t) =>
            recruitKeywords.test(t.text)
          );

          // Extract hashtags
          const hashtagPattern = /#\w+/g;
          const hashtagCounts = new Map<string, number>();
          for (const t of tweets) {
            const matches = t.text.match(hashtagPattern) || [];
            for (const tag of matches) {
              hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
            }
          }
          const commonHashtags = [...hashtagCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([tag]) => tag);

          // Determine content themes
          const themeKeywords: Record<string, RegExp> = {
            "game highlights": /highlight|game day|W!|victory|win/i,
            "recruiting announcements": /commit|sign|offer|welcome/i,
            "program culture": /culture|family|brotherhood|tradition/i,
            "player spotlights": /spotlight|congrats|shoutout|player/i,
            "camp invites": /camp|clinic|visit|prospect day/i,
            "recruit interactions": /recruit|prospect|c\/o|class of/i,
          };
          const contentThemes: string[] = [];
          for (const [theme, re] of Object.entries(themeKeywords)) {
            if (tweets.some((t) => re.test(t.text))) {
              contentThemes.push(theme);
            }
          }

          analysis = {
            schoolId: school.id,
            schoolName: school.name,
            xHandle: school.officialXHandle,
            tweetFrequency,
            contentThemes:
              contentThemes.length > 0 ? contentThemes : ["general content"],
            engagementRate,
            interactsWithRecruits,
            peakActivityHours: sortedHours,
            commonHashtags,
            analysisStatus: "live",
          };
        } else {
          // Handle not found — use mock
          analysis = generateMockAnalysis(school);
          analysis.analysisStatus = "handle_not_found";
        }
      } catch (xErr) {
        console.error(
          `[scrape-x] X API failed for ${school.officialXHandle}:`,
          xErr
        );
        analysis = generateMockAnalysis(school);
      }

      // Store results in coachBehaviorProfiles if DB is configured (upsert to prevent duplicates)
      if (isDbConfigured()) {
        try {
          // Check if a profile already exists for this school
          const existing = await db.select({ id: coachBehaviorProfiles.id })
            .from(coachBehaviorProfiles)
            .where(eq(coachBehaviorProfiles.schoolName, school.name))
            .limit(1);

          if (existing.length > 0) {
            // Update existing
            await db.update(coachBehaviorProfiles)
              .set({
                tweetFrequency: analysis.tweetFrequency,
                peakActivityHours: analysis.peakActivityHours,
                commonHashtags: analysis.commonHashtags,
                interactsWithRecruits: analysis.interactsWithRecruits,
                engagementStyle:
                  analysis.interactsWithRecruits ? "active_recruiter" : "broadcast",
                estimatedResponseRate:
                  school.priorityTier === "Tier 3"
                    ? 0.7
                    : school.priorityTier === "Tier 2"
                      ? 0.4
                      : 0.15,
                lastUpdated: new Date(),
              })
              .where(eq(coachBehaviorProfiles.id, existing[0].id));
          } else {
            // Insert new
            await db.insert(coachBehaviorProfiles).values({
              coachName: `Staff — ${school.name}`,
              schoolName: school.name,
              division: school.division,
              conference: school.conference,
              tweetFrequency: analysis.tweetFrequency,
              peakActivityHours: analysis.peakActivityHours,
              commonHashtags: analysis.commonHashtags,
              interactsWithRecruits: analysis.interactsWithRecruits,
              engagementStyle:
                analysis.interactsWithRecruits ? "active_recruiter" : "broadcast",
              estimatedResponseRate:
                school.priorityTier === "Tier 3"
                  ? 0.7
                  : school.priorityTier === "Tier 2"
                    ? 0.4
                    : 0.15,
              lastUpdated: new Date(),
            });
          }
        } catch (dbErr) {
          console.error(
            `[scrape-x] Failed to store behavior profile for ${school.name}:`,
            dbErr
          );
        }
      }

      analyses.push(analysis);
    }

    return NextResponse.json({
      success: true,
      summary: {
        accountsAnalyzed: analyses.length,
        liveAnalyses: analyses.filter((a) => a.analysisStatus === "live").length,
        mockAnalyses: analyses.filter((a) => a.analysisStatus !== "live").length,
      },
      analyses,
    });
  } catch (err) {
    console.error("[scrape-x] Unexpected error:", err);
    return NextResponse.json(
      { error: "X scrape pipeline failed", details: String(err) },
      { status: 500 }
    );
  }
}
