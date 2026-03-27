import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Camera,
  Clapperboard,
  FileText,
  Globe,
  Home,
  Layers,
  Map,
  Palette,
  Rocket,
  Users,
  UsersRound,
  Wand2,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  blurb?: string;
}

export interface AppNavSection {
  id: string;
  label: string;
  items: AppNavItem[];
}

export const primaryTabs: AppNavItem[] = [
  { href: "/dashboard", label: "Today", icon: Home, blurb: "Daily command center" },
  { href: "/coaches", label: "Outreach", icon: Globe, blurb: "Coach pipeline and outreach" },
  { href: "/content", label: "Content", icon: FileText, blurb: "Create and schedule content" },
  { href: "/camps", label: "Camps", icon: CalendarDays, blurb: "Camp tracker" },
  { href: "/agency", label: "Agency", icon: UsersRound, blurb: "Virtual recruiting team" },
  { href: "/recruit", label: "Site", icon: Rocket, blurb: "Public recruiting site" },
];

export const navSections: AppNavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { href: "/dashboard", label: "Today", icon: Home, blurb: "Daily ops dashboard" },
      { href: "/recruit", label: "Recruit Website", icon: Rocket, blurb: "Public-facing recruiting site" },
    ],
  },
  {
    id: "content",
    label: "Publishing",
    items: [
      { href: "/content", label: "Content Studio", icon: FileText, blurb: "Queue, create, and library" },
      { href: "/posts", label: "Publish", icon: Bot, blurb: "Post queue and scheduling" },
      { href: "/content-queue", label: "Content Queue", icon: Layers, blurb: "Content pipeline and review" },
      { href: "/prompt-studio", label: "Prompt Studio", icon: Wand2, blurb: "AI prompt builder and templates" },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    items: [
      { href: "/coaches", label: "Outreach", icon: Users, blurb: "Coach CRM and pipeline" },
      { href: "/outreach", label: "Outreach Program", icon: Globe, blurb: "DM sequences and follow strategy" },
    ],
  },
  {
    id: "media",
    label: "Media",
    items: [
      { href: "/camps", label: "Camp Tracker", icon: CalendarDays, blurb: "Camps, dates, and measurables" },
      { href: "/media-lab", label: "Media", icon: Clapperboard, blurb: "Media lab and highlight reels" },
      { href: "/brand-kit", label: "Brand Kit", icon: Palette, blurb: "Brand assets and visual identity" },
      { href: "/capture", label: "Capture", icon: Camera, blurb: "Content capture and upload tools" },
    ],
  },
  {
    id: "systems",
    label: "Research",
    items: [
      { href: "/x-growth", label: "X Growth", icon: BarChart3, blurb: "X/Twitter growth analytics" },
      { href: "/map", label: "School Map", icon: Map, blurb: "School locations and targets" },
      { href: "/agency", label: "Agency", icon: UsersRound, blurb: "Virtual recruiting team chat" },
    ],
  },
];

export function getActiveNavItem(pathname: string): AppNavItem | null {
  const allItems = [...primaryTabs, ...navSections.flatMap((section) => section.items)];

  const exactMatch = allItems.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch;

  const prefixMatch = allItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  if (prefixMatch) return prefixMatch;

  return allItems.find((item) => item.href === "/dashboard") ?? null;
}

export function getNavSectionLabel(pathname: string): string {
  const matchingSection = navSections.find((section) =>
    section.items.some(
      (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
    )
  );

  return matchingSection?.label ?? "Command";
}
