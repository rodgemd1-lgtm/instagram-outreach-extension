"use client";

import { useEffect, useState } from "react";

const LABELS = [
  "Film Quality",
  "Social Presence",
  "Coach Outreach",
  "Academic Profile",
  "Camp Attendance",
  "Network Size",
];

const CURRENT = [65, 45, 55, 80, 30, 40];
const TARGET = [90, 80, 75, 90, 70, 60];

const CX = 150;
const CY = 150;
const R = 120;
const AXES = 6;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

function polarToCart(index: number, valuePct: number): [number, number] {
  const angle = (index / AXES) * 2 * Math.PI - Math.PI / 2;
  const x = CX + R * (valuePct / 100) * Math.cos(angle);
  const y = CY + R * (valuePct / 100) * Math.sin(angle);
  return [x, y];
}

function buildPolygon(values: number[]): string {
  return values.map((v, i) => polarToCart(i, v).join(",")).join(" ");
}

export function RadarChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Grid lines
  const gridPolygons = GRID_LEVELS.map((level) => {
    const pts = Array.from({ length: AXES }, (_, i) => {
      const angle = (i / AXES) * 2 * Math.PI - Math.PI / 2;
      const x = CX + R * level * Math.cos(angle);
      const y = CY + R * level * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
    return pts;
  });

  // Axis lines
  const axisLines = Array.from({ length: AXES }, (_, i) => {
    const [x, y] = polarToCart(i, 100);
    return { x1: CX, y1: CY, x2: x, y2: y };
  });

  // Label positions (push labels slightly outside)
  const labelPositions = LABELS.map((label, i) => {
    const [x, y] = polarToCart(i, 118);
    return { label, x, y };
  });

  const targetPoly = buildPolygon(TARGET);
  const currentPoly = mounted ? buildPolygon(CURRENT) : buildPolygon(Array(AXES).fill(0));

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        Recruiting Readiness
      </h3>
      <div className="flex justify-center">
        <svg width={300} height={300} viewBox="0 0 300 300" className="w-full max-w-[300px]">
          {/* Grid */}
          {gridPolygons.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="white" strokeOpacity={0.06} strokeWidth="1" />
          ))}

          {/* Axes */}
          {axisLines.map((line, i) => (
            <line key={i} {...line} stroke="white" strokeOpacity={0.08} strokeWidth="1" />
          ))}

          {/* Target polygon (dashed) */}
          <polygon
            points={targetPoly}
            fill="none"
            stroke="white"
            strokeOpacity={0.2}
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* Current polygon (animated) */}
          <polygon
            points={currentPoly}
            fill="#ff000c"
            fillOpacity={0.2}
            stroke="#ff000c"
            strokeWidth="1.5"
            style={{
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />

          {/* Current value dots */}
          {mounted &&
            CURRENT.map((v, i) => {
              const [x, y] = polarToCart(i, v);
              return <circle key={i} cx={x} cy={y} r={3} fill="#ff000c" />;
            })}

          {/* Labels */}
          {labelPositions.map(({ label, x, y }, i) => (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fillOpacity={0.4}
              fontSize="9"
              fontFamily="monospace"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-4 rounded-sm bg-[#ff000c]/60" />
          <span className="font-mono text-[10px] text-white/40">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-px w-4 border-t border-dashed border-white/30" />
          <span className="font-mono text-[10px] text-white/40">Target</span>
        </div>
      </div>
    </div>
  );
}
