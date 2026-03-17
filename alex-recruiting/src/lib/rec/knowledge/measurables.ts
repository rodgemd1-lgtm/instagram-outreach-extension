// Measurables Database with D1/D2/D3 Benchmarks
// Supabase-backed via Drizzle ORM
// Tracks Jacob's physical measurables against college OL/DT benchmarks

import { eq, desc, and } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { measurables } from "@/lib/db/schema";

// ---- Types ----

export type MeasureType =
  | "40yd"
  | "shuttle"
  | "broad_jump"
  | "vertical"
  | "bench"
  | "squat"
  | "clean"
  | "height"
  | "weight";

export type MeasureSource = "camp" | "training" | "self_reported" | "combine";

export interface Measurement {
  id: string;
  athleteId: string;
  measureType: MeasureType;
  value: number;
  unit: string;
  measuredAt: string;
  source: MeasureSource;
  campId: string | null;
  verified: boolean;
  notes: string | null;
  createdAt: string;
}

export interface Benchmark {
  measureType: MeasureType;
  unit: string;
  d1_OG: number;
  d1_DT: number;
  d2_OL: number;
  d3_OL: number;
  label: string;
  higherIsBetter: boolean;
}

export interface PercentileResult {
  measureType: MeasureType;
  label: string;
  currentValue: number;
  unit: string;
  d1_OG_pct: number;
  d1_DT_pct: number;
  d2_OL_pct: number;
  d3_OL_pct: number;
}

// ---- Row mapper ----

function rowToMeasurement(row: typeof measurables.$inferSelect): Measurement {
  return {
    id: row.id,
    athleteId: row.athleteId,
    measureType: row.measureType as MeasureType,
    value: row.value,
    unit: row.unit,
    measuredAt: row.measuredAt?.toISOString() ?? new Date().toISOString(),
    source: row.source as MeasureSource,
    campId: row.campId ?? null,
    verified: row.verified ?? false,
    notes: row.notes ?? null,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// ---- Jacob's current measurables (baseline) ----

export const JACOB_CURRENT: { measureType: MeasureType; value: number; unit: string; date: string }[] = [
  { measureType: "height", value: 76, unit: "inches", date: "2026-01-15" },      // 6'4"
  { measureType: "weight", value: 285, unit: "lbs", date: "2026-01-15" },
  { measureType: "bench", value: 265, unit: "lbs", date: "2026-01-15" },
  { measureType: "squat", value: 350, unit: "lbs", date: "2026-01-15" },
];

// ---- D1/D2/D3 OL/DT Benchmarks ----
// These are average measurables for college OL/DT recruits at each division level

export const BENCHMARKS: Benchmark[] = [
  {
    measureType: "height",
    unit: "inches",
    d1_OG: 75, // 6'3"
    d1_DT: 75, // 6'3"
    d2_OL: 74, // 6'2"
    d3_OL: 73, // 6'1"
    label: "Height",
    higherIsBetter: true,
  },
  {
    measureType: "weight",
    unit: "lbs",
    d1_OG: 305,
    d1_DT: 280,
    d2_OL: 285,
    d3_OL: 270,
    label: "Weight",
    higherIsBetter: true,
  },
  {
    measureType: "40yd",
    unit: "seconds",
    d1_OG: 4.95,
    d1_DT: 4.85,
    d2_OL: 5.1,
    d3_OL: 5.2,
    label: "40-Yard Dash",
    higherIsBetter: false, // lower is faster
  },
  {
    measureType: "bench",
    unit: "lbs",
    d1_OG: 315,
    d1_DT: 300,
    d2_OL: 285,
    d3_OL: 260,
    label: "Bench Press",
    higherIsBetter: true,
  },
  {
    measureType: "squat",
    unit: "lbs",
    d1_OG: 445,
    d1_DT: 425,
    d2_OL: 400,
    d3_OL: 375,
    label: "Squat",
    higherIsBetter: true,
  },
  {
    measureType: "vertical",
    unit: "inches",
    d1_OG: 28,
    d1_DT: 30,
    d2_OL: 26,
    d3_OL: 24,
    label: "Vertical Jump",
    higherIsBetter: true,
  },
  {
    measureType: "shuttle",
    unit: "seconds",
    d1_OG: 4.55,
    d1_DT: 4.45,
    d2_OL: 4.7,
    d3_OL: 4.85,
    label: "20-Yard Shuttle",
    higherIsBetter: false,
  },
  {
    measureType: "broad_jump",
    unit: "inches",
    d1_OG: 96, // 8'0"
    d1_DT: 100, // 8'4"
    d2_OL: 90, // 7'6"
    d3_OL: 84, // 7'0"
    label: "Broad Jump",
    higherIsBetter: true,
  },
  {
    measureType: "clean",
    unit: "lbs",
    d1_OG: 285,
    d1_DT: 275,
    d2_OL: 255,
    d3_OL: 235,
    label: "Power Clean",
    higherIsBetter: true,
  },
];

// ---- In-memory fallback ----

const memoryMeasurables: Measurement[] = [];
let memNextId = 1;

function memGenerateId(): string {
  return `meas-${Date.now()}-${memNextId++}`;
}

// ---- Public API ----

export async function getMeasurables(
  athleteId: string = "jacob-rodgers"
): Promise<Measurement[]> {
  if (!isDbConfigured()) {
    return memoryMeasurables.filter((m) => m.athleteId === athleteId);
  }
  const rows = await db
    .select()
    .from(measurables)
    .where(eq(measurables.athleteId, athleteId))
    .orderBy(desc(measurables.measuredAt));
  return rows.map(rowToMeasurement);
}

export async function getMeasurablesByType(
  type: MeasureType,
  athleteId: string = "jacob-rodgers"
): Promise<Measurement[]> {
  if (!isDbConfigured()) {
    return memoryMeasurables.filter(
      (m) => m.athleteId === athleteId && m.measureType === type
    );
  }
  const rows = await db
    .select()
    .from(measurables)
    .where(and(eq(measurables.athleteId, athleteId), eq(measurables.measureType, type)))
    .orderBy(desc(measurables.measuredAt));
  return rows.map(rowToMeasurement);
}

export async function addMeasurement(data: {
  athleteId?: string;
  measureType: MeasureType;
  value: number;
  unit: string;
  measuredAt?: string;
  source?: MeasureSource;
  campId?: string;
  verified?: boolean;
  notes?: string;
}): Promise<Measurement> {
  if (!isDbConfigured()) {
    const measurement: Measurement = {
      id: memGenerateId(),
      athleteId: data.athleteId ?? "jacob-rodgers",
      measureType: data.measureType,
      value: data.value,
      unit: data.unit,
      measuredAt: data.measuredAt ?? new Date().toISOString(),
      source: data.source ?? "self_reported",
      campId: data.campId ?? null,
      verified: data.verified ?? false,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    memoryMeasurables.push(measurement);
    return measurement;
  }

  const [row] = await db
    .insert(measurables)
    .values({
      athleteId: data.athleteId ?? "jacob-rodgers",
      measureType: data.measureType,
      value: data.value,
      unit: data.unit,
      measuredAt: data.measuredAt ? new Date(data.measuredAt) : new Date(),
      source: data.source ?? "self_reported",
      campId: data.campId,
      verified: data.verified ?? false,
      notes: data.notes,
    })
    .returning();

  return rowToMeasurement(row);
}

// ---- Percentile calculation ----
// Calculates where an athlete's value falls relative to each division benchmark.
// Uses a linear scale: 100% = at benchmark, scaled proportionally.
// For "lower is better" metrics (40yd, shuttle), the scale is inverted.

function calculatePercentile(
  value: number,
  benchmark: number,
  higherIsBetter: boolean
): number {
  if (higherIsBetter) {
    // e.g., bench 265 vs D1 benchmark 315 => 265/315 = 84%
    const pct = Math.round((value / benchmark) * 100);
    return Math.min(pct, 150); // cap at 150% to handle over-performers
  } else {
    // e.g., 40yd: lower is better. 5.0 vs 4.95 benchmark => 4.95/5.0 = 99%
    if (value <= 0) return 0;
    const pct = Math.round((benchmark / value) * 100);
    return Math.min(pct, 150);
  }
}

export async function getPercentiles(
  athleteId: string = "jacob-rodgers"
): Promise<PercentileResult[]> {
  const allMeasurements = await getMeasurables(athleteId);
  const results: PercentileResult[] = [];

  for (const benchmark of BENCHMARKS) {
    // Get the most recent measurement of this type
    const measurements = allMeasurements.filter(
      (m) => m.measureType === benchmark.measureType
    );

    if (measurements.length === 0) continue;

    // Most recent is first (ordered by desc measuredAt)
    const latest = measurements[0];

    results.push({
      measureType: benchmark.measureType,
      label: benchmark.label,
      currentValue: latest.value,
      unit: benchmark.unit,
      d1_OG_pct: calculatePercentile(latest.value, benchmark.d1_OG, benchmark.higherIsBetter),
      d1_DT_pct: calculatePercentile(latest.value, benchmark.d1_DT, benchmark.higherIsBetter),
      d2_OL_pct: calculatePercentile(latest.value, benchmark.d2_OL, benchmark.higherIsBetter),
      d3_OL_pct: calculatePercentile(latest.value, benchmark.d3_OL, benchmark.higherIsBetter),
    });
  }

  return results;
}

// ---- Progress / history for charting ----

export interface ProgressEntry {
  measureType: MeasureType;
  label: string;
  unit: string;
  history: { date: string; value: number; source: MeasureSource }[];
  currentValue: number;
  improvementRate: number | null; // value change per month
  projectedValueIn6Months: number | null;
}

export async function getProgressChart(
  athleteId: string = "jacob-rodgers"
): Promise<ProgressEntry[]> {
  const allMeasurements = await getMeasurables(athleteId);
  const results: ProgressEntry[] = [];

  const typeGroups = new Map<MeasureType, Measurement[]>();
  for (const m of allMeasurements) {
    const existing = typeGroups.get(m.measureType) ?? [];
    existing.push(m);
    typeGroups.set(m.measureType, existing);
  }

  for (const [type, measurements] of typeGroups) {
    const benchmark = BENCHMARKS.find((b) => b.measureType === type);
    if (!benchmark) continue;

    // Sort chronologically (oldest first) for history
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    const history = sorted.map((m) => ({
      date: m.measuredAt,
      value: m.value,
      source: m.source,
    }));

    const currentValue = sorted[sorted.length - 1].value;

    // Calculate improvement rate if we have 2+ data points
    let improvementRate: number | null = null;
    let projectedValueIn6Months: number | null = null;

    if (sorted.length >= 2) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const monthsElapsed =
        (new Date(last.measuredAt).getTime() - new Date(first.measuredAt).getTime()) /
        (1000 * 60 * 60 * 24 * 30);

      if (monthsElapsed > 0) {
        improvementRate = Number(
          ((last.value - first.value) / monthsElapsed).toFixed(2)
        );
        projectedValueIn6Months = Number(
          (currentValue + improvementRate * 6).toFixed(1)
        );
      }
    }

    results.push({
      measureType: type,
      label: benchmark.label,
      unit: benchmark.unit,
      history,
      currentValue,
      improvementRate,
      projectedValueIn6Months,
    });
  }

  return results;
}

// ---- Get benchmarks (static) ----

export function getBenchmarks(): Benchmark[] {
  return [...BENCHMARKS];
}

// ---- Seed Jacob's baseline measurements ----

export async function seedJacobBaseline(): Promise<Measurement[]> {
  const seeded: Measurement[] = [];
  for (const m of JACOB_CURRENT) {
    const measurement = await addMeasurement({
      athleteId: "jacob-rodgers",
      measureType: m.measureType,
      value: m.value,
      unit: m.unit,
      measuredAt: m.date,
      source: "self_reported",
      verified: false,
      notes: "Baseline measurement — January 2026",
    });
    seeded.push(measurement);
  }
  return seeded;
}

// ---- Format helper for display ----

export function formatMeasurable(type: MeasureType, value: number): string {
  switch (type) {
    case "height": {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      return `${feet}'${inches}"`;
    }
    case "weight":
    case "bench":
    case "squat":
    case "clean":
      return `${value} lbs`;
    case "40yd":
    case "shuttle":
      return `${value}s`;
    case "vertical":
    case "broad_jump":
      return `${value}"`;
    default:
      return `${value}`;
  }
}

// ---- Knowledge context for persona injection ----

export async function getKnowledgeContext(): Promise<string> {
  const lines: string[] = [];

  lines.push("=== MEASURABLES & BENCHMARKS ===\n");

  lines.push("Jacob Rodgers — Class of 2029 — DT/OG — Pewaukee HS, WI\n");

  // Show current measurables
  lines.push("Current Measurables (January 2026 baseline):");
  for (const m of JACOB_CURRENT) {
    const benchmark = BENCHMARKS.find((b) => b.measureType === m.measureType);
    const formatted = formatMeasurable(m.measureType, m.value);
    lines.push(`  ${benchmark?.label ?? m.measureType}: ${formatted}`);
  }

  // Show benchmark comparison
  lines.push("\nDivision Benchmarks (Average OL/DT Recruit):");
  lines.push("  Metric          | D1 OG    | D1 DT    | D2 OL    | D3 OL    | Jacob");
  lines.push("  ----------------|----------|----------|----------|----------|--------");

  for (const b of BENCHMARKS) {
    const jacobData = JACOB_CURRENT.find((j) => j.measureType === b.measureType);
    const jacobStr = jacobData ? formatMeasurable(b.measureType, jacobData.value) : "N/A";
    const d1og = formatMeasurable(b.measureType, b.d1_OG);
    const d1dt = formatMeasurable(b.measureType, b.d1_DT);
    const d2 = formatMeasurable(b.measureType, b.d2_OL);
    const d3 = formatMeasurable(b.measureType, b.d3_OL);

    lines.push(
      `  ${b.label.padEnd(16)}| ${d1og.padEnd(9)}| ${d1dt.padEnd(9)}| ${d2.padEnd(9)}| ${d3.padEnd(9)}| ${jacobStr}`
    );
  }

  // Show percentile analysis for known values
  lines.push("\nJacob's Percentile Ranking (vs Division Benchmarks):");

  for (const m of JACOB_CURRENT) {
    const benchmark = BENCHMARKS.find((b) => b.measureType === m.measureType);
    if (!benchmark) continue;

    const d1og = calculatePercentile(m.value, benchmark.d1_OG, benchmark.higherIsBetter);
    const d1dt = calculatePercentile(m.value, benchmark.d1_DT, benchmark.higherIsBetter);
    const d2 = calculatePercentile(m.value, benchmark.d2_OL, benchmark.higherIsBetter);
    const d3 = calculatePercentile(m.value, benchmark.d3_OL, benchmark.higherIsBetter);

    lines.push(
      `  ${benchmark.label}: D1 OG ${d1og}% | D1 DT ${d1dt}% | D2 ${d2}% | D3 ${d3}%`
    );
  }

  lines.push("\nKey Takeaways:");
  lines.push("  - Height (6'4\"): EXCEEDS all division averages — elite length for OL/DT");
  lines.push("  - Weight (285): Meets D2 average, close to D1 DT — needs 15-20 lbs for D1 OG");
  lines.push("  - Bench (265): Solid base — 93% of D3, needs +50 for D1 OG (315)");
  lines.push("  - Squat (350): Strong — 93% of D3, needs +95 for D1 OG (445)");
  lines.push("  - Missing: 40yd, shuttle, vertical, broad jump, clean — GET THESE AT CAMPS");
  lines.push("");
  lines.push("Priority Actions:");
  lines.push("  1. Register for National Underclassman Combine to get verified measurables");
  lines.push("  2. Target +20 lbs on bench and +50 lbs on squat by end of Summer 2026");
  lines.push("  3. Record 40yd and shuttle at first camp opportunity");

  return lines.join("\n");
}
