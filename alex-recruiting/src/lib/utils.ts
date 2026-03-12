import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getEngagementRate(impressions: number, engagements: number): number {
  if (impressions === 0) return 0;
  return Math.round((engagements / impressions) * 10000) / 100;
}

export function getPillarColor(pillar: string): string {
  switch (pillar) {
    case "performance": return "bg-[#ff000c]/20 text-[#ff000c]";
    case "work_ethic": return "bg-[#D4A853]/20 text-[#D4A853]";
    case "character": return "bg-white/10 text-white/80";
    default: return "bg-white/5 text-white/40";
  }
}

export function getPillarLabel(pillar: string): string {
  switch (pillar) {
    case "performance": return "On-Field Performance";
    case "work_ethic": return "Work Ethic & Training";
    case "character": return "Character & Brand";
    default: return pillar;
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "Tier 1": return "text-[#ff000c] bg-[#ff000c]/10 border-[#ff000c]/20";
    case "Tier 2": return "text-[#D4A853] bg-[#D4A853]/10 border-[#D4A853]/20";
    case "Tier 3": return "text-white/60 bg-white/5 border-white/10";
    default: return "text-white/40 bg-white/5 border-white/10";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft": return "text-[#F59E0B] bg-[#F59E0B]/10";
    case "approved": return "text-[#ff000c] bg-[#ff000c]/10";
    case "scheduled": return "text-[#D4A853] bg-[#D4A853]/10";
    case "posted": return "text-[#22C55E] bg-[#22C55E]/10";
    case "rejected": return "text-[#EF4444] bg-[#EF4444]/10";
    case "sent": return "text-[#22C55E] bg-[#22C55E]/10";
    case "responded": return "text-[#22C55E] bg-[#22C55E]/10";
    case "no_response": return "text-[#F59E0B] bg-[#F59E0B]/10";
    default: return "text-white/40 bg-white/5";
  }
}
