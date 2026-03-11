"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Plus } from "lucide-react";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import type { DMCard } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { Coach, DMMessage } from "@/lib/types";

export default function OutreachPage() {
  const [dms, setDms] = useState<DMMessage[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editDM, setEditDM] = useState<DMMessage | undefined>();

  // ── Data fetching ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dmsRes, coachesRes] = await Promise.allSettled([
        fetch("/api/dms"),
        fetch("/api/coaches"),
      ]);

      if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
        const data = await dmsRes.value.json();
        setDms(data.dms ?? []);
      }

      if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
        const data = await coachesRes.value.json();
        setCoaches(data.coaches ?? []);
      }
    } catch {
      // Use fallback empty arrays
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Summary counts ────────────────────────────────────────────────────
  const queued = dms.filter(
    (d) => d.status === "drafted" || d.status === "not_sent"
  ).length;
  const sent = dms.filter((d) => d.status === "sent").length;
  const replied = dms.filter((d) => d.status === "responded").length;

  // ── Card click handler ────────────────────────────────────────────────
  const handleCardClick = useCallback(
    (card: DMCard) => {
      const match = dms.find((d) => d.id === card.id);
      if (match) {
        setEditDM(match);
        setComposerOpen(true);
      }
    },
    [dms]
  );

  // ── Composer callbacks ────────────────────────────────────────────────
  const openNewComposer = useCallback(() => {
    setEditDM(undefined);
    setComposerOpen(true);
  }, []);

  const handleComposerClose = useCallback(() => {
    setComposerOpen(false);
    setEditDM(undefined);
  }, []);

  const handleSaved = useCallback(() => {
    void loadData();
  }, [loadData]);

  // ── Kanban data ───────────────────────────────────────────────────────
  const kanbanDMs: DMCard[] = dms.map((dm) => ({
    id: dm.id,
    coachId: dm.coachId,
    coachName: dm.coachName,
    schoolName: dm.schoolName,
    content: dm.content,
    templateType: dm.templateType,
    status: dm.status,
    sentAt: dm.sentAt,
    respondedAt: dm.respondedAt,
    createdAt: dm.createdAt,
  }));

  const kanbanCoaches = coaches.map((c) => ({
    id: c.id,
    priorityTier: c.priorityTier,
  }));

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dash-text">
            DM Outreach
          </h1>
          <p className="mt-1 text-sm text-dash-muted">
            {loading
              ? "Loading outreach pipeline..."
              : `${queued} queued \u00B7 ${sent} sent \u00B7 ${replied} replied`}
          </p>
        </div>
        <button
          type="button"
          onClick={openNewComposer}
          className="flex items-center gap-1.5 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-dash-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          New DM
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-dash-muted" />
        </div>
      ) : dms.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No outreach messages yet"
          description="Draft your first DM to a coach to start building relationships."
          action={{ label: "Compose DM", onClick: openNewComposer }}
        />
      ) : (
        <DMKanban
          dms={kanbanDMs}
          coaches={kanbanCoaches}
          onCardClick={handleCardClick}
        />
      )}

      {/* Composer slide-over */}
      <DMComposer
        open={composerOpen}
        onClose={handleComposerClose}
        coaches={coaches}
        editDM={editDM}
        onSaved={handleSaved}
      />
    </div>
  );
}
