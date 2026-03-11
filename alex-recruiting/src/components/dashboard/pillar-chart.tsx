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

  const data = Object.entries(PILLAR_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    count: counts[key as CalendarPillar],
    color: cfg.color,
  }));

  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-dash-text">
        Posts by Pillar
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data}>
            <XAxis
              type="number"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "#1A1D27",
                border: "1px solid #2A2D37",
                borderRadius: 8,
                fontSize: 12,
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
    </div>
  );
}
