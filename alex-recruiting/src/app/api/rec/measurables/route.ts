import { NextRequest, NextResponse } from "next/server";
import {
  getMeasurables,
  getMeasurablesByType,
  addMeasurement,
  getPercentiles,
  getProgressChart,
  JACOB_CURRENT,
} from "@/lib/rec/knowledge/measurables";
import type { MeasureType, MeasureSource } from "@/lib/rec/knowledge/measurables";

export async function GET(req: NextRequest) {
  const athleteId = req.nextUrl.searchParams.get("athleteId") ?? "jacob-rodgers";
  const type = req.nextUrl.searchParams.get("type") as MeasureType | null;
  const includePercentiles = req.nextUrl.searchParams.get("percentiles") === "true";
  const includeProgress = req.nextUrl.searchParams.get("progress") === "true";

  let measurements;
  if (type) {
    measurements = await getMeasurablesByType(type, athleteId);
  } else {
    measurements = await getMeasurables(athleteId);
  }

  const response: Record<string, unknown> = {
    measurements,
    total: measurements.length,
  };

  // If no measurements in DB, include baseline data
  if (measurements.length === 0) {
    response.baseline = JACOB_CURRENT;
    response.note = "No measurements recorded in database yet. Showing baseline values. POST to /api/rec/measurables to record measurements.";
  }

  if (includePercentiles) {
    response.percentiles = await getPercentiles(athleteId);
  }

  if (includeProgress) {
    response.progress = await getProgressChart(athleteId);
  }

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.measureType || data.value === undefined || !data.unit) {
    return NextResponse.json(
      { error: "measureType, value, and unit are required" },
      { status: 400 }
    );
  }

  const validTypes: MeasureType[] = [
    "40yd", "shuttle", "broad_jump", "vertical",
    "bench", "squat", "clean", "height", "weight",
  ];

  if (!validTypes.includes(data.measureType)) {
    return NextResponse.json(
      { error: `Invalid measureType. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const measurement = await addMeasurement({
    athleteId: data.athleteId,
    measureType: data.measureType as MeasureType,
    value: data.value,
    unit: data.unit,
    measuredAt: data.measuredAt,
    source: data.source as MeasureSource | undefined,
    campId: data.campId,
    verified: data.verified,
    notes: data.notes,
  });

  return NextResponse.json({ measurement });
}
