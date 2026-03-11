"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Eye,
  FileText,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface DashboardStats {
  profileViews: number;
  coachFollowers: number;
  dmsSent: number;
  postsThisWeek: number;
  draftDMs: number;
  draftPosts: number;
  staleCoaches: number;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: "camp" | "deadline" | "post" | "followup";
}

export default function DashboardPage() {
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
        // Fetch real stats from existing API endpoints
        const [analyticsRes, coachesRes, postsRes, dmsRes] = await Promise.allSettled([
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
          const coaches: { lastEngaged: string | null }[] = Array.isArray(data) ? data : data?.coaches ?? [];
          coachFollowers = coaches.length;
          const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
          staleCoaches = coaches.filter(
            (c) => c.lastEngaged && new Date(c.lastEngaged).getTime() < twoWeeksAgo
          ).length;
        }

        if (postsRes.status === "fulfilled" && postsRes.value.ok) {
          const data = await postsRes.value.json();
          const posts: { status: string; updatedAt: string }[] = data?.posts ?? [];
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          postsThisWeek = posts.filter(
            (p) => p.status === "posted" && new Date(p.updatedAt).getTime() >= oneWeekAgo
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

  const actionItems: ActionItem[] = [];

  if (stats.draftDMs > 0) {
    actionItems.push({
      id: "dm-drafts",
      title: `Review ${stats.draftDMs} pending DM draft${stats.draftDMs !== 1 ? "s" : ""}`,
      description: "Outreach messages waiting for approval",
      href: "/dashboard/outreach",
      priority: "high",
    });
  }
  if (stats.draftPosts > 0) {
    actionItems.push({
      id: "post-drafts",
      title: `Schedule ${stats.draftPosts} draft post${stats.draftPosts !== 1 ? "s" : ""}`,
      description: "Posts drafted but not yet scheduled",
      href: "/dashboard/calendar",
      priority: "high",
    });
  }
  if (stats.staleCoaches > 0) {
    actionItems.push({
      id: "stale-coaches",
      title: `${stats.staleCoaches} coach${stats.staleCoaches !== 1 ? "es" : ""} need follow-up`,
      description: "No engagement in 14+ days",
      href: "/dashboard/coaches",
      priority: "medium",
    });
  }
  if (actionItems.length === 0) {
    actionItems.push({
      id: "all-clear",
      title: "All caught up!",
      description: "No urgent action items right now",
      href: "/dashboard/calendar",
      priority: "low",
    });
  }

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "Wisconsin Spring Prospect Camp",
      date: "Apr 12, 2026",
      type: "camp",
    },
    {
      id: "2",
      title: "NCAA Contact Period Opens",
      date: "Jun 15, 2027",
      type: "deadline",
    },
    {
      id: "3",
      title: "Film highlight update due",
      date: "Mar 15, 2026",
      type: "followup",
    },
  ];

  const typeColors: Record<string, string> = {
    camp: "bg-dash-accent/20 text-dash-accent",
    deadline: "bg-dash-warning/20 text-dash-warning",
    post: "bg-dash-success/20 text-dash-success",
    followup: "bg-dash-gold/20 text-dash-gold",
  };

  const priorityColors: Record<string, string> = {
    high: "border-l-dash-danger",
    medium: "border-l-dash-warning",
    low: "border-l-dash-muted",
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-dash-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-dash-text md:text-3xl">
          Welcome back, Jacob.
        </h1>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          label="Profile Views"
          value={loading ? "..." : stats.profileViews}
          change="+12 this week"
          changeType="up"
          icon={Eye}
        />
        <StatCard
          label="Coaches in DB"
          value={loading ? "..." : stats.coachFollowers}
          change="183 total"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="DMs Sent"
          value={loading ? "..." : stats.dmsSent}
          icon={Mail}
        />
        <StatCard
          label="Posts This Week"
          value={loading ? "..." : stats.postsThisWeek}
          change="Target: 5-7"
          changeType="neutral"
          icon={FileText}
        />
      </div>

      {/* Two-column: Action items + Upcoming events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Action items */}
        <div className="rounded-xl border border-dash-border bg-dash-surface">
          <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
            <h2 className="text-sm font-semibold text-dash-text">
              Action Items
            </h2>
            <span className="rounded-full bg-dash-danger/10 px-2.5 py-0.5 text-xs font-semibold text-dash-danger">
              {actionItems.filter((a) => a.priority === "high").length} urgent
            </span>
          </div>
          <div className="divide-y divide-dash-border-subtle">
            {actionItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center justify-between border-l-2 px-5 py-4 transition-colors hover:bg-dash-surface-raised ${priorityColors[item.priority]}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dash-text">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-dash-muted">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-dash-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="rounded-xl border border-dash-border bg-dash-surface">
          <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
            <h2 className="text-sm font-semibold text-dash-text">
              Upcoming Events
            </h2>
            <Link
              href="/dashboard/calendar"
              className="text-xs font-medium text-dash-accent hover:text-dash-accent-hover"
            >
              View calendar
            </Link>
          </div>
          <div className="divide-y divide-dash-border-subtle">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-surface-raised">
                  <Calendar className="h-4 w-4 text-dash-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dash-text">
                    {event.title}
                  </p>
                  <p className="mt-0.5 text-xs text-dash-muted">{event.date}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColors[event.type]}`}
                >
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/recruit"
          className="group rounded-xl border border-dash-border bg-dash-surface p-4 transition-colors hover:border-dash-accent/30 hover:bg-dash-surface-raised"
        >
          <TrendingUp className="h-5 w-5 text-dash-accent" />
          <p className="mt-3 text-sm font-semibold text-dash-text">
            Recruit Site
          </p>
          <p className="mt-0.5 text-xs text-dash-muted">View public profile</p>
        </Link>
        <Link
          href="/posts"
          className="group rounded-xl border border-dash-border bg-dash-surface p-4 transition-colors hover:border-dash-accent/30 hover:bg-dash-surface-raised"
        >
          <FileText className="h-5 w-5 text-dash-accent" />
          <p className="mt-3 text-sm font-semibold text-dash-text">
            Post Queue
          </p>
          <p className="mt-0.5 text-xs text-dash-muted">Review and publish</p>
        </Link>
        <Link
          href="/agency"
          className="group rounded-xl border border-dash-border bg-dash-surface p-4 transition-colors hover:border-dash-accent/30 hover:bg-dash-surface-raised"
        >
          <Users className="h-5 w-5 text-dash-accent" />
          <p className="mt-3 text-sm font-semibold text-dash-text">
            REC Team
          </p>
          <p className="mt-0.5 text-xs text-dash-muted">
            Chat with your team
          </p>
        </Link>
        <Link
          href="/coaches"
          className="group rounded-xl border border-dash-border bg-dash-surface p-4 transition-colors hover:border-dash-accent/30 hover:bg-dash-surface-raised"
        >
          <Mail className="h-5 w-5 text-dash-accent" />
          <p className="mt-3 text-sm font-semibold text-dash-text">
            Coach Pipeline
          </p>
          <p className="mt-0.5 text-xs text-dash-muted">
            CRM and outreach
          </p>
        </Link>
      </div>
    </div>
  );
}
