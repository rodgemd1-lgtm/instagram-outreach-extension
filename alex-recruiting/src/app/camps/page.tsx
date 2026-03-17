"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SCPageHeader, SCGlassCard, SCBadge } from "@/components/sc";
// Types inlined to avoid importing server-only camp-database module
type CampType = "school_camp" | "prospect_day" | "combine" | "showcase" | "satellite";
type RegistrationStatus = "not_registered" | "registered" | "waitlisted" | "confirmed";
type FollowUpStatus = "none" | "pending" | "in_progress" | "completed";

interface CoachPresent {
  name: string;
  title: string;
  school: string;
  contacted: boolean;
}

interface CampResult {
  measurables: { name: string; value: string; unit: string }[];
  drills: { name: string; score: string; notes: string }[];
  feedback: string[];
}

interface CoachContact {
  coachName: string;
  school: string;
  title: string;
  businessCard: boolean;
  followUpNeeded: boolean;
  followUpDone: boolean;
  notes: string;
}

interface Camp {
  id: string;
  name: string;
  school: string | null;
  location: string | null;
  campType: CampType;
  date: string | null;
  dateEnd: string | null;
  registrationDeadline: string | null;
  registrationStatus: RegistrationStatus;
  cost: number | null;
  coachesPresent: CoachPresent[];
  results: CampResult | null;
  coachContacts: CoachContact[];
  followUpStatus: FollowUpStatus;
  offerCorrelation: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Types ----

type TabId = "calendar" | "upcoming" | "history" | "measurables";

interface Measurable {
  id: string;
  date: string;
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
  fortyYard: number | null;
  shuttle: number | null;
  vertical: number | null;
}

// ---- D1 OL Benchmarks ----

const D1_BENCHMARKS = {
  bench: 315,
  squat: 500,
  deadlift: 550,
  fortyYard: 5.2,
  shuttle: 4.6,
  vertical: 28,
} as const;

const D2_BENCHMARKS = {
  bench: 275,
  squat: 425,
  deadlift: 475,
  fortyYard: 5.4,
  shuttle: 4.8,
  vertical: 26,
} as const;

const D3_BENCHMARKS = {
  bench: 245,
  squat: 375,
  deadlift: 415,
  fortyYard: 5.5,
  shuttle: 4.9,
  vertical: 24,
} as const;

// ---- Sample Past Camps with Results ----

const SAMPLE_PAST_CAMPS: Camp[] = [
  {
    id: "past-1",
    name: "Midwest OL Showcase",
    school: null,
    location: "Chicago, IL",
    campType: "showcase",
    date: "2025-07-15T09:00:00.000Z",
    dateEnd: "2025-07-15T16:00:00.000Z",
    registrationDeadline: null,
    registrationStatus: "confirmed",
    cost: 95,
    coachesPresent: [
      { name: "Coach Williams", title: "OL Coach", school: "Northern Illinois", contacted: true },
      { name: "Coach Davis", title: "Recruiting Coordinator", school: "Western Michigan", contacted: true },
    ],
    results: {
      measurables: [
        { name: "40-yard dash", value: "5.45", unit: "seconds" },
        { name: "Bench Press", value: "185", unit: "lbs" },
        { name: "Vertical Jump", value: "22", unit: "inches" },
      ],
      drills: [
        { name: "Pass Set", score: "7/10", notes: "Good initial kick, needs work on anchor" },
        { name: "Pull Block", score: "8/10", notes: "Excellent movement and finish" },
      ],
      feedback: [
        "Great size for the position. Keep developing footwork.",
        "Strong hands. Very coachable athlete.",
      ],
    },
    coachContacts: [
      {
        coachName: "Coach Williams",
        school: "Northern Illinois",
        title: "OL Coach",
        businessCard: true,
        followUpNeeded: true,
        followUpDone: true,
        notes: "Told Jacob to attend their June camp next year",
      },
    ],
    followUpStatus: "completed",
    offerCorrelation: null,
    notes: "First showcase. Good experience measuring against other OL prospects.",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-07-16T00:00:00.000Z",
  },
  {
    id: "past-2",
    name: "Pewaukee HS Winter Combine",
    school: null,
    location: "Pewaukee, WI",
    campType: "combine",
    date: "2026-01-20T08:00:00.000Z",
    dateEnd: "2026-01-20T14:00:00.000Z",
    registrationDeadline: null,
    registrationStatus: "confirmed",
    cost: 0,
    coachesPresent: [],
    results: {
      measurables: [
        { name: "Bench Press", value: "205", unit: "lbs" },
        { name: "Squat", value: "315", unit: "lbs" },
        { name: "40-yard dash", value: "5.38", unit: "seconds" },
        { name: "Shuttle", value: "4.85", unit: "seconds" },
        { name: "Vertical Jump", value: "24", unit: "inches" },
      ],
      drills: [],
      feedback: ["Improved bench by 20 lbs since July showcase."],
    },
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "School-hosted winter testing. Good progress on measurables.",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-21T00:00:00.000Z",
  },
];

// ---- Sample Measurables ----

const SAMPLE_MEASURABLES: Measurable[] = [
  {
    id: "m-1",
    date: "2025-07-15",
    bench: 185,
    squat: 285,
    deadlift: 315,
    fortyYard: 5.45,
    shuttle: 4.95,
    vertical: 22,
  },
  {
    id: "m-2",
    date: "2026-01-20",
    bench: 205,
    squat: 315,
    deadlift: 345,
    fortyYard: 5.38,
    shuttle: 4.85,
    vertical: 24,
  },
];

// ---- Utility Functions ----

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeClasses(status: RegistrationStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "registered":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "waitlisted":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "not_registered":
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

function getStatusLabel(status: RegistrationStatus): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "registered":
      return "Registered";
    case "waitlisted":
      return "Waitlisted";
    case "not_registered":
      return "Not Registered";
  }
}

function getTierFromNotes(notes: string | null): string | null {
  if (!notes) return null;
  if (notes.includes("Tier 1")) return "Tier 1";
  if (notes.includes("Tier 2")) return "Tier 2";
  if (notes.includes("Tier 3")) return "Tier 3";
  return null;
}

function getRecommendation(camp: Camp): { text: string; color: string } | null {
  const tier = getTierFromNotes(camp.notes);
  if (!tier) return null;

  if (tier === "Tier 2") {
    return { text: "High Priority", color: "text-green-400" };
  }
  if (tier === "Tier 3") {
    return { text: "Safety — Go", color: "text-blue-400" };
  }
  if (tier === "Tier 1") {
    return { text: "Reach — Exposure", color: "text-yellow-400" };
  }
  return null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ---- Components ----

// Tab Button
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all",
        active
          ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
          : "text-slate-500 hover:text-white hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );
}

// ---- Calendar Tab ----

function CalendarTab({ camps }: { camps: Camp[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const campsByDate = useMemo(() => {
    const map = new Map<string, Camp[]>();
    for (const camp of camps) {
      if (!camp.date) continue;
      const d = new Date(camp.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate().toString();
        const existing = map.get(key) || [];
        existing.push(camp);
        map.set(key, existing);
      }
    }
    return map;
  }, [camps, year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCamp(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCamp(null);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <h3 className="text-lg font-semibold text-white">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-700 rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-800/50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border-t border-slate-800 p-2 min-h-[80px] bg-slate-900/30"
            />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayCamps = campsByDate.get(day.toString()) || [];
            const hasCamps = dayCamps.length > 0;

            return (
              <div
                key={day}
                onClick={() => {
                  if (hasCamps) setSelectedCamp(dayCamps[0]);
                }}
                className={cn(
                  "border-t border-slate-800 p-2 min-h-[80px] transition-colors",
                  hasCamps
                    ? "cursor-pointer hover:bg-slate-800/70"
                    : "bg-slate-900/20"
                )}
              >
                <span className="text-sm text-slate-300">{day}</span>
                {dayCamps.map((camp) => (
                  <div
                    key={camp.id || camp.name}
                    className={cn(
                      "mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate",
                      camp.registrationStatus === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : camp.registrationStatus === "registered"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-600/30 text-slate-400"
                    )}
                    title={camp.name}
                  >
                    {camp.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          Registered
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          Not Registered
        </div>
      </div>

      {/* Selected Camp Detail */}
      {selectedCamp && (
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-900/50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-semibold text-lg">
                {selectedCamp.name}
              </h4>
              {selectedCamp.school && (
                <p className="text-slate-400 text-sm">{selectedCamp.school}</p>
              )}
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border",
                getStatusBadgeClasses(selectedCamp.registrationStatus)
              )}
            >
              {getStatusLabel(selectedCamp.registrationStatus)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-slate-500">calendar_today</span>
              {formatDate(selectedCamp.date)}
            </div>
            {selectedCamp.location && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-slate-500">location_on</span>
                {selectedCamp.location}
              </div>
            )}
            {selectedCamp.cost !== null && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-slate-500">attach_money</span>
                ${selectedCamp.cost}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="capitalize text-xs bg-slate-800 px-2 py-0.5 rounded">
                {selectedCamp.campType.replace("_", " ")}
              </span>
            </div>
          </div>
          {selectedCamp.notes && (
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {selectedCamp.notes}
            </p>
          )}
          <button
            onClick={() => setSelectedCamp(null)}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Upcoming Tab ----

function UpcomingTab({
  camps,
  onStatusChange,
}: {
  camps: Camp[];
  onStatusChange: (campId: string, status: RegistrationStatus) => void;
}) {
  const now = new Date();
  const upcoming = camps
    .filter((c) => c.date && new Date(c.date) >= now)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-white/10 mx-auto mb-4 block">calendar_today</span>
        <p className="text-slate-400">No upcoming camps scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcoming.map((camp) => {
        const recommendation = getRecommendation(camp);
        const daysUntil = camp.date
          ? Math.ceil(
              (new Date(camp.date).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        return (
          <div
            key={camp.id || camp.name}
            className="border border-slate-700 rounded-xl p-5 bg-slate-900/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-semibold">{camp.name}</h4>
                  {recommendation && (
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        recommendation.color
                      )}
                    >
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      {recommendation.text}
                    </span>
                  )}
                </div>
                {camp.school && (
                  <p className="text-sm text-slate-400 mt-0.5">
                    {camp.school}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {daysUntil !== null && (
                  <span className="text-xs text-slate-500">
                    {daysUntil} days away
                  </span>
                )}
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                    getStatusBadgeClasses(camp.registrationStatus)
                  )}
                >
                  {getStatusLabel(camp.registrationStatus)}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-slate-500 flex-shrink-0">calendar_today</span>
                <span>{formatDate(camp.date)}</span>
              </div>
              {camp.location && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="material-symbols-outlined text-[16px] text-slate-500 flex-shrink-0">location_on</span>
                  <span>{camp.location}</span>
                </div>
              )}
              {camp.cost !== null && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="material-symbols-outlined text-[16px] text-slate-500 flex-shrink-0">attach_money</span>
                  <span>${camp.cost}</span>
                </div>
              )}
              {camp.coachesPresent.length > 0 && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="material-symbols-outlined text-[16px] text-slate-500 flex-shrink-0">group</span>
                  <span>
                    {camp.coachesPresent
                      .map((c) => c.name)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Registration deadline */}
            {camp.registrationDeadline && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span>
                <span className="text-slate-400">
                  Registration deadline:{" "}
                  {formatDate(camp.registrationDeadline)}
                </span>
                {new Date(camp.registrationDeadline) < now && (
                  <span className="text-red-400 font-medium">Passed</span>
                )}
              </div>
            )}

            {camp.notes && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                {camp.notes}
              </p>
            )}

            {/* Status update */}
            <div className="mt-4 flex items-center gap-2">
              <select
                value={camp.registrationStatus}
                onChange={(e) =>
                  onStatusChange(
                    camp.id || camp.name,
                    e.target.value as RegistrationStatus
                  )
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="not_registered">Not Registered</option>
                <option value="registered">Registered</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <span className="text-xs text-slate-500">Update status</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- History Tab ----

function HistoryTab({ camps }: { camps: Camp[] }) {
  const now = new Date();
  const pastCamps = camps
    .filter((c) => c.date && new Date(c.date) < now)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  if (pastCamps.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-white/10 mx-auto mb-4 block">emoji_events</span>
        <p className="text-slate-400">No past camps recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-slate-700" />

      <div className="space-y-8">
        {pastCamps.map((camp) => (
          <div key={camp.id} className="relative pl-10 md:pl-14">
            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-2.5 md:left-4.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900",
                camp.results ? "bg-green-500" : "bg-slate-600"
              )}
            />

            <div className="border border-slate-700 rounded-xl p-5 bg-slate-900/50">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h4 className="text-white font-semibold">{camp.name}</h4>
                  <p className="text-sm text-slate-400">
                    {formatDate(camp.date)}
                    {camp.location ? ` -- ${camp.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {camp.followUpStatus === "completed" && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Follow-up done
                    </span>
                  )}
                  {camp.followUpStatus === "pending" && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Follow-up needed
                    </span>
                  )}
                </div>
              </div>

              {/* Results */}
              {camp.results && (
                <div className="mt-4 space-y-3">
                  {/* Measurables */}
                  {camp.results.measurables.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Measurables
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {camp.results.measurables.map((m) => (
                          <span
                            key={m.name}
                            className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs text-slate-200"
                          >
                            {m.name}: <strong>{m.value}</strong> {m.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drills */}
                  {camp.results.drills.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Drill Scores
                      </h5>
                      <div className="space-y-1.5">
                        {camp.results.drills.map((d) => (
                          <div
                            key={d.name}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-300">{d.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">
                                {d.score}
                              </span>
                              {d.notes && (
                                <span className="text-xs text-slate-500 hidden md:inline">
                                  {d.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {camp.results.feedback.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Coach Feedback
                      </h5>
                      <div className="space-y-1">
                        {camp.results.feedback.map((f, i) => (
                          <p key={i} className="text-sm text-slate-300 italic">
                            &ldquo;{f}&rdquo;
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coach Contacts */}
              {camp.coachContacts.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Coach Contacts Made
                  </h5>
                  <div className="space-y-1.5">
                    {camp.coachContacts.map((cc) => (
                      <div
                        key={cc.coachName}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-slate-500">group</span>
                          <span className="text-slate-300">
                            {cc.coachName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {cc.title}, {cc.school}
                          </span>
                        </div>
                        {cc.businessCard && (
                          <span className="text-xs text-blue-400">
                            Business card
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {camp.notes && !camp.results && (
                <p className="mt-3 text-sm text-slate-500">{camp.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Measurables Tab ----

function BenchmarkBar({
  label,
  value,
  d1,
  d2,
  d3,
  unit,
  lowerIsBetter = false,
}: {
  label: string;
  value: number | null;
  d1: number;
  d2: number;
  d3: number;
  unit: string;
  lowerIsBetter?: boolean;
}) {
  if (value === null) return null;

  // For "lower is better" metrics, invert the percentage logic
  const maxVal = lowerIsBetter ? Math.max(d3, value) * 1.1 : Math.max(d1, value) * 1.15;
  const pctValue = lowerIsBetter
    ? ((maxVal - value) / maxVal) * 100
    : (value / maxVal) * 100;
  const pctD1 = lowerIsBetter
    ? ((maxVal - d1) / maxVal) * 100
    : (d1 / maxVal) * 100;
  const pctD2 = lowerIsBetter
    ? ((maxVal - d2) / maxVal) * 100
    : (d2 / maxVal) * 100;
  const pctD3 = lowerIsBetter
    ? ((maxVal - d3) / maxVal) * 100
    : (d3 / maxVal) * 100;

  // Color based on which tier the value meets
  let barColor = "bg-red-500";
  if (lowerIsBetter) {
    if (value <= d1) barColor = "bg-green-500";
    else if (value <= d2) barColor = "bg-blue-500";
    else if (value <= d3) barColor = "bg-yellow-500";
  } else {
    if (value >= d1) barColor = "bg-green-500";
    else if (value >= d2) barColor = "bg-blue-500";
    else if (value >= d3) barColor = "bg-yellow-500";
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-medium text-white">
          {value} {unit}
        </span>
      </div>
      <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
        {/* Jacob's value */}
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(pctValue, 100)}%` }}
        />
        {/* D1 marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-green-400/60"
          style={{ left: `${Math.min(pctD1, 100)}%` }}
          title={`D1 avg: ${d1}${unit}`}
        />
        {/* D2 marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-blue-400/60"
          style={{ left: `${Math.min(pctD2, 100)}%` }}
          title={`D2 avg: ${d2}${unit}`}
        />
        {/* D3 marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-400/60"
          style={{ left: `${Math.min(pctD3, 100)}%` }}
          title={`D3 avg: ${d3}${unit}`}
        />
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
          D1: {d1}
          {unit}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
          D2: {d2}
          {unit}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
          D3: {d3}
          {unit}
        </span>
      </div>
    </div>
  );
}

function MeasurablesTab() {
  const [measurables, setMeasurables] = useState<Measurable[]>(SAMPLE_MEASURABLES);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bench: "",
    squat: "",
    deadlift: "",
    fortyYard: "",
    shuttle: "",
    vertical: "",
  });

  const latestEntry = measurables.length > 0 ? measurables[measurables.length - 1] : null;
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const entry: Measurable = {
        id: `m-${Date.now()}`,
        date: formData.date,
        bench: formData.bench ? parseFloat(formData.bench) : null,
        squat: formData.squat ? parseFloat(formData.squat) : null,
        deadlift: formData.deadlift ? parseFloat(formData.deadlift) : null,
        fortyYard: formData.fortyYard ? parseFloat(formData.fortyYard) : null,
        shuttle: formData.shuttle ? parseFloat(formData.shuttle) : null,
        vertical: formData.vertical ? parseFloat(formData.vertical) : null,
      };
      setMeasurables((prev) => [...prev, entry]);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        bench: "",
        squat: "",
        deadlift: "",
        fortyYard: "",
        shuttle: "",
        vertical: "",
      });
      setShowForm(false);
    },
    [formData]
  );

  function getTrend(
    current: number | null,
    previous: number | null,
    lowerIsBetter: boolean = false
  ): React.ReactNode {
    if (current === null || previous === null) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) {
      return <span className="material-symbols-outlined text-[14px] text-slate-500">remove</span>;
    }
    const improved = lowerIsBetter ? diff < 0 : diff > 0;
    return improved ? (
      <span className="material-symbols-outlined text-[14px] text-green-400">trending_up</span>
    ) : (
      <span className="material-symbols-outlined text-[14px] text-red-400">trending_down</span>
    );
  }

  return (
    <div className="space-y-8">
      {/* Benchmark Comparison */}
      {latestEntry && (
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-900/50">
          <h3 className="text-white font-semibold mb-1">
            D1/D2/D3 OL Benchmark Comparison
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Jacob&apos;s latest numbers vs. average college OL measurables
          </p>

          <div className="space-y-5">
            <BenchmarkBar
              label="Bench Press"
              value={latestEntry.bench}
              d1={D1_BENCHMARKS.bench}
              d2={D2_BENCHMARKS.bench}
              d3={D3_BENCHMARKS.bench}
              unit=" lbs"
            />
            <BenchmarkBar
              label="Squat"
              value={latestEntry.squat}
              d1={D1_BENCHMARKS.squat}
              d2={D2_BENCHMARKS.squat}
              d3={D3_BENCHMARKS.squat}
              unit=" lbs"
            />
            <BenchmarkBar
              label="Deadlift"
              value={latestEntry.deadlift}
              d1={D1_BENCHMARKS.deadlift}
              d2={D2_BENCHMARKS.deadlift}
              d3={D3_BENCHMARKS.deadlift}
              unit=" lbs"
            />
            <BenchmarkBar
              label="40-Yard Dash"
              value={latestEntry.fortyYard}
              d1={D1_BENCHMARKS.fortyYard}
              d2={D2_BENCHMARKS.fortyYard}
              d3={D3_BENCHMARKS.fortyYard}
              unit="s"
              lowerIsBetter
            />
            <BenchmarkBar
              label="Shuttle"
              value={latestEntry.shuttle}
              d1={D1_BENCHMARKS.shuttle}
              d2={D2_BENCHMARKS.shuttle}
              d3={D3_BENCHMARKS.shuttle}
              unit="s"
              lowerIsBetter
            />
            <BenchmarkBar
              label="Vertical Jump"
              value={latestEntry.vertical}
              d1={D1_BENCHMARKS.vertical}
              d2={D2_BENCHMARKS.vertical}
              d3={D3_BENCHMARKS.vertical}
              unit=" in"
            />
          </div>
        </div>
      )}

      {/* Log New Measurables */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Log New Measurables
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 border border-slate-700 rounded-xl p-5 bg-slate-900/50"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Bench (lbs)
                </label>
                <input
                  type="number"
                  value={formData.bench}
                  onChange={(e) =>
                    setFormData({ ...formData, bench: e.target.value })
                  }
                  placeholder="e.g. 225"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Squat (lbs)
                </label>
                <input
                  type="number"
                  value={formData.squat}
                  onChange={(e) =>
                    setFormData({ ...formData, squat: e.target.value })
                  }
                  placeholder="e.g. 350"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Deadlift (lbs)
                </label>
                <input
                  type="number"
                  value={formData.deadlift}
                  onChange={(e) =>
                    setFormData({ ...formData, deadlift: e.target.value })
                  }
                  placeholder="e.g. 385"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  40-Yard (sec)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fortyYard}
                  onChange={(e) =>
                    setFormData({ ...formData, fortyYard: e.target.value })
                  }
                  placeholder="e.g. 5.30"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Shuttle (sec)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shuttle}
                  onChange={(e) =>
                    setFormData({ ...formData, shuttle: e.target.value })
                  }
                  placeholder="e.g. 4.80"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Vertical (in)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.vertical}
                  onChange={(e) =>
                    setFormData({ ...formData, vertical: e.target.value })
                  }
                  placeholder="e.g. 25"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Measurables
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Measurables History Table */}
      <div className="border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/70">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Bench
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Squat
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Deadlift
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  40-Yard
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Shuttle
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Vertical
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {measurables.map((entry, idx) => {
                const prev = idx > 0 ? measurables[idx - 1] : null;
                return (
                  <tr key={entry.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.bench !== null ? `${entry.bench} lbs` : "--"}
                        {prev && getTrend(entry.bench, prev.bench)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.squat !== null ? `${entry.squat} lbs` : "--"}
                        {prev && getTrend(entry.squat, prev.squat)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.deadlift !== null
                          ? `${entry.deadlift} lbs`
                          : "--"}
                        {prev && getTrend(entry.deadlift, prev.deadlift)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.fortyYard !== null
                          ? `${entry.fortyYard}s`
                          : "--"}
                        {prev &&
                          getTrend(entry.fortyYard, prev.fortyYard, true)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.shuttle !== null ? `${entry.shuttle}s` : "--"}
                        {prev && getTrend(entry.shuttle, prev.shuttle, true)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.vertical !== null
                          ? `${entry.vertical} in`
                          : "--"}
                        {prev && getTrend(entry.vertical, prev.vertical)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function CampsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch camps from API (server-side module), merge with sample past camps
  useEffect(() => {
    fetch("/api/camps")
      .then((r) => r.json())
      .then((data) => {
        const apiCamps: Camp[] = data.camps ?? [];
        setCamps([...SAMPLE_PAST_CAMPS, ...apiCamps]);
      })
      .catch(() => {
        // Fallback to sample past camps only
        setCamps([...SAMPLE_PAST_CAMPS]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(
    (campId: string, status: RegistrationStatus) => {
      setCamps((prev) =>
        prev.map((c) =>
          (c.id || c.name) === campId
            ? { ...c, registrationStatus: status, updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  // Summary stats
  const now = new Date();
  const upcomingCount = camps.filter(
    (c) => c.date && new Date(c.date) >= now
  ).length;
  const confirmedCount = camps.filter(
    (c) => c.registrationStatus === "confirmed"
  ).length;
  const pastCount = camps.filter(
    (c) => c.date && new Date(c.date) < now
  ).length;
  const totalCost = camps
    .filter((c) => c.date && new Date(c.date) >= now)
    .reduce((sum, c) => sum + (c.cost || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Camp Operations"
        title="CAMPS & EVENTS"
        subtitle="Track camps, combines, and measurables for Jacob Rodgers — Class of 2029 OL"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Upcoming</p>
          <p className="text-2xl font-black text-white">{upcomingCount}</p>
        </SCGlassCard>
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confirmed</p>
          <p className="text-2xl font-black text-emerald-400">{confirmedCount}</p>
        </SCGlassCard>
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Past Camps</p>
          <p className="text-2xl font-black text-white">{pastCount}</p>
        </SCGlassCard>
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Est. Cost</p>
          <p className="text-2xl font-black text-white">${totalCost}</p>
        </SCGlassCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 border border-sc-border p-1 rounded-xl overflow-x-auto">
        <TabButton
          label="Calendar"
          active={activeTab === "calendar"}
          onClick={() => setActiveTab("calendar")}
        />
        <TabButton
          label="Upcoming"
          active={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />
        <TabButton
          label="History"
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        />
        <TabButton
          label="Measurables"
          active={activeTab === "measurables"}
          onClick={() => setActiveTab("measurables")}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "calendar" && <CalendarTab camps={camps} />}
      {activeTab === "upcoming" && (
        <UpcomingTab camps={camps} onStatusChange={handleStatusChange} />
      )}
      {activeTab === "history" && <HistoryTab camps={camps} />}
      {activeTab === "measurables" && <MeasurablesTab />}
    </div>
  );
}
