"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { targetSchools } from "@/lib/data/target-schools";
import { getSchoolColors } from "@/lib/data/school-branding";

/**
 * Approximate lat/lon for target schools, mapped to SVG coordinates.
 * SVG viewport covers the Midwest US (~40-48N lat, ~80-97W lon).
 */
const SCHOOL_COORDS: Record<string, { x: number; y: number }> = {
  wisconsin: { x: 55, y: 18 },
  northwestern: { x: 65, y: 35 },
  iowa: { x: 48, y: 38 },
  "iowa-state": { x: 38, y: 40 },
  "northern-illinois": { x: 68, y: 33 },
  "western-michigan": { x: 75, y: 28 },
  "ball-state": { x: 72, y: 45 },
  "central-michigan": { x: 78, y: 22 },
  "south-dakota-state": { x: 25, y: 20 },
  "north-dakota-state": { x: 22, y: 10 },
  "illinois-state": { x: 60, y: 45 },
  "youngstown-state": { x: 88, y: 38 },
  "saginaw-valley": { x: 80, y: 20 },
  "michigan-tech": { x: 65, y: 5 },
  "ferris-state": { x: 76, y: 16 },
  "winona-state": { x: 42, y: 18 },
  "minnesota-state-mankato": { x: 38, y: 15 },
};

const TIER_COLORS: Record<string, string> = {
  "Tier 1": "#C5050C",
  "Tier 2": "#F59E0B",
  "Tier 3": "rgba(255,255,255,0.4)",
};

const TIER_SIZES: Record<string, number> = {
  "Tier 1": 3.5,
  "Tier 2": 2.8,
  "Tier 3": 2,
};

interface TalentTopographyProps {
  className?: string;
  onSchoolClick?: (schoolId: string) => void;
}

export function TalentTopography({ className, onSchoolClick }: TalentTopographyProps) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <h3 className="stitch-label mb-4">Talent Network Topography</h3>
      <div className="relative">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-auto"
          role="img"
          aria-label="Map showing geographic distribution of target schools across the Midwest"
        >
          {/* Background grid */}
          <defs>
            <pattern id="topogrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="60" fill="url(#topogrid)" />

          {/* Connection lines from Pewaukee (home base) */}
          {targetSchools.map((school) => {
            const coords = SCHOOL_COORDS[school.id];
            if (!coords) return null;
            const color = TIER_COLORS[school.priorityTier] || "rgba(255,255,255,0.1)";
            return (
              <line
                key={`line-${school.id}`}
                x1={57}
                y1={20}
                x2={coords.x}
                y2={coords.y}
                stroke={color}
                strokeWidth="0.3"
                strokeOpacity="0.2"
                strokeDasharray="1 1"
              />
            );
          })}

          {/* Home base — Pewaukee, WI */}
          <circle cx={57} cy={20} r={2} fill="none" stroke="#C5050C" strokeWidth="0.5" strokeDasharray="1 0.5" opacity="0.5" />
          <circle cx={57} cy={20} r={1} fill="#C5050C" />
          <text x={57} y={26} textAnchor="middle" className="fill-white/30 text-[2.5px] font-bold uppercase">Home</text>

          {/* School dots */}
          {targetSchools.map((school) => {
            const coords = SCHOOL_COORDS[school.id];
            if (!coords) return null;
            const color = TIER_COLORS[school.priorityTier] || "rgba(255,255,255,0.4)";
            const r = TIER_SIZES[school.priorityTier] || 2;
            const schoolColors = getSchoolColors(school.id);

            return (
              <g
                key={school.id}
                className="cursor-pointer"
                onClick={() => onSchoolClick?.(school.id)}
              >
                {/* Glow for Tier 1 */}
                {school.priorityTier === "Tier 1" && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={r + 2}
                    fill={color}
                    opacity="0.12"
                  />
                )}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={r}
                  fill={schoolColors.primary}
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.9"
                />
                <title>{`${school.name} (${school.priorityTier})`}</title>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4">
          {["Tier 1", "Tier 2", "Tier 3"].map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: TIER_COLORS[tier] }}
              />
              <span className="text-[10px] text-white/30">{tier}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
