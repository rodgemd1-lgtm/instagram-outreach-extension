"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCInput,
  SCStatCard,
} from "@/components/sc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Measurement {
  id: string;
  athleteId: string;
  measureType: string;
  value: number;
  unit: string;
  measuredAt: string;
  source: "camp" | "training" | "self_reported" | "combine";
  verified: boolean;
  notes: string | null;
}

interface Baseline {
  measureType: string;
  value: number;
  unit: string;
  date: string;
}

interface Percentile {
  measureType: string;
  label: string;
  currentValue: number;
  unit: string;
  d1_OG_pct: number;
  d1_DT_pct: number;
  d2_OL_pct: number;
  d3_OL_pct: number;
}

interface ProgressEntry {
  measureType: string;
  label: string;
  entries: Array<{ date: string; value: number }>;
}

interface MeasurablesResponse {
  measurements: Measurement[];
  baseline: Baseline[];
  percentiles: Percentile[];
  progress: ProgressEntry[];
}

// ---------------------------------------------------------------------------
// Hardcoded D1 / D2 / D3 benchmarks
// ---------------------------------------------------------------------------

const BENCHMARKS: Record<
  string,
  { label: string; unit: string; d1: number; d2: number; d3: number; lowerIsBetter?: boolean }
> = {
  height: { label: "Height", unit: "in", d1: 75, d2: 74, d3: 73 },
  weight: { label: "Weight", unit: "lbs", d1: 305, d2: 285, d3: 270 },
  bench: { label: "Bench Press", unit: "lbs", d1: 315, d2: 285, d3: 260 },
  squat: { label: "Squat", unit: "lbs", d1: 445, d2: 400, d3: 375 },
  "40yd": { label: "40-Yard Dash", unit: "s", d1: 4.95, d2: 5.1, d3: 5.2, lowerIsBetter: true },
  vertical: { label: "Vertical Jump", unit: "in", d1: 28, d2: 26, d3: 24 },
  shuttle: { label: "Shuttle", unit: "s", d1: 4.55, d2: 4.7, d3: 4.85, lowerIsBetter: true },
};

const MEASURE_TYPES = Object.keys(BENCHMARKS);

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "training", label: "Training" },
  { value: "camp", label: "Camp" },
  { value: "combine", label: "Combine" },
  { value: "self_reported", label: "Self-Reported" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValue(type: string, value: number): string {
  if (type === "height") {
    const feet = Math.floor(value / 12);
    const inches = value % 12;
    return `${feet}'${inches}"`;
  }
  return `${value}`;
}

/** Returns a percentage (0-100+) of current vs benchmark. */
function benchmarkPct(
  current: number,
  benchmark: number,
  lowerIsBetter: boolean
): number {
  if (benchmark === 0) return 0;
  if (lowerIsBetter) {
    // For time-based: being faster (lower) is better
    return Math.round((benchmark / current) * 100);
  }
  return Math.round((current / benchmark) * 100);
}

/** Pick badge variant based on pct relative to benchmark. */
function pctVariant(pct: number): "success" | "warning" | "danger" {
  if (pct >= 100) return "success";
  if (pct >= 90) return "warning";
  return "danger";
}

/** Pick bar color class based on pct. */
function barColor(pct: number): string {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 90) return "bg-yellow-500";
  return "bg-red-500";
}

/** Determine trend arrow for a progress series. */
function trendArrow(entries: Array<{ value: number }>): "up" | "down" | "neutral" {
  if (entries.length < 2) return "neutral";
  const last = entries[entries.length - 1].value;
  const prev = entries[entries.length - 2].value;
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "neutral";
}

const TREND_ICON: Record<string, string> = {
  up: "trending_up",
  down: "trending_down",
  neutral: "trending_flat",
};

const TREND_SYMBOL: Record<string, string> = {
  up: "\u2191",
  down: "\u2193",
  neutral: "\u2192",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MeasurablesTracker() {
  // Data state
  const [data, setData] = useState<MeasurablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState(MEASURE_TYPES[0]);
  const [formValue, setFormValue] = useState("");
  const [formSource, setFormSource] = useState("training");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------- Fetch data ----------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/rec/measurables?percentiles=true&progress=true");
      if (!res.ok) throw new Error(`Failed to load measurables (${res.status})`);
      const json: MeasurablesResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Submit new measurement ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue) return;

    const bench = BENCHMARKS[formType];
    const body = {
      measureType: formType,
      value: Number(formValue),
      unit: bench?.unit ?? "",
      source: formSource,
      notes: formNotes || undefined,
      measuredAt: formDate || undefined,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/rec/measurables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      // Reset form and refetch
      setFormValue("");
      setFormNotes("");
      setFormOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Derive current values for stat cards ----------
  const currentVal = (type: string): number | null => {
    if (!data) return null;
    // Prefer latest measurement, then baseline
    const ms = data.measurements
      .filter((m) => m.measureType === type)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    if (ms.length > 0) return ms[0].value;
    const bl = data.baseline.find((b) => b.measureType === type);
    return bl?.value ?? null;
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="Measurables" subtitle="Track progress against college benchmarks" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SCGlassCard key={i} className="p-5 animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded mb-3" />
              <div className="h-8 w-24 bg-white/10 rounded" />
            </SCGlassCard>
          ))}
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error && !data) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="Measurables" subtitle="Track progress against college benchmarks" />
        <SCGlassCard className="p-8 text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3 block">error</span>
          <p className="text-white font-bold mb-1">Failed to load measurables</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <SCButton onClick={fetchData} size="sm">
            Retry
          </SCButton>
        </SCGlassCard>
      </div>
    );
  }

  // After this point data is guaranteed non-null
  const safeData = data!;

  const statCards: { type: string; label: string; icon: string }[] = [
    { type: "height", label: "Height", icon: "height" },
    { type: "weight", label: "Weight", icon: "monitor_weight" },
    { type: "bench", label: "Bench Press", icon: "fitness_center" },
    { type: "squat", label: "Squat", icon: "exercise" },
  ];

  // Build a map for progress trends
  const progressMap = new Map(safeData.progress.map((p) => [p.measureType, p]));

  // Recent measurements sorted newest first
  const recentMeasurements = [...safeData.measurements]
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <SCPageHeader
        title="Measurables"
        subtitle="Track progress against college benchmarks"
        actions={
          <SCButton
            variant={formOpen ? "secondary" : "primary"}
            size="sm"
            onClick={() => setFormOpen((o) => !o)}
          >
            <span className="material-symbols-outlined text-[18px]">
              {formOpen ? "close" : "add"}
            </span>
            {formOpen ? "Cancel" : "Log Measurement"}
          </SCButton>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Stats Overview */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ type, label, icon }) => {
          const val = currentVal(type);
          const prog = progressMap.get(type);
          const trend =
            prog && prog.entries.length >= 2 ? trendArrow(prog.entries) : undefined;
          const bench = BENCHMARKS[type];

          return (
            <SCStatCard
              key={type}
              label={label}
              value={val !== null ? `${formatValue(type, val)} ${bench.unit !== "in" && type !== "height" ? bench.unit : ""}`.trim() : "--"}
              icon={icon}
              trend={
                trend
                  ? {
                      value: trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Steady",
                      direction: trend,
                    }
                  : undefined
              }
              progress={
                val !== null
                  ? Math.min(100, benchmarkPct(val, bench.d1, !!bench.lowerIsBetter))
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Add Measurement Form (collapsible) */}
      {/* ------------------------------------------------------------------ */}
      {formOpen && (
        <SCGlassCard className="p-6">
          <h2 className="text-lg font-bold text-white mb-4">Log New Measurement</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type select */}
            <div>
              <label
                htmlFor="measure-type"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5"
              >
                Type
              </label>
              <select
                id="measure-type"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-white/5 border border-sc-border rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50 focus:border-sc-primary/50 transition-colors"
              >
                {MEASURE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-neutral-900">
                    {BENCHMARKS[t].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <SCInput
              label="Value"
              type="number"
              step="any"
              placeholder={`e.g. ${BENCHMARKS[formType]?.d3 ?? ""}`}
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              required
            />

            {/* Source select */}
            <div>
              <label
                htmlFor="measure-source"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5"
              >
                Source
              </label>
              <select
                id="measure-source"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full bg-white/5 border border-sc-border rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50 focus:border-sc-primary/50 transition-colors"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-neutral-900">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <SCInput
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />

            {/* Notes */}
            <div className="sm:col-span-2 lg:col-span-2">
              <SCInput
                label="Notes"
                placeholder="Optional notes..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <SCButton type="submit" disabled={submitting || !formValue} className="w-full">
                {submitting ? "Saving..." : "Save Measurement"}
              </SCButton>
            </div>
          </form>
        </SCGlassCard>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Benchmark Comparison */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Benchmark Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(BENCHMARKS).map(([type, bench]) => {
            const val = currentVal(type);
            if (val === null) return null;

            const d3Pct = benchmarkPct(val, bench.d3, !!bench.lowerIsBetter);
            const d2Pct = benchmarkPct(val, bench.d2, !!bench.lowerIsBetter);
            const d1Pct = benchmarkPct(val, bench.d1, !!bench.lowerIsBetter);

            const tiers = [
              { label: "D3", pct: d3Pct, target: bench.d3 },
              { label: "D2", pct: d2Pct, target: bench.d2 },
              { label: "D1 OG", pct: d1Pct, target: bench.d1 },
            ];

            return (
              <SCGlassCard key={type} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold">{bench.label}</p>
                    <p className="text-slate-400 text-sm">
                      {formatValue(type, val)} {bench.unit}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {tiers.map((t) => (
                      <SCBadge key={t.label} variant={pctVariant(t.pct)}>
                        {t.label}: {t.pct}%
                      </SCBadge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {tiers.map((t) => (
                    <div key={t.label}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>
                          {t.label} ({t.target}
                          {bench.unit})
                        </span>
                        <span>{t.pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor(t.pct)}`}
                          style={{ width: `${Math.min(100, t.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SCGlassCard>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* History Table */}
      {/* ------------------------------------------------------------------ */}
      {recentMeasurements.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Measurements</h2>
          <SCGlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3">
                      Date
                    </th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3">
                      Type
                    </th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3">
                      Value
                    </th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3">
                      Source
                    </th>
                    <th className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMeasurements.map((m) => {
                    const bench = BENCHMARKS[m.measureType];
                    const prog = progressMap.get(m.measureType);
                    const trend = prog ? trendArrow(prog.entries) : "neutral";

                    return (
                      <tr
                        key={m.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3 text-slate-300">
                          {new Date(m.measuredAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-white font-medium">
                          {bench?.label ?? m.measureType}
                        </td>
                        <td className="px-5 py-3 text-white">
                          {formatValue(m.measureType, m.value)} {m.unit}
                          {m.verified && (
                            <span
                              className="material-symbols-outlined text-emerald-500 text-[14px] ml-1 align-middle"
                              title="Verified"
                            >
                              verified
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <SCBadge variant={m.source === "combine" || m.source === "camp" ? "info" : "default"}>
                            {m.source.replace("_", " ")}
                          </SCBadge>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              trend === "up"
                                ? "text-emerald-400"
                                : trend === "down"
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                          >
                            {TREND_ICON[trend]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Inline error toast */}
      {error && data && (
        <div className="fixed bottom-6 right-6 z-50">
          <SCGlassCard variant="broadcast" className="p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-sm text-white">{error}</p>
            <SCButton variant="ghost" size="sm" onClick={() => setError(null)}>
              Dismiss
            </SCButton>
          </SCGlassCard>
        </div>
      )}
    </div>
  );
}
