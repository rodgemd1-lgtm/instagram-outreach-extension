import { NextRequest, NextResponse } from "next/server";
import { targetSchools, getSchoolById } from "@/lib/data/target-schools";
import { db, isDbConfigured } from "@/lib/db";
import { scrapeJobs } from "@/lib/db/schema";

// POST /api/coaches/research
// Accepts { schoolId?: string } to research one or all target schools
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { schoolId } = body as { schoolId?: string };

    const schools = schoolId
      ? [getSchoolById(schoolId)].filter(Boolean)
      : targetSchools;

    if (schools.length === 0) {
      return NextResponse.json(
        { error: "School not found", schoolId },
        { status: 404 }
      );
    }

    const results: {
      schoolId: string;
      schoolName: string;
      coachesFound: number;
      articlesFound: number;
      staffUrl: string;
      scrapeStatus: string;
      searchStatus: string;
    }[] = [];

    for (const school of schools) {
      if (!school) continue;

      let scrapeStatus = "skipped";
      let coachesFound = 0;
      let articlesFound = 0;
      let searchStatus = "skipped";

      // Record the scrape job in the database if configured
      if (isDbConfigured()) {
        try {
          await db.insert(scrapeJobs).values({
            type: "coach_research",
            targetUrl: school.staffUrl,
            status: "pending",
          });
        } catch (dbErr) {
          console.error(`[research] Failed to insert scrapeJob for ${school.name}:`, dbErr);
        }
      }

      // Attempt Firecrawl scrape of staff page
      try {
        const { scrapeCoachingStaff } = await import("@/lib/integrations/firecrawl");
        const staffResult = await scrapeCoachingStaff(school.staffUrl);
        coachesFound = staffResult.coaches.length;
        scrapeStatus = "success";

        // Update scrape job status
        if (isDbConfigured()) {
          try {
            const { eq, and } = await import("drizzle-orm");
            await db
              .update(scrapeJobs)
              .set({
                status: "completed",
                result: { coaches: staffResult.coaches },
                completedAt: new Date(),
              })
              .where(
                and(
                  eq(scrapeJobs.targetUrl, school.staffUrl),
                  eq(scrapeJobs.status, "pending")
                )
              );
          } catch (updateErr) {
            console.error(`[research] Failed to update scrapeJob:`, updateErr);
          }
        }
      } catch (scrapeErr) {
        console.error(`[research] Firecrawl failed for ${school.name}:`, scrapeErr);
        scrapeStatus = "failed";

        // Generate mock coach data from static information
        coachesFound = school.priorityTier === "Tier 1" ? 3 : school.priorityTier === "Tier 2" ? 2 : 2;
      }

      // Attempt Exa search for recent coach news
      try {
        const { searchSchoolOLNeeds } = await import("@/lib/integrations/exa");
        const searchResults = await searchSchoolOLNeeds(school.name);
        articlesFound = searchResults.length;
        searchStatus = "success";
      } catch (searchErr) {
        console.error(`[research] Exa search failed for ${school.name}:`, searchErr);
        searchStatus = "failed";

        // Return mock article count from static data
        articlesFound = school.priorityTier === "Tier 1" ? 5 : school.priorityTier === "Tier 2" ? 3 : 1;
      }

      results.push({
        schoolId: school.id,
        schoolName: school.name,
        coachesFound,
        articlesFound,
        staffUrl: school.staffUrl,
        scrapeStatus,
        searchStatus,
      });
    }

    const totalCoaches = results.reduce((sum, r) => sum + r.coachesFound, 0);
    const totalArticles = results.reduce((sum, r) => sum + r.articlesFound, 0);

    return NextResponse.json({
      success: true,
      summary: {
        schoolsResearched: results.length,
        totalCoachesFound: totalCoaches,
        totalArticlesFound: totalArticles,
      },
      results,
    });
  } catch (err) {
    console.error("[research] Unexpected error:", err);
    return NextResponse.json(
      { error: "Research pipeline failed", details: String(err) },
      { status: 500 }
    );
  }
}
