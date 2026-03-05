import { NextRequest, NextResponse } from "next/server";
import { targetSchools } from "@/lib/data/target-schools";
import { getTierForDivision, scoreCoach } from "@/lib/alex/coach-ranker";

// In-memory coach store (will be replaced by DB when configured)
const coachStore = targetSchools.map((school) => ({
  id: school.id,
  name: `OL Coach — ${school.name}`,
  title: "Offensive Line Coach",
  schoolId: school.id,
  schoolName: school.name,
  division: school.division,
  conference: school.conference,
  xHandle: "",
  dmOpen: school.priorityTier === "Tier 3",
  followStatus: "not_followed" as const,
  dmStatus: "not_sent" as const,
  priorityTier: school.priorityTier,
  olNeedScore: 3,
  xActivityScore: 3,
  lastEngaged: null,
  notes: school.whyJacob,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");
  const division = searchParams.get("division");
  const status = searchParams.get("followStatus");

  let filtered = [...coachStore];

  if (tier) filtered = filtered.filter((c) => c.priorityTier === tier);
  if (division) filtered = filtered.filter((c) => c.division === division);
  if (status) filtered = filtered.filter((c) => c.followStatus === status);

  // Sort by score
  filtered.sort((a, b) => scoreCoach(b) - scoreCoach(a));

  return NextResponse.json({ coaches: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newCoach = {
    id: `coach-${Date.now()}`,
    name: body.name,
    title: body.title || "",
    schoolId: body.schoolId || "",
    schoolName: body.schoolName,
    division: body.division,
    conference: body.conference || "",
    xHandle: body.xHandle || "",
    dmOpen: body.dmOpen || false,
    followStatus: "not_followed" as const,
    dmStatus: "not_sent" as const,
    priorityTier: body.priorityTier || getTierForDivision(body.division, body.conference || ""),
    olNeedScore: body.olNeedScore || 3,
    xActivityScore: body.xActivityScore || 3,
    lastEngaged: null,
    notes: body.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  coachStore.push(newCoach);

  return NextResponse.json({ coach: newCoach }, { status: 201 });
}
