"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Users, Mail } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/coaches").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/posts").then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([analyticsData, coachData, postData]) => {
      setAnalytics(analyticsData);
      const c = Array.isArray(coachData) ? coachData : coachData?.coaches || [];
      setCoaches(c);
      const p = Array.isArray(postData) ? postData : postData?.posts || [];
      setPosts(p);

      // Build activities from real data
      const acts: any[] = [];
      c.slice(0, 5).forEach((coach: any, i: number) => {
        if (coach.followStatus) {
          acts.push({ id: `follow-${i}`, type: "follow", description: `Followed ${coach.name} at ${coach.schoolName}`, timestamp: coach.updatedAt || coach.createdAt || new Date().toISOString() });
        }
      });
      p.slice(0, 5).forEach((post: any, i: number) => {
        acts.push({ id: `post-${i}`, type: "post", description: `Published: "${(post.content || post.caption || "").slice(0, 50)}..."`, timestamp: post.createdAt || post.date || new Date().toISOString() });
      });
      acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(acts.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  // Pipeline stages from REAL data
  const totalCoaches = coaches.length;
  const followed = coaches.filter((c: any) => c.followStatus === "following" || c.followStatus === "followed" || c.followStatus === "followed_back").length;
  const dmd = coaches.filter((c: any) => c.dmStatus === "sent" || c.dmStatus === "responded" || c.dmStatus === "no_response").length;
  const replied = coaches.filter((c: any) => c.dmStatus === "responded").length;

  const funnelStages = [
    { label: "Total Coaches", count: totalCoaches, color: "#0F1720" },
    { label: "Followed", count: followed, color: "#2563EB" },
    { label: "DM Sent", count: dmd, color: "#F59E0B" },
    { label: "Replied", count: replied, color: "#16A34A" },
  ];

  return (
    <div className="space-y-6 animate-fade-in -m-6 p-6 min-h-screen bg-[#FAFAFA]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0F1720]">Analytics</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Real-time recruiting progression metrics
          </p>
        </div>
      </div>

      <p className="mb-6 -mt-4 text-sm text-[#6B7280] max-w-3xl">
        Monitor pipeline conversion from views to offers. Drill down into specific engagement events, profile analytics, and daily activity.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profile Views" value={analytics?.profileViews ?? null} icon={Eye} />
        <StatCard label="Engagement Rate" value={analytics?.engagementRate ? `${analytics.engagementRate}%` : null} icon={TrendingUp} />
        <StatCard label="Coach Responses" value={replied || null} icon={Mail} />
        <StatCard label="Total Coaches" value={totalCoaches || null} icon={Users} />
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white border border-[rgba(15,40,75,0.08)] rounded-[24px] overflow-hidden">
        <div className="px-5 py-5 border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <h2 className="text-lg font-semibold text-[var(--app-navy-strong)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--app-navy-strong)] opacity-70" />
            Recruiting Pipeline
          </h2>
        </div>
        <div className="p-6">
          {totalCoaches > 0 ? (
            <PipelineFunnel stages={funnelStages} />
          ) : (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-[var(--app-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-[var(--app-navy-strong)]">Empty pipeline</p>
              <p className="text-xs text-[var(--app-muted)] mt-1">Add targets to view funnel metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-[rgba(15,40,75,0.08)] rounded-[24px] overflow-hidden">
        <div className="px-5 py-5 border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <h2 className="text-lg font-semibold text-[var(--app-navy-strong)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--app-navy-strong)] opacity-70" />
            Activity Log
          </h2>
        </div>
        {activities.length > 0 ? (
          <ActivityFeed activities={activities} />
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-10 h-10 text-[var(--app-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--app-navy-strong)] font-medium text-sm">No activity recorded</p>
            <p className="text-[var(--app-muted)] text-xs mt-1">System events will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
