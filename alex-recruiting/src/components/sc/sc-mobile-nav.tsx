"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileTab {
  label: string;
  href: string;
  icon: string;
}

const tabs: MobileTab[] = [
  { label: "Command", href: "/dashboard", icon: "dashboard" },
  { label: "Coaches", href: "/coaches", icon: "groups" },
  { label: "Outreach", href: "/outreach", icon: "campaign" },
  { label: "Content", href: "/content", icon: "edit_note" },
  { label: "Camps", href: "/camps", icon: "event" },
  { label: "Agency", href: "/agency", icon: "smart_toy" },
];

export function SCMobileNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-sc-surface border-t border-sc-border lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary focus-visible:ring-inset ${
                active ? "text-sc-primary" : "text-slate-500"
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  active ? "text-sc-primary" : "text-slate-500"
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
