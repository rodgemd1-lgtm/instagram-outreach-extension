interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">{item.label}</span>
            <span className="font-jetbrains text-xs font-bold tabular-nums text-white">{item.value}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.03]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((item.value / max) * 100, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
