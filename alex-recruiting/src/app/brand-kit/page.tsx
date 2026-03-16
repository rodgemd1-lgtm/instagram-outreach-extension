"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Type,
  Image as ImageIcon,
  BookOpen,
  Check,
  Copy,
  Download,
} from "lucide-react";
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
    sample: "6'4\" | 285 lbs | 3.8 GPA",
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
    items: [
      "Confident but not arrogant — let the work speak",
      "Direct, disciplined, coach-ready language",
      "Never self-promote — spotlight shift to team and coaches",
      "Respectful, mature beyond his years",
    ],
  },
  {
    title: "Visual Identity",
    items: [
      "Dark, cinematic backgrounds with warm stadium lighting",
      "Red jersey (#CC0022) as signature color anchor",
      "Low camera angles — power, dominance, authority",
      "Faces obscured in AI-generated content (helmet shadow)",
    ],
  },
  {
    title: "Content Constitution",
    items: [
      "No trash talk or opponent disrespect",
      "No personal drama or complaints",
      "No ranking or star speculation",
      "Every post passes the Spotlight Shift Check",
    ],
  },
  {
    title: "Platform Strategy",
    items: [
      "X is the primary recruiting visibility channel",
      "3-5 posts per week across all content pillars",
      "40% On-Field, 40% Training, 20% Character",
      "Engage coaches with likes, retweets, and film replies",
    ],
  },
];

type Tab = "colors" | "typography" | "assets" | "guidelines";

export default function BrandKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  function copyColor(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }

  const tabs: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "assets", label: "School Assets", icon: ImageIcon },
    { id: "guidelines", label: "Guidelines", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-navy-strong)]">Brand Kit Studio</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Jacob Rodgers brand system — colors, typography, school assets, and content guidelines.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-[rgba(15,40,75,0.04)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-[var(--app-navy-strong)] shadow-sm"
                : "text-[var(--app-muted)] hover:text-[var(--app-navy)]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
              <CardTitle className="text-lg text-[var(--app-navy-strong)]">Brand Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {BRAND_COLORS.map((color) => (
                <div
                  key={color.hex}
                  className="overflow-hidden rounded-xl border border-[rgba(15,40,75,0.08)]"
                >
                  <div
                    className="h-24 w-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--app-navy-strong)]">
                        {color.name}
                      </p>
                      <button
                        onClick={() => copyColor(color.hex)}
                        className="rounded-md p-1 text-[var(--app-muted)] hover:bg-[rgba(15,40,75,0.05)]"
                      >
                        {copiedColor === color.hex ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-[var(--app-muted)]">
                      {color.hex}
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">{color.use}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
              <CardTitle className="text-lg text-[var(--app-navy-strong)]">
                Target School Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {targetSchools.map((school) => {
                const colors = schoolColors[school.id];
                if (!colors) return null;
                return (
                  <div
                    key={school.id}
                    className="flex items-center gap-3 rounded-xl border border-[rgba(15,40,75,0.08)] p-3"
                  >
                    <div className="flex gap-1">
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg border border-[rgba(15,40,75,0.1)]"
                        style={{ backgroundColor: colors.secondary }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--app-navy-strong)]">
                        {school.name}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--app-muted)]">
                        {colors.primary} / {colors.secondary}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {school.priorityTier}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">Type System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {TYPOGRAPHY.map((specimen) => (
              <div
                key={specimen.name}
                className="rounded-xl border border-[rgba(15,40,75,0.08)] p-4"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{specimen.name}</Badge>
                  <span className="text-[10px] text-[var(--app-muted)]">
                    {specimen.font} · {specimen.weight} · {specimen.size}
                  </span>
                </div>
                <div className="mt-3">
                  <p
                    className={`${specimen.font} ${specimen.weight} ${specimen.size} text-[var(--app-navy-strong)]`}
                  >
                    {specimen.sample}
                  </p>
                </div>
                <p className="mt-2 text-xs text-[var(--app-muted)]">{specimen.use}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">
              School Logo Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {targetSchools.map((school) => (
              <div
                key={school.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-[rgba(15,40,75,0.08)] bg-white/80 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/logos/${school.id}.svg`}
                  alt={school.name}
                  className="h-16 w-16 rounded-full"
                />
                <p className="text-center text-xs font-medium text-[var(--app-navy-strong)]">
                  {school.name}
                </p>
                <Badge variant="secondary" className="text-[10px]">
                  {school.conference}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Guidelines Tab */}
      {activeTab === "guidelines" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDELINES.map((section) => (
            <Card key={section.title}>
              <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
                <CardTitle className="text-lg text-[var(--app-navy-strong)]">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                    <p className="text-sm text-[var(--app-navy-strong)]">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
