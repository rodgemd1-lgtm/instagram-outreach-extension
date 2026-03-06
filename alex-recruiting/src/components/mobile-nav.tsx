"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Mail,
  Brain,
  BarChart3,
  Menu,
  X,
  Calendar,
  FileText,
  ShieldCheck,
  Swords,
  Search,
} from "lucide-react";
import { useState } from "react";

const primaryTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/coaches", label: "Coaches", icon: Users },
  { href: "/dms", label: "DMs", icon: Mail },
  { href: "/intelligence", label: "Intel", icon: Brain },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

const secondaryNav = [
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/posts", label: "Post Queue", icon: FileText },
  { href: "/audit", label: "Profile Audit", icon: ShieldCheck },
  { href: "/competitors", label: "Competitors", icon: Swords },
  { href: "/scrape", label: "Scraping Tools", icon: Search },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {primaryTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors min-w-0 flex-1",
                isActive
                  ? "text-slate-900"
                  : "text-slate-400 active:text-slate-600"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}
              />
              <span className="truncate">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-8 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -ml-2 text-slate-600 active:text-slate-900"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden animate-slide-in">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Alex Recruiting</p>
                  <p className="text-[10px] text-slate-500">Jacob Rogers | OL | &apos;28</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Main
              </p>
              {primaryTabs.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 active:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}

              <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tools
              </p>
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 active:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Phase tracker */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-700">Double Black Box</p>
                <p className="text-[10px] text-slate-500 mt-1">Phase 03 — Build</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-blue-600" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
