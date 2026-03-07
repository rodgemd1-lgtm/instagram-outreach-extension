import { NextRequest, NextResponse } from "next/server";
import {
  getCamps,
  getCampsByStatus,
  getCampsByType,
  getCampsBySchool,
  getCampHistory,
  addCamp,
} from "@/lib/rec/knowledge/camp-database";
import type { RegistrationStatus, CampType } from "@/lib/rec/knowledge/camp-database";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const type = req.nextUrl.searchParams.get("type");
  const school = req.nextUrl.searchParams.get("school");
  const history = req.nextUrl.searchParams.get("history");

  let result;

  if (history === "true") {
    result = await getCampHistory();
  } else if (status) {
    result = await getCampsByStatus(status as RegistrationStatus);
  } else if (type) {
    result = await getCampsByType(type as CampType);
  } else if (school) {
    result = await getCampsBySchool(school);
  } else {
    result = await getCamps();
  }

  return NextResponse.json({ camps: result, total: result.length });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const camp = await addCamp({
    name: data.name,
    school: data.school,
    location: data.location,
    campType: data.campType,
    date: data.date,
    dateEnd: data.dateEnd,
    registrationDeadline: data.registrationDeadline,
    registrationStatus: data.registrationStatus,
    cost: data.cost,
    coachesPresent: data.coachesPresent,
    notes: data.notes,
  });

  return NextResponse.json({ camp });
}
