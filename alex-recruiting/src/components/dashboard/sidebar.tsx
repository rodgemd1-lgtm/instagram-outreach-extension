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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/content", label: "Content", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/5 bg-black md:flex">
      {/* Header — matches recruit nav branding */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff000c]/10">
          <span className="text-sm font-bold text-[#ff000c]">79</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-white">JACOB RODGERS</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Class of 2029 &middot; OL/DL</p>
        </div>
      </div>

      {/* Navigation — recruit-style uppercase tracking */}
      <nav className="flex-1 px-3 py-6">
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
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-widest transition-all duration-300",
                  isActive
                    ? "border-l-2 border-[#ff000c] bg-white/5 text-[#ff000c]"
                    : "border-l-2 border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/60"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — recruit site link */}
      <div className="border-t border-white/5 px-3 py-4">
        <Link
          href="/recruit"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/50"
        >
          <span className="inline-block h-4 w-px bg-[#ff000c]/40" />
          View Recruit Site
        </Link>
      </div>
    </aside>
  );
}
