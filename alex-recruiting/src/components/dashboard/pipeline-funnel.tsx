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
    <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-dash-text">
        Coach Pipeline
      </h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 4);
          return (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-dash-muted">
                  {stage.label}
                </span>
                <span className="text-xs font-semibold text-dash-text">
                  {stage.count}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-dash-surface-raised">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
