"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { dmTemplates, fillTemplate } from "@/lib/data/templates";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { Coach, DMMessage } from "@/lib/types";

function buildIntroDraft(coach: Coach): string {
  const lastName = coach.name.split(" ").pop() ?? coach.name;
  return fillTemplate(dmTemplates.intro.template, {
    COACH_LAST_NAME: lastName,
    SCHOOL_NAME: coach.schoolName,
    NCSA_LINK: jacobProfile.ncsaProfileUrl || jacobProfile.websiteUrl || "https://ncsasports.org",
  });
}

function tierSort(coach: Coach): number {
  if (coach.priorityTier === "Tier 1") return 0;
  if (coach.priorityTier === "Tier 2") return 1;
  return 2;
}

export function DMCampaign() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [recentDMs, setRecentDMs] = useState<DMMessage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [coachResponse, dmResponse] = await Promise.all([
        fetch("/api/coaches", { cache: "no-store" }),
        fetch("/api/dms", { cache: "no-store" }),
      ]);

      const coachData = await coachResponse.json();
      const dmData = await dmResponse.json();

      const liveCoaches: Coach[] = coachData.coaches ?? [];
      setCoaches(liveCoaches);
      setRecentDMs(dmData.dms ?? []);
      setDrafts((current) => {
        const next = { ...current };
        for (const coach of liveCoaches) {
          if (!next[coach.id]) {
            next[coach.id] = buildIntroDraft(coach);
          }
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to load DM campaign data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const queue = useMemo(
    () =>
      coaches
        .filter((coach) => coach.xHandle)
        .filter((coach) => coach.dmStatus !== "responded")
        .sort((a, b) => tierSort(a) - tierSort(b) || Number(b.dmOpen) - Number(a.dmOpen))
        .slice(0, 12),
    [coaches]
  );

  const waveSummary = useMemo(
    () => [
      {
        label: "Ready Now",
        description: "Open DMs or lower-friction targets",
        count: queue.filter((coach) => coach.dmOpen || coach.priorityTier === "Tier 3").length,
      },
      {
        label: "Tier 1",
        description: "Reach programs worth warming up over time",
        count: queue.filter((coach) => coach.priorityTier === "Tier 1").length,
      },
      {
        label: "Tier 2",
        description: "Core target schools in the funnel",
        count: queue.filter((coach) => coach.priorityTier === "Tier 2").length,
      },
      {
        label: "Sent",
        description: "Logged outreach already in the system",
        count: recentDMs.filter((dm) => dm.status === "sent" || dm.status === "responded").length,
      },
    ],
    [queue, recentDMs]
  );

  const nextCoach = queue[0] ?? null;

  async function sendDraft(coach: Coach) {
    setSendingId(coach.id);

    try {
      const response = await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.name,
          schoolName: coach.schoolName,
          templateType: "intro",
          xHandle: coach.xHandle,
          content: drafts[coach.id],
          sendNow: true,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Send failed (${response.status})`);
      }

      await load();
    } catch (error) {
      console.error("Failed to send DM:", error);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="shell-panel-strong overflow-hidden px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shell-kicker">
              <Mail className="h-3.5 w-3.5" />
              Operator-led outreach
            </span>
            <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
              Live DM queue
            </Badge>
          </div>

          <div className="mt-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
              This room should make the next coach conversation obvious.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-muted)] sm:text-base">
              Start with the highest-value coach who already has a real X handle, tighten the draft if needed, and send only when the message is concise and the profile supports it.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                label: "Next outreach",
                value: nextCoach ? nextCoach.name.split(" ")[0] : "—",
                detail: nextCoach ? `${nextCoach.schoolName} is the top live move.` : "No DM-ready coach is loaded yet.",
              },
              {
                label: "Ready now",
                value: `${queue.filter((coach) => coach.dmOpen || coach.priorityTier === "Tier 3").length}`,
                detail: "Lower-friction outreach opportunities.",
              },
              {
                label: "Logged sends",
                value: `${recentDMs.filter((dm) => dm.status === "sent" || dm.status === "responded").length}`,
                detail: "Outreach already recorded in the system.",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{item.value}</p>
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
            {nextCoach ? `Draft for ${nextCoach.name}` : "Review the coach pipeline first"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
            {nextCoach
              ? `${nextCoach.schoolName} is the current lead target in the queue. Open the draft, keep the note tight, and send only if the message earns a reply.`
              : "There is no clean DM-ready record right now. Enrich coach handles and priorities first, then return here to send outreach."}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() => dispatchOperatorCommand({ command: "Draft the next DM" })}
              disabled={!nextCoach}
            >
              Draft next DM
            </Button>
            <Button
              variant="outline"
              className="bg-white/80"
              onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}
            >
              Ask for today&apos;s plan
            </Button>
            <Button asChild variant="outline" className="justify-between bg-white/80">
              <Link href="/coaches">
                Open coach pipeline
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-between bg-white/80"
              onClick={() => dispatchOperatorCommand({ command: "Show follow targets" })}
            >
              Review follow targets
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {waveSummary.map((wave) => (
          <div key={wave.label} className="shell-metric">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">{wave.label}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{wave.description}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{wave.count}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <CardTitle className="text-base text-[var(--app-navy-strong)]">Live DM Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="py-6 text-sm text-[var(--app-muted)]">Loading outreach queue...</div>
          ) : queue.length === 0 ? (
            <div className="py-6 text-sm text-[var(--app-muted)]">No coaches with X handles are ready for outreach yet.</div>
          ) : (
            queue.map((coach) => (
              <Card key={coach.id} className="border-[rgba(15,40,75,0.08)] bg-white/76 shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{coach.name}</p>
                        <Badge variant={coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3"}>
                          {coach.priorityTier}
                        </Badge>
                        {coach.dmOpen ? <Badge variant="secondary">DM Open</Badge> : null}
                      </div>
                      <p className="text-xs text-[var(--app-muted)]">
                        {coach.schoolName} · {coach.title || "Football staff"} · {coach.xHandle}
                      </p>
                    </div>
                    <Badge variant={coach.dmStatus === "sent" ? "sent" : coach.dmStatus === "responded" ? "responded" : "draft"}>
                      {coach.dmStatus.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <Textarea
                    value={drafts[coach.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [coach.id]: event.target.value,
                      }))
                    }
                    rows={4}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendDraft(coach)}
                      disabled={sendingId === coach.id || !drafts[coach.id]?.trim()}
                      className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                    >
                      {sendingId === coach.id ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-3 w-3" />
                      )}
                      Send via X
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/76"
                      onClick={() =>
                        setDrafts((current) => ({
                          ...current,
                          [coach.id]: buildIntroDraft(coach),
                        }))
                      }
                    >
                      <Mail className="mr-2 h-3 w-3" />
                      Reset draft
                    </Button>
                  </div>

                  {coach.notes ? <p className="text-xs text-[var(--app-muted)]">{coach.notes}</p> : null}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <CardTitle className="text-base text-[var(--app-navy-strong)]">Recent Outreach Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentDMs.length === 0 ? (
            <div className="py-4 text-sm text-[var(--app-muted)]">No DMs logged yet.</div>
          ) : (
            recentDMs.slice(0, 10).map((dm) => (
              <div key={dm.id} className="rounded-[20px] border border-[rgba(15,40,75,0.08)] bg-white/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{dm.coachName}</p>
                  <Badge variant={dm.status === "responded" ? "responded" : dm.status === "sent" ? "sent" : "secondary"}>
                    {dm.status}
                  </Badge>
                  {dm.status === "sent" || dm.status === "responded" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--app-muted)]">{dm.schoolName}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--app-ink)]">{dm.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
