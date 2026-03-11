"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Home,
  Mail,
  MessageSquare,
  Users,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-dash-border bg-dash-surface md:flex">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dash-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dash-accent/10">
          <span className="text-sm font-bold text-dash-accent">JR</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-dash-text">Jacob Rodgers</p>
          <p className="text-xs text-dash-muted">Class of 2029 &middot; OL/DL</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-dash-accent/10 text-dash-accent"
                    : "text-dash-text-secondary hover:bg-dash-surface-raised hover:text-dash-text"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — back to main app */}
      <div className="border-t border-dash-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-dash-muted transition-colors hover:text-dash-text"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Command Center
        </Link>
      </div>
    </aside>
  );
}
