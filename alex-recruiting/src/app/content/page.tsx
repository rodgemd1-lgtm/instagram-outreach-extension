"use client";

import { useState } from "react";
import { SCPageHeader, SCTabs, SCPageTransition, SCGlassCard } from "@/components/sc";
import { ContentQueue } from "@/components/content/content-queue";
import { HooksLibrary } from "@/components/content/hooks-library";
import { MediaBrowser } from "@/components/content/media-browser";

const TABS = [
  { label: "Queue", value: "queue" },
  { label: "Create", value: "create" },
  { label: "Library", value: "library" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <SCPageTransition>
      <div className="space-y-6">
        <SCPageHeader
          title="Content Studio"
          subtitle="Create, schedule, and manage Jacob's X presence"
        />
        <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === "queue" && <ContentQueue />}

        {activeTab === "create" && (
          <SCGlassCard className="p-6">
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">edit_note</span>
              <p className="text-white font-medium mb-1">Content Creator</p>
              <p className="text-sm">AI-powered post generation coming in Sprint 3</p>
            </div>
          </SCGlassCard>
        )}

        {activeTab === "library" && (
          <div className="space-y-6">
            <HooksLibrary />
            <MediaBrowser />
          </div>
        )}
      </div>
    </SCPageTransition>
  );
}
