"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { SlideOver } from "@/components/dashboard/slide-over";
import { Badge } from "@/components/dashboard/badge";
import type { Coach, DMMessage } from "@/lib/types";

// ─── Template content ───────────────────────────────────────────────────────
const TEMPLATES: Record<string, { label: string; body: string }> = {
  intro: {
    label: "Intro",
    body: `Coach {LAST_NAME}, my name is Jacob Rodgers. I'm a Class of 2029 OL from Pewaukee High School in Wisconsin (6'4", 285). I've been following {SCHOOL} and really admire the way your offensive line plays. I'd love the opportunity to learn more about your program and what you look for in a lineman. Here is a link to my film: https://www.hudl.com/profile/jacobrodgers`,
  },
  postCamp: {
    label: "Post-Camp",
    body: `Coach {LAST_NAME}, just got back from camp and wanted to stay on your radar. I learned a ton working with your staff and the competitive atmosphere at {SCHOOL} is exactly what I'm looking for. I'll keep working and would love any feedback on areas to improve. Thank you for your time.`,
  },
  postFollow: {
    label: "After Follow",
    body: `Coach {LAST_NAME}, thank you for the follow! I've had {SCHOOL} on my radar and it means a lot that you're keeping an eye on my development. I'm putting in the work this offseason and would love to visit campus when the time is right.`,
  },
  valueAdd: {
    label: "Value Add",
    body: `Coach {LAST_NAME}, wanted to share some updated film and measurables from this offseason. I've been focused on improving my footwork and pad level. Here's my latest highlight reel: https://www.hudl.com/profile/jacobrodgers. I'd appreciate any feedback you have for me. Thank you, Coach.`,
  },
};

// ─── Props ──────────────────────────────────────────────────────────────────
interface DMComposerProps {
  open: boolean;
  onClose: () => void;
  coaches: Coach[];
  editDM?: DMMessage;
  onSaved: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName;
}

function tierVariant(tier: string): "accent" | "success" | "muted" {
  switch (tier) {
    case "Tier 1":
      return "accent";
    case "Tier 2":
      return "success";
    default:
      return "muted";
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export function DMComposer({
  open,
  onClose,
  coaches,
  editDM,
  onSaved,
}: DMComposerProps) {
  // Coach selector state
  const [coachSearch, setCoachSearch] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Message state
  const [templateKey, setTemplateKey] = useState<string>("");
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Populate from editDM when opening
  useEffect(() => {
    if (!open) return;

    if (editDM) {
      const match = coaches.find((c) => c.id === editDM.coachId);
      setSelectedCoach(match ?? null);
      setContent(editDM.content);
      setTemplateKey(editDM.templateType ?? "");
      setCoachSearch("");
    } else {
      setSelectedCoach(null);
      setContent("");
      setTemplateKey("");
      setCoachSearch("");
    }
    setReviewed(false);
    setSaving(false);
  }, [open, editDM, coaches]);

  // Filtered coaches for dropdown
  const filtered = useMemo(() => {
    if (!coachSearch.trim()) return coaches.slice(0, 8);
    const q = coachSearch.toLowerCase();
    return coaches
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.schoolName.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [coaches, coachSearch]);

  // Apply template
  const applyTemplate = useCallback(
    (key: string) => {
      setTemplateKey(key);
      const tpl = TEMPLATES[key];
      if (!tpl) return;
      const coach = selectedCoach;
      let text = tpl.body;
      if (coach) {
        text = text
          .replace(/\{LAST_NAME\}/g, getLastName(coach.name))
          .replace(/\{SCHOOL\}/g, coach.schoolName);
      }
      setContent(text);
    },
    [selectedCoach]
  );

  // Select a coach
  const selectCoach = useCallback(
    (coach: Coach) => {
      setSelectedCoach(coach);
      setCoachSearch("");
      setShowDropdown(false);
      // Re-apply current template with new coach
      if (templateKey) {
        const tpl = TEMPLATES[templateKey];
        if (tpl) {
          setContent(
            tpl.body
              .replace(/\{LAST_NAME\}/g, getLastName(coach.name))
              .replace(/\{SCHOOL\}/g, coach.schoolName)
          );
        }
      }
    },
    [templateKey]
  );

  // Submit handler
  const submit = useCallback(
    async (action: "draft" | "approve" | "send") => {
      if (!selectedCoach || !content.trim()) return;
      setSaving(true);

      const body: Record<string, unknown> = {
        coachId: selectedCoach.id,
        coachName: selectedCoach.name,
        schoolName: selectedCoach.schoolName,
        templateType: templateKey || "manual",
        content: content.trim(),
        sendNow: action === "send",
        xHandle: selectedCoach.xHandle || undefined,
      };

      // For approve, we add status logic after save (the API defaults to drafted)
      try {
        const res = await fetch("/api/dms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          onSaved();
          onClose();
        }
      } catch {
        // Silently fail for now
      } finally {
        setSaving(false);
      }
    },
    [selectedCoach, content, templateKey, onSaved, onClose]
  );

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={editDM ? "Edit DM" : "Compose DM"}
      subtitle="Draft a direct message to a coach"
      wide
    >
      <div className="flex flex-col gap-6">
        {/* ── Coach selector ──────────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">
            Coach
          </label>

          {selectedCoach ? (
            <div className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-dash-text">
                  {selectedCoach.name}
                </span>
                <span className="text-xs text-dash-muted">
                  {selectedCoach.schoolName}
                </span>
                <Badge variant={tierVariant(selectedCoach.priorityTier)}>
                  {selectedCoach.priorityTier}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCoach(null);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="text-xs font-medium text-dash-accent hover:text-dash-accent-hover"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
              <input
                ref={searchRef}
                type="text"
                value={coachSearch}
                onChange={(e) => {
                  setCoachSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search coaches by name or school..."
                className="w-full rounded-lg border border-dash-border bg-dash-surface py-2.5 pl-9 pr-3 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
              />
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />

              {showDropdown && filtered.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-dash-border bg-dash-bg shadow-lg">
                  {filtered.map((coach) => (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => selectCoach(coach)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-dash-surface-raised"
                    >
                      <span className="text-sm font-medium text-dash-text">
                        {coach.name}
                      </span>
                      <span className="text-xs text-dash-muted">
                        {coach.schoolName}
                      </span>
                      <Badge
                        variant={tierVariant(coach.priorityTier)}
                        className="ml-auto"
                      >
                        {coach.priorityTier}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Template picker ─────────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">
            Template
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  templateKey === key
                    ? "bg-dash-accent text-white"
                    : "bg-dash-surface-raised text-dash-text-secondary hover:bg-dash-surface-raised/80"
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Message textarea ────────────────────────────────────────────── */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-dash-muted">
              Message
            </label>
            <span className="text-[10px] text-dash-muted">
              {content.length} chars
            </span>
          </div>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-lg border border-dash-border bg-dash-surface px-3 py-2.5 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
          />
        </div>

        {/* ── Family review gate ──────────────────────────────────────────── */}
        <label className="flex items-center gap-2.5 rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            className="h-4 w-4 rounded border-dash-border text-dash-accent focus:ring-dash-accent"
          />
          <span className="text-sm font-medium text-dash-text">
            Mike has reviewed this message
          </span>
        </label>

        {/* ── Action buttons ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 border-t border-dash-border pt-4">
          <button
            type="button"
            disabled={!selectedCoach || !content.trim() || saving}
            onClick={() => submit("draft")}
            className="rounded-lg border border-dash-border px-4 py-2 text-xs font-semibold text-dash-text transition-colors hover:bg-dash-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={!selectedCoach || !content.trim() || !reviewed || saving}
            onClick={() => submit("approve")}
            className="rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve &amp; Queue
          </button>
          <button
            type="button"
            disabled={!selectedCoach || !content.trim() || !reviewed || saving}
            onClick={() => submit("send")}
            className="rounded-lg bg-dash-success px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-dash-success/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send Now
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
