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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#0F1720]">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profile Views" value={analytics?.profileViews ?? null} icon={Eye} />
        <StatCard label="Engagement Rate" value={analytics?.engagementRate ? `${analytics.engagementRate}%` : null} icon={TrendingUp} />
        <StatCard label="Coach Responses" value={replied || null} icon={Mail} />
        <StatCard label="Total Coaches" value={totalCoaches || null} icon={Users} />
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#0F1720] mb-4">Recruiting Pipeline</h2>
        {totalCoaches > 0 ? (
          <PipelineFunnel stages={funnelStages} />
        ) : (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">Add coaches to see your pipeline</p>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-semibold text-[#0F1720]">Activity</h2>
        </div>
        {activities.length > 0 ? (
          <ActivityFeed activities={activities} />
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
