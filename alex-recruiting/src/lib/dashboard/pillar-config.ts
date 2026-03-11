export type CalendarPillar = "film" | "training" | "academic" | "camp" | "lifestyle";

export const PILLAR_CONFIG: Record<CalendarPillar, { label: string; color: string; bgClass: string; textClass: string }> = {
  film:      { label: "Film",      color: "#EF4444", bgClass: "bg-dash-danger/20",  textClass: "text-dash-danger" },
  training:  { label: "Training",  color: "#3B82F6", bgClass: "bg-dash-accent/20",  textClass: "text-dash-accent" },
  academic:  { label: "Academic",  color: "#22C55E", bgClass: "bg-dash-success/20", textClass: "text-dash-success" },
  camp:      { label: "Camp",      color: "#F59E0B", bgClass: "bg-dash-warning/20", textClass: "text-dash-warning" },
  lifestyle: { label: "Lifestyle", color: "#D4A853", bgClass: "bg-dash-gold/20",    textClass: "text-dash-gold" },
};

export function toCalendarPillar(backendPillar: string): CalendarPillar {
  switch (backendPillar) {
    case "performance": return "film";
    case "work_ethic": return "training";
    case "character": return "lifestyle";
    default: return backendPillar as CalendarPillar;
  }
}

export function toBackendPillar(calendarPillar: CalendarPillar): string {
  switch (calendarPillar) {
    case "film": return "performance";
    case "training": return "work_ethic";
    case "academic": return "character";
    case "camp": return "performance";
    case "lifestyle": return "work_ethic";
  }
}

export function toCalendarPillarExact(backendPillar: string, hint?: string): CalendarPillar {
  if (hint && ALL_PILLARS.includes(hint as CalendarPillar)) return hint as CalendarPillar;
  return toCalendarPillar(backendPillar);
}

export const ALL_PILLARS: CalendarPillar[] = ["film", "training", "academic", "camp", "lifestyle"];
