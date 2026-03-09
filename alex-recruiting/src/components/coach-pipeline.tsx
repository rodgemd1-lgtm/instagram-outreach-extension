"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Users } from "lucide-react";
import type { Coach, PriorityTier } from "@/lib/types";
import { cn } from "@/lib/utils";

type PipelineStage =
  | "discovered"
  | "followed"
  | "engaged"
  | "dm_sent"
  | "responded"
  | "relationship";

interface CoachWithStage extends Coach {
  stage: PipelineStage;
  daysInStage: number;
}

const STAGES: Array<{
  id: PipelineStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}> = [
  { id: "discovered", label: "Discovered", color: "text-[var(--app-navy-strong)]", bgColor: "bg-[rgba(15,40,75,0.06)]", borderColor: "border-[rgba(15,40,75,0.1)]", dotColor: "bg-[var(--app-navy)]" },
  { id: "followed", label: "Followed", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", dotColor: "bg-blue-500" },
  { id: "engaged", label: "Engaged", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-[var(--app-gold)]" },
  { id: "dm_sent", label: "DM Sent", color: "text-fuchsia-700", bgColor: "bg-fuchsia-50", borderColor: "border-fuchsia-200", dotColor: "bg-fuchsia-500" },
  { id: "responded", label: "Responded", color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", dotColor: "bg-teal-500" },
  { id: "relationship", label: "Relationship", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-500" },
];

function deriveStage(coach: Coach): PipelineStage {
  if (coach.dmStatus === "responded" && coach.followStatus === "followed_back") {
    return "relationship";
  }
  if (coach.dmStatus === "responded") {
    return "responded";
  }
  if (coach.dmStatus === "sent" || coach.dmStatus === "no_response") {
    return "dm_sent";
  }
  if (coach.followStatus === "followed_back" || Boolean(coach.lastEngaged)) {
    return "engaged";
  }
  if (coach.followStatus === "followed") {
    return "followed";
  }
  return "discovered";
}

function daysSince(dateString: string | null): number {
  if (!dateString) return 0;
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
}

function tierVariant(tier: PriorityTier): "tier1" | "tier2" | "tier3" {
  if (tier === "Tier 1") return "tier1";
  if (tier === "Tier 2") return "tier2";
  return "tier3";
}

export function CoachPipeline() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<PriorityTier | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/coaches", { cache: "no-store" });
        const data = await response.json();
        if (active) {
          setCoaches(data.coaches ?? []);
        }
      } catch (error) {
        console.error("Failed to load coach pipeline:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const pipelineCoaches = useMemo<CoachWithStage[]>(
    () =>
      coaches.map((coach) => ({
        ...coach,
        stage: deriveStage(coach),
        daysInStage: daysSince(coach.lastEngaged ?? coach.updatedAt ?? coach.createdAt),
      })),
    [coaches]
  );

  const filteredCoaches = useMemo(
    () =>
      pipelineCoaches.filter((coach) => {
        const matchesSearch =
          search.trim() === "" ||
          coach.name.toLowerCase().includes(search.toLowerCase()) ||
          coach.schoolName.toLowerCase().includes(search.toLowerCase());
        const matchesTier = tierFilter === "all" || coach.priorityTier === tierFilter;
        return matchesSearch && matchesTier;
      }),
    [pipelineCoaches, search, tierFilter]
  );

  const grouped = useMemo(() => {
    const rows: Record<PipelineStage, CoachWithStage[]> = {
      discovered: [],
      followed: [],
      engaged: [],
      dm_sent: [],
      responded: [],
      relationship: [],
    };

    for (const coach of filteredCoaches) {
      rows[coach.stage].push(coach);
    }

    return rows;
  }, [filteredCoaches]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--app-navy)]" />
                <span className="text-sm font-semibold text-[var(--app-navy-strong)]">
                  {filteredCoaches.length} Coaches in Pipeline
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      stage.bgColor,
                      stage.color
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                    {stage.label}: {grouped[stage.id].length}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search coach name or school..."
                  className="pl-9"
                />
              </div>
              <select
                value={tierFilter}
                onChange={(event) => setTierFilter(event.target.value as PriorityTier | "all")}
                className="h-11 rounded-2xl border border-[rgba(15,40,75,0.1)] bg-white/82 px-4 text-sm text-[var(--app-ink)] shadow-sm focus:border-[rgba(15,40,75,0.22)] focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,60,0.4)]"
              >
                <option value="all">All tiers</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3">Tier 3</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-[var(--app-muted)]">
            Loading coach pipeline...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className={cn("rounded-[24px] border bg-white/62 shadow-sm backdrop-blur-sm", stage.borderColor)}
            >
              <div className={cn("flex items-center justify-between rounded-t-[24px] px-4 py-3", stage.bgColor)}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", stage.dotColor)} />
                  <span className={cn("text-sm font-semibold", stage.color)}>{stage.label}</span>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", stage.bgColor, stage.color)}>
                  {grouped[stage.id].length}
                </span>
              </div>

              <div className="space-y-2 p-3">
                {grouped[stage.id].length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[rgba(15,40,75,0.12)] px-3 py-6 text-center text-xs text-[var(--app-muted)]">
                    No coaches in this stage
                  </div>
                ) : (
                  grouped[stage.id].map((coach) => (
                    <Card key={coach.id} className="border-[rgba(15,40,75,0.08)] bg-white/78 shadow-none">
                      <CardContent className="space-y-3 p-3">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{coach.name}</p>
                              <p className="text-xs text-[var(--app-muted)]">{coach.title || "Football staff"}</p>
                            </div>
                            <Badge variant={tierVariant(coach.priorityTier)}>{coach.priorityTier}</Badge>
                          </div>
                          <p className="text-xs font-medium text-[var(--app-ink)]">{coach.schoolName}</p>
                          <p className="text-xs text-[var(--app-muted)]">
                            {coach.division} {coach.conference ? `· ${coach.conference}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px] text-[var(--app-muted)]">
                          <span>Follow: {coach.followStatus.replaceAll("_", " ")}</span>
                          <span>DM: {coach.dmStatus.replaceAll("_", " ")}</span>
                          <span>{coach.daysInStage}d in stage</span>
                        </div>

                        {coach.xHandle ? (
                          <a
                            href={`https://x.com/${coach.xHandle.replace("@", "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                          >
                            {coach.xHandle}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="text-xs text-[var(--app-muted)]">No X handle on file yet</p>
                        )}

                        {coach.notes ? (
                          <p className="text-xs leading-relaxed text-slate-600">{coach.notes}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
