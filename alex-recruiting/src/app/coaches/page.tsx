"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import {
  StitchPageHeader,
  StatCard,
  FlashTicker,
  FilterBar,
  GlassCard,
  StitchBadge,
  StitchButton,
  OLNeedMeter,
  EngagementDot,
} from "@/components/stitch";
import {
  StitchTable,
  StitchTableHeader,
  StitchTableHead,
  StitchTableBody,
  StitchTableRow,
  StitchTableCell,
} from "@/components/stitch/stitch-table";
import Image from "next/image";
import { getSchoolLogo } from "@/lib/data/school-branding";

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

function mapStatus(status: string): "replied" | "sent" | "unsent" | "none" {
  if (status === "replied" || status === "responded") return "replied";
  if (status === "sent" || status === "following") return "sent";
  if (status === "not_following" || status === "unsent") return "unsent";
  return "none";
}

export default function CoachesPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");

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
  const intelReports = coaches.filter((c) => c.xActivityScore > 0).length;
  const withFollows = coaches.filter((c) => c.followStatus === "following").length;
  const withDMs = coaches.filter((c) => c.dmStatus === "sent" || c.dmStatus === "responded").length;
  const engagementRate = totalCoaches > 0 ? Math.round((withFollows / totalCoaches) * 100) : 0;
  const responseRate = withDMs > 0 ? Math.round((coaches.filter((c) => c.dmStatus === "responded").length / withDMs) * 100) : 0;

  // Ticker alerts
  const tickerItems = [
    `${totalCoaches} coaches in database`,
    `${intelReports} with intel reports`,
    coaches.filter((c) => c.priorityTier === "Tier 1").length + " Tier 1 targets",
  ];

  return (
    <div className="space-y-6">
      {/* Flash Ticker */}
      <FlashTicker items={tickerItems} />

      {/* Page Header */}
      <StitchPageHeader
        title="War Room"
        subtitle="Coach intelligence and targeting operations"
        actions={
          <>
            <StitchButton variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export DB
            </StitchButton>
            <StitchButton variant="pirate" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Target
            </StitchButton>
          </>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active Targets" value={totalCoaches} />
        <StatCard label="Intel Reports" value={intelReports} />
        <StatCard label="Engagement Rate" value={`${engagementRate}%`} />
        <StatCard label="Response Rate" value={`${responseRate}%`} />
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: "Tier",
            value: tierFilter,
            onChange: setTierFilter,
            options: [
              { value: "all", label: "All Tiers" },
              { value: "Tier 1", label: "Tier 1 (Reach)" },
              { value: "Tier 2", label: "Tier 2 (Target)" },
              { value: "Tier 3", label: "Tier 3 (Safety)" },
            ],
          },
          {
            label: "Division",
            value: divisionFilter,
            onChange: setDivisionFilter,
            options: [
              { value: "all", label: "All Divisions" },
              { value: "D1 FBS", label: "D1 FBS" },
              { value: "D1 FCS", label: "D1 FCS" },
              { value: "D2", label: "D2" },
            ],
          },
        ]}
      />

      {/* Coach Table */}
      {loading ? (
        <GlassCard className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5050C] border-t-transparent" />
          <span className="ml-3 text-sm text-white/40">Loading targets...</span>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <p className="text-sm text-white/40">No coaches found. Adjust filters or add new targets.</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <StitchTable>
            <StitchTableHeader>
              <tr>
                <StitchTableHead>School / Coach</StitchTableHead>
                <StitchTableHead>Division</StitchTableHead>
                <StitchTableHead>Tier</StitchTableHead>
                <StitchTableHead>OL Need</StitchTableHead>
                <StitchTableHead>Follow</StitchTableHead>
                <StitchTableHead>DM</StitchTableHead>
                <StitchTableHead>X Activity</StitchTableHead>
              </tr>
            </StitchTableHeader>
            <StitchTableBody>
              {filtered.map((coach) => {
                const schoolId = coach.schoolId || coach.schoolName.toLowerCase().replace(/\s+/g, "-");
                const logoPath = getSchoolLogo(schoolId);

                return (
                  <StitchTableRow
                    key={coach.id}
                    onClick={() => router.push(`/coaches/${schoolId}`)}
                  >
                    <StitchTableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                          <Image
                            src={logoPath}
                            alt={coach.schoolName}
                            width={24}
                            height={24}
                            className="opacity-70"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{coach.schoolName}</p>
                          <p className="text-[11px] text-white/40">{coach.name}</p>
                        </div>
                      </div>
                    </StitchTableCell>
                    <StitchTableCell>
                      <span className="text-xs text-white/50">{coach.division}</span>
                      <br />
                      <span className="text-[10px] text-white/30">{coach.conference}</span>
                    </StitchTableCell>
                    <StitchTableCell>
                      <StitchBadge
                        variant={
                          coach.priorityTier === "Tier 1" ? "tier1" :
                          coach.priorityTier === "Tier 2" ? "tier2" : "tier3"
                        }
                      >
                        {coach.priorityTier}
                      </StitchBadge>
                    </StitchTableCell>
                    <StitchTableCell>
                      <OLNeedMeter level={Math.min(5, Math.max(1, Math.round(coach.olNeedScore / 2)))} />
                    </StitchTableCell>
                    <StitchTableCell>
                      <EngagementDot status={mapStatus(coach.followStatus)} />
                    </StitchTableCell>
                    <StitchTableCell>
                      <EngagementDot status={mapStatus(coach.dmStatus)} />
                    </StitchTableCell>
                    <StitchTableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/5">
                          <div
                            className="h-1.5 rounded-full bg-[#00f2ff]"
                            style={{ width: `${Math.min(100, coach.xActivityScore * 10)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/30">{coach.xActivityScore}</span>
                      </div>
                    </StitchTableCell>
                  </StitchTableRow>
                );
              })}
            </StitchTableBody>
          </StitchTable>
        </GlassCard>
      )}
    </div>
  );
}
