"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Save, CheckCircle } from "lucide-react";
import { SlideOver } from "./slide-over";
import type { Coach, DMMessage } from "@/lib/types";

interface DMComposerProps {
  open: boolean;
  onClose: () => void;
  coaches: Coach[];
  existingDM?: DMMessage | null;
  preselectedCoachId?: string | null;
  onSaved: () => void;
}

const TEMPLATES = [
  {
    type: "intro",
    label: "Intro",
    template: `Coach {coachName},\n\nMy name is Jacob Rodgers \u2014 Class of 2029 OL/DL out of Pewaukee HS, Wisconsin. I've been following {schoolName}'s program and love what you're building.\n\nI'd love to get on your radar. Here's my film: https://alex-recruiting.vercel.app/recruit\n\n6'4" 285 | 445 DL | 265 Bench | 350 Squat\n\nThank you for your time, Coach.`,
  },
  {
    type: "follow_up",
    label: "Follow-up",
    template: `Coach {coachName},\n\nI reached out a few weeks ago \u2014 wanted to follow up. I've been putting in work this spring and have updated film on my profile.\n\nWould love the chance to visit campus or attend a camp this summer if you have availability.\n\nhttps://alex-recruiting.vercel.app/recruit`,
  },
  {
    type: "value_add",
    label: "Value Add",
    template: `Coach {coachName},\n\nWanted to share an update \u2014 just posted new training film from this week. Numbers continue to climb (445 DL, 265 Bench, 350 Squat as a freshman).\n\nI'll be at IMG Lineman Camp late March. Would be great to connect.\n\nhttps://alex-recruiting.vercel.app/recruit`,
  },
  {
    type: "soft_close",
    label: "Soft Close",
    template: `Coach {coachName},\n\nI'm putting together my camp schedule for summer 2026. Does {schoolName} have any prospect camps or events I should know about?\n\nI'd love the opportunity to work out in front of your staff.\n\nThank you, Coach.`,
  },
];

export function DMComposer({ open, onClose, coaches, existingDM, preselectedCoachId, onSaved }: DMComposerProps) {
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [coachSearch, setCoachSearch] = useState("");
  const [templateType, setTemplateType] = useState("intro");
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  function applyTemplate(type: string, coach: Coach | null) {
    const tpl = TEMPLATES.find((t) => t.type === type);
    if (!tpl || !coach) return;
    const filled = tpl.template
      .replace(/\{coachName\}/g, coach.name.split(" ").pop() || coach.name)
      .replace(/\{schoolName\}/g, coach.schoolName);
    setContent(filled);
    setTemplateType(type);
  }

  useEffect(() => {
    if (existingDM) {
      setSelectedCoachId(existingDM.coachId);
      setContent(existingDM.content);
      setTemplateType(existingDM.templateType);
    } else if (preselectedCoachId) {
      setSelectedCoachId(preselectedCoachId);
      const coach = coaches.find((c) => c.id === preselectedCoachId);
      if (coach) applyTemplate("intro", coach);
    } else {
      setSelectedCoachId("");
      setContent("");
      setTemplateType("intro");
    }
    setReviewed(false);
  }, [existingDM, preselectedCoachId, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCoachSelect = (coachId: string) => {
    setSelectedCoachId(coachId);
    const coach = coaches.find((c) => c.id === coachId);
    if (coach) applyTemplate(templateType, coach);
  };

  const handleSave = useCallback(async (status: "drafted" | "approved") => {
    if (!selectedCoach) return;
    setSaving(true);
    try {
      await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          coachName: selectedCoach.name,
          schoolName: selectedCoach.schoolName,
          templateType,
          content,
          status,
          sendNow: false,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save DM:", err);
    } finally {
      setSaving(false);
    }
  }, [selectedCoach, templateType, content, onSaved, onClose]);

  const filteredCoaches = coachSearch
    ? coaches.filter((c) => c.name.toLowerCase().includes(coachSearch.toLowerCase()) || c.schoolName.toLowerCase().includes(coachSearch.toLowerCase()))
    : coaches.slice(0, 20);

  return (
    <SlideOver open={open} onClose={onClose} title={existingDM ? "Edit DM" : "New DM"}>
      <div className="space-y-5">
        {/* Coach selector */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">To Coach</label>
          {selectedCoach ? (
            <div className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-surface-raised p-3">
              <div>
                <p className="text-sm font-medium text-dash-text">{selectedCoach.name}</p>
                <p className="text-xs text-dash-muted">{selectedCoach.schoolName} &middot; {selectedCoach.division}</p>
              </div>
              <button type="button" onClick={() => setSelectedCoachId("")} className="text-xs text-dash-accent hover:underline">Change</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Search coaches..."
                className="w-full rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
              />
              <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-dash-border bg-dash-surface">
                {filteredCoaches.map((coach) => (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => handleCoachSelect(coach.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-dash-surface-raised"
                  >
                    <span className="text-sm text-dash-text">{coach.name}</span>
                    <span className="text-xs text-dash-muted">{coach.schoolName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template picker */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Template</label>
          <div className="flex gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                type="button"
                onClick={() => { setTemplateType(tpl.type); if (selectedCoach) applyTemplate(tpl.type, selectedCoach); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${templateType === tpl.type ? "bg-dash-accent text-white" : "border border-dash-border text-dash-text-secondary hover:bg-dash-surface-raised"}`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 font-mono text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            placeholder="Select a coach and template to generate a message..."
          />
          <p className="mt-1 text-right text-xs text-dash-muted">{content.length} chars</p>
        </div>

        {/* Family review gate */}
        <label className="flex items-center gap-3 rounded-lg border border-dash-border bg-dash-surface-raised p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            className="h-4 w-4 rounded border-dash-border accent-dash-accent"
          />
          <div>
            <p className="text-sm font-medium text-dash-text">Dad has reviewed this message</p>
            <p className="text-xs text-dash-muted">Required before queueing</p>
          </div>
          {reviewed && <CheckCircle className="ml-auto h-4 w-4 text-dash-success" />}
        </label>

        {/* Actions */}
        <div className="flex gap-2 border-t border-dash-border pt-4">
          <button
            type="button"
            onClick={() => handleSave("drafted")}
            disabled={saving || !content || !selectedCoach}
            className="flex items-center gap-2 rounded-lg border border-dash-border px-4 py-2 text-sm font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("approved")}
            disabled={saving || !content || !selectedCoach || !reviewed}
            className="flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Approve & Queue
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
