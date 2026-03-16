"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Mail, FileText, Eye, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { targetSchools } from "@/lib/data/target-schools";
import { getSchoolLogo, getSchoolColors } from "@/lib/data/school-branding";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

interface DashboardStats {
  profileViews: number | null;
  coachCount: number | null;
  dmsSent: number | null;
  postsThisWeek: number | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: null,
    coachCount: null,
    dmsSent: null,
    postsThisWeek: null,
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      schoolId?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

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

        // Calculate posts this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const postsThisWeek = posts.filter(
          (p: any) => new Date(p.createdAt || p.date) > weekAgo
        ).length;

        setStats({
          profileViews: analyticsRes?.profileViews ?? null,
          coachCount: coaches.length || null,
          dmsSent:
            dms.filter(
              (d: any) => d.status === "sent" || d.status === "delivered"
            ).length || null,
          postsThisWeek: postsThisWeek || null,
        });

        // Build activity from real data
        const activity: Array<{
          id: string;
          type: string;
          description: string;
          timestamp: string;
          schoolId?: string;
        }> = [];

        // Recent DMs
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

        // Recent posts
        posts.slice(0, 5).forEach((post: any, i: number) => {
          activity.push({
            id: `post-${i}`,
            type: "post",
            description: `Posted: "${(post.content || post.caption || "").slice(0, 60)}..."`,
            timestamp:
              post.createdAt || post.date || new Date().toISOString(),
          });
        });

        // Sort by timestamp descending
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

  // Group target schools by tier
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

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-black text-[#0F1720] tracking-tight mb-2">Overview</h1>

      {/* Stat Cards */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.08}>
        <StaggerItem>
          <StatCard label="Coaches Tracked" value={stats.coachCount} icon={Users} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="DMs Sent" value={stats.dmsSent} icon={Mail} />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Posts This Week"
            value={stats.postsThisWeek}
            icon={FileText}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Profile Views" value={stats.profileViews} icon={Eye} />
        </StaggerItem>
      </StaggerChildren>

      {/* Two Column Layout */}
      <ScrollReveal variant="fadeUp" delay={0.15}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-xl shadow-[4px_4px_0_#E5E7EB] hover:shadow-[4px_4px_0_#0F1720] transition-shadow duration-200">
          <div className="px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F1720] tracking-tight">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F5F4] animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-[#F5F5F4] rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-[#F5F5F4] rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                  {item.schoolId ? (
                    <img
                      src={getSchoolLogo(item.schoolId)}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F4] flex items-center justify-center">
                      {item.type === "dm" ? (
                        <Mail className="w-4 h-4 text-[#9CA3AF]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#9CA3AF]" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F1720] truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {timeAgo(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <Mail className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">No recent activity</p>
                <p className="text-xs text-[#D1D5DB] mt-1">
                  Start by following a coach or drafting a DM
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Target Schools */}
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-[4px_4px_0_#E5E7EB] hover:shadow-[4px_4px_0_#0F1720] transition-shadow duration-200">
          <div className="px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F1720] tracking-tight">
              Target Schools
            </h2>
          </div>
          <div className="p-4 space-y-6">
            {Object.entries(schoolsByTier).map(([tier, schools]) => (
              <div key={tier}>
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
                  {tier}
                </p>
                <div className="space-y-1.5">
                  {schools.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center gap-2.5 py-1.5"
                    >
                      <img
                        src={getSchoolLogo(school.id)}
                        alt={school.name}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="text-sm text-[#0F1720] flex-1 truncate">
                        {school.name}
                      </span>
                      <span className="text-xs text-[#9CA3AF] bg-[#F5F5F4] px-2 py-0.5 rounded-full">
                        {school.conference}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Quick Actions */}
      <ScrollReveal variant="fadeUp" delay={0.2}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "View Recruit Site", href: "/recruit", icon: ArrowRight },
          { label: "Draft Content", href: "/dashboard/content", icon: FileText },
          { label: "Coach Pipeline", href: "/dashboard/coaches", icon: Users },
          { label: "Send DM", href: "/dashboard/outreach", icon: Mail },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:-translate-y-1 hover:shadow-[4px_4px_0_#0F1720] transition-all duration-200 group flex flex-col items-center justify-center text-center"
          >
            <div className="mb-3 p-3 rounded-xl bg-[#F8FAFC] group-hover:bg-[#0F1720] transition-colors duration-200">
              <action.icon className="w-6 h-6 text-[#6B7280] group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-bold text-[#0F1720]">
              {action.label}
            </p>
          </Link>
        ))}
      </div>
      </ScrollReveal>
    </div>
  );
}
