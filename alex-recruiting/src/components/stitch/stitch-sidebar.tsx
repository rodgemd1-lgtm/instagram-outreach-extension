"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Crosshair,
  Target,
  Shield,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StitchNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** If set, this item is shown only when pathname matches this prefix (context-aware) */
  contextPrefix?: string;
}

const stitchNav: StitchNavItem[] = [
  { href: "/coaches", label: "War Room", icon: Crosshair },
  { href: "/coaches", label: "AI Scout", icon: Brain, contextPrefix: "/coaches/" },
  { href: "/outreach", label: "Campaign HQ", icon: Target },
  { href: "/recruit", label: "The Vault", icon: Shield },
  { href: "/media-upload", label: "Media Lab", icon: Upload },
  { href: "/agency", label: "Agency", icon: Users },
];

export function StitchSidebar() {
  const pathname = usePathname();

  // Determine if we're on a coach detail page
  const isCoachDetail = /^\/coaches\/[^/]+/.test(pathname) && pathname !== "/coaches";

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-white/5 bg-[#0a0a0a] md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg pirate-gradient">
          <span className="text-sm font-black text-white">A</span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">ALEX</p>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
            Recruiting Intel
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {stitchNav.map((item) => {
          // Context-aware items only show when the pathname matches
          if (item.contextPrefix && !pathname.startsWith(item.contextPrefix)) {
            return null;
          }

          // For the "AI Scout" contextual item, it's active when on /coaches/[id]
          const isActive = item.contextPrefix
            ? isCoachDetail
            : item.label === "War Room"
              ? pathname === "/coaches"
              : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.contextPrefix ? pathname : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                item.contextPrefix && "ml-3 text-xs",
                isActive
                  ? "bg-[#C5050C]/15 text-white"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  item.contextPrefix && "h-3.5 w-3.5",
                  isActive ? "text-[#C5050C]" : "text-white/30"
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C5050C] animate-flash-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/5 px-5 py-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
          Jacob Rodgers — OL &apos;29
        </p>
      </div>
    </aside>
  );
}
