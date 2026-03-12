"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Users, Mail, Loader2 } from "lucide-react";
import { useDashboardAssembly } from "@/hooks/useDashboardAssembly";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RadarChart } from "@/components/dashboard/radar-chart";
import { HeatCalendar } from "@/components/dashboard/heat-calendar";
import { Sparkline } from "@/components/dashboard/sparkline";

interface AnalyticsData {
  totalFollowers: number;
  avgEngagementRate: number;
  profileVisits: number;
  dmResponseRate: number;
}

interface PostItem {
  pillar: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  content?: string;
}

interface CoachItem {
  dmStatus: string;
  followStatus: string;
}

interface ActivityItem {
  id: string;
  type: "post" | "dm" | "follow" | "engagement";
  description: string;
  timestamp: string;
  detail?: string;
}

// Deterministic sparkline data generator
function sparkData(seed: number): number[] {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    s = (s * 16807 + 0) % 2147483647;
    out.push(Math.floor((s / 2147483647) * 60) + 20);
  }
  return out;
}

export default function AnalyticsPage() {
  const scopeRef = useDashboardAssembly({ stagger: 0.06 });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, postsRes, coachesRes] = await Promise.allSettled([
          fetch("/api/analytics"),
          fetch("/api/posts"),
          fetch("/api/coaches"),
        ]);

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          const c = data?.current;
          if (c) {
            setAnalytics({
              totalFollowers: c.totalFollowers ?? 0,
              avgEngagementRate: c.avgEngagementRate ?? 0,
              profileVisits: c.profileVisits ?? 0,
              dmResponseRate: c.dmResponseRate ?? 0,
            });
          }
        }

        if (postsRes.status === "fulfilled" && postsRes.value.ok) {
          const data = await postsRes.value.json();
          setPosts(data?.posts ?? []);
        }

        if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
          const data = await coachesRes.value.json();
          setCoaches(data?.coaches ?? []);
        }
      } catch {
        // Use fallback empty state
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  // Build pipeline stages from coaches
  const totalCoaches = coaches.length;
  const dmSentCount = coaches.filter((c) =>
    ["sent", "responded", "approved"].includes(c.dmStatus)
  ).length;
  const repliedCount = coaches.filter((c) => c.dmStatus === "responded").length;
  const mutualFollowCount = coaches.filter(
    (c) => c.followStatus === "followed_back"
  ).length;

  const pipelineStages = [
    { label: "Total Coaches", count: totalCoaches, color: "#ff000c" },
    { label: "DM Sent", count: dmSentCount, color: "#D4A853" },
    { label: "Replied", count: repliedCount, color: "#22C55E" },
    { label: "Mutual Follow", count: mutualFollowCount, color: "#22C55E" },
  ];

  // Synthesize activities from posted posts
  const activities: ActivityItem[] = posts
    .filter((p) => p.status === "posted")
    .slice(0, 10)
    .map((p, i) => ({
      id: `activity-${i}`,
      type: "post" as const,
      description: `Published ${p.pillar} post`,
      timestamp: p.updatedAt || p.createdAt,
      detail: p.content ? p.content.slice(0, 120) : undefined,
    }));

  // Stat cards with sparklines
  const statCards = [
    {
      label: "Profile Views",
      value: analytics?.profileVisits ?? 247,
      icon: Eye,
      change: "+12%",
      changeType: "up" as const,
      spark: sparkData(101),
    },
    {
      label: "Engagement Rate",
      value: analytics?.avgEngagementRate ?? 4.8,
      icon: TrendingUp,
      change: "+0.3%",
      changeType: "up" as const,
      spark: sparkData(202),
      isPercent: true,
    },
    {
      label: "Coach Response",
      value: analytics?.dmResponseRate ?? 32,
      icon: Mail,
      change: "+5%",
      changeType: "up" as const,
      spark: sparkData(303),
      isPercent: true,
    },
    {
      label: "Network Growth",
      value: analytics?.totalFollowers ?? 156,
      icon: Users,
      change: "+24",
      changeType: "up" as const,
      spark: sparkData(404),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div ref={scopeRef}>
      {/* Page header */}
      <div className="mb-8" data-dash-animate>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
          ANALYTICS
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Intelligence dashboard — track recruiting progress and identify
          what&apos;s working.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column — primary visualizations */}
        <div className="space-y-6">
          <div data-dash-animate>
            <PipelineFunnel stages={pipelineStages} />
          </div>
          <div data-dash-animate>
            <RadarChart />
          </div>
          <div data-dash-animate>
            <HeatCalendar />
          </div>
        </div>

        {/* Right column — stat cards + activity feed */}
        <div className="space-y-4">
          {/* Stat cards with sparklines */}
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                data-dash-animate
                className="rounded-xl border border-white/5 bg-[#0A0A0A] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111111]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                      {card.label}
                    </p>
                    <div className="mt-2 flex items-end gap-3">
                      <AnimatedNumber
                        value={typeof card.value === "number" ? card.value : 0}
                        format={card.isPercent ? "percent" : "number"}
                        className="text-3xl font-bold tracking-tight text-white"
                      />
                      <Sparkline data={card.spark} className="mb-1" />
                    </div>
                    <p className="mt-1 font-mono text-xs font-medium text-[#22C55E]">
                      {card.change} this week
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff000c]/10">
                    <Icon className="h-5 w-5 text-[#ff000c]" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Activity feed */}
          <div data-dash-animate>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
