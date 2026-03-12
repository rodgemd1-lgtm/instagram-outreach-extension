"use client";

interface WaveProgressProps {
  currentWave: number;
  counts: { followed: number; introDM: number; followUp: number; directAsk: number };
  total: number;
}

const WAVES = [
  { label: "Follow", color: "#A1A1AA", description: "Days 1-14" },
  { label: "Intro DM", color: "#D4A853", description: "Days 15-30" },
  { label: "Follow-up", color: "#F59E0B", description: "Days 31-60" },
  { label: "Direct Ask", color: "#ff000c", description: "Days 61-90" },
];

const COUNT_KEYS = ["followed", "introDM", "followUp", "directAsk"] as const;

export function WaveProgress({
  currentWave,
  counts,
  total,
}: WaveProgressProps) {
  const countValues = [counts.followed, counts.introDM, counts.followUp, counts.directAsk];
  const activeTotal = countValues.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          DM Campaign Waves
        </h3>
        <span className="font-mono text-xs text-white/50">
          {activeTotal}/{total} coaches in pipeline
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {WAVES.map((wave, i) => {
          const count = countValues[i];
          const widthPercent = total > 0 ? (count / total) * 100 : 0;
          if (widthPercent === 0) return null;
          const isCurrent = i === currentWave;

          return (
            <div
              key={wave.label}
              className="relative transition-all duration-500"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: wave.color,
                boxShadow: isCurrent
                  ? `0 0 12px ${wave.color}80, inset 0 0 4px rgba(255,255,255,0.2)`
                  : "none",
              }}
            >
              {isCurrent && (
                <div
                  className="absolute inset-0 animate-pulse rounded-full"
                  style={{
                    border: `1px solid ${wave.color}`,
                    boxShadow: `0 0 8px ${wave.color}60`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Wave labels */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {WAVES.map((wave, i) => {
          const count = countValues[i];
          const isCurrent = i === currentWave;

          return (
            <div
              key={wave.label}
              className={`rounded-lg border px-2 py-1.5 transition-colors ${
                isCurrent
                  ? "border-white/10 bg-white/5"
                  : "border-transparent bg-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: wave.color }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  {wave.label}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="font-mono text-sm font-bold text-white">
                  {count}
                </span>
                <span className="text-[9px] text-white/30">{wave.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
