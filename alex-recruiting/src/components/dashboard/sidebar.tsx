"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Home,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RRS_SCORE = 42;

function getRrsColor(score: number) {
  if (score < 40) return "#ff000c";
  if (score <= 70) return "#D4A853";
  return "#22c55e";
}

type NavIndicator =
  | { type: "dot"; color: string }
  | { type: "arrow-up"; color: string }
  | null;

const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  indicator?: NavIndicator;
}> = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true, indicator: null },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users, indicator: { type: "dot", color: "#f59e0b" } },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail, indicator: { type: "dot", color: "#ff000c" } },
  { href: "/dashboard/content", label: "Content", icon: Calendar, indicator: { type: "dot", color: "#22c55e" } },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, indicator: { type: "arrow-up", color: "#22c55e" } },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare, indicator: null },
];

// Inline SVG noise for subtle sidebar film grain (1% opacity)
const SIDEBAR_GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export function DashboardSidebar() {
  const pathname = usePathname();
  const rrsColor = getRrsColor(RRS_SCORE);

  // SVG radial progress ring values
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (RRS_SCORE / 100) * circumference;

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/5 bg-black md:flex"
      style={{ position: "relative" }}
    >
      {/* Sidebar film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.01]"
        aria-hidden="true"
        style={{
          backgroundImage: SIDEBAR_GRAIN_BG,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Header — matches recruit nav branding */}
      <div className="relative flex items-center gap-3 border-b border-white/5 px-5 py-5">
        {/* Animated pulse ring badge */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff000c]/10">
          <span className="absolute inset-0 animate-[breathe_3s_ease-in-out_infinite] rounded-lg border border-[#ff000c]/30" />
          <span className="text-sm font-bold text-[#ff000c]">79</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-white">JACOB RODGERS</p>
          <p className="text-dash-xs uppercase tracking-[0.2em] text-white/40">Class of 2029 &middot; OL/DL</p>

          {/* Recruiting Readiness Score — radial ring */}
          <div className="mt-2 flex items-center gap-2">
            <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90">
              {/* Background ring */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke={rrsColor}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            {/* Score number overlaid on the ring */}
            <div className="-ml-[46px] flex h-[44px] w-[44px] items-center justify-center">
              <span className="font-mono text-sm font-bold" style={{ color: rrsColor }}>
                {RRS_SCORE}
              </span>
            </div>
            <span className="text-dash-xs uppercase tracking-[0.2em] text-white/30">RRS</span>
          </div>
        </div>
      </div>

      {/* Navigation — recruit-style uppercase tracking */}
      <nav className="relative flex-1 px-3 py-6">
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
                    ? "border-l-2 border-[#ff000c] bg-white/5 text-[#ff000c] shadow-[0_0_20px_rgba(255,0,12,0.15)]"
                    : "border-l-2 border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/60"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>

                {/* Status indicator */}
                {item.indicator?.type === "dot" && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.indicator.color }}
                  />
                )}
                {item.indicator?.type === "arrow-up" && (
                  <TrendingUp
                    className="h-3 w-3 shrink-0"
                    style={{ color: item.indicator.color }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — recruit site link with gradient underline hover */}
      <div className="relative border-t border-white/5 px-3 py-4">
        <Link
          href="/recruit"
          target="_blank"
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-dash-xs font-medium uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/50"
        >
          <span className="inline-block h-4 w-px bg-[#ff000c]/40" />
          View Recruit Site
          {/* Gradient underline that animates width on hover */}
          <span className="absolute bottom-1.5 left-8 right-3 h-px origin-left scale-x-0 bg-gradient-to-r from-[#ff000c] to-[#D4A853] transition-transform duration-300 group-hover:scale-x-100" />
        </Link>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </aside>
  );
}
