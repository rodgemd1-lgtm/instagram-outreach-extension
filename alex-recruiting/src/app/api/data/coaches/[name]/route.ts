import { NextRequest, NextResponse } from "next/server";
import { targetSchools } from "@/lib/data/target-schools";

interface RouteParams {
  params: { name: string };
}

function schoolToSlug(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/university|college|state|the/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFallbackCoachProfile(coachName: string, school?: string) {
  const schoolMatch = school
    ? targetSchools.find(
        (entry) =>
          entry.name.toLowerCase() === school.toLowerCase() ||
          entry.id === schoolToSlug(school)
      )
    : null;

  return {
    firstName: coachName.split(" ")[0] ?? coachName,
    lastName: coachName.split(" ").slice(1).join(" ") || "",
    fullName: coachName,
    currentSchool: school ?? schoolMatch?.name ?? null,
    currentSchoolSlug: school ? schoolToSlug(school) : schoolMatch?.id ?? null,
    hireDate: null,
    tenureYears: null,
    totalCoachingYears: null,
    previousSchools: [],
    seasons: [],
    avgRecruitingClassRank: null,
    bestRecruitingClassRank: null,
    isTargetSchool: Boolean(schoolMatch),
    targetSchoolPriorityTier: schoolMatch?.priorityTier ?? null,
    targetSchoolWhyJacob: schoolMatch?.whyJacob ?? null,
    targetSchoolDmTimeline: schoolMatch?.dmTimeline ?? null,
    cfbdAvailable: false,
    enrichedAt: null,
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { name } = params;
  const { searchParams } = new URL(req.url);
  const school = searchParams.get("school") ?? undefined;

  if (!name) {
    return NextResponse.json({ error: "Missing coach name" }, { status: 400 });
  }

  return NextResponse.json({
    coach: buildFallbackCoachProfile(decodeURIComponent(name), school),
    source: "fallback",
  });
}
