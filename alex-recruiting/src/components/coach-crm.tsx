"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Filter, Search, UserPlus, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import { cn } from "@/lib/utils";

interface Coach {
  id: string;
  name: string;
  title: string;
  schoolName: string;
  division: string;
  conference: string;
  xHandle: string;
  dmOpen: boolean;
  followStatus: string;
  dmStatus: string;
  priorityTier: string;
  olNeedScore: number;
  xActivityScore: number;
  notes: string;
}

export function CoachCRM() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoaches = useCallback(async () => {
    try {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      setCoaches(data.coaches ?? []);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCoaches();
  }, [fetchCoaches]);

  const filtered = useMemo(
    () =>
      coaches
        .filter((coach) => {
          const matchesSearch =
            coach.name.toLowerCase().includes(search.toLowerCase()) ||
            coach.schoolName.toLowerCase().includes(search.toLowerCase());
          const matchesTier = !tierFilter || coach.priorityTier === tierFilter;
          return matchesSearch && matchesTier;
        })
        .sort((a, b) => {
          const tierRank = { "Tier 1": 0, "Tier 2": 1, "Tier 3": 2 };
          const firstTier = tierRank[a.priorityTier as keyof typeof tierRank] ?? 3;
          const secondTier = tierRank[b.priorityTier as keyof typeof tierRank] ?? 3;
          if (firstTier !== secondTier) return firstTier - secondTier;
          return b.olNeedScore + b.xActivityScore - (a.olNeedScore + a.xActivityScore);
        }),
    [coaches, search, tierFilter]
  );

  const tierCounts = {
    "Tier 1": coaches.filter((coach) => coach.priorityTier === "Tier 1").length,
    "Tier 2": coaches.filter((coach) => coach.priorityTier === "Tier 2").length,
    "Tier 3": coaches.filter((coach) => coach.priorityTier === "Tier 3").length,
  };

  const coachesWithHandles = coaches.filter((coach) => Boolean(coach.xHandle)).length;
  const dmReadyCoaches = coaches.filter((coach) => Boolean(coach.xHandle) && coach.dmStatus !== "sent");
  const followReadyCoaches = coaches.filter((coach) => Boolean(coach.xHandle) && coach.followStatus === "not_followed");
  const bestCoach = filtered.find((coach) => Boolean(coach.xHandle)) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="shell-panel-strong overflow-hidden px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shell-kicker">
              <Users className="h-3.5 w-3.5" />
              Outreach operating room
            </span>
            <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
              Live coach CRM
            </Badge>
          </div>

          <div className="mt-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
              The pipeline should tell you who matters, who is ready, and what to do next.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-muted)] sm:text-base">
              Filter the coach list, then act from the top: enrich handles, draft the next DM, or work the follow list. This room is sorted so the most relevant programs rise first instead of getting buried in raw volume.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                label: "Handle-ready",
                value: coachesWithHandles,
                detail: "Coaches with real X handles attached.",
              },
              {
                label: "DM-ready",
                value: dmReadyCoaches.length,
                detail: "Enough signal exists to draft respectful outreach.",
              },
              {
                label: "Follow-ready",
                value: followReadyCoaches.length,
                detail: "Likely next accounts worth following.",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-panel-strong px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            Recommended move
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
            {bestCoach ? `Start with ${bestCoach.name}` : "Load the coach list"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
            {bestCoach
              ? `${bestCoach.schoolName} is near the top of the live priority list. Use the operator to draft outreach, review follow targets, or move into the DM room.`
              : "Once the live coach list loads, this panel will surface the highest-value next move."}
          </p>

          {bestCoach ? (
            <div className="mt-5 rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-[linear-gradient(145deg,rgba(255,248,238,0.9),rgba(241,245,248,0.9))] p-4">
              <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{bestCoach.name}</p>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                {bestCoach.schoolName} · {bestCoach.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                Tier {bestCoach.priorityTier.replace("Tier ", "")} priority with OL need score {bestCoach.olNeedScore}/5 and X activity score {bestCoach.xActivityScore}/5.
              </p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() => dispatchOperatorCommand({ command: "Draft the next DM" })}
              disabled={dmReadyCoaches.length === 0}
            >
              Draft next DM
            </Button>
            <Button
              variant="outline"
              className="bg-white/80"
              onClick={() => dispatchOperatorCommand({ command: "Show follow targets" })}
            >
              Review follow targets
            </Button>
            <Button
              variant="outline"
              className="justify-between bg-white/80"
              onClick={() => setTierFilter("Tier 1")}
            >
              Focus Tier 1
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="justify-between bg-white/80"
              onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}
            >
              Ask for next move
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="shell-metric cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => setTierFilter(null)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">Total coaches</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{coaches.length}</p>
        </div>
        {Object.entries(tierCounts).map(([tier, count]) => (
          <div
            key={tier}
            className={cn(
              "shell-metric cursor-pointer transition-transform hover:-translate-y-0.5",
              tierFilter === tier && "border-[rgba(15,40,75,0.18)] bg-[rgba(15,40,75,0.08)]"
            )}
            onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">{tier}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{count}</p>
          </div>
        ))}
      </div>

      <div className="shell-panel flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--app-muted)]" />
          <Input
            placeholder="Search coaches or schools..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-white/76" onClick={() => setTierFilter(null)}>
          <Filter className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
        <Button size="sm" className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]">
          <UserPlus className="mr-2 h-4 w-4" />
          Add coach
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Follow</TableHead>
              <TableHead>DM</TableHead>
              <TableHead>OL Need</TableHead>
              <TableHead>X Handle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-[var(--app-muted)]">
                  Loading coach database...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-[var(--app-muted)]">
                  No coaches found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{coach.name}</p>
                      <p className="text-xs text-[var(--app-muted)]">{coach.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--app-ink)]">{coach.schoolName}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-[var(--app-navy-strong)]">{coach.division}</span>
                    <br />
                    <span className="text-xs text-[var(--app-muted)]">{coach.conference}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3"}>
                      {coach.priorityTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.followStatus === "followed_back" ? "posted" : coach.followStatus === "followed" ? "approved" : "secondary"}>
                      {coach.followStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.dmStatus === "responded" ? "responded" : coach.dmStatus === "sent" ? "sent" : "secondary"}>
                      {coach.dmStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-2 w-2 rounded-full",
                            index < coach.olNeedScore ? "bg-[var(--app-gold)]" : "bg-[rgba(15,40,75,0.12)]"
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coach.xHandle ? (
                      <a
                        href={`https://x.com/${coach.xHandle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--app-navy)]"
                      >
                        {coach.xHandle}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--app-muted)]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
