"use client";

import { useState } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCBadge,
  SCTabs,
} from "@/components/sc";
import { schoolColors } from "@/lib/data/school-branding";
import { targetSchools } from "@/lib/data/target-schools";

const BRAND_COLORS = [
  { name: "Pewaukee Navy", hex: "#0F284B", use: "Primary text, buttons, headers" },
  { name: "Pewaukee Gold", hex: "#C89B3C", use: "Accent, highlights, CTAs" },
  { name: "Warm Stone", hex: "#E7DED1", use: "Background, cards" },
  { name: "Field Black", hex: "#111827", use: "Body text, dark UI" },
  { name: "Pewaukee Red", hex: "#CC0022", use: "Jersey color, alerts" },
  { name: "Stadium White", hex: "#F9FAFB", use: "Light backgrounds" },
];

const TYPOGRAPHY = [
  {
    name: "Display",
    font: "font-mono",
    weight: "font-bold",
    size: "text-4xl",
    sample: "JACOB RODGERS",
    use: "Hero headlines, section titles",
  },
  {
    name: "Heading",
    font: "font-sans",
    weight: "font-semibold",
    size: "text-2xl",
    sample: "Class of 2029 | OL | Pewaukee HS",
    use: "Page titles, card headers",
  },
  {
    name: "Subheading",
    font: "font-sans",
    weight: "font-medium",
    size: "text-lg",
    sample: '6\'4" | 285 lbs | 3.8 GPA',
    use: "Section labels, stats",
  },
  {
    name: "Body",
    font: "font-sans",
    weight: "font-normal",
    size: "text-sm",
    sample: "Offensive lineman committed to the process. Every rep counts.",
    use: "Body copy, descriptions",
  },
  {
    name: "Caption",
    font: "font-mono",
    weight: "font-medium",
    size: "text-xs",
    sample: "PANCAKE BLOCKS: 47 | SACKS: 12",
    use: "Data labels, stat cards",
  },
];

const GUIDELINES = [
  {
    title: "Voice & Tone",
    icon: "record_voice_over",
    items: [
      "Confident but not arrogant — let the work speak",
      "Direct, disciplined, coach-ready language",
      "Never self-promote — spotlight shift to team and coaches",
      "Respectful, mature beyond his years",
    ],
  },
  {
    title: "Visual Identity",
    icon: "palette",
    items: [
      "Dark, cinematic backgrounds with warm stadium lighting",
      "Red jersey (#CC0022) as signature color anchor",
      "Low camera angles — power, dominance, authority",
      "Faces obscured in AI-generated content (helmet shadow)",
    ],
  },
  {
    title: "Content Constitution",
    icon: "gavel",
    items: [
      "No trash talk or opponent disrespect",
      "No personal drama or complaints",
      "No ranking or star speculation",
      "Every post passes the Spotlight Shift Check",
    ],
  },
  {
    title: "Platform Strategy",
    icon: "campaign",
    items: [
      "X is the primary recruiting visibility channel",
      "3-5 posts per week across all content pillars",
      "40% On-Field, 40% Training, 20% Character",
      "Engage coaches with likes, retweets, and film replies",
    ],
  },
];

type Tab = "colors" | "typography" | "assets" | "guidelines";

const TABS = [
  { label: "Colors", value: "colors" },
  { label: "Typography", value: "typography" },
  { label: "School Assets", value: "assets" },
  { label: "Guidelines", value: "guidelines" },
];

export default function BrandKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Visual System"
        title="BRAND KIT"
        subtitle="Jacob Rodgers brand system — colors, typography, school assets, and content guidelines."
      />

      <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as Tab)} />

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <SCGlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Brand Colors</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BRAND_COLORS.map((color) => (
                <div
                  key={color.hex}
                  className="overflow-hidden rounded-xl border border-sc-border"
                >
                  <div className="h-24 w-full" style={{ backgroundColor: color.hex }} />
                  <div className="p-3 bg-white/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">{color.name}</p>
                      <button
                        onClick={() => copyColor(color.hex)}
                        className="rounded-md p-1 text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedColor === color.hex ? (
                          <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        )}
                      </button>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{color.hex}</p>
                    <p className="mt-1 text-xs text-slate-500">{color.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </SCGlassCard>

          <SCGlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Target School Colors</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {targetSchools.map((school) => {
                const colors = schoolColors[school.id];
                if (!colors) return null;
                return (
                  <div
                    key={school.id}
                    className="flex items-center gap-3 rounded-xl border border-sc-border bg-white/5 p-3"
                  >
                    <div className="flex gap-1">
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg border border-sc-border"
                        style={{ backgroundColor: colors.secondary }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{school.name}</p>
                      <p className="font-mono text-[10px] text-slate-500">
                        {colors.primary} / {colors.secondary}
                      </p>
                    </div>
                    <SCBadge variant="default">{school.priorityTier}</SCBadge>
                  </div>
                );
              })}
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <SCGlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Type System</h3>
          <div className="space-y-6">
            {TYPOGRAPHY.map((specimen) => (
              <div
                key={specimen.name}
                className="rounded-xl border border-sc-border bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <SCBadge variant="primary">{specimen.name}</SCBadge>
                  <span className="text-[10px] text-slate-500">
                    {specimen.font} / {specimen.weight} / {specimen.size}
                  </span>
                </div>
                <div className="mt-3">
                  <p className={`${specimen.font} ${specimen.weight} ${specimen.size} text-white`}>
                    {specimen.sample}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">{specimen.use}</p>
              </div>
            ))}
          </div>
        </SCGlassCard>
      )}

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <SCGlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">School Logo Assets</h3>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {targetSchools.map((school) => (
              <div
                key={school.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-sc-border bg-white/5 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/logos/${school.id}.svg`}
                  alt={school.name}
                  className="h-16 w-16 rounded-full"
                />
                <p className="text-center text-xs font-bold text-white">{school.name}</p>
                <SCBadge variant="default">{school.conference}</SCBadge>
              </div>
            ))}
          </div>
        </SCGlassCard>
      )}

      {/* Guidelines Tab */}
      {activeTab === "guidelines" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDELINES.map((section) => (
            <SCGlassCard key={section.title} className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-sc-primary">{section.icon}</span>
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400 mt-0.5 flex-shrink-0">check_circle</span>
                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </SCGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
