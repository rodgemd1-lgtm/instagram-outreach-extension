"use client";

import { cn } from "@/lib/utils";

interface ActivityRadarProps {
  /** Values 0-100 for each axis */
  data: {
    posting: number;
    engagement: number;
    recruiting: number;
    responsiveness: number;
    visibility: number;
  };
  className?: string;
}

export function ActivityRadar({ data, className }: ActivityRadarProps) {
  const axes = [
    { key: "posting", label: "Posting", angle: -90 },
    { key: "engagement", label: "Engage", angle: -18 },
    { key: "recruiting", label: "Recruit", angle: 54 },
    { key: "responsiveness", label: "Response", angle: 126 },
    { key: "visibility", label: "Visible", angle: 198 },
  ] as const;

  const cx = 100;
  const cy = 100;
  const maxR = 80;

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  // Build polygon points
  const points = axes
    .map((axis) => {
      const value = data[axis.key] / 100;
      const { x, y } = polarToXY(axis.angle, maxR * value);
      return `${x},${y}`;
    })
    .join(" ");

  const description = axes
    .map((axis) => `${axis.label}: ${data[axis.key]}%`)
    .join(", ");

  return (
    <div className={cn("relative", className)} role="img" aria-label={`Activity radar chart — ${description}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={axes
              .map((axis) => {
                const { x, y } = polarToXY(axis.angle, maxR * scale);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((axis) => {
          const { x, y } = polarToXY(axis.angle, maxR);
          return (
            <line
              key={axis.key}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="rgba(197,5,12,0.15)"
          stroke="#C5050C"
          strokeWidth="2"
        />

        {/* Data dots */}
        {axes.map((axis) => {
          const value = data[axis.key] / 100;
          const { x, y } = polarToXY(axis.angle, maxR * value);
          return (
            <circle
              key={axis.key}
              cx={x}
              cy={y}
              r="3"
              fill="#C5050C"
            />
          );
        })}

        {/* Labels */}
        {axes.map((axis) => {
          const { x, y } = polarToXY(axis.angle, maxR + 16);
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/40 text-[8px] font-bold uppercase"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
