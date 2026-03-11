"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Users, Mail, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PillarChart } from "@/components/dashboard/pillar-chart";
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
    { label: "Total Coaches", count: totalCoaches, color: "#3B82F6" },
    { label: "DM Sent", count: dmSentCount, color: "#F97316" },
    { label: "Replied", count: repliedCount, color: "#22C55E" },
    { label: "Mutual Follow", count: mutualFollowCount, color: "#D4A853" },
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
    }));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dash-muted" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Engagement, growth, and recruiting funnel metrics.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          label="Followers"
          value={analytics?.totalFollowers ?? 0}
          icon={Users}
        />
        <StatCard
          label="Engagement"
          value={`${analytics?.avgEngagementRate ?? 0}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Profile Views"
          value={analytics?.profileVisits ?? 0}
          icon={Eye}
        />
        <StatCard
          label="DM Response"
          value={`${analytics?.dmResponseRate ?? 0}%`}
          icon={Mail}
        />
      </div>

      {/* Two-column: Pillar chart + Pipeline funnel */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <PillarChart posts={posts} />
        <PipelineFunnel stages={pipelineStages} />
      </div>

      {/* Activity feed */}
      <ActivityFeed activities={activities} />
    </div>
  );
}
