"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  Target,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/coaches", label: "War Room", icon: Crosshair },
  { href: "/outreach", label: "Campaign", icon: Target },
  { href: "/recruit", label: "Vault", icon: Shield },
  { href: "/media-upload", label: "Media", icon: Upload },
  { href: "/agency", label: "Agency", icon: Users },
];

export function StitchMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0a0a0a]/95 px-2 py-2 backdrop-blur-xl md:hidden safe-bottom">
      <div className="grid grid-cols-5 gap-1">
        {mobileNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-all",
                isActive
                  ? "bg-[#C5050C]/15 text-white"
                  : "text-white/30"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isActive ? "text-[#C5050C]" : "")}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
