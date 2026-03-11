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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch real stats from existing API endpoints
        const [analyticsRes, coachesRes] = await Promise.allSettled([
          fetch("/api/analytics"),
          fetch("/api/coaches"),
        ]);

        let profileViews = 0;
        let coachFollowers = 0;

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          profileViews = data?.totalViews ?? 0;
        }

        if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
          const data = await coachesRes.value.json();
          coachFollowers = Array.isArray(data) ? data.length : data?.coaches?.length ?? 0;
        }

        setStats({
          profileViews,
          coachFollowers,
          dmsSent: 0,
          postsThisWeek: 0,
        });
      } catch {
        // Use fallback zeros
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  const actionItems: ActionItem[] = [
    {
      id: "1",
      title: "Review 3 pending DM drafts",
      description: "Outreach to Wisconsin, Iowa State, and NDSU coaches",
      href: "/dashboard/outreach",
      priority: "high",
    },
    {
      id: "2",
      title: "Schedule this week's posts",
      description: "5 posts drafted, none scheduled yet",
      href: "/dashboard/calendar",
      priority: "high",
    },
    {
      id: "3",
      title: "Upload new training clips",
      description: "Spring training film from last week",
      href: "/media-import",
      priority: "medium",
    },
  ];

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
