"use client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface PostingWindow {
  day_of_week: number;
  hour_start: number;
  score: number;
  coach_overlap: number;
}

function getColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-emerald-400";
  if (score >= 40) return "bg-emerald-300";
  if (score >= 20) return "bg-emerald-200";
  if (score > 0) return "bg-emerald-100";
  return "bg-[#F5F5F4]";
}

export function PostingHeatmap({ windows }: { windows: PostingWindow[] }) {
  const windowMap = new Map<string, PostingWindow>();
  windows.forEach((w) => {
    windowMap.set(`${w.day_of_week}-${w.hour_start}`, w);
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex">
          <div className="w-10" />
          {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-[var(--app-muted)]">
              {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
            </div>
          ))}
        </div>
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-0.5 mt-0.5">
            <span className="w-10 text-[10px] font-medium text-[var(--app-muted)]">{day}</span>
            {HOURS.map((hour) => {
              const w = windowMap.get(`${dayIdx}-${hour}`);
              const score = w?.score ?? 0;
              return (
                <div
                  key={hour}
                  className={`h-5 flex-1 rounded-sm ${getColor(score)} transition-colors`}
                  title={`${day} ${hour}:00 — Score: ${score.toFixed(0)}${w?.coach_overlap ? `, Coach overlap: ${(w.coach_overlap * 100).toFixed(0)}%` : ""}`}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-2 flex items-center justify-end gap-1">
          <span className="text-[10px] text-[var(--app-muted)]">Less</span>
          {[0, 20, 40, 60, 80].map((s) => (
            <div key={s} className={`h-3 w-3 rounded-sm ${getColor(s)}`} />
          ))}
          <span className="text-[10px] text-[var(--app-muted)]">More</span>
        </div>
      </div>
    </div>
  );
}
