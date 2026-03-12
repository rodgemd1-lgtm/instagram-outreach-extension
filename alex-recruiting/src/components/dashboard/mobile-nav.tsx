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

const RRS_SCORE = 42;

function getRrsColor(score: number) {
  if (score < 40) return "#ff000c";
  if (score <= 70) return "#D4A853";
  return "#22c55e";
}

// Split into left 3 and right 3 tabs around center RRS indicator
const LEFT_TABS: ReadonlyArray<{ href: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
];

const RIGHT_TABS: ReadonlyArray<{ href: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
];

function MobileTab({ item, pathname }: { item: typeof LEFT_TABS[number]; pathname: string }) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[9px] font-medium uppercase tracking-wider transition-all duration-150 active:scale-95",
        isActive
          ? "text-[#ff000c]"
          : "text-white/40"
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const rrsColor = getRrsColor(RRS_SCORE);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5 md:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {/* Left 3 tabs */}
        {LEFT_TABS.map((item) => (
          <MobileTab key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Center RRS indicator */}
        <div className="flex min-h-[44px] flex-col items-center justify-center px-1">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full border-2"
            style={{ borderColor: rrsColor }}
          >
            <span
              className="font-mono text-[10px] font-bold leading-none"
              style={{ color: rrsColor }}
            >
              {RRS_SCORE}
            </span>
          </div>
        </div>

        {/* Right 3 tabs */}
        {RIGHT_TABS.map((item) => (
          <MobileTab key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
