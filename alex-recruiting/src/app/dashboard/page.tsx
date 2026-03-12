"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { useDashboardAssembly } from "@/hooks/useDashboardAssembly";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailyBrief } from "@/components/dashboard/daily-brief";
import { ReadinessScoreGauge } from "@/components/dashboard/readiness-score";
import { RecruitingTimeline } from "@/components/dashboard/recruiting-timeline";
import { SignalFeed } from "@/components/dashboard/signal-feed";

interface DashboardStats {
  profileViews: number;
  coachFollowers: number;
  dmsSent: number;
  postsThisWeek: number;
  draftDMs: number;
  draftPosts: number;
  staleCoaches: number;
}

export default function DashboardPage() {
  const scopeRef = useDashboardAssembly();

  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    coachFollowers: 0,
    dmsSent: 0,
    postsThisWeek: 0,
    draftDMs: 0,
    draftPosts: 0,
    staleCoaches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [analyticsRes, coachesRes, postsRes, dmsRes] =
          await Promise.allSettled([
            fetch("/api/analytics"),
            fetch("/api/coaches"),
            fetch("/api/posts"),
            fetch("/api/dms"),
          ]);

        let profileViews = 0;
        let coachFollowers = 0;
        let postsThisWeek = 0;
        let dmsSent = 0;

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          profileViews = data?.totalViews ?? 0;
        }

        let draftPosts = 0;
        let draftDMs = 0;
        let staleCoaches = 0;

        if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
          const data = await coachesRes.value.json();
          const coaches: { lastEngaged: string | null }[] = Array.isArray(data)
            ? data
            : (data?.coaches ?? []);
          coachFollowers = coaches.length;
          const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
          staleCoaches = coaches.filter(
            (c) =>
              c.lastEngaged && new Date(c.lastEngaged).getTime() < twoWeeksAgo
          ).length;
        }

        if (postsRes.status === "fulfilled" && postsRes.value.ok) {
          const data = await postsRes.value.json();
          const posts: { status: string; updatedAt: string }[] =
            data?.posts ?? [];
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          postsThisWeek = posts.filter(
            (p) =>
              p.status === "posted" &&
              new Date(p.updatedAt).getTime() >= oneWeekAgo
          ).length;
          draftPosts = posts.filter((p) => p.status === "draft").length;
        }

        if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
          const data = await dmsRes.value.json();
          const dms: { status: string }[] = data?.dms ?? [];
          dmsSent = dms.filter((d) => d.status === "sent").length;
          draftDMs = dms.filter((d) => d.status === "drafted").length;
        }

        setStats({
          profileViews,
          coachFollowers,
          dmsSent,
          postsThisWeek,
          draftDMs,
          draftPosts,
          staleCoaches,
        });
      } catch {
        // Use fallback zeros
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  // Quick actions data
  const quickActions = [
    {
      href: "/recruit",
      icon: TrendingUp,
      label: "Recruit Site",
      desc: "View public profile",
    },
    {
      href: "/dashboard/content",
      icon: FileText,
      label: "Content",
      desc: "Review and publish",
    },
    {
      href: "/dashboard/team",
      icon: MessageSquare,
      label: "Team",
      desc: "Chat with your team",
    },
    {
      href: "/dashboard/coaches",
      icon: Mail,
      label: "Coach Pipeline",
      desc: "CRM and outreach",
    },
  ];

  return (
    <div ref={scopeRef}>
      {/* 1. Daily Brief — Hero with typewriter */}
      <div data-dash-animate>
        <DailyBrief />
      </div>

      {/* 2. Readiness Score + Stat Cards row */}
      <div
        className="mb-8 grid gap-6 md:grid-cols-[320px_1fr]"
        data-dash-animate
      >
        <ReadinessScoreGauge />

        {/* Stat cards 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Profile Views",
              value: loading ? 0 : stats.profileViews,
              change: "+12 this week",
              changeType: "up" as const,
              icon: Eye,
              sparkline: [3, 7, 5, 12, 9, 14, 18],
            },
            {
              label: "Coaches in DB",
              value: loading ? 0 : stats.coachFollowers,
              change: "183 total",
              changeType: "neutral" as const,
              icon: Users,
              sparkline: [150, 155, 160, 165, 170, 178, 183],
            },
            {
              label: "DMs Sent",
              value: loading ? 0 : stats.dmsSent,
              change: "+3 this week",
              changeType: "up" as const,
              icon: Mail,
              sparkline: [1, 2, 1, 3, 2, 4, 3],
            },
            {
              label: "Posts This Week",
              value: loading ? 0 : stats.postsThisWeek,
              change: "Target: 5-7",
              changeType: "neutral" as const,
              icon: FileText,
              sparkline: [2, 4, 3, 5, 4, 6, 3],
            },
          ].map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      {/* 3. NCAA Timeline */}
      <div className="mb-8" data-dash-animate>
        <RecruitingTimeline />
      </div>

      {/* 4. Two-column: Signal Feed + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-[1fr_320px]" data-dash-animate>
        <SignalFeed />

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 rounded-full bg-[#ff000c]" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Quick Actions
            </h2>
          </div>
          {quickActions.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#0A0A0A] p-4 transition-all duration-300 hover:border-[#ff000c]/20 hover:bg-[#111111] hover:shadow-[0_0_20px_rgba(255,0,12,0.06)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff000c]/10">
                <link.icon className="h-5 w-5 text-[#ff000c]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {link.label}
                </p>
                <p className="text-[11px] text-white/40">{link.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:text-[#ff000c] group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
