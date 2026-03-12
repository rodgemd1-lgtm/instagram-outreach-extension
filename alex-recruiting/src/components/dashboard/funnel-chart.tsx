interface FunnelChartProps {
  stages: { label: string; value: number; color: string }[];
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxValue = stages[0]?.value || 1;

  return (
    <div className="space-y-2">
      {stages.map((stage) => {
        const widthPct = Math.max((stage.value / maxValue) * 100, 20);
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-24 text-right">
              <span className="text-xs font-medium text-white/40">{stage.label}</span>
            </div>
            <div className="flex-1">
              <div
                className="flex h-8 items-center rounded px-3 transition-all duration-700"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                }}
              >
                <span className="font-jetbrains text-xs font-bold text-white">{stage.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
