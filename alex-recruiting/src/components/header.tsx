"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarClock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "@/components/mobile-nav";
import { getActiveNavItem, getNavSectionLabel } from "@/lib/app-navigation";
import { dispatchOperatorCommand, openOperator } from "@/lib/os/operator-client";
import type { OSBriefingResponse } from "@/lib/os/types";

export function Header() {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname);
  const sectionLabel = getNavSectionLabel(pathname);
  const [briefing, setBriefing] = useState<OSBriefingResponse | null>(null);
  const [today, setToday] = useState("Today");

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
        console.error("Failed to load header briefing:", error);
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

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  const firstPriority = briefing?.priorities[0] ?? null;
  const quickActions = briefing?.priorities.slice(0, 3) ?? [];

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-[1600px] rounded-[30px] border border-[rgba(15,40,75,0.08)] bg-[rgba(255,248,238,0.78)] px-4 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <MobileDrawer />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                <span>{sectionLabel}</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--app-gold)] sm:block" />
                <span>{today}</span>
              </div>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold tracking-tight text-[var(--app-navy-strong)]">
                  {activeItem?.label ?? "Today"}
                </h2>
                <span className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-navy)]">
                  Operator-first workspace
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-[38rem] xl:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Today&apos;s plan
              </Button>
              <Button onClick={() => openOperator()}>
                <Sparkles className="mr-2 h-4 w-4" />
                Open operator
              </Button>
            </div>

            <div className="w-full rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/86 px-4 py-3 xl:max-w-[42rem]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    Do next
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--app-navy-strong)]">
                    {firstPriority?.title ?? "Loading the live priority stack..."}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
                    {firstPriority?.summary ?? "The command center is syncing live recruiting data."}
                  </p>
                </div>
                {firstPriority ? (
                  <div className="flex shrink-0 gap-2">
                    {firstPriority.command ? (
                      <Button
                        size="sm"
                        onClick={() => dispatchOperatorCommand({ command: firstPriority.command })}
                      >
                        {firstPriority.actionLabel}
                      </Button>
                    ) : null}
                    {firstPriority.href ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={firstPriority.href}>
                          Open
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {quickActions.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[rgba(15,40,75,0.08)] pt-3">
                  {quickActions.slice(1).map((priority) => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() =>
                        priority.command
                          ? dispatchOperatorCommand({ command: priority.command })
                          : undefined
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.04)] px-3 py-1.5 text-xs font-semibold text-[var(--app-navy-strong)] transition hover:border-[rgba(15,40,75,0.16)] hover:bg-[rgba(15,40,75,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!priority.command}
                    >
                      {priority.actionLabel}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
