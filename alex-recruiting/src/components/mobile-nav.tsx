"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, primaryTabs } from "@/lib/app-navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(15,40,75,0.08)] bg-[rgba(255,248,238,0.92)] px-2 py-2 backdrop-blur-xl md:hidden safe-bottom">
      <div className="grid grid-cols-6 gap-1">
        {primaryTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all",
                isActive
                  ? "bg-[var(--app-navy-strong)] text-white shadow-[0_14px_30px_rgba(15,40,75,0.22)]"
                  : "text-[var(--app-muted)]"
              )}
            >
              <tab.icon className={cn("h-4 w-4", isActive ? "text-[var(--app-gold-soft)]" : "text-[var(--app-navy)]")} />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/70 p-2 text-[var(--app-navy-strong)] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-50 bg-[rgba(11,29,54,0.48)] backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />

          <div className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm overflow-y-auto border-r border-[rgba(15,40,75,0.12)] bg-[linear-gradient(180deg,rgba(250,245,236,0.98),rgba(237,242,246,0.96))] px-4 py-4 shadow-2xl md:hidden">
            <div className="shell-panel-strong px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    Alex Recruiting
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--app-navy-strong)]">
                    Jacob Rodgers
                  </h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Pewaukee HS | OL / DL | Class of 2029</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/75 p-2 text-[var(--app-navy-strong)]"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 pb-24">
              {navSections.map((section) => (
                <section key={section.id} className="shell-panel px-3 py-3">
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    {section.label}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "shell-nav-link",
                            isActive ? "shell-nav-link-active text-white" : "shell-nav-link-idle text-[var(--app-navy-strong)]"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                              isActive
                                ? "border-white/12 bg-white/10 text-[var(--app-gold-soft)]"
                                : "border-[rgba(15,40,75,0.08)] bg-white/90 text-[var(--app-navy)]"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-sm font-semibold", isActive ? "text-white" : "text-[var(--app-navy-strong)]")}>
                              {item.label}
                            </p>
                            <p className={cn("mt-0.5 text-[11px] leading-5", isActive ? "text-white/68" : "text-[var(--app-muted)]")}>
                              {item.blurb}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
