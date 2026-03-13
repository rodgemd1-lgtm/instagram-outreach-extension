"use client";

interface WaveProgressProps {
  currentWave: number;
  counts: { followed: number; introDM: number; followUp: number; directAsk: number };
  total: number;
}

const WAVES = [
  { label: "Follow", color: "#1E3A5F", description: "Days 1-14" },
  { label: "Intro DM", color: "#3B82F6", description: "Days 15-30" },
  { label: "Follow-up", color: "#D97706", description: "Days 31-60" },
  { label: "Direct Ask", color: "#16A34A", description: "Days 61-90" },
];

export function WaveProgress({ currentWave, counts, total }: WaveProgressProps) {
  const countValues = [counts.followed, counts.introDM, counts.followUp, counts.directAsk];
  const activeTotal = countValues.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          DM Campaign Waves
        </h3>
        <span className="font-mono text-xs text-[#9CA3AF]">
          {activeTotal}/{total} coaches in pipeline
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#F5F5F4]">
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
                opacity: isCurrent ? 1 : 0.7,
              }}
            />
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
                  ? "border-[#E5E7EB] bg-[#FAFAFA]"
                  : "border-transparent bg-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: wave.color }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {wave.label}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="font-mono text-sm font-bold text-[#0F1720]">
                  {count}
                </span>
                <span className="text-[9px] text-[#9CA3AF]">{wave.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
