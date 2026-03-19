import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Clapperboard,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Map,
  Rocket,
  Users,
  UsersRound,
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
  { href: "/dashboard", label: "Command", icon: LayoutDashboard, blurb: "Daily command center" },
  { href: "/coaches", label: "Coaches", icon: Users, blurb: "Coach CRM and intelligence" },
  { href: "/outreach", label: "Outreach", icon: Globe, blurb: "Pipeline and DM sequences" },
  { href: "/content", label: "Content", icon: FileText, blurb: "Create and schedule content" },
  { href: "/camps", label: "Camps", icon: CalendarDays, blurb: "Camp tracker and invites" },
  { href: "/agency", label: "Agency", icon: UsersRound, blurb: "Virtual recruiting team" },
];

export const navSections: AppNavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { href: "/dashboard", label: "Command", icon: LayoutDashboard, blurb: "Operations dashboard" },
      { href: "/recruit", label: "Recruit Website", icon: Rocket, blurb: "Public-facing recruiting site" },
    ],
  },
  {
    id: "coaches",
    label: "Coaches",
    items: [
      { href: "/coaches", label: "Coach Pipeline", icon: Users, blurb: "All coaches, profiles, map, competitors" },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    items: [
      { href: "/outreach", label: "Outreach Pipeline", icon: Globe, blurb: "DM sequences and follow strategy" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/content", label: "Content Studio", icon: FileText, blurb: "Queue, create, and library" },
    ],
  },
  {
    id: "media",
    label: "Camps & Media",
    items: [
      { href: "/camps", label: "Camp Tracker", icon: CalendarDays, blurb: "Camps, dates, and measurables" },
    ],
  },
  {
    id: "agency",
    label: "Agency",
    items: [
      { href: "/agency", label: "Agency", icon: UsersRound, blurb: "Team, roles, and chat" },
    ],
  },
];

export function getActiveNavItem(pathname: string): AppNavItem | null {
  const allItems = [...primaryTabs, ...navSections.flatMap((section) => section.items)];

  const exactMatch = allItems.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch;

  return (
    allItems.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ??
    allItems.find((item) => item.href === "/dashboard") ??
    null
  );
}

export function getNavSectionLabel(pathname: string): string {
  const matchingSection = navSections.find((section) =>
    section.items.some((item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href)))
  );

  return matchingSection?.label ?? "Command";
}
