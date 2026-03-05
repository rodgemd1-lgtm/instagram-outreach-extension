"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit3, Clock, Image } from "lucide-react";
import { cn, getPillarLabel } from "@/lib/utils";

interface PostDraft {
  id: string;
  content: string;
  pillar: string;
  hashtags: string[];
  bestTime: string;
  status: string;
  mediaSuggestion?: string;
}

// Sample drafts for demonstration
const sampleDrafts: PostDraft[] = [
  {
    id: "draft-1",
    content: "Back to work this Monday. Film review from Friday's game + footwork drills in the weight room. Every rep counts.\n\nFull film: [NCSA LINK]\n#2028Recruit #FootballRecruiting #OL #PutInTheWork #WisconsinFootball",
    pillar: "work_ethic",
    hashtags: ["#2028Recruit", "#FootballRecruiting", "#OL", "#PutInTheWork", "#WisconsinFootball"],
    bestTime: "6:30-8:00 AM CST",
    status: "draft",
    mediaSuggestion: "Training video — footwork drills or weight room session",
  },
  {
    id: "draft-2",
    content: "Drive block from Friday's game — working on finishing through the whistle. 6'4\" 285 and getting more physical every week.\n\nFull film: [NCSA LINK]\n#OL #OffensiveLine #FootballRecruiting #2028Recruit #Pewaukee",
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#FootballRecruiting", "#2028Recruit", "#Pewaukee"],
    bestTime: "3:30-5:00 PM CST",
    status: "draft",
    mediaSuggestion: "Native video — 15-30 second clip of drive block, trimmed tight",
  },
  {
    id: "draft-3",
    content: "Honor roll this semester. Balancing the books and the field — D1 programs want student-athletes.\n\n#2028Recruit #FootballRecruiting #WisconsinFootball",
    pillar: "character",
    hashtags: ["#2028Recruit", "#FootballRecruiting", "#WisconsinFootball"],
    bestTime: "12:00-1:00 PM CST",
    status: "draft",
    mediaSuggestion: "Photo — academic achievement or team group photo",
  },
];

export function PostQueue() {
  const [drafts, setDrafts] = useState<PostDraft[]>(sampleDrafts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function handleApprove(id: string) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved" } : d)));
  }

  function handleReject(id: string) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "rejected" } : d)));
  }

  function handleEdit(id: string, content: string) {
    setEditingId(id);
    setEditContent(content);
  }

  function saveEdit(id: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, content: editContent } : d))
    );
    setEditingId(null);
  }

  const pillarColor = (pillar: string) => {
    switch (pillar) {
      case "performance": return "performance";
      case "work_ethic": return "work_ethic";
      case "character": return "character";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{drafts.filter((d) => d.status === "draft").length}</p>
            <p className="text-xs text-slate-500">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{drafts.filter((d) => d.status === "approved").length}</p>
            <p className="text-xs text-slate-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{drafts.filter((d) => d.status === "posted").length}</p>
            <p className="text-xs text-slate-500">Posted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{drafts.filter((d) => d.status === "rejected").length}</p>
            <p className="text-xs text-slate-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Draft Cards */}
      <div className="space-y-4">
        {drafts.map((draft) => (
          <Card key={draft.id} className={cn(draft.status === "rejected" && "opacity-50")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={pillarColor(draft.pillar) as "performance" | "work_ethic" | "character"}>
                    {getPillarLabel(draft.pillar)}
                  </Badge>
                  <Badge variant={draft.status === "approved" ? "approved" : draft.status === "rejected" ? "rejected" : "draft"}>
                    {draft.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {draft.bestTime}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === draft.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(draft.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{draft.content}</p>
                  {draft.mediaSuggestion && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded p-2">
                      <Image className="h-3 w-3" />
                      <span>{draft.mediaSuggestion}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {draft.hashtags.map((tag) => (
                      <span key={tag} className="text-xs text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            {draft.status === "draft" && editingId !== draft.id && (
              <CardFooter className="gap-2">
                <Button size="sm" variant="success" onClick={() => handleApprove(draft.id)}>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(draft.id, draft.content)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(draft.id)}>
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
