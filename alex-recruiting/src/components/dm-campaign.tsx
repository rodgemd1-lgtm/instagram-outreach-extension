"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Edit3, CheckCircle2, Mail } from "lucide-react";
import { dmTemplates } from "@/lib/data/templates";
import { targetSchools } from "@/lib/data/target-schools";

interface DMDraft {
  id: string;
  coachName: string;
  schoolName: string;
  tier: string;
  templateType: string;
  content: string;
  status: "drafted" | "approved" | "sent" | "responded";
}

// Generate initial DM drafts for Tier 3 coaches (Wave 0)
const tier3Schools = targetSchools.filter((s) => s.priorityTier === "Tier 3");
const initialDMs: DMDraft[] = tier3Schools.map((school, i) => ({
  id: `dm-${i}`,
  coachName: `OL Coach — ${school.name}`,
  schoolName: school.name,
  tier: "Tier 3",
  templateType: "intro",
  content: dmTemplates.intro.template
    .replace("{COACH_LAST_NAME}", "Coach")
    .replace("{SCHOOL_NAME}", school.name)
    .replace("{NCSA_LINK}", "[NCSA LINK]"),
  status: "drafted",
}));

export function DMCampaign() {
  const [dms, setDMs] = useState<DMDraft[]>(initialDMs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function handleApprove(id: string) {
    setDMs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved" } : d)));
  }

  function handleSend(id: string) {
    setDMs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "sent" } : d)));
  }

  function startEdit(id: string, content: string) {
    setEditingId(id);
    setEditContent(content);
  }

  function saveEdit(id: string) {
    setDMs((prev) => prev.map((d) => (d.id === id ? { ...d, content: editContent } : d)));
    setEditingId(null);
  }

  const waves = [
    { name: "Wave 0 — Immediate", tier: "Tier 3", description: "D2/GLIAC/NSIC coaches — open DMs, fast movers" },
    { name: "Wave 1 — Day 30", tier: "Tier 2 FCS", description: "FCS/MVFC coaches — active on X" },
    { name: "Wave 2 — Day 60", tier: "Tier 2 MAC", description: "MAC coaches — recruit Midwest OL" },
    { name: "Wave 3 — Day 90", tier: "Tier 1", description: "Big Ten/Big 12 — brand building" },
  ];

  return (
    <div className="space-y-6">
      {/* DM Wave Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {waves.map((wave) => (
          <Card key={wave.name}>
            <CardContent className="p-4">
              <p className="text-sm font-semibold">{wave.name}</p>
              <p className="text-xs text-slate-500 mt-1">{wave.description}</p>
              <Badge variant="secondary" className="mt-2 text-[10px]">{wave.tier}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">DM Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Object.entries(dmTemplates).map(([key, template]) => (
              <div key={key} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <p className="text-sm font-medium">{template.name}</p>
                </div>
                <p className="text-xs text-slate-500">{template.useCase}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DM Queue */}
      <div>
        <h3 className="text-sm font-semibold mb-3">DM Queue — Wave 0 (Tier 3 D2 Coaches)</h3>
        <div className="space-y-3">
          {dms.map((dm) => (
            <Card key={dm.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{dm.coachName}</p>
                    <Badge variant="tier3">{dm.tier}</Badge>
                    <Badge variant={dm.status === "sent" ? "sent" : dm.status === "approved" ? "approved" : "draft"}>
                      {dm.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{dm.schoolName}</p>
                </div>

                {editingId === dm.id ? (
                  <div className="space-y-2">
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(dm.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">{dm.content}</p>
                )}
              </CardContent>
              {dm.status === "drafted" && editingId !== dm.id && (
                <CardFooter className="gap-2 pt-0">
                  <Button size="sm" variant="success" onClick={() => handleApprove(dm.id)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(dm.id, dm.content)}>
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </CardFooter>
              )}
              {dm.status === "approved" && (
                <CardFooter className="gap-2 pt-0">
                  <Button size="sm" onClick={() => handleSend(dm.id)}>
                    <Send className="h-3 w-3 mr-1" /> Send via X API
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
