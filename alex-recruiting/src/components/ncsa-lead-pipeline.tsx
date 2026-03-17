"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  ArrowRight,
  Eye,
  Mail,
  Tent,
  User,
  Loader2,
  Check,
  Copy,
} from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  new: "border-t-blue-500",
  researched: "border-t-amber-500",
  followed: "border-t-purple-500",
  dm_drafted: "border-t-cyan-500",
  dm_sent: "border-t-green-500",
  responded: "border-t-emerald-500",
};

const SOURCE_ICONS: Record<string, typeof Eye> = {
  profile_view: Eye,
  camp_invite: Tent,
  message: Mail,
  manual: User,
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

export function NCSALeadPipeline() {
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

  // Form state for adding leads
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NCSA Lead Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} total leads in pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleLiveSync} disabled={syncing}>
            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            {syncing ? "Syncing..." : "Sync NCSA"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setScanOpen(true)}>
            <Search className="h-3 w-3" /> Import HTML
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3" /> Add Lead
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            { label: "Searches", value: summary.searchesDetected },
            { label: "Views", value: summary.schoolsThatViewedProfile },
            { label: "Follows", value: summary.followsDetected },
            { label: "Messages", value: summary.messagesReceived },
            { label: "Camp Invites", value: summary.campInvitesReceived },
            { label: "Reached Out", value: summary.schoolsThatReachedOut },
            { label: "X Ready", value: summary.xReadyLeads },
            { label: "Follow Ready", value: summary.followReadyLeads },
          ].map((metric) => (
            <Card key={metric.label} className="shadow-sm">
              <CardContent className="p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{metric.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {actionableLeads.length > 0 && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">X-ready leads</h2>
            <p className="text-sm text-slate-500 mt-1">
              These leads already map to an X handle, so you can follow the coach and copy a thank-you draft immediately.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {actionableLeads.map(({ lead, match }) => (
              <Card key={lead.id} className="shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lead.schoolName}</p>
                    <p className="text-xs text-slate-500">
                      {match?.matchedCoachName || lead.coachName}
                      {match?.matchedCoachTitle ? ` • ${match.matchedCoachTitle}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">{match?.matchedCoachXHandle}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Badge variant="outline">{SOURCE_LABELS[lead.source]}</Badge>
                    <Badge variant="secondary">{match?.matchConfidence || "low"} confidence</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{lead.sourceDetail}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={actingLeadId === lead.id || match?.matchedCoachFollowStatus === "followed"}
                      onClick={() => followLead(lead.id)}
                    >
                      {actingLeadId === lead.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : match?.matchedCoachFollowStatus === "followed" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : null}
                      {match?.matchedCoachFollowStatus === "followed" ? "Following" : "Follow on X"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={actingLeadId === lead.id}
                      onClick={() => copyDraft(lead.id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Columns */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATUS_ORDER.map((status) => (
            <div key={status}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {leadsByStatus[status]?.length || 0}
                </Badge>
              </div>
              <div className={`space-y-2 min-h-[100px] rounded-lg border border-slate-100 border-t-2 ${STATUS_COLORS[status]} bg-slate-50/50 p-2`}>
                {(leadsByStatus[status] || []).map((lead) => {
                  const SourceIcon = SOURCE_ICONS[lead.source] || User;
                  return (
                    <Card key={lead.id} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{lead.coachName}</p>
                            <p className="text-xs text-slate-500 truncate">{lead.schoolName}</p>
                          </div>
                          <SourceIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="secondary" className="text-[9px]">{lead.division}</Badge>
                          <Badge variant="outline" className="text-[9px]">{SOURCE_LABELS[lead.source]}</Badge>
                        </div>
                        {lead.xHandle && (
                          <p className="text-[10px] text-blue-600 mt-1.5">{lead.xHandle}</p>
                        )}
                        {matches[lead.id]?.matchedCoachXHandle && !lead.xHandle && (
                          <p className="text-[10px] text-blue-600 mt-1.5">
                            {matches[lead.id]?.matchedCoachXHandle}
                          </p>
                        )}
                        {status !== "responded" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 h-7 text-[10px] gap-1"
                            disabled={advancing === lead.id}
                            onClick={() => advanceLead(lead)}
                          >
                            {advancing === lead.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                Advance <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lead Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Coach Name" value={newLead.coachName} onChange={(e) => setNewLead({ ...newLead, coachName: e.target.value })} />
            <Input placeholder="School Name" value={newLead.schoolName} onChange={(e) => setNewLead({ ...newLead, schoolName: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Division (e.g., D1 FBS)" value={newLead.division} onChange={(e) => setNewLead({ ...newLead, division: e.target.value })} />
              <Input placeholder="Conference" value={newLead.conference} onChange={(e) => setNewLead({ ...newLead, conference: e.target.value })} />
            </div>
            <Input placeholder="X Handle (optional)" value={newLead.xHandle} onChange={(e) => setNewLead({ ...newLead, xHandle: e.target.value })} />
            <Input placeholder="Notes (optional)" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
            <Button className="w-full" onClick={handleAddLead} disabled={!newLead.coachName || !newLead.schoolName}>
              Add Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan NCSA Dialog */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import NCSA HTML</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-500">
              Fallback only. The main button now runs the authenticated NCSA sync automatically. Use this only if you need to paste exported HTML by hand.
            </p>
            <textarea
              className="w-full h-48 rounded-lg border border-slate-200 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste NCSA page HTML here..."
              value={scanHtml}
              onChange={(e) => setScanHtml(e.target.value)}
            />
            <Button className="w-full gap-1.5" onClick={handleScan} disabled={!scanHtml.trim() || scanning}>
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scanning ? "Scanning..." : "Scan for Leads"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
