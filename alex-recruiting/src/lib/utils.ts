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
    case "performance": return "bg-blue-500";
    case "work_ethic": return "bg-orange-500";
    case "character": return "bg-green-500";
    default: return "bg-gray-500";
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
    case "Tier 1": return "text-purple-600 bg-purple-50 border-purple-200";
    case "Tier 2": return "text-blue-600 bg-blue-50 border-blue-200";
    case "Tier 3": return "text-green-600 bg-green-50 border-green-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft": return "text-yellow-600 bg-yellow-50";
    case "approved": return "text-blue-600 bg-blue-50";
    case "scheduled": return "text-purple-600 bg-purple-50";
    case "posted": return "text-green-600 bg-green-50";
    case "rejected": return "text-red-600 bg-red-50";
    case "sent": return "text-green-600 bg-green-50";
    case "responded": return "text-emerald-600 bg-emerald-50";
    case "no_response": return "text-orange-600 bg-orange-50";
    default: return "text-gray-600 bg-gray-50";
  }
}
