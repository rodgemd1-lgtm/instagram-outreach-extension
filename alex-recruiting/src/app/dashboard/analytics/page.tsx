"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Users, Mail, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

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
}

export default function AnalyticsPage() {
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

  // Build content distribution from posts
  const pillarCounts: Record<string, number> = {};
  posts.forEach((p) => {
    const pillar = p.pillar || "Other";
    pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
  });
  const contentData = Object.entries(pillarCounts).map(([label, value]) => ({
    label,
    value,
    color: "#ff000c",
  }));

  // Synthesize activities from posted posts
  const activities: ActivityItem[] = posts
    .filter((p) => p.status === "posted")
    .slice(0, 10)
    .map((p, i) => ({
      id: `activity-${i}`,
      type: "post" as const,
      description: `Published ${p.pillar} post`,
      timestamp: p.updatedAt || p.createdAt,
    }));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
          ANALYTICS
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Track recruiting progress and identify what&apos;s working.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: "Pipeline Total", value: totalCoaches, icon: Users },
          { label: "DMs Sent", value: dmSentCount, icon: Mail },
          { label: "Response Rate", value: `${analytics?.dmResponseRate ?? 0}%`, icon: TrendingUp },
          { label: "Profile Score", value: analytics?.profileVisits ?? 0, icon: Eye },
        ].map((card, index) => (
          <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Pipeline funnel — full width */}
      <div className="mb-8">
        <PipelineFunnel stages={pipelineStages} />
      </div>

      {/* Two-column: Content distribution + Activity feed */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
          <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            Content Distribution
          </h3>
          {contentData.length > 0 ? (
            <BarChart data={contentData} />
          ) : (
            <p className="py-8 text-center text-sm text-white/40">
              No content data yet.
            </p>
          )}
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
