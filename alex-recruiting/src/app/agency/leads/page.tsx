"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCInput,
} from "@/components/sc";
import type { NCSALead } from "@/lib/rec/types";

const STATUS_ORDER = ["new", "researched", "followed", "dm_drafted", "dm_sent", "responded"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  researched: "Researched",
  followed: "Followed",
  dm_drafted: "DM Drafted",
  dm_sent: "DM Sent",
  responded: "Responded",
};

const STATUS_ICONS: Record<string, string> = {
  new: "fiber_new",
  researched: "search",
  followed: "person_add",
  dm_drafted: "edit_note",
  dm_sent: "send",
  responded: "reply",
};

const SOURCE_ICONS: Record<string, string> = {
  profile_view: "visibility",
  camp_invite: "camping",
  message: "mail",
  manual: "person",
};

const SOURCE_LABELS: Record<string, string> = {
  profile_view: "Profile View",
  camp_invite: "Camp Invite",
  message: "Message",
  manual: "Manual",
};

interface LeadMatch {
  leadId: string;
  matchedCoachName: string | null;
  matchedCoachTitle: string | null;
  matchedCoachXHandle: string | null;
  matchedCoachFollowStatus: string | null;
  thankYouDraft: string;
  matchConfidence: "high" | "medium" | "low";
}

interface LeadSummary {
  totalLeads: number;
  schoolsThatSearched: number;
  schoolsThatViewedProfile: number;
  schoolsThatFollowed: number;
  schoolsThatReachedOut: number;
  searchesDetected: number;
  followsDetected: number;
  messagesReceived: number;
  campInvitesReceived: number;
  xReadyLeads: number;
  followReadyLeads: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<NCSALead[]>([]);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [matches, setMatches] = useState<Record<string, LeadMatch>>({});
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanHtml, setScanHtml] = useState("");
  const [scanning, setScanning] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [actingLeadId, setActingLeadId] = useState<string | null>(null);

  const [newLead, setNewLead] = useState({
    coachName: "",
    schoolName: "",
    division: "",
    conference: "",
    source: "manual" as const,
    sourceDetail: "",
    xHandle: "",
    notes: "",
  });

  const loadLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/rec/ncsa/leads");
      const data = await res.json();
      setLeads(data.leads || []);
      setSummary(data.summary || null);
      setMatches(
        Object.fromEntries(
          ((data.matches || []) as LeadMatch[]).map((match) => [match.leadId, match])
        )
      );
    } catch {
      console.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const advanceLead = async (lead: NCSALead) => {
    const currentIndex = STATUS_ORDER.indexOf(lead.outreachStatus as typeof STATUS_ORDER[number]);
    if (currentIndex >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIndex + 1];

    setAdvancing(lead.id);
    try {
      await fetch("/api/rec/ncsa/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: nextStatus }),
      });
      await loadLeads();
    } catch {
      console.error("Failed to advance lead");
    } finally {
      setAdvancing(null);
    }
  };

  const handleAddLead = async () => {
    try {
      await fetch("/api/rec/ncsa/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      setAddOpen(false);
      setNewLead({ coachName: "", schoolName: "", division: "", conference: "", source: "manual", sourceDetail: "", xHandle: "", notes: "" });
      await loadLeads();
    } catch {
      console.error("Failed to add lead");
    }
  };

  const handleScan = async () => {
    if (!scanHtml.trim()) return;
    setScanning(true);
    try {
      const res = await fetch("/api/rec/ncsa/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: scanHtml }),
      });
      const data = await res.json();
      setScanOpen(false);
      setScanHtml("");
      await loadLeads();
      alert(`Imported ${data.created} leads from NCSA`);
    } catch {
      console.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleLiveSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ncsa/scrape", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Authenticated NCSA sync failed");
        return;
      }
      await loadLeads();
      const stats = data.coachActivity?.stats;
      alert(
        [
          `Imported ${data.importResult?.inserted ?? 0} new leads`,
          data.importResult?.updated
            ? `Updated ${data.importResult.updated} existing leads`
            : null,
          stats
            ? `Dashboard: ${stats.searches} searches, ${stats.views} views, ${stats.follows} follows`
            : null,
          data.mode === "legacy_fallback" ? "Route used legacy fallback." : null,
        ]
          .filter(Boolean)
          .join("\n")
      );
    } catch {
      alert("Authenticated NCSA sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const followLead = async (leadId: string) => {
    setActingLeadId(leadId);
    try {
      const res = await fetch("/api/rec/ncsa/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action: "follow" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.message || "Follow failed");
        return;
      }
      await loadLeads();
    } catch {
      alert("Follow failed");
    } finally {
      setActingLeadId(null);
    }
  };

  const copyDraft = async (leadId: string) => {
    setActingLeadId(leadId);
    try {
      const res = await fetch("/api/rec/ncsa/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action: "draft" }),
      });
      const data = await res.json();
      if (!res.ok || !data.thankYouDraft) {
        alert(data.error || "No draft available");
        return;
      }
      await navigator.clipboard.writeText(data.thankYouDraft);
      alert("Thank-you draft copied");
    } catch {
      alert("Could not copy draft");
    } finally {
      setActingLeadId(null);
    }
  };

  const leadsByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.outreachStatus === s);
    return acc;
  }, {} as Record<string, NCSALead[]>);

  const actionableLeads = leads
    .map((lead) => ({ lead, match: matches[lead.id] }))
    .filter(({ match }) => Boolean(match?.matchedCoachXHandle))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Lead Funnel"
        title="NCSA PIPELINE"
        subtitle="Work NCSA leads like a live funnel with visible status"
        actions={
          <div className="flex gap-2">
            <SCButton size="sm" variant="primary" onClick={handleLiveSync} disabled={syncing}>
              {syncing ? (
                <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[14px]">sync</span>
              )}
              {syncing ? "Syncing..." : "Sync NCSA"}
            </SCButton>
            <SCButton size="sm" variant="secondary" onClick={() => setScanOpen(true)}>
              <span className="material-symbols-outlined text-[14px]">code</span>
              Import HTML
            </SCButton>
            <SCButton size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Lead
            </SCButton>
          </div>
        }
      />

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            { label: "Searches", value: summary.searchesDetected, icon: "search" },
            { label: "Views", value: summary.schoolsThatViewedProfile, icon: "visibility" },
            { label: "Follows", value: summary.followsDetected, icon: "person_add" },
            { label: "Messages", value: summary.messagesReceived, icon: "mail" },
            { label: "Camp Invites", value: summary.campInvitesReceived, icon: "camping" },
            { label: "Reached Out", value: summary.schoolsThatReachedOut, icon: "outgoing_mail" },
            { label: "X Ready", value: summary.xReadyLeads, icon: "bolt" },
            { label: "Follow Ready", value: summary.followReadyLeads, icon: "how_to_reg" },
          ].map((metric) => (
            <SCStatCard
              key={metric.label}
              label={metric.label}
              value={String(metric.value)}
              icon={metric.icon}
            />
          ))}
        </div>
      )}

      {/* X-Ready Leads */}
      {actionableLeads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-emerald-500">bolt</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              X-Ready Leads
            </h2>
            <p className="text-xs text-slate-600 ml-2">
              Already mapped to an X handle -- follow and copy a thank-you draft immediately
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {actionableLeads.map(({ lead, match }) => (
              <SCGlassCard key={lead.id} className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-white">{lead.schoolName}</p>
                  <p className="text-xs text-slate-500">
                    {match?.matchedCoachName || lead.coachName}
                    {match?.matchedCoachTitle ? ` -- ${match.matchedCoachTitle}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-blue-400">{match?.matchedCoachXHandle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SCBadge variant="default">{SOURCE_LABELS[lead.source]}</SCBadge>
                  <SCBadge
                    variant={
                      match?.matchConfidence === "high"
                        ? "success"
                        : match?.matchConfidence === "medium"
                        ? "warning"
                        : "default"
                    }
                  >
                    {match?.matchConfidence || "low"} confidence
                  </SCBadge>
                </div>
                <p className="text-xs text-slate-500">{lead.sourceDetail}</p>
                <div className="flex gap-2">
                  <SCButton
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    disabled={actingLeadId === lead.id || match?.matchedCoachFollowStatus === "followed"}
                    onClick={() => followLead(lead.id)}
                  >
                    {actingLeadId === lead.id ? (
                      <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                    ) : match?.matchedCoachFollowStatus === "followed" ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                    )}
                    {match?.matchedCoachFollowStatus === "followed" ? "Following" : "Follow on X"}
                  </SCButton>
                  <SCButton
                    size="sm"
                    variant="secondary"
                    disabled={actingLeadId === lead.id}
                    onClick={() => copyDraft(lead.id)}
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Draft
                  </SCButton>
                </div>
              </SCGlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Columns */}
      {loading ? (
        <SCGlassCard className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
          <span className="ml-3 text-sm text-slate-400">Loading leads...</span>
        </SCGlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATUS_ORDER.map((status) => (
            <div key={status}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">
                    {STATUS_ICONS[status]}
                  </span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {STATUS_LABELS[status]}
                  </h3>
                </div>
                <SCBadge variant="default">
                  {leadsByStatus[status]?.length || 0}
                </SCBadge>
              </div>
              <div className="space-y-2 min-h-[100px] rounded-xl border border-dashed border-sc-border p-2">
                {(leadsByStatus[status] || []).map((lead) => (
                  <SCGlassCard key={lead.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{lead.coachName}</p>
                        <p className="text-xs text-slate-500 truncate">{lead.schoolName}</p>
                      </div>
                      <span className="material-symbols-outlined text-[14px] text-slate-600">
                        {SOURCE_ICONS[lead.source] || "person"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <SCBadge variant="default">{lead.division}</SCBadge>
                      <SCBadge variant="info">{SOURCE_LABELS[lead.source]}</SCBadge>
                    </div>
                    {(lead.xHandle || matches[lead.id]?.matchedCoachXHandle) && (
                      <p className="text-[10px] text-blue-400 mt-1.5">
                        {lead.xHandle || matches[lead.id]?.matchedCoachXHandle}
                      </p>
                    )}
                    {status !== "responded" && (
                      <SCButton
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-[10px]"
                        disabled={advancing === lead.id}
                        onClick={() => advanceLead(lead)}
                      >
                        {advancing === lead.id ? (
                          <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
                        ) : (
                          <>
                            Advance
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </>
                        )}
                      </SCButton>
                    )}
                  </SCGlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <SCGlassCard variant="strong" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Add Lead Manually</h3>
              <button onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <SCInput placeholder="Coach Name" value={newLead.coachName} onChange={(e) => setNewLead({ ...newLead, coachName: e.target.value })} />
              <SCInput placeholder="School Name" value={newLead.schoolName} onChange={(e) => setNewLead({ ...newLead, schoolName: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <SCInput placeholder="Division (e.g., D1 FBS)" value={newLead.division} onChange={(e) => setNewLead({ ...newLead, division: e.target.value })} />
                <SCInput placeholder="Conference" value={newLead.conference} onChange={(e) => setNewLead({ ...newLead, conference: e.target.value })} />
              </div>
              <SCInput placeholder="X Handle (optional)" value={newLead.xHandle} onChange={(e) => setNewLead({ ...newLead, xHandle: e.target.value })} />
              <SCInput placeholder="Notes (optional)" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
              <SCButton variant="primary" className="w-full" onClick={handleAddLead} disabled={!newLead.coachName || !newLead.schoolName}>
                Add Lead
              </SCButton>
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Scan NCSA Dialog */}
      {scanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <SCGlassCard variant="strong" className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Import NCSA HTML</h3>
              <button onClick={() => setScanOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Fallback only. The main button now runs the authenticated NCSA sync automatically. Use this only if you need to paste exported HTML by hand.
              </p>
              <textarea
                className="w-full h-48 rounded-lg border border-sc-border bg-white/5 p-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                placeholder="Paste NCSA page HTML here..."
                value={scanHtml}
                onChange={(e) => setScanHtml(e.target.value)}
              />
              <SCButton variant="primary" className="w-full" onClick={handleScan} disabled={!scanHtml.trim() || scanning}>
                {scanning ? (
                  <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">search</span>
                )}
                {scanning ? "Scanning..." : "Scan for Leads"}
              </SCButton>
            </div>
          </SCGlassCard>
        </div>
      )}
    </div>
  );
}
