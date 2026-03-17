"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Sparkles,
  Target,
  TerminalSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { OSBriefingResponse } from "@/lib/os/types";

const fallbackBrief: OSBriefingResponse = {
  generatedAt: "",
  headline: "Today&apos;s command center is syncing live recruiting data.",
  summary: "Susan&apos;s OS is pulling posts, coach targets, tasks, and growth signals now so this page can tell you what to do first.",
  metrics: [
    { label: "Focus score", value: "—", detail: "Syncing the live audit." },
    { label: "Posts ready", value: "—", detail: "Checking the queue." },
    { label: "Coach moves", value: "—", detail: "Checking DM-ready coaches and follow targets." },
    { label: "Open tasks", value: "—", detail: "Loading the active operating list." },
  ],
  priorities: [
    {
      id: "loading-priority",
      title: "Let the operator gather your next three moves",
      summary: "The page is loading live recruiting context right now.",
      detail: "As soon as the briefing completes, this stack will swap from placeholder guidance to live actions based on posts, outreach, and tasks.",
      status: "attention",
      command: "What should I do today?",
      href: "/posts",
      actionLabel: "Ask the operator",
      actionKind: "operator",
    },
  ],
  workflows: [
    {
      id: "loading-publish",
      title: "Publishing",
      summary: "The publishing room will sort drafts, approvals, and sends into a clear sequence.",
      metric: "Syncing",
      href: "/posts",
      hrefLabel: "Open publishing room",
      command: "What should I do today?",
      actionLabel: "Ask the operator",
      actionKind: "operator",
      steps: [
        { label: "Review", detail: "Check the next draft." },
        { label: "Approve", detail: "Move only the right post forward." },
        { label: "Publish", detail: "Send one approved post to X." },
      ],
    },
    {
      id: "loading-outreach",
      title: "Outreach",
      summary: "The outreach room will surface the next coach worth messaging or following.",
      metric: "Syncing",
      href: "/coaches",
      hrefLabel: "Open outreach room",
      command: "What should I do today?",
      actionLabel: "Ask the operator",
      actionKind: "operator",
      steps: [
        { label: "Pick", detail: "Find the next relevant coach." },
        { label: "Draft", detail: "Write concise outreach." },
        { label: "Track", detail: "Keep the next follow-up obvious." },
      ],
    },
    {
      id: "loading-growth",
      title: "Growth",
      summary: "The growth room will focus on recruiting-relevant visibility instead of vanity metrics.",
      metric: "Syncing",
      href: "/connections",
      hrefLabel: "Open growth room",
      command: "What should I do today?",
      actionLabel: "Ask the operator",
      actionKind: "operator",
      steps: [
        { label: "Scan", detail: "Review priority targets." },
        { label: "Follow", detail: "Make the next smart follow move." },
        { label: "Measure", detail: "See if real output is compounding." },
      ],
    },
  ],
  activity: [
    {
      id: "loading-activity",
      label: "Live feed",
      detail: "The activity stream will fill with posts, coach movement, and operating tasks once syncing completes.",
      timeLabel: "Syncing",
    },
  ],
  operatorPrompts: ["What should I do today?"],
  team: [
    {
      id: "susan-loading",
      name: "Susan's design studio",
      role: "Live orchestration",
      ownership: "Daily priorities",
      note: "The apparatus is loading the next-action stack and will populate with live owners shortly.",
    },
  ],
};

export function TodayCommandCenter() {
  const shouldReduceMotion = useReducedMotion();
  const [briefing, setBriefing] = useState<OSBriefingResponse>(fallbackBrief);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const todaysPlaybook = briefing.priorities.slice(0, 3);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        console.error("Failed to load Today command center:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const shouldAnimate = mounted && !shouldReduceMotion;

  return (
    <div className="space-y-8 pb-8">
      <motion.section
        initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[38px] border border-[rgba(15,40,75,0.08)] bg-[linear-gradient(145deg,rgba(255,248,238,0.94),rgba(240,245,248,0.92))] px-6 py-7 shadow-[0_34px_90px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[40%] bg-[radial-gradient(circle_at_top,_rgba(200,155,60,0.22),_transparent_55%)]" />
        <div className="pointer-events-none absolute -left-12 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(15,40,75,0.12),_transparent_65%)] blur-2xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="shell-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Susan&apos;s Full Design Studio + Startup Intelligence OS
              </span>
              <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
                {loading ? "Syncing live data" : "Today view"}
              </Badge>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-[var(--app-navy-strong)] sm:text-5xl">
                {briefing.headline}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--app-muted)] sm:text-lg">
                {briefing.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}>
                Ask the operator for today&apos;s plan
              </Button>
              <Button asChild variant="outline">
                <Link href="/posts">Open publishing room</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {briefing.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.35, delay: 0.06 * index }}
                  className="shell-metric"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">{metric.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.96 } : false}
            animate={shouldAnimate ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-[32px] border border-[rgba(15,40,75,0.08)] bg-[linear-gradient(160deg,rgba(15,40,75,0.98),rgba(10,28,53,0.94))] p-5 text-white shadow-[0_28px_70px_rgba(15,40,75,0.28)]"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
              <TerminalSquare className="h-3.5 w-3.5" />
              Motion narrative
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Step 1</p>
                <p className="mt-2 text-lg font-semibold">See the real priority</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  The app should tell you what matters today before it asks you to navigate anywhere.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Step 2</p>
                <p className="mt-2 text-lg font-semibold">Act from the same surface</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Approve, publish, draft, and route through the embedded operator instead of hunting through tools.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Step 3</p>
                <p className="mt-2 text-lg font-semibold">Keep the story moving</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Susan, Marcus, Prism, and Trey hold the narrative, usability, and recruiting clarity together as one system.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.04 }}
          className="shell-panel-strong px-5 py-5 sm:px-6"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            <Target className="h-3.5 w-3.5 text-[var(--app-gold)]" />
            If you only do three things today
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {todaysPlaybook.map((priority, index) => (
              <div
                key={priority.id}
                className="rounded-[26px] border border-[rgba(15,40,75,0.08)] bg-white/84 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,40,75,0.98),rgba(11,29,54,0.94))] text-sm font-semibold text-[var(--app-gold-soft)]">
                    0{index + 1}
                  </div>
                  <Badge
                    className={
                      priority.status === "ready"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : priority.status === "blocked"
                          ? "border-rose-200 bg-rose-50 text-rose-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }
                  >
                    {priority.status}
                  </Badge>
                </div>

                <h2 className="mt-4 text-xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                  {priority.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">{priority.summary}</p>

                <div className="mt-4 rounded-[18px] bg-[rgba(15,40,75,0.04)] px-4 py-3 text-sm text-[var(--app-navy-strong)]">
                  {priority.detail}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {priority.actionKind === "operator" && priority.command ? (
                    <Button onClick={() => dispatchOperatorCommand({ command: priority.command })}>
                      {priority.actionLabel}
                    </Button>
                  ) : priority.href ? (
                    <Button asChild>
                      <Link href={priority.href}>{priority.actionLabel}</Link>
                    </Button>
                  ) : null}
                  {priority.href ? (
                    <Button asChild variant="outline">
                      <Link href={priority.href}>Open room</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="shell-panel-strong px-5 py-5 sm:px-6"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            <TerminalSquare className="h-3.5 w-3.5 text-[var(--app-gold)]" />
            Ask the operator
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
            Use plain language. The system should route the work.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
            These are the fastest prompts for moving the stack forward without deciding where to click first.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {briefing.operatorPrompts.slice(0, 6).map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="justify-start bg-white/80 text-left"
                onClick={() => dispatchOperatorCommand({ command: prompt })}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="shell-panel-strong px-5 py-5 sm:px-6"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            <Target className="h-3.5 w-3.5 text-[var(--app-gold)]" />
            Top priorities
          </div>
          <div className="mt-5 space-y-4">
            {briefing.priorities.map((priority, index) => (
              <motion.div
                key={priority.id}
                initial={shouldAnimate ? { opacity: 0, x: -12 } : false}
                animate={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.35, delay: 0.08 * index }}
                className="rounded-[28px] border border-[rgba(15,40,75,0.08)] bg-white/84 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                      Priority {index + 1}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--app-navy-strong)]">
                      {priority.title}
                    </h2>
                  </div>
                  <Badge
                    className={
                      priority.status === "ready"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : priority.status === "blocked"
                          ? "border-rose-200 bg-rose-50 text-rose-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }
                  >
                    {priority.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">{priority.summary}</p>
                <p className="mt-3 rounded-[18px] bg-[rgba(15,40,75,0.04)] px-4 py-3 text-sm text-[var(--app-navy-strong)]">
                  {priority.detail}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {priority.actionKind === "operator" && priority.command ? (
                    <Button onClick={() => dispatchOperatorCommand({ command: priority.command })}>
                      {priority.actionLabel}
                    </Button>
                  ) : priority.href ? (
                    <Button asChild>
                      <Link href={priority.href}>{priority.actionLabel}</Link>
                    </Button>
                  ) : null}
                  {priority.href ? (
                    <Button asChild variant="outline">
                      <Link href={priority.href}>Open room</Link>
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="space-y-6"
        >
          <div className="shell-panel-strong px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
              <Compass className="h-3.5 w-3.5 text-[var(--app-gold)]" />
              Live activity
            </div>
            <div className="mt-5 space-y-3">
              {briefing.activity.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/82 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{item.label}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                      {item.timeLabel}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="shell-panel-strong px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--app-gold)]" />
              Susan&apos;s apparatus
            </div>
            <div className="mt-5 space-y-3">
              {briefing.team.slice(0, 4).map((member) => (
                <div key={member.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/82 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{member.name}</p>
                      <p className="text-xs text-[var(--app-muted)]">{member.role}</p>
                    </div>
                    <Badge className="border-[rgba(15,40,75,0.1)] bg-[rgba(15,40,75,0.04)] text-[var(--app-navy-strong)] hover:bg-[rgba(15,40,75,0.04)]">
                      {member.ownership}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{member.note}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {briefing.workflows.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: 0.08 * index }}
            className="shell-panel-strong px-5 py-5 sm:px-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {workflow.metric}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                  {workflow.title}
                </h3>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--app-muted)]" />
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">{workflow.summary}</p>

            <div className="mt-4 space-y-3">
              {workflow.steps.map((step) => (
                <div key={step.label} className="rounded-[20px] border border-[rgba(15,40,75,0.08)] bg-white/82 px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{step.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{step.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {workflow.actionKind === "operator" && workflow.command ? (
                <Button onClick={() => dispatchOperatorCommand({ command: workflow.command })}>
                  {workflow.actionLabel}
                </Button>
              ) : (
                <Button asChild>
                  <Link href={workflow.href}>{workflow.actionLabel}</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={workflow.href}>{workflow.hrefLabel}</Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
