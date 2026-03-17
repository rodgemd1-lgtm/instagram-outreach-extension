"use client";

import { useState, useEffect } from "react";
import { SCPageHeader, SCGlassCard, SCButton, SCBadge, SCTable } from "@/components/sc";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Competitor {
  id: string;
  name: string;
  xHandle: string;
  position: string;
  classYear: number;
  school: string;
  state: string;
  height: string;
  weight: string;
  followerCount: number;
  postCadence: number;
  engagementRate: number;
  topContentTypes: string[];
  schoolInterestSignals: string[];
}

interface JacobStats {
  followers: number;
  postsPerWeek: number;
  engagementRate: number;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [jacobStats, setJacobStats] = useState<JacobStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashRes = await fetch("/api/dashboard/live");
        if (dashRes.ok) {
          const data = await dashRes.json();
          setJacobStats({
            followers: data.followers?.count ?? 0,
            postsPerWeek: data.posts?.thisWeek ?? 0,
            engagementRate: data.engagement?.rate ?? 0,
          });
        }
      } catch {
        // Will show '--' if fetch fails
      }

      try {
        const compRes = await fetch("/api/intelligence/competitors");
        if (compRes.ok) {
          const data = await compRes.json();
          setCompetitors(data.competitors || []);
        }
      } catch {
        // Empty state is fine
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const columns = [
    {
      key: "name",
      header: "Recruit",
      render: (row: Record<string, unknown>) => (
        <div>
          <p className="text-sm font-bold text-white">{row.name as string}</p>
          <span className="text-xs text-sc-primary">
            {row.xHandle as string}
          </span>
        </div>
      ),
    },
    {
      key: "position",
      header: "Pos",
      render: (row: Record<string, unknown>) => (
        <SCBadge variant="primary">{row.position as string}</SCBadge>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (row: Record<string, unknown>) => (
        <span className="text-sm text-slate-300">
          {row.height as string} {row.weight as string}
        </span>
      ),
    },
    {
      key: "school",
      header: "School",
      render: (row: Record<string, unknown>) => (
        <span className="text-sm text-slate-300">
          {row.school as string}, {row.state as string}
        </span>
      ),
    },
    {
      key: "followerCount",
      header: "Followers",
      align: "right" as const,
      render: (row: Record<string, unknown>) => (
        <span className="text-sm font-bold text-white">{row.followerCount as number}</span>
      ),
    },
    {
      key: "postCadence",
      header: "Posts/wk",
      align: "right" as const,
    },
    {
      key: "engagementRate",
      header: "Engage %",
      align: "right" as const,
      render: (row: Record<string, unknown>) => (
        <span className="text-sm text-white">{row.engagementRate as number}%</span>
      ),
    },
    {
      key: "signals",
      header: "Signals",
      render: (row: Record<string, unknown>) => (
        <div className="flex flex-wrap gap-1">
          {((row.schoolInterestSignals as string[]) || []).map((s: string, i: number) => (
            <SCBadge key={i} variant="default">{s}</SCBadge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SCPageHeader
        title="COMPARISON MATRIX"
        kicker="Prospect Analysis"
        subtitle="Monitor 2029 OL recruits in the Wisconsin/Midwest region -- follower growth, posting cadence, engagement."
        actions={
          <div className="flex gap-3">
            <SCButton variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[16px]">search</span>
              Discover
            </SCButton>
            <SCButton variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </SCButton>
          </div>
        }
      />

      {/* Jacob's Comparison Card */}
      <SCGlassCard variant="broadcast" className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-black uppercase text-white">Jacob Rodgers</p>
              <p className="text-xs text-sc-primary">@JacobRodge52987</p>
            </div>
            <SCBadge variant="primary">OL</SCBadge>
            <span className="text-sm text-slate-400">
              6&apos;4&quot; 285 | Pewaukee HS, WI | 2029
            </span>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-black text-white">
                {jacobStats ? jacobStats.followers : loading ? "..." : "--"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Followers
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-white">
                {jacobStats ? jacobStats.postsPerWeek : loading ? "..." : "--"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Posts/wk
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-white">
                {jacobStats ? `${jacobStats.engagementRate}%` : loading ? "..." : "--%"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Engagement
              </p>
            </div>
          </div>
        </div>
      </SCGlassCard>

      {/* Competitor Table */}
      {loading ? (
        <SCGlassCard className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
          <span className="ml-3 text-sm text-slate-400">Loading competitor data...</span>
        </SCGlassCard>
      ) : competitors.length === 0 ? (
        <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">
            person_search
          </span>
          <p className="text-lg font-bold text-white">No competitor data available</p>
          <p className="mt-2 text-sm text-slate-400">
            Click &quot;Discover&quot; to scan for 2029 OL recruits.
          </p>
        </SCGlassCard>
      ) : (
        <SCTable
          columns={columns}
          data={competitors as unknown as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
