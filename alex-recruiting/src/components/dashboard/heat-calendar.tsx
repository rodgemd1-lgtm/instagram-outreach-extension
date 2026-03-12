"use client";

const WEEKS = 26;
const DAYS = 7;
const CELL = 10;
const GAP = 2;

// Seeded pseudo-random for deterministic data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateHeatData(): number[][] {
  const rand = seededRandom(42);
  const data: number[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    for (let d = 0; d < DAYS; d++) {
      const r = rand();
      // Mostly 0s, some 1s, rare 2s
      if (r < 0.6) week.push(0);
      else if (r < 0.9) week.push(1);
      else week.push(2);
    }
    data.push(week);
  }
  return data;
}

function getCellColor(val: number): string {
  if (val === 0) return "rgba(255,255,255,0.05)";
  if (val === 1) return "rgba(212,168,83,0.3)";
  return "rgba(255,0,12,0.6)";
}

const MONTH_LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

export function HeatCalendar() {
  const data = generateHeatData();

  const svgWidth = WEEKS * (CELL + GAP) + 28; // +28 for day labels
  const svgHeight = DAYS * (CELL + GAP) + 16; // +16 for month labels

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        Content Activity
      </h3>
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
        >
          {/* Month labels */}
          {MONTH_LABELS.map((label, i) => {
            const x = 28 + i * (WEEKS / MONTH_LABELS.length) * (CELL + GAP);
            return (
              <text
                key={label}
                x={x}
                y={10}
                fill="white"
                fillOpacity={0.3}
                fontSize="8"
                fontFamily="monospace"
              >
                {label}
              </text>
            );
          })}

          {/* Day labels */}
          {Object.entries(DAY_LABELS).map(([dayIdx, label]) => (
            <text
              key={dayIdx}
              x={0}
              y={16 + Number(dayIdx) * (CELL + GAP) + CELL / 2 + 3}
              fill="white"
              fillOpacity={0.3}
              fontSize="8"
              fontFamily="monospace"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {data.map((week, w) =>
            week.map((val, d) => (
              <rect
                key={`${w}-${d}`}
                x={28 + w * (CELL + GAP)}
                y={16 + d * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={getCellColor(val)}
              />
            ))
          )}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[9px] text-white/30">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((v) => (
            <div
              key={v}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: getCellColor(v) }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] text-white/30">More</span>
      </div>
    </div>
  );
}
