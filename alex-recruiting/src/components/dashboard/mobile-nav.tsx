"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_TABS: ReadonlyArray<{ href: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
];

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5 md:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {MOBILE_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider transition-colors",
                isActive
                  ? "text-[#ff000c]"
                  : "text-white/40"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
