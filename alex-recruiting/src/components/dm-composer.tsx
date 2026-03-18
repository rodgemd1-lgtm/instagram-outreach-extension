"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Coach, DMMessage } from "@/lib/types";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCButton } from "@/components/sc/sc-button";

interface DMComposerProps {
  coaches: Coach[];
  selectedDM: DMMessage | null;
  preselectedCoachId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const TEMPLATE_TYPES = [
  { value: "intro", label: "Introduction" },
  { value: "followup", label: "Follow-Up" },
  { value: "direct", label: "Direct Ask" },
  { value: "manual", label: "Manual" },
] as const;

export function DMComposer({ coaches, selectedDM, preselectedCoachId, onClose, onSaved }: DMComposerProps) {
  const [coachId, setCoachId] = useState(selectedDM?.coachId || preselectedCoachId || "");
  const [coachName, setCoachName] = useState(selectedDM?.coachName || "");
  const [schoolName, setSchoolName] = useState(selectedDM?.schoolName || "");
  const [templateType, setTemplateType] = useState(selectedDM?.templateType || "intro");
  const [content, setContent] = useState(selectedDM?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort coaches alphabetically for the dropdown
  const sortedCoaches = useMemo(
    () => [...coaches].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [coaches]
  );

  // Auto-fill coach name and school when coach is selected
  const handleCoachSelect = useCallback(
    (id: string) => {
      setCoachId(id);
      const coach = coaches.find((c) => c.id === id);
      if (coach) {
        setCoachName(coach.name);
        setSchoolName(coach.schoolName);
      }
    },
    [coaches]
  );

  // Pre-fill from preselectedCoachId on mount
  useEffect(() => {
    if (preselectedCoachId && !selectedDM) {
      handleCoachSelect(preselectedCoachId);
    }
  }, [preselectedCoachId, selectedDM, handleCoachSelect]);

  const handleSave = async (sendNow: boolean) => {
    if (!coachName.trim() || !schoolName.trim() || !content.trim()) {
      setError("Coach name, school, and message are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coachId || undefined,
          coachName: coachName.trim(),
          schoolName: schoolName.trim(),
          templateType,
          content: content.trim(),
          sendNow,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save DM");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!selectedDM;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-sc-bg border-l border-sc-border overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-black text-white">
            {isEditing ? "Edit DM" : "New DM"}
          </h2>
          <SCButton variant="ghost" size="sm" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </SCButton>
        </div>

        <div className="space-y-4">
          {/* Coach selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Coach
            </label>
            {coaches.length > 0 ? (
              <select
                value={coachId}
                onChange={(e) => handleCoachSelect(e.target.value)}
                className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
              >
                <option value="" className="bg-gray-900">Select a coach...</option>
                {sortedCoaches.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-900">
                    {c.name} — {c.schoolName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  placeholder="Coach name"
                  className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                />
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="School name"
                  className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                />
              </div>
            )}
            {coachId && (
              <p className="text-xs text-slate-500 mt-1">
                {coachName} — {schoolName}
              </p>
            )}
          </div>

          {/* Template type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Template
            </label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplateType(t.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    templateType === t.value
                      ? "border-sc-primary bg-sc-primary/20 text-white"
                      : "border-sc-border bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50 resize-y"
              placeholder="Draft your message to the coach..."
              rows={8}
            />
            <p className={`text-xs mt-1 ${charCount > 9000 ? "text-amber-400" : "text-slate-500"}`}>
              {charCount.toLocaleString()} / 10,000
            </p>
          </div>

          {/* Error */}
          {error && (
            <SCGlassCard className="p-3 border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </SCGlassCard>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SCButton
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {saving ? "Saving..." : "Save Draft"}
            </SCButton>
            <SCButton
              onClick={() => handleSave(true)}
              disabled={saving}
              variant="ghost"
              className="flex-1"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Send Now
            </SCButton>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Send Now requires X API OAuth credentials configured in Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
