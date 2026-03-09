"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { OSBriefingResponse } from "@/lib/os/types";
import { navSections, primaryTabs } from "@/lib/app-navigation";

export function Sidebar() {
  const pathname = usePathname();
  const [briefing, setBriefing] = useState<OSBriefingResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/os/briefing", { cache: "no-store" });
        const data = (await response.json()) as OSBriefingResponse;
        if (active) {
          setBriefing(data);
        }
      } catch (error) {
        console.error("Failed to load sidebar briefing:", error);
      }
    }

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 90_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const firstPriority = briefing?.priorities[0] ?? null;
  const secondarySections = navSections.filter((section) => section.id !== "command").slice(0, 4);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[18rem] flex-col border-r border-[rgba(15,40,75,0.08)] bg-[linear-gradient(180deg,rgba(250,245,236,0.96),rgba(239,244,248,0.94))] px-4 py-4 backdrop-blur-xl md:flex">
      <div className="shell-panel-strong overflow-hidden px-5 py-5">
        <div className="shell-kicker">
          <Sparkles className="h-3.5 w-3.5" />
          Susan&apos;s OS
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            Jacob Rodgers
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
            Recruiting command center
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
            Pewaukee HS. OL / DL. Class of 2029. Built to tell you what matters and let you act from one place.
          </p>
        </div>

        <div className="mt-5 rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-[linear-gradient(145deg,rgba(15,40,75,0.96),rgba(10,28,53,0.94))] px-4 py-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
            Do next
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {firstPriority?.title ?? "Loading the live priority stack..."}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/70">
            {firstPriority?.summary ?? "The operator will surface the most important move here."}
          </p>
          {firstPriority?.command ? (
            <button
              type="button"
              onClick={() => dispatchOperatorCommand({ command: firstPriority.command })}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/14"
            >
              {firstPriority.actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 shell-panel px-3 py-3">
        <div className="px-2 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            Primary rooms
          </p>
        </div>
        <div className="space-y-2">
          {primaryTabs.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shell-nav-link",
                  isActive
                    ? "shell-nav-link-active text-white"
                    : "shell-nav-link-idle text-[var(--app-navy-strong)] hover:border-[rgba(15,40,75,0.12)] hover:bg-white/84"
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
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {secondarySections.map((section) => (
          <section key={section.id} className="shell-panel px-3 py-3">
            <div className="px-2 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                {section.label}
              </p>
            </div>
            <div className="space-y-2">
              {section.items.slice(0, 4).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shell-nav-link",
                      isActive
                        ? "shell-nav-link-active text-white"
                        : "shell-nav-link-idle text-[var(--app-navy-strong)] hover:border-[rgba(15,40,75,0.12)] hover:bg-white/84"
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
    </aside>
  );
}
