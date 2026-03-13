"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  PILLAR_CONFIG,
  toCalendarPillar,
  type CalendarPillar,
} from "@/lib/dashboard/pillar-config";

/* ------------------------------------------------------------------ */
/*  Pillar colors for light theme                                      */
/* ------------------------------------------------------------------ */

const PILLAR_COLORS: Record<CalendarPillar, string> = {
  film: "#0F1720",
  training: "#D4A853",
  academic: "#6B7280",
  camp: "#F59E0B",
  lifestyle: "#D4A853",
};

/* ------------------------------------------------------------------ */
/*  Target distribution                                                */
/* ------------------------------------------------------------------ */

const TARGET_DISTRIBUTION: Record<CalendarPillar, number> = {
  film: 40,
  training: 40,
  academic: 20,
  camp: 0,
  lifestyle: 0,
};

interface PillarChartProps {
  posts: { pillar: string }[];
}

export function PillarChart({ posts }: PillarChartProps) {
  // Count posts per calendar pillar
  const counts: Record<CalendarPillar, number> = {
    film: 0,
    training: 0,
    academic: 0,
    camp: 0,
    lifestyle: 0,
  };

  for (const post of posts) {
    const mapped = toCalendarPillar(post.pillar);
    if (mapped in counts) {
      counts[mapped]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const data = Object.entries(PILLAR_CONFIG).map(([key, cfg]) => {
    const k = key as CalendarPillar;
    const pct = total > 0 ? Math.round((counts[k] / total) * 100) : 0;
    const target = TARGET_DISTRIBUTION[k];
    return {
      name: cfg.label,
      count: counts[k],
      pct,
      target,
      color: PILLAR_COLORS[k],
    };
  });

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">
          Posts by Pillar
        </h3>
        {total > 0 && (
          <span className="text-xs text-[#9CA3AF] font-mono">
            {total} total
          </span>
        )}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data}>
            <XAxis
              type="number"
              tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 12,
                color: "#0F1720",
              }}
              itemStyle={{ color: "#0F1720" }}
              labelStyle={{ color: "#6B7280" }}
              formatter={(value: number, _name: string, props: { payload: { pct: number; target: number } }) => {
                const { pct, target } = props.payload;
                const targetStr = target > 0 ? ` (target: ${target}%)` : "";
                return [`${value} posts (${pct}%)${targetStr}`, ""];
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Target distribution indicator */}
      <div className="mt-3 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">
        <span>Target:</span>
        <span className="text-[#0F1720]">Film 40%</span>
        <span className="text-[#D4A853]">Training 40%</span>
        <span className="text-[#6B7280]">Academic 20%</span>
      </div>
    </div>
  );
}
