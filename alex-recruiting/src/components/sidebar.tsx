"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  FileText,
  Mail,
  BarChart3,
  ShieldCheck,
  Swords,
  Search,
  Home,
  Brain,
  PenSquare,
  Palette,
  Zap,
  BookOpen,
  MessageSquarePlus,
  Flame,
  Send,
  UserSearch,
  Twitter,
  ClipboardList,
  Bot,
  Rocket,
  Film,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/agency", label: "Agency", icon: UsersRound },
  { href: "/launch", label: "Profile Launch", icon: Rocket },
  { href: "/manage", label: "Content Manager", icon: ClipboardList },
  { href: "/x-profile", label: "Jacob's X Profile", icon: Twitter },
  { href: "/create", label: "Create Post", icon: PenSquare },
  { href: "/hooks", label: "Hooks Library", icon: Zap },
  { href: "/captions", label: "Captions Library", icon: BookOpen },
  { href: "/viral", label: "Viral Content", icon: Flame },
  { href: "/comments", label: "Comment Templates", icon: MessageSquarePlus },
  { href: "/cold-dms", label: "Cold DM Engine", icon: Send },
  { href: "/connections", label: "Who to Connect With", icon: UserSearch },
  { href: "/videos", label: "Video Library", icon: Film },
  { href: "/coaches", label: "Coach Pipeline", icon: Users },
  { href: "/dms", label: "DM Campaigns", icon: Mail },
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/posts", label: "Post Queue", icon: FileText },
  { href: "/profile-studio", label: "Profile Studio", icon: Palette },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/audit", label: "Profile Audit", icon: ShieldCheck },
  { href: "/competitors", label: "Competitors", icon: Swords },
  { href: "/scrape", label: "Scraping Tools", icon: Search },
  { href: "/intelligence", label: "Intelligence", icon: Brain },
  { href: "/agents", label: "Agent Command Center", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900">Alex Recruiting</h1>
          <p className="text-[11px] text-slate-500">Jacob Rodgers | DT/OG | &apos;29</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-slate-900" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">Double Black Box</p>
          <p className="text-[11px] text-slate-500 mt-1">Phase 03 — Build</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-slate-900" style={{ width: "50%" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
