"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCButton } from "@/components/sc/sc-button";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCHeroBanner, SCAnimatedNumber, SCPageTransition } from "@/components/sc";
import { motion } from "framer-motion";
import { targetSchools } from "@/lib/data/target-schools";
import { getSchoolLogo } from "@/lib/data/school-branding";
import { StalenessIndicator } from "@/components/staleness-indicator";
import { DailyActionPlan } from "@/components/daily-action-plan";

interface DashboardStats {
  profileViews: number | null;
  coachCount: number | null;
  dmsSent: number | null;
  postsThisWeek: number | null;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  schoolId?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: null,
    coachCount: null,
    dmsSent: null,
    postsThisWeek: null,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, coachesRes, postsRes, dmsRes] = await Promise.all([
          fetch("/api/analytics")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch("/api/coaches")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch("/api/posts")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch("/api/dms")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);

        const coaches = Array.isArray(coachesRes)
          ? coachesRes
          : coachesRes?.coaches || [];
        const posts = Array.isArray(postsRes)
          ? postsRes
          : postsRes?.posts || [];
        const dms = Array.isArray(dmsRes) ? dmsRes : dmsRes?.messages || [];

        // Only count posts actually published to X (have xPostId/x_post_id),
        // NOT all DB drafts which inflate the number
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const postsThisWeek = posts.filter(
          (p: any) =>
            (p.xPostId || p.x_post_id) &&
            new Date(p.createdAt || p.date) > weekAgo
        ).length;

        if (analyticsRes?.meta?.lastUpdated) {
          setLastUpdated(analyticsRes.meta.lastUpdated);
        }

        setStats({
          profileViews: analyticsRes?.current?.profileVisits ?? analyticsRes?.profileViews ?? null,
          coachCount: coaches.length || null,
          dmsSent:
            dms.filter(
              (d: any) => d.status === "sent" || d.status === "delivered"
            ).length || null,
          postsThisWeek: postsThisWeek || null,
        });

        const activity: ActivityItem[] = [];

        dms.slice(0, 5).forEach((dm: any, i: number) => {
          activity.push({
            id: `dm-${i}`,
            type: "dm",
            description: `DM ${dm.status === "sent" ? "sent to" : "drafted for"} ${dm.coachName || "coach"}`,
            timestamp:
              dm.createdAt || dm.updatedAt || new Date().toISOString(),
            schoolId: dm.schoolId,
          });
        });

        // Only show posts actually published to X (have xPostId),
        // NOT seeded drafts which would appear as fake activity
        posts
          .filter((p: any) => p.xPostId || p.x_post_id)
          .slice(0, 5)
          .forEach((post: any, i: number) => {
            activity.push({
              id: `post-${i}`,
              type: "post",
              description: `Posted: "${(post.content || post.caption || "").slice(0, 60)}..."`,
              timestamp:
                post.createdAt || post.date || new Date().toISOString(),
            });
          });

        activity.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setRecentActivity(activity.slice(0, 10));
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const schoolsByTier = targetSchools.reduce(
    (acc, school) => {
      const tier = school.priorityTier;
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(school);
      return acc;
    },
    {} as Record<string, typeof targetSchools>
  );

  function timeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const statCards = [
    {
      label: "Coaches Tracked",
      value: stats.coachCount != null ? <SCAnimatedNumber value={stats.coachCount} /> : "--",
      icon: "target",
      trend: stats.coachCount != null ? { value: "tracking" as const, direction: "up" as const } : undefined,
    },
    {
      label: "DMs Sent",
      value: stats.dmsSent != null ? <SCAnimatedNumber value={stats.dmsSent} /> : "--",
      icon: "monitoring",
      trend: stats.dmsSent != null ? { value: "outreach active" as const, direction: "up" as const } : undefined,
    },
    {
      label: "Scout Velocity",
      value: stats.postsThisWeek != null ? <SCAnimatedNumber value={stats.postsThisWeek} suffix="/wk" /> : "--",
      icon: "bolt",
      trend: undefined,
    },
  ];

  return (
    <SCPageTransition>
      <div className="space-y-8">
      {/* Page Header */}
      <SCPageHeader
        title="JACOB'S COMMAND"
        subtitle="Pewaukee Pirates Elite Scouting Pipeline"
      />

      {/* Hero Banner */}
      <SCHeroBanner screen="command" className="mb-6" />

      {/* Today's Plan — Daily Action Items */}
      <DailyActionPlan />

      {/* Stat Cards — 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SCStatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
            />
          </motion.div>
        ))}
      </div>

      {/* Data staleness indicator */}
      {!loading && <StalenessIndicator lastUpdated={lastUpdated} className="mt-1" />}

      {/* AI Recommendation Engine */}
      <SCGlassCard className="overflow-hidden">
        <div className="flex items-center justify-between bg-sc-primary/5 border-b border-sc-border px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sc-primary text-xl">auto_awesome</span>
            <span className="text-xs font-black uppercase tracking-widest text-white">
              AI Recommendation Engine
            </span>
          </div>
          <SCBadge variant="success">System Active</SCBadge>
        </div>
        <div className="p-6 flex flex-col md:flex-row items-start gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-sc-primary/10 border border-sc-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-sc-primary text-4xl">psychology</span>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              {stats.coachCount != null && stats.coachCount > 0
                ? `You are tracking ${stats.coachCount} coaches. Continue engaging with top-tier programs and keep your DM pipeline warm.`
                : "Start building your recruiting pipeline. Add target coaches and begin outreach to get personalized recommendations."}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/dashboard/coaches">
                <SCButton variant="primary" size="sm">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  Coach Pipeline
                </SCButton>
              </Link>
              <Link href="/dashboard/outreach">
                <SCButton variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Send DM
                </SCButton>
              </Link>
            </div>
          </div>
        </div>
      </SCGlassCard>

      {/* Two Column: Pipeline / Activity + Target Schools sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity — Pipeline */}
        <SCGlassCard className="lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-sc-border flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Pipeline Activity
            </h2>
            <SCBadge variant="info">Live</SCBadge>
          </div>
          <div className="divide-y divide-sc-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="px-6 py-3 flex items-center gap-3 hover:bg-sc-primary/5 transition-colors">
                  {item.schoolId ? (
                    <img
                      src={getSchoolLogo(item.schoolId)}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        {item.type === "dm" ? "mail" : "article"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {timeAgo(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-600 mb-2 block">inbox</span>
                <p className="text-sm text-slate-400">No recent activity</p>
                <p className="text-xs text-slate-600 mt-1">
                  Start by following a coach or drafting a DM
                </p>
              </div>
            )}
          </div>
        </SCGlassCard>

        {/* Target Schools sidebar */}
        <SCGlassCard className="overflow-hidden">
          <div className="px-6 py-4 border-b border-sc-border flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Active Scouts
            </h2>
            <SCBadge variant="primary">{targetSchools.length} Schools</SCBadge>
          </div>
          <div className="p-4 space-y-5 max-h-[480px] overflow-y-auto">
            {Object.entries(schoolsByTier).map(([tier, schools]) => (
              <div key={tier}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  {tier}
                </p>
                <div className="space-y-1">
                  {schools.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <img
                        src={getSchoolLogo(school.id)}
                        alt={school.name}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="text-sm text-white flex-1 truncate">
                        {school.name}
                      </span>
                      <SCBadge variant="default">{school.conference}</SCBadge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "View Recruit Site", href: "/recruit", icon: "open_in_new" },
          { label: "Draft Content", href: "/dashboard/content", icon: "edit_note" },
          { label: "Coach Pipeline", href: "/dashboard/coaches", icon: "group" },
          { label: "Send DM", href: "/dashboard/outreach", icon: "send" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <SCGlassCard className="p-5 hover:bg-sc-primary/5 transition-all cursor-pointer group text-center">
              <div className="mb-3 mx-auto w-12 h-12 rounded-xl bg-white/5 group-hover:bg-sc-primary/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-sc-primary transition-colors">
                  {action.icon}
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                {action.label}
              </p>
            </SCGlassCard>
          </Link>
        ))}
      </div>
      </div>
    </SCPageTransition>
  );
}
