"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Home,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
] as const;

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-dash-border bg-dash-surface/95 backdrop-blur-lg md:hidden safe-bottom">
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
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-dash-accent"
                  : "text-dash-muted"
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
