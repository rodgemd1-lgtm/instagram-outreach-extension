"use client";

import { useState, useCallback } from "react";
import { SCButton } from "@/components/sc/sc-button";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DMSenderProps {
  dmId: string;
  coachName: string;
  coachHandle?: string;
  message: string;
  onSent?: () => void;
}

type DeliveryStatus = "idle" | "confirming" | "sending" | "sent" | "queued" | "error" | "rate-limited";

interface SendResponse {
  status: "sent" | "queued" | "error";
  deliveryId?: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DMSender({ dmId, coachName, coachHandle, message, onSent }: DMSenderProps) {
  const [status, setStatus] = useState<DeliveryStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryMinutes, setRetryMinutes] = useState<number>(0);

  /* No handle state */
  if (!coachHandle) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <XIcon className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-500">
          No X handle found for {coachName}
        </span>
      </div>
    );
  }

  /* Send DM via API */
  const handleSend = useCallback(async () => {
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/dms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dmId, coachHandle, message }),
      });

      const data: SendResponse = await res.json();

      if (res.status === 429) {
        setStatus("rate-limited");
        // Try to parse retry time from response
        const retryAfter = res.headers.get("Retry-After");
        setRetryMinutes(retryAfter ? Math.ceil(parseInt(retryAfter, 10) / 60) : 5);
        return;
      }

      if (!res.ok || data.status === "error") {
        setStatus("error");
        setErrorMessage(data.error ?? "Failed to send DM");
        return;
      }

      setStatus(data.status);
      if (data.status === "sent") {
        onSent?.();
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Check your connection.");
    }
  }, [dmId, coachHandle, message, onSent]);

  /* Status display */
  const renderStatus = () => {
    switch (status) {
      case "sent":
        return (
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckIcon className="w-4 h-4" />
            <span className="text-xs font-bold">Sent</span>
          </div>
        );
      case "queued":
        return (
          <div className="flex items-center gap-1.5 text-yellow-500">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs font-bold">Queued</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 text-red-500">
            <XCircleIcon className="w-4 h-4" />
            <span className="text-xs font-bold">{errorMessage}</span>
          </div>
        );
      case "rate-limited":
        return (
          <div className="flex items-center gap-1.5 text-yellow-500">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs font-bold">
              Rate limited &mdash; try again in {retryMinutes} min
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Confirmation modal (inline) */}
      {status === "confirming" && (
        <SCGlassCard className="p-4 space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            Send this DM to{" "}
            <span className="text-white font-bold">@{coachHandle}</span>?
          </p>

          {/* Message preview */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6">
              {message}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SCButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              className="gap-1.5"
            >
              <XIcon className="w-3.5 h-3.5" />
              Confirm Send
            </SCButton>
            <SCButton
              variant="ghost"
              size="sm"
              onClick={() => setStatus("idle")}
            >
              Cancel
            </SCButton>
          </div>
        </SCGlassCard>
      )}

      {/* Send button + status */}
      <div className="flex items-center gap-3">
        {status === "idle" && (
          <SCButton
            variant="primary"
            size="sm"
            onClick={() => setStatus("confirming")}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
          >
            <XIcon className="w-3.5 h-3.5" />
            Send via X
          </SCButton>
        )}

        {status === "sending" && (
          <SCButton variant="secondary" size="sm" disabled className="gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </SCButton>
        )}

        {(status === "error" || status === "rate-limited") && (
          <SCButton
            variant="secondary"
            size="sm"
            onClick={() => setStatus("confirming")}
            className="gap-1.5"
          >
            <XIcon className="w-3.5 h-3.5" />
            Retry
          </SCButton>
        )}

        {renderStatus()}
      </div>
    </div>
  );
}
