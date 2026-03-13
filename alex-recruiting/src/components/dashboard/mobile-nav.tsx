"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}> = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
];

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2 py-1.5",
                isActive
                  ? "text-[#0F1720]"
                  : "text-[#9CA3AF]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {isActive && (
                <span className="text-[10px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
