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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/coaches", label: "Coach CRM", icon: Users },
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/posts", label: "Post Queue", icon: FileText },
  { href: "/dms", label: "DM Campaigns", icon: Mail },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/audit", label: "Profile Audit", icon: ShieldCheck },
  { href: "/competitors", label: "Competitors", icon: Swords },
  { href: "/scrape", label: "Scraping Tools", icon: Search },
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
          <p className="text-[11px] text-slate-500">Jacob Rogers | OL | &apos;28</p>
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
