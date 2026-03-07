import { NextRequest, NextResponse } from "next/server";
import {
  getBenchmarks,
  getPercentiles,
  getProgressChart,
  formatMeasurable,
  JACOB_CURRENT,
} from "@/lib/rec/knowledge/measurables";

export async function GET(req: NextRequest) {
  const athleteId = req.nextUrl.searchParams.get("athleteId") ?? "jacob-rodgers";
  const includeProgress = req.nextUrl.searchParams.get("progress") === "true";

  const benchmarks = getBenchmarks();
  const percentiles = await getPercentiles(athleteId);

  // Build a comparison table for easy consumption
  const comparison = benchmarks.map((b) => {
    const jacobData = JACOB_CURRENT.find((j) => j.measureType === b.measureType);
    const pctData = percentiles.find((p) => p.measureType === b.measureType);

    return {
      measureType: b.measureType,
      label: b.label,
      unit: b.unit,
      higherIsBetter: b.higherIsBetter,
      benchmarks: {
        d1_OG: { value: b.d1_OG, formatted: formatMeasurable(b.measureType, b.d1_OG) },
        d1_DT: { value: b.d1_DT, formatted: formatMeasurable(b.measureType, b.d1_DT) },
        d2_OL: { value: b.d2_OL, formatted: formatMeasurable(b.measureType, b.d2_OL) },
        d3_OL: { value: b.d3_OL, formatted: formatMeasurable(b.measureType, b.d3_OL) },
      },
      jacob: jacobData
        ? {
            value: jacobData.value,
            formatted: formatMeasurable(b.measureType, jacobData.value),
            date: jacobData.date,
          }
        : null,
      percentiles: pctData
        ? {
            d1_OG: pctData.d1_OG_pct,
            d1_DT: pctData.d1_DT_pct,
            d2_OL: pctData.d2_OL_pct,
            d3_OL: pctData.d3_OL_pct,
          }
        : null,
    };
  });

  const response: Record<string, unknown> = {
    benchmarks: comparison,
    total: comparison.length,
    summary: {
      measuredCount: JACOB_CURRENT.length,
      totalBenchmarks: benchmarks.length,
      unmeasured: benchmarks
        .filter((b) => !JACOB_CURRENT.find((j) => j.measureType === b.measureType))
        .map((b) => b.label),
    },
  };

  if (includeProgress) {
    response.progress = await getProgressChart(athleteId);
  }

  return NextResponse.json(response);
}
