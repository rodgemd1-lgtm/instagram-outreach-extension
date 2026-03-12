interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

interface PipelineFunnelProps {
  stages: PipelineStage[];
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <h3 className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        Coach Pipeline
      </h3>
      <div className="space-y-1">
        {stages.map((stage, index) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 6);

          // Compute conversion rate from previous stage
          let conversionRate: number | null = null;
          if (index > 0 && stages[index - 1].count > 0) {
            conversionRate = Math.round(
              (stage.count / stages[index - 1].count) * 100
            );
          }

          return (
            <div key={stage.label}>
              {/* Conversion rate between stages */}
              {conversionRate !== null && (
                <div className="flex items-center gap-2 py-1.5 pl-1">
                  <svg
                    className="h-3 w-3 text-white/20"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M6 2L6 10M6 10L3 7M6 10L9 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className={`font-jetbrains text-xs font-medium ${
                      conversionRate >= 20
                        ? "text-[#22C55E]"
                        : "text-[#F59E0B]"
                    }`}
                  >
                    {conversionRate}% conversion
                  </span>
                </div>
              )}

              {/* Stage bar */}
              <div className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-xs text-white/40">
                  {stage.label}
                </span>
                <div className="relative flex-1">
                  <div className="h-8 w-full rounded bg-white/[0.03]">
                    <div
                      className="flex h-8 items-center rounded px-3 transition-all duration-700"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: stage.color,
                      }}
                    >
                      <span className="font-jetbrains text-xs font-bold text-white">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
