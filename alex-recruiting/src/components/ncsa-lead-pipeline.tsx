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

export function NCSALeadPipeline() {
  const [leads, setLeads] = useState<NCSALead[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanHtml, setScanHtml] = useState("");
  const [scanning, setScanning] = useState(false);
  const [advancing, setAdvancing] = useState<string | null>(null);

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

  const leadsByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.outreachStatus === s);
    return acc;
  }, {} as Record<string, NCSALead[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NCSA Lead Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} total leads in pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setScanOpen(true)}>
            <Search className="h-3 w-3" /> Scan NCSA
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3" /> Add Lead
          </Button>
        </div>
      </div>

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
            <DialogTitle>Scan NCSA Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-500">
              Log into NCSA in your browser, navigate to your dashboard, then copy the page source (Ctrl+U / Cmd+U) and paste it below.
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
