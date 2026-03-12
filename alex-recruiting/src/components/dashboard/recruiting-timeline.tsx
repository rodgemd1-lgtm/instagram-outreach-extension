"use client";

const timelineEvents = [
  {
    date: "Mar 2026",
    label: "Film Update Due",
    type: "action" as const,
    dateObj: new Date("2026-03-15"),
  },
  {
    date: "Apr 2026",
    label: "WI Spring Camp",
    type: "camp" as const,
    dateObj: new Date("2026-04-12"),
  },
  {
    date: "Jun 2027",
    label: "Coach Contact Opens",
    type: "milestone" as const,
    dateObj: new Date("2027-06-15"),
  },
  {
    date: "Apr 2028",
    label: "Official Visits Open",
    type: "milestone" as const,
    dateObj: new Date("2028-04-01"),
  },
  {
    date: "Dec 2028",
    label: "Early Signing",
    type: "deadline" as const,
    dateObj: new Date("2028-12-01"),
  },
];

const typeColors: Record<string, string> = {
  action: "#ff000c",
  camp: "#D4A853",
  milestone: "#22C55E",
  deadline: "#EF4444",
};

export function RecruitingTimeline() {
  const now = new Date();

  // Timeline spans from first event to last event
  const startDate = timelineEvents[0].dateObj;
  const endDate = timelineEvents[timelineEvents.length - 1].dateObj;
  const totalSpan = endDate.getTime() - startDate.getTime();

  // Current position as a percentage
  const currentProgress = Math.max(
    0,
    Math.min(
      100,
      ((now.getTime() - startDate.getTime()) / totalSpan) * 100
    )
  );

  // Find nearest upcoming event
  const nextEvent = timelineEvents.find((e) => e.dateObj.getTime() > now.getTime());
  const daysUntilNext = nextEvent
    ? Math.ceil(
        (nextEvent.dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#ff000c]" />
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            NCAA Timeline
          </h2>
        </div>
        {nextEvent && daysUntilNext !== null && (
          <span className="rounded-full bg-[#ff000c]/10 px-3 py-1 text-[11px] font-mono font-medium text-[#ff000c]">
            {daysUntilNext}d until {nextEvent.label}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative mt-4">
        {/* Track */}
        <div className="h-1 w-full rounded-full bg-white/5" />

        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-1 rounded-full bg-gradient-to-r from-[#ff000c] to-[#ff000c]/60"
          style={{ width: `${currentProgress}%` }}
        />

        {/* Current position dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${currentProgress}%` }}
        >
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-[#ff000c] ring-2 ring-[#ff000c]/30" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-[#ff000c] animate-ping opacity-30" />
          </div>
        </div>

        {/* Event markers */}
        {timelineEvents.map((event) => {
          const position =
            ((event.dateObj.getTime() - startDate.getTime()) / totalSpan) * 100;
          const isPast = event.dateObj.getTime() < now.getTime();

          return (
            <div
              key={event.label}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${position}%` }}
            >
              <div
                className="h-2.5 w-2.5 rounded-full border-2"
                style={{
                  borderColor: typeColors[event.type],
                  backgroundColor: isPast ? typeColors[event.type] : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels below */}
      <div className="relative mt-6 h-10">
        {timelineEvents.map((event) => {
          const position =
            ((event.dateObj.getTime() - startDate.getTime()) / totalSpan) * 100;
          const isPast = event.dateObj.getTime() < now.getTime();

          return (
            <div
              key={event.label}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${position}%` }}
            >
              <p
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isPast ? "text-white/30" : "text-white/60"
                }`}
              >
                {event.label}
              </p>
              <p className="text-[9px] text-white/20 mt-0.5 font-mono">
                {event.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
