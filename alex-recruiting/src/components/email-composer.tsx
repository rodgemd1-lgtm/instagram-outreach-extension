"use client";

import { useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";
import { SCBadge } from "@/components/sc/sc-badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TemplateType =
  | "initial_outreach"
  | "camp_followup"
  | "film_share"
  | "academic_highlight"
  | "visit_request";

interface GeneratedEmail {
  subject: string;
  body: string;
}

interface SendResult {
  status: "queued" | "draft" | "error";
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Template definitions                                               */
/* ------------------------------------------------------------------ */

const TEMPLATES: {
  type: TemplateType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: "initial_outreach",
    label: "Initial Outreach",
    icon: "waving_hand",
    description: "First contact introducing Jacob to the coaching staff",
  },
  {
    type: "camp_followup",
    label: "Camp Follow-Up",
    icon: "sports",
    description: "Follow up after attending a camp or clinic",
  },
  {
    type: "film_share",
    label: "Film Share",
    icon: "movie",
    description: "Share game or practice film with a coach",
  },
  {
    type: "academic_highlight",
    label: "Academic Highlight",
    icon: "school",
    description: "Showcase GPA, test scores, and academic achievements",
  },
  {
    type: "visit_request",
    label: "Visit Request",
    icon: "location_on",
    description: "Request an unofficial or official campus visit",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EmailComposer() {
  // --- form state ---
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("initial_outreach");
  const [coachName, setCoachName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [customContext, setCustomContext] = useState("");

  // --- async state ---
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<GeneratedEmail | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- generate preview ---------- */
  const handleGenerate = async () => {
    if (!coachName.trim() || !schoolName.trim()) {
      setError("Coach name and school name are required.");
      return;
    }

    setGenerating(true);
    setError(null);
    setSendResult(null);

    try {
      const res = await fetch("/api/outreach/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          coachName: coachName.trim(),
          schoolName: schoolName.trim(),
          templateType: selectedTemplate,
          ...(customContext.trim() && { customContext: customContext.trim() }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setPreview({ subject: data.subject, body: data.body });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setGenerating(false);
    }
  };

  /* ---------- queue / save ---------- */
  const handleSend = async (action: "queue" | "draft") => {
    if (!preview) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/outreach/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          coachName: coachName.trim(),
          schoolName: schoolName.trim(),
          templateType: selectedTemplate,
          subject: preview.subject,
          body: preview.body,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setSendResult({
        status: action === "queue" ? "queued" : "draft",
        message:
          data.message ??
          (action === "queue"
            ? "Email queued for sending"
            : "Draft saved successfully"),
      });
    } catch (err) {
      setSendResult({
        status: "error",
        message: err instanceof Error ? err.message : "Operation failed",
      });
    } finally {
      setSending(false);
    }
  };

  /* ---------- reset ---------- */
  const handleReset = () => {
    setCoachName("");
    setSchoolName("");
    setCustomContext("");
    setPreview(null);
    setSendResult(null);
    setError(null);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* Header */}
      <SCPageHeader
        title="Email Composer"
        subtitle="Generate and send personalized outreach emails to college coaches"
        kicker="Outreach"
        actions={
          <SCButton variant="ghost" size="sm" onClick={handleReset}>
            <span className="material-symbols-outlined text-[16px]">
              restart_alt
            </span>
            Reset
          </SCButton>
        }
      />

      {/* Error banner */}
      {error && (
        <SCGlassCard className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">
              error
            </span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </SCGlassCard>
      )}

      {/* Template selector */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Select Template
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TEMPLATES.map((t) => {
            const isActive = selectedTemplate === t.type;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setSelectedTemplate(t.type)}
                className={`
                  text-left p-4 rounded-xl border transition-all
                  ${
                    isActive
                      ? "bg-sc-primary/10 border-sc-primary/50 ring-1 ring-sc-primary/30"
                      : "bg-white/5 border-sc-border hover:bg-white/10 hover:border-sc-border-strong"
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined text-[24px] mb-2 block ${
                    isActive ? "text-sc-primary" : "text-slate-400"
                  }`}
                >
                  {t.icon}
                </span>
                <p
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {t.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coach info + context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <SCGlassCard className="p-6 space-y-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Coach Details
          </p>

          <SCInput
            label="Coach Name"
            icon="person"
            placeholder="e.g. Coach John Smith"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
          />

          <SCInput
            label="School Name"
            icon="account_balance"
            placeholder="e.g. University of Wisconsin"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />

          <div className="w-full">
            <label
              htmlFor="custom-context"
              className="sc-label mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Custom Context (Optional)
            </label>
            <textarea
              id="custom-context"
              rows={4}
              placeholder="Add personal details, recent interactions, camp dates, etc."
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="w-full bg-white/5 border border-sc-border rounded-lg py-2 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sc-primary/50 focus:border-sc-primary/50 transition-colors resize-none"
            />
          </div>

          <SCButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={generating || !coachName.trim() || !schoolName.trim()}
          >
            {generating ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Generating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  auto_awesome
                </span>
                Generate Preview
              </>
            )}
          </SCButton>
        </SCGlassCard>

        {/* Right: preview pane */}
        <SCGlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Email Preview
            </p>
            {preview && (
              <SCBadge variant="success">Ready</SCBadge>
            )}
          </div>

          {preview ? (
            <div className="space-y-4">
              {/* Subject line */}
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Subject
                </p>
                <p className="text-sm font-semibold text-white bg-white/5 rounded-lg px-4 py-2 border border-sc-border">
                  {preview.subject}
                </p>
              </div>

              {/* Body */}
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Body
                </p>
                <div className="text-sm text-slate-300 bg-white/5 rounded-lg px-4 py-3 border border-sc-border whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                  {preview.body}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <SCButton
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleSend("queue")}
                  disabled={sending}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    send
                  </span>
                  {sending ? "Sending..." : "Queue to Send"}
                </SCButton>
                <SCButton
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleSend("draft")}
                  disabled={sending}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    save
                  </span>
                  Save Draft
                </SCButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3">
                mail
              </span>
              <p className="text-sm text-slate-500 font-medium">
                No preview yet
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Select a template and fill in coach details, then generate a
                preview
              </p>
            </div>
          )}
        </SCGlassCard>
      </div>

      {/* Send result status */}
      {sendResult && (
        <SCGlassCard
          className={`p-4 border-l-4 ${
            sendResult.status === "error"
              ? "border-l-red-500"
              : sendResult.status === "queued"
                ? "border-l-blue-500"
                : "border-l-emerald-500"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined ${
                sendResult.status === "error"
                  ? "text-red-400"
                  : sendResult.status === "queued"
                    ? "text-blue-400"
                    : "text-emerald-400"
              }`}
            >
              {sendResult.status === "error"
                ? "error"
                : sendResult.status === "queued"
                  ? "schedule_send"
                  : "check_circle"}
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                {sendResult.status === "error"
                  ? "Error"
                  : sendResult.status === "queued"
                    ? "Queued"
                    : "Draft Saved"}
              </p>
              <p className="text-sm text-white">{sendResult.message}</p>
            </div>
            <SCBadge
              variant={
                sendResult.status === "error"
                  ? "danger"
                  : sendResult.status === "queued"
                    ? "info"
                    : "success"
              }
              className="ml-auto"
            >
              {sendResult.status}
            </SCBadge>
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}
