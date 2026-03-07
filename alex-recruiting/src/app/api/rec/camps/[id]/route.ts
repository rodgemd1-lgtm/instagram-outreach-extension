import { NextRequest, NextResponse } from "next/server";
import { getCampById, updateCamp, addCampResult } from "@/lib/rec/knowledge/camp-database";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const camp = await getCampById(id);

  if (!camp) {
    return NextResponse.json({ error: "Camp not found" }, { status: 404 });
  }

  return NextResponse.json({ camp });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  // If results are being submitted, use the dedicated addCampResult function
  // which also sets followUpStatus to "pending"
  if (data.results && !data.registrationStatus && !data.followUpStatus) {
    const updated = await addCampResult(id, data.results);
    if (!updated) {
      return NextResponse.json({ error: "Camp not found" }, { status: 404 });
    }
    return NextResponse.json({ camp: updated });
  }

  const updated = await updateCamp(id, {
    registrationStatus: data.registrationStatus,
    results: data.results,
    coachContacts: data.coachContacts,
    coachesPresent: data.coachesPresent,
    followUpStatus: data.followUpStatus,
    offerCorrelation: data.offerCorrelation,
    notes: data.notes,
    cost: data.cost,
    date: data.date,
    dateEnd: data.dateEnd,
    registrationDeadline: data.registrationDeadline,
  });

  if (!updated) {
    return NextResponse.json({ error: "Camp not found" }, { status: 404 });
  }

  return NextResponse.json({ camp: updated });
}
