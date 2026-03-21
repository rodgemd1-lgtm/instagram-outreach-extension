"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { getSchoolLogo } from "@/lib/data/school-branding";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCInput,
  SCHeroBanner,
  SCPageTransition,
  SCAnimatedNumber,
} from "@/components/sc";

interface Coach {
  id: string;
  name: string;
  title: string;
  schoolName: string;
  schoolId?: string;
  division: string;
  conference: string;
  xHandle: string;
  dmOpen: boolean;
  followStatus: string;
  dmStatus: string;
  priorityTier: string;
  olNeedScore: number;
  xActivityScore: number;
  notes: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const EMPTY_FORM = {
  name: "",
  title: "",
  schoolName: "",
  division: "D1 FBS",
  conference: "",
  xHandle: "",
  priorityTier: "Tier 2",
};

export default function CoachesPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [showNewTargetModal, setShowNewTargetModal] = useState(false);
  const [newCoachForm, setNewCoachForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleExport = async () => {
    try {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      const rows: Coach[] = data.coaches ?? [];
      const headers = [
        "name",
        "schoolName",
        "division",
        "conference",
        "priorityTier",
        "xHandle",
        "followStatus",
        "dmStatus",
        "olNeedScore",
        "xActivityScore",
      ];
      const csvLines = [
        headers.join(","),
        ...rows.map((r) =>
          headers
            .map((h) => {
              const val = String(r[h as keyof Coach] ?? "");
              return val.includes(",") ? `"${val}"` : val;
            })
            .join(",")
        ),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `coaches-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleNewCoachSubmit = async () => {
    if (!newCoachForm.name || !newCoachForm.schoolName) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoachForm),
      });
      if (!res.ok) throw new Error("Failed to create coach");
      setShowNewTargetModal(false);
      setNewCoachForm(EMPTY_FORM);
      await fetchCoaches();
    } catch (error) {
      console.error("Failed to add coach:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchCoaches = useCallback(async () => {
    try {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      setCoaches(data.coaches ?? []);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCoaches();
  }, [fetchCoaches]);

  const filtered = useMemo(
    () =>
      coaches
        .filter((c) => {
          const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.schoolName.toLowerCase().includes(search.toLowerCase());
          const matchesTier = tierFilter === "all" || c.priorityTier === tierFilter;
          const matchesDivision = divisionFilter === "all" || c.division === divisionFilter;
          return matchesSearch && matchesTier && matchesDivision;
        })
        .sort((a, b) => {
          const tierRank: Record<string, number> = { "Tier 1": 0, "Tier 2": 1, "Tier 3": 2 };
          const t = (tierRank[a.priorityTier] ?? 3) - (tierRank[b.priorityTier] ?? 3);
          if (t !== 0) return t;
          return b.olNeedScore + b.xActivityScore - (a.olNeedScore + a.xActivityScore);
        }),
    [coaches, search, tierFilter, divisionFilter]
  );

  // Stats
  const totalCoaches = coaches.length;
  const withFollows = coaches.filter((c) => c.followStatus === "followed" || c.followStatus === "followed_back").length;
  const withDMs = coaches.filter((c) => c.dmStatus === "sent" || c.dmStatus === "responded").length;
  const responded = coaches.filter((c) => c.dmStatus === "responded").length;
  const engagementRate = totalCoaches > 0 ? Math.round((withFollows / totalCoaches) * 100) : 0;
  const avgProbability =
    totalCoaches > 0
      ? Math.round(coaches.reduce((sum, c) => sum + c.olNeedScore, 0) / totalCoaches)
      : 0;

  const TABLE_HEADERS = ["School / Coach", "Division", "Tier", "OL Need", "Follow", "DM", "X Activity"];

  return (
    <SCPageTransition>
      <div className="space-y-6">
        <SCPageHeader
          kicker="Offer Management"
          title="ACTIVE OFFER PIPELINE"
          subtitle="Coach intelligence and targeting operations"
          actions={
            <div className="flex gap-3">
              <SCButton variant="secondary" size="sm" onClick={handleExport}>
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export DB
              </SCButton>
              <SCButton variant="primary" size="sm" onClick={() => setShowNewTargetModal(true)}>
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Target
              </SCButton>
            </div>
          }
        />

        <SCHeroBanner screen="command" className="mb-6" />

        {/* Stat Cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <SCStatCard
              label="Coaches Tracked"
              value={<SCAnimatedNumber value={totalCoaches} />}
              icon="groups"
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <SCStatCard
              label="Followed"
              value={<SCAnimatedNumber value={withFollows} />}
              icon="pending"
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <SCStatCard
              label="Responded"
              value={<SCAnimatedNumber value={responded} />}
              icon="task_alt"
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <SCStatCard
              label="Avg Probability"
              value={<><SCAnimatedNumber value={avgProbability} suffix="/10" /></>}
              icon="analytics"
              progress={avgProbability * 10}
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <SCGlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SCInput
              icon="search"
              placeholder="Search coaches or schools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all" className="bg-sc-surface text-white">All Tiers</option>
            <option value="Tier 1" className="bg-sc-surface text-white">Tier 1 (Reach)</option>
            <option value="Tier 2" className="bg-sc-surface text-white">Tier 2 (Target)</option>
            <option value="Tier 3" className="bg-sc-surface text-white">Tier 3 (Safety)</option>
          </select>
          <select
            className="rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
          >
            <option value="all" className="bg-sc-surface text-white">All Divisions</option>
            <option value="D1 FBS" className="bg-sc-surface text-white">D1 FBS</option>
            <option value="D1 FCS" className="bg-sc-surface text-white">D1 FCS</option>
            <option value="D2" className="bg-sc-surface text-white">D2</option>
          </select>
        </SCGlassCard>

        {/* Coach Table */}
        {loading ? (
          <SCGlassCard className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
            <span className="ml-3 text-sm text-slate-400">Loading targets...</span>
          </SCGlassCard>
        ) : filtered.length === 0 ? (
          <SCGlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/10">person_search</span>
            <p className="mt-4 text-lg font-bold text-white/50">
              {coaches.length === 0 ? "No coaches in the database" : "No coaches match your filters"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {coaches.length === 0
                ? "Run the data pipeline to seed your target school coaches."
                : "Try adjusting your search, tier, or division filters."}
            </p>
            {coaches.length === 0 && (
              <SCButton variant="primary" size="sm" className="mt-6" onClick={() => window.location.href = "/scrape"}>
                <span className="material-symbols-outlined text-[16px]">database</span>
                Seed Coach Database
              </SCButton>
            )}
          </SCGlassCard>
        ) : (
          <SCGlassCard className="overflow-hidden rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-sc-surface/50">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sc-border">
                {filtered.map((coach) => {
                  const schoolId = coach.schoolId || coach.schoolName.toLowerCase().replace(/\s+/g, "-");
                  const logoPath = getSchoolLogo(schoolId);
                  const olLevel = Math.min(5, Math.max(1, Math.round(coach.olNeedScore / 2)));
                  const followColor =
                    coach.followStatus === "following"
                      ? "bg-emerald-500"
                      : coach.followStatus === "not_following"
                      ? "bg-white/20"
                      : "bg-yellow-500";
                  const dmColor =
                    coach.dmStatus === "responded"
                      ? "bg-emerald-500"
                      : coach.dmStatus === "sent"
                      ? "bg-blue-500"
                      : "bg-white/20";

                  return (
                    <tr
                      key={coach.id}
                      className="hover:bg-sc-primary/5 transition-colors cursor-pointer"
                      onClick={() => router.push(`/coaches/${schoolId}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                            {logoPath ? (
                              <Image
                                src={logoPath}
                                alt={coach.schoolName}
                                width={24}
                                height={24}
                                className="opacity-70"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">
                                {coach.schoolName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{coach.schoolName}</p>
                            <p className="text-[11px] text-slate-500">{coach.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">{coach.division}</span>
                        <br />
                        <span className="text-[10px] text-slate-600">{coach.conference}</span>
                      </td>
                      <td className="px-4 py-3">
                        <SCBadge
                          variant={
                            coach.priorityTier === "Tier 1"
                              ? "danger"
                              : coach.priorityTier === "Tier 2"
                              ? "warning"
                              : "default"
                          }
                        >
                          {coach.priorityTier}
                        </SCBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < olLevel ? "bg-sc-primary shadow-[0_0_4px_rgba(197,5,12,0.4)]" : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${followColor}`} />
                          <span className="text-[10px] text-slate-500 capitalize">
                            {coach.followStatus?.replace(/_/g, " ") ?? "unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${dmColor}`} />
                          <span className="text-[10px] text-slate-500 capitalize">
                            {coach.dmStatus?.replace(/_/g, " ") ?? "none"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-white/5">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{ width: `${Math.min(100, coach.xActivityScore * 10)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-600">{coach.xActivityScore}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </SCGlassCard>
        )}
        {/* New Target Modal */}
        {showNewTargetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <SCGlassCard className="w-full max-w-md p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Add New Target
                </h2>
                <button
                  onClick={() => setShowNewTargetModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <SCInput
                  label="Coach Name"
                  placeholder="e.g. John Smith"
                  value={newCoachForm.name}
                  onChange={(e) =>
                    setNewCoachForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <SCInput
                  label="Title"
                  placeholder="e.g. Offensive Line Coach"
                  value={newCoachForm.title}
                  onChange={(e) =>
                    setNewCoachForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
                <SCInput
                  label="School Name"
                  placeholder="e.g. University of Wisconsin"
                  value={newCoachForm.schoolName}
                  onChange={(e) =>
                    setNewCoachForm((f) => ({ ...f, schoolName: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="sc-label mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Division
                    </label>
                    <select
                      className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                      value={newCoachForm.division}
                      onChange={(e) =>
                        setNewCoachForm((f) => ({ ...f, division: e.target.value }))
                      }
                    >
                      <option value="FBS" className="bg-sc-surface text-white">D1 FBS</option>
                      <option value="FCS" className="bg-sc-surface text-white">D1 FCS</option>
                      <option value="D2" className="bg-sc-surface text-white">D2</option>
                      <option value="D3" className="bg-sc-surface text-white">D3</option>
                      <option value="NAIA" className="bg-sc-surface text-white">NAIA</option>
                    </select>
                  </div>
                  <div>
                    <label className="sc-label mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Priority Tier
                    </label>
                    <select
                      className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                      value={newCoachForm.priorityTier}
                      onChange={(e) =>
                        setNewCoachForm((f) => ({ ...f, priorityTier: e.target.value }))
                      }
                    >
                      <option value="Tier 1" className="bg-sc-surface text-white">Tier 1 (Reach)</option>
                      <option value="Tier 2" className="bg-sc-surface text-white">Tier 2 (Target)</option>
                      <option value="Tier 3" className="bg-sc-surface text-white">Tier 3 (Safety)</option>
                    </select>
                  </div>
                </div>
                <SCInput
                  label="Conference"
                  placeholder="e.g. Big Ten"
                  value={newCoachForm.conference}
                  onChange={(e) =>
                    setNewCoachForm((f) => ({ ...f, conference: e.target.value }))
                  }
                />
                <SCInput
                  label="X Handle"
                  icon="alternate_email"
                  placeholder="e.g. @coachsmith"
                  value={newCoachForm.xHandle}
                  onChange={(e) =>
                    setNewCoachForm((f) => ({ ...f, xHandle: e.target.value }))
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <SCButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTargetModal(false)}
                >
                  Cancel
                </SCButton>
                <SCButton
                  variant="primary"
                  size="sm"
                  disabled={submitting || !newCoachForm.name || !newCoachForm.schoolName}
                  onClick={handleNewCoachSubmit}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add Target
                    </>
                  )}
                </SCButton>
              </div>
            </SCGlassCard>
          </div>
        )}
      </div>
    </SCPageTransition>
  );
}
