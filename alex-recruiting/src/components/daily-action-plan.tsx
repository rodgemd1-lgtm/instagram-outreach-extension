"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import type { Coach, Post, DMMessage } from "@/lib/types";

// Weekly targets — real strategic decisions, not fake data
const WEEKLY_TARGETS = {
  follows: 5,
  posts: 3,
  dms: 2,
};

interface ActionPlanData {
  coachesToFollow: Coach[];
  nextDraftPost: Post | null;
  nextDraftDM: DMMessage | null;
  weeklyFollows: number;
  weeklyPosts: number;
  weeklyDMs: number;
}

function ProgressBar({
  current,
  target,
  label,
}: {
  current: number;
  target: number;
  label: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const complete = current >= target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span
          className={`text-xs font-bold ${complete ? "text-green-400" : "text-white"}`}
        >
          {current}/{target}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${complete ? "bg-green-500" : "bg-sc-primary"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function DailyActionPlan() {
  const [data, setData] = useState<ActionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [coachesRes, postsRes, dmsRes] = await Promise.all([
          fetch("/api/coaches?followStatus=not_followed")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch("/api/posts")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch("/api/dms")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);

        const allCoaches: Coach[] = coachesRes?.coaches ?? [];
        const allPosts: Post[] = postsRes?.posts ?? [];
        const allDMs: DMMessage[] = dmsRes?.dms ?? [];

        // Prioritize D3 > D2 > FCS > FBS for follow-back probability
        const tierOrder: Record<string, number> = {
          "Tier 3": 1,
          "Tier 2": 2,
          "Tier 1": 3,
        };
        const sorted = [...allCoaches].sort(
          (a, b) =>
            (tierOrder[a.priorityTier] ?? 4) -
            (tierOrder[b.priorityTier] ?? 4)
        );
        const coachesToFollow = sorted.slice(0, 5);

        // Next draft post (no xPostId = not published)
        const nextDraftPost =
          allPosts.find(
            (p) => p.status === "draft" && !p.xPostId
          ) ?? null;

        // Next drafted DM
        const nextDraftDM =
          allDMs.find((d) => d.status === "drafted") ?? null;

        // Weekly progress — count items from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Follows this week: coaches whose followStatus changed (we count followed coaches with recent updatedAt)
        const allCoachesRes = await fetch("/api/coaches")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        const everyCoach: Coach[] = allCoachesRes?.coaches ?? [];

        const weeklyFollows = everyCoach.filter(
          (c) =>
            c.followStatus === "followed" &&
            c.updatedAt &&
            new Date(c.updatedAt) > weekAgo
        ).length;

        // Posts published this week (have xPostId)
        const weeklyPosts = allPosts.filter(
          (p) =>
            (p.xPostId) &&
            new Date(p.createdAt) > weekAgo
        ).length;

        // DMs sent this week
        const weeklyDMs = allDMs.filter(
          (d) =>
            (d.status === "sent" || d.status === "delivered") &&
            d.sentAt &&
            new Date(d.sentAt) > weekAgo
        ).length;

        setData({
          coachesToFollow,
          nextDraftPost,
          nextDraftDM,
          weeklyFollows,
          weeklyPosts,
          weeklyDMs,
        });
      } catch (e) {
        console.error("Failed to fetch daily action plan:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <SCGlassCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sc-border flex items-center gap-3">
          <span className="material-symbols-outlined text-sc-primary text-xl">
            today
          </span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Today&apos;s Plan
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>
    );
  }

  if (error || !data) {
    return (
      <SCGlassCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sc-border flex items-center gap-3">
          <span className="material-symbols-outlined text-sc-primary text-xl">
            today
          </span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Today&apos;s Plan
          </h2>
        </div>
        <div className="p-6 text-center">
          <span className="material-symbols-outlined text-[32px] text-slate-600 mb-2 block">
            cloud_off
          </span>
          <p className="text-sm text-slate-400">
            Could not load your daily plan
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Check your connection and refresh
          </p>
        </div>
      </SCGlassCard>
    );
  }

  const {
    coachesToFollow,
    nextDraftPost,
    nextDraftDM,
    weeklyFollows,
    weeklyPosts,
    weeklyDMs,
  } = data;

  const allCaughtUp =
    coachesToFollow.length === 0 && !nextDraftPost && !nextDraftDM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SCGlassCard variant="broadcast" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-sc-primary/5 border-b border-sc-border px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sc-primary text-xl">
              today
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Today&apos;s Plan
            </span>
          </div>
          <SCBadge variant="primary">
            {allCaughtUp ? "All Clear" : "Action Needed"}
          </SCBadge>
        </div>

        {allCaughtUp ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-green-400 mb-3 block">
              check_circle
            </span>
            <p className="text-sm font-bold text-white mb-1">
              You&apos;re all caught up!
            </p>
            <p className="text-xs text-slate-400">
              No pending actions today. Great work, Jacob.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sc-border">
            {/* 1. Accounts to Follow */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-blue-400">
                  person_add
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Coaches to Follow
                </h3>
              </div>

              {coachesToFollow.length > 0 ? (
                <div className="space-y-2">
                  {coachesToFollow.map((coach) => (
                    <div
                      key={coach.id}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-blue-400">
                          person
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {coach.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {coach.schoolName} &middot; {coach.division}
                        </p>
                      </div>
                      {coach.xHandle && (
                        <a
                          href={`https://x.com/${coach.xHandle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sc-primary hover:underline flex-shrink-0"
                        >
                          Follow
                        </a>
                      )}
                    </div>
                  ))}
                  <Link
                    href="/dashboard/coaches"
                    className="block text-xs text-sc-primary hover:underline mt-2 pl-2"
                  >
                    View all coaches &rarr;
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500 pl-2">
                  No coaches to follow today &mdash; you&apos;re caught up!
                </p>
              )}
            </div>

            {/* 2. Next Post to Review */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-amber-400">
                  edit_note
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Next Post to Review
                </h3>
              </div>

              {nextDraftPost ? (
                <div className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">
                      article
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2">
                      {nextDraftPost.content.slice(0, 120)}
                      {nextDraftPost.content.length > 120 ? "..." : ""}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {nextDraftPost.pillar} &middot; Draft
                    </p>
                  </div>
                  <Link
                    href="/content-queue"
                    className="text-xs text-sc-primary hover:underline flex-shrink-0 mt-1"
                  >
                    Review
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500 pl-2">
                  No drafts waiting &mdash; create a new post!
                </p>
              )}
            </div>

            {/* 3. Next DM to Send */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-purple-400">
                  mail
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Next DM to Send
                </h3>
              </div>

              {nextDraftDM ? (
                <div className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-purple-400">
                      send
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      {nextDraftDM.coachName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {nextDraftDM.schoolName}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/outreach"
                    className="text-xs text-sc-primary hover:underline flex-shrink-0 mt-1"
                  >
                    Send
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500 pl-2">
                  No DMs drafted &mdash; start outreach to a coach!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Weekly Progress — always shown */}
        <div className="border-t border-sc-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-green-400">
              trending_up
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              This Week&apos;s Progress
            </h3>
          </div>
          <div className="space-y-3">
            <ProgressBar
              current={weeklyFollows}
              target={WEEKLY_TARGETS.follows}
              label="Follows"
            />
            <ProgressBar
              current={weeklyPosts}
              target={WEEKLY_TARGETS.posts}
              label="Posts Published"
            />
            <ProgressBar
              current={weeklyDMs}
              target={WEEKLY_TARGETS.dms}
              label="DMs Sent"
            />
          </div>
        </div>
      </SCGlassCard>
    </motion.div>
  );
}
