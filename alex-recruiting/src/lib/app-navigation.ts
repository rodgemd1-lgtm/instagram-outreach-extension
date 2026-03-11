import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  CalendarDays,
  Camera,
  Clapperboard,
  ClipboardList,
  FileText,
  Film,
  Flame,
  Home,
  LayoutDashboard,
  Mail,
  MessageSquarePlus,
  Palette,
  PenSquare,
  PlayCircle,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Swords,
  Trophy,
  Upload,
  UserSearch,
  Users,
  UsersRound,
  Zap,
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
  { href: "/", label: "Today", icon: Home, blurb: "Daily command center" },
  { href: "/posts", label: "Publish", icon: FileText, blurb: "Queue and approvals" },
  { href: "/coaches", label: "Outreach", icon: Users, blurb: "Pipeline and follow-up" },
  { href: "/media-lab", label: "Media", icon: Clapperboard, blurb: "Top assets and reels" },
  { href: "/profile-studio", label: "Identity", icon: Palette, blurb: "Profile, visuals, launch" },
  { href: "/recruit", label: "Site", icon: Rocket, blurb: "Public recruiting website" },
];

export const navSections: AppNavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { href: "/", label: "Today", icon: Home, blurb: "See the next three moves" },
      { href: "/profile-studio", label: "Identity Studio", icon: Palette, blurb: "Profile, visuals, and X surface" },
      { href: "/recruit", label: "Recruit Website", icon: Rocket, blurb: "Public-facing recruiting site" },
      { href: "/audit", label: "Live Audit", icon: ShieldCheck, blurb: "Readiness score and blockers" },
      { href: "/agency", label: "Agency", icon: UsersRound, blurb: "Team, roles, and process" },
      { href: "/analytics", label: "Analytics", icon: BarChart3, blurb: "Signals, cadence, and outcomes" },
      { href: "/dashboard", label: "Dashboard v2", icon: LayoutDashboard, blurb: "New operations dashboard" },
    ],
  },
  {
    id: "content",
    label: "Publishing",
    items: [
      { href: "/posts", label: "Post Queue", icon: FileText, blurb: "Approve and send to X" },
      { href: "/calendar", label: "Content Calendar", icon: Calendar, blurb: "Cadence and publishing windows" },
      { href: "/create", label: "Create Post", icon: PenSquare, blurb: "Write and shape content" },
      { href: "/manage", label: "Content Manager", icon: ClipboardList, blurb: "Plan the output system" },
      { href: "/hooks", label: "Hooks Library", icon: Zap, blurb: "Openers worth using" },
      { href: "/captions", label: "Captions Library", icon: BookOpen, blurb: "Draft bank and formulas" },
      { href: "/comments", label: "Comment Templates", icon: MessageSquarePlus, blurb: "Replies and engagement plays" },
      { href: "/viral", label: "Viral Content", icon: Flame, blurb: "Higher-reach content formats" },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    items: [
      { href: "/coaches", label: "Coach Pipeline", icon: Users, blurb: "Live CRM and priority stages" },
      { href: "/dms", label: "DM Campaigns", icon: Mail, blurb: "Draft and send coach outreach" },
      { href: "/connections", label: "Follow Targets", icon: UserSearch, blurb: "Relationship map and likely follow-backs" },
      { href: "/cold-dms", label: "Cold DM Engine", icon: Send, blurb: "Sequences and first-contact plays" },
      { href: "/competitors", label: "Competitors", icon: Swords, blurb: "Benchmark against other recruits" },
    ],
  },
  {
    id: "media",
    label: "Media",
    items: [
      { href: "/media-lab", label: "Media Lab", icon: Clapperboard, blurb: "Ranked assets, reels, and draft queue" },
      { href: "/videos", label: "Video Library", icon: Film, blurb: "Clips and film inventory" },
      { href: "/media", label: "Photo Library", icon: Camera, blurb: "Photos and favorites" },
      { href: "/youtube-studio", label: "YouTube Studio", icon: PlayCircle, blurb: "Video packaging and channel plan" },
      { href: "/media-import", label: "Import Media", icon: Upload, blurb: "Pull in local and Photos assets" },
      { href: "/camps", label: "Camp Tracker", icon: CalendarDays, blurb: "Camps, dates, and measurables" },
      { href: "/accomplishments", label: "Accomplishments", icon: Trophy, blurb: "Performance proof and milestones" },
    ],
  },
  {
    id: "systems",
    label: "Research",
    items: [
      { href: "/intelligence", label: "Intelligence", icon: Brain, blurb: "Research, knowledge, and strategy" },
      { href: "/scrape", label: "Scraping Tools", icon: Search, blurb: "School and coach intelligence" },
      { href: "/agents", label: "Agent Command Center", icon: Bot, blurb: "Agent workflows and orchestration" },
    ],
  },
];

export function getActiveNavItem(pathname: string): AppNavItem | null {
  const allItems = [...primaryTabs, ...navSections.flatMap((section) => section.items)];

  const exactMatch = allItems.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch;

  return (
    allItems.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ??
    allItems.find((item) => item.href === "/") ??
    null
  );
}

export function getNavSectionLabel(pathname: string): string {
  const matchingSection = navSections.find((section) =>
    section.items.some((item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href)))
  );

  return matchingSection?.label ?? "Command";
}
