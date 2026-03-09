"use client";

import {
  Bot,
  Brain,
  Clapperboard,
  FileText,
  Mail,
  ShieldCheck,
  Target,
  Users,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudioMetric {
  label: string;
  value: string;
  detail: string;
}

const STUDIO_ICONS = {
  Bot,
  Brain,
  Clapperboard,
  FileText,
  Mail,
  ShieldCheck,
  Target,
  Users,
  UsersRound,
} as const;

interface StudioPageHeaderProps {
  icon: keyof typeof STUDIO_ICONS;
  kicker: string;
  title: string;
  description: string;
  metrics?: StudioMetric[];
  council?: string[];
  children?: React.ReactNode;
  className?: string;
}

export function StudioPageHeader({
  icon: Icon,
  kicker,
  title,
  description,
  metrics = [],
  council = [],
  children,
  className,
}: StudioPageHeaderProps) {
  const ResolvedIcon = STUDIO_ICONS[Icon];

  return (
    <section className={cn("shell-panel-strong overflow-hidden", className)}>
      <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
        <div className="space-y-5">
          <div className="shell-kicker">
            <ResolvedIcon className="h-3.5 w-3.5" />
            {kicker}
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-[var(--app-navy-strong)] sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--app-muted)] sm:text-base">
              {description}
            </p>
          </div>

          {metrics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="shell-metric">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">{metric.detail}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[rgba(15,40,75,0.1)] bg-[linear-gradient(145deg,rgba(15,40,75,0.98),rgba(11,29,54,0.94))] p-5 text-white shadow-[0_24px_70px_rgba(15,40,75,0.24)]">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
              <ResolvedIcon className="h-3.5 w-3.5" />
              Design Council Guidance
            </div>
            <p className="mt-4 text-sm leading-6 text-white/82">
              Marcus keeps the interaction path obvious, Prism holds the visual system together, Lens protects clarity, and Susan enforces execution quality.
            </p>
            {council.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {council.map((member) => (
                  <Badge
                    key={member}
                    className="border-white/12 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white"
                  >
                    {member}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {children ? (
            <div className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/76 p-4 text-sm text-[var(--app-navy-strong)] shadow-sm">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
