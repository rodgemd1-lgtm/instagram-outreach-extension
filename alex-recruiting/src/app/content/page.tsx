"use client";

import { useState } from "react";
import { SCPageHeader, SCTabs, SCPageTransition } from "@/components/sc";
import { ContentQueue } from "@/components/content/content-queue";
import { WeeklyReview } from "@/components/content/weekly-review";
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
          kicker="Content Operations"
          title="CONTENT STUDIO"
          subtitle="Create, schedule, and manage Jacob's X presence"
        />
        <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === "queue" && <ContentQueue />}

        {activeTab === "create" && <WeeklyReview />}

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
