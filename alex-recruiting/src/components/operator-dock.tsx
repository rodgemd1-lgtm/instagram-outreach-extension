"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Loader2,
  MessageSquare,
  PanelRightOpen,
  TerminalSquare,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OPERATOR_EVENT_NAME, type OperatorCommandEventDetail } from "@/lib/os/operator-client";
import type {
  OSBriefingResponse,
  OSOperatorCard,
  OSOperatorResponse,
} from "@/lib/os/types";

interface OperatorMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  status?: OSOperatorResponse["status"];
  cards?: OSOperatorCard[];
  followUpPrompts?: string[];
  focusPath?: string;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function statusTone(status: OSOperatorResponse["status"] | undefined): string {
  switch (status) {
    case "success":
      return "border-emerald-200/80 bg-emerald-50/80 text-emerald-900";
    case "warning":
      return "border-amber-200/80 bg-amber-50/80 text-amber-900";
    case "error":
      return "border-rose-200/80 bg-rose-50/80 text-rose-900";
    default:
      return "border-[rgba(15,40,75,0.08)] bg-white/85 text-[var(--app-navy-strong)]";
  }
}

/** Routes where the OperatorDock must never render (public-facing pages). */
const HIDDEN_ROUTES = ["/recruit"];

export function OperatorDock() {
  const pathname = usePathname();

  // Never show operator UI on public-facing recruit page
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return <OperatorDockInner />;
}

function OperatorDockInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [briefing, setBriefing] = useState<OSBriefingResponse | null>(null);
  const [messages, setMessages] = useState<OperatorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [running, setRunning] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBrief() {
      setLoadingBrief(true);
      try {
        const response = await fetch("/api/os/briefing", { cache: "no-store" });
        const data = (await response.json()) as OSBriefingResponse;

        if (!active) return;

        setBriefing(data);
        setMessages((current) => {
          if (current.length > 0) return current;
          return [
            {
              id: makeId("assistant"),
              role: "assistant",
              status: "info",
              content: `${data.headline} ${data.summary}`,
              followUpPrompts: data.operatorPrompts,
            },
          ];
        });
      } catch (error) {
        if (!active) return;
        console.error("Failed to load OS briefing:", error);
      } finally {
        if (active) {
          setLoadingBrief(false);
        }
      }
    }

    void loadBrief();
    const interval = window.setInterval(() => {
      void loadBrief();
    }, 90_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, openMobile]);

  const currentPrompts = useMemo(() => {
    const latestPrompts = [...messages].reverse().find((message) => message.followUpPrompts?.length);
    if (latestPrompts?.followUpPrompts?.length) return latestPrompts.followUpPrompts;
    return briefing?.operatorPrompts ?? [];
  }, [briefing, messages]);

  const runCommand = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) return;

      setMessages((current) => [
        ...current,
        { id: makeId("user"), role: "user", content: trimmed },
      ]);
      setInput("");
      setRunning(true);

      try {
        const response = await fetch("/api/os/operator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: trimmed, contextPath: pathname }),
        });
        const data = (await response.json()) as OSOperatorResponse;

        setMessages((current) => [
          ...current,
          {
            id: makeId("assistant"),
            role: "assistant",
            content: data.message,
            status: data.status,
            cards: data.cards,
            followUpPrompts: data.followUpPrompts,
            focusPath: data.focusPath,
          },
        ]);

        if (data.focusPath) {
          router.prefetch(data.focusPath);
        }
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: makeId("assistant"),
            role: "assistant",
            status: "error",
            content:
              error instanceof Error
                ? error.message
                : "The operator hit an unexpected error.",
          },
        ]);
      } finally {
        setRunning(false);
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    function handleEvent(event: Event) {
      const custom = event as CustomEvent<OperatorCommandEventDetail>;
      const detail = custom.detail ?? {};
      setHighlight(true);
      window.setTimeout(() => setHighlight(false), 1200);

      if (detail.openOnly) {
        setOpenMobile(true);
      }

      if (detail.command) {
        void runCommand(detail.command);
      }
    }

    window.addEventListener(OPERATOR_EVENT_NAME, handleEvent as EventListener);
    return () => window.removeEventListener(OPERATOR_EVENT_NAME, handleEvent as EventListener);
  }, [runCommand]);

  function renderPanel(isMobile: boolean) {
    return (
      <div
        className={cn(
          "flex h-full flex-col border-l border-[rgba(15,40,75,0.08)] bg-[linear-gradient(180deg,rgba(251,246,237,0.96),rgba(238,244,248,0.94))] backdrop-blur-xl",
          isMobile ? "rounded-[30px] border shadow-[0_36px_90px_rgba(15,23,42,0.22)]" : "",
          highlight && "ring-2 ring-[rgba(200,155,60,0.45)] ring-offset-2 ring-offset-transparent"
        )}
      >
        <div className="border-b border-[rgba(15,40,75,0.08)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,40,75,0.08)] bg-white/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-navy)]">
                <TerminalSquare className="h-3.5 w-3.5" />
                Embedded Operator
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-[var(--app-navy-strong)]">
                Startup Intelligence OS
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                Susan&apos;s full design team is routing live recruiting work here. Ask for the next move or have the system do it for you.
              </p>
            </div>
            {isMobile ? (
              <button
                onClick={() => setOpenMobile(false)}
                className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/78 p-2 text-[var(--app-navy-strong)]"
                aria-label="Close operator"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(briefing?.metrics ?? []).slice(0, 2).map((metric) => (
              <div key={metric.label} className="rounded-[20px] border border-[rgba(15,40,75,0.08)] bg-white/82 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {metric.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-[var(--app-navy-strong)]">{metric.value}</p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-[rgba(15,40,75,0.08)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                Current room
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--app-navy-strong)]">{pathname}</p>
            </div>
            <Badge className="border-[rgba(15,40,75,0.1)] bg-[rgba(200,155,60,0.14)] text-[var(--app-navy-strong)] hover:bg-[rgba(200,155,60,0.14)]">
              Live operator
            </Badge>
          </div>
        </div>

        <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {loadingBrief && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--app-muted)]" />
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "animate-fade-in rounded-[24px] border px-4 py-4 shadow-sm",
                message.role === "user"
                  ? "ml-8 border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.94)] text-white"
                  : statusTone(message.status)
              )}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">
                {message.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {message.role === "assistant" ? "Operator" : "You"}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6">{message.content}</p>

              {message.cards?.length ? (
                <div className="mt-4 space-y-3">
                  {message.cards.map((card) => {
                    const command = card.command;
                    const href = card.href;

                    return (
                      <div key={card.id} className="rounded-[20px] border border-[rgba(15,40,75,0.08)] bg-white/82 p-4 text-[var(--app-navy-strong)]">
                        <p className="text-sm font-semibold">{card.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{card.detail}</p>
                        {card.meta ? <p className="mt-2 text-xs text-[var(--app-muted)]">{card.meta}</p> : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {command && card.commandLabel ? (
                            <Button size="sm" onClick={() => void runCommand(command)}>
                              {card.commandLabel}
                            </Button>
                          ) : null}
                          {href && card.hrefLabel ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (href.startsWith("/")) {
                                  router.push(href);
                                  if (isMobile) setOpenMobile(false);
                                } else {
                                  window.open(href, "_blank", "noopener,noreferrer");
                                }
                              }}
                            >
                              {card.hrefLabel}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {message.focusPath ? (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      router.push(message.focusPath!);
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    Open room
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          {running ? (
            <div className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/82 px-4 py-4 text-sm text-[var(--app-muted)]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Operator is working...
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-[rgba(15,40,75,0.08)] px-4 py-4">
          <div className="flex flex-wrap gap-2 pb-3">
            {currentPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void runCommand(prompt)}
                className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/86 px-3 py-2 text-xs font-semibold text-[var(--app-navy-strong)] transition hover:-translate-y-0.5 hover:border-[rgba(15,40,75,0.14)]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void runCommand(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask what to do, approve a post, draft a DM..."
              className="h-12 rounded-[20px] bg-white"
            />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-[18px]" disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[24rem] xl:block">
        {renderPanel(false)}
      </aside>

      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="fixed bottom-[5.6rem] right-4 z-50 rounded-full border border-[rgba(15,40,75,0.12)] bg-[var(--app-navy-strong)] px-4 py-3 text-white shadow-[0_24px_50px_rgba(15,40,75,0.28)] xl:hidden"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <PanelRightOpen className="h-4 w-4" />
          Operator
        </span>
      </button>

      {openMobile ? (
        <div className="fixed inset-0 z-[60] bg-[rgba(11,29,54,0.54)] px-4 py-4 backdrop-blur-md xl:hidden">
          <div className="mx-auto h-full max-w-lg">{renderPanel(true)}</div>
        </div>
      ) : null}
    </>
  );
}
