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

const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}> = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col border-r border-[#E5E7EB] bg-white md:flex">
      {/* Header */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <p className="text-[#0F1720] font-semibold text-lg">Jacob Rodgers</p>
        <p className="text-[#9CA3AF] text-sm">
          Class of 2029 &middot; OL &middot; Pewaukee HS
        </p>
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
                  "flex items-center gap-3 py-2.5 px-4 text-sm transition-colors",
                  isActive
                    ? "text-[#0F1720] font-semibold bg-[#F5F5F4] border-l-[3px] border-[#0F1720] rounded-r-lg"
                    : "text-[#6B7280] hover:bg-[#F5F5F4] rounded-lg"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] px-5 py-4">
        <Link
          href="/recruit"
          className="text-[#9CA3AF] text-sm hover:text-[#6B7280] hover:underline transition-colors"
        >
          View Recruit Site &rarr;
        </Link>
      </div>
    </aside>
  );
}
