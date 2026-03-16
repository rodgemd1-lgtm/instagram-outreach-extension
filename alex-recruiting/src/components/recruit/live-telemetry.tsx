"use client";

import { useEffect, useState } from "react";

interface TelemetryData {
  visitors: number;
  filmViews: number;
  avgWatchTime: string;
  coachViews: number;
}

export function LiveTelemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetch("/api/recruit/data");
        const json = await res.json();
        if (json.stats) {
          setData({
            visitors: json.stats.totalViews ?? 0,
            filmViews: json.stats.filmClicks ?? 0,
            avgWatchTime: json.stats.avgWatchTime ?? "0:00",
            coachViews: json.stats.coachViews ?? 0,
          });
        }
      } catch {
        // Telemetry is optional — fail silently
      }
    }
    fetchTelemetry();
  }, []);

  const items = [
    { label: "Visitors", value: data?.visitors ?? 0 },
    { label: "Film Views", value: data?.filmViews ?? 0 },
    { label: "Avg Watch", value: data?.avgWatchTime ?? "—" },
    { label: "Coach Views", value: data?.coachViews ?? 0 },
  ];

  return (
    <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div className="mr-4 w-[180px] rounded-2xl border border-white/[0.06] bg-black/80 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#C5050C]" />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Live Telemetry
          </p>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-xl font-black tabular-nums text-white">
                {item.value}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
