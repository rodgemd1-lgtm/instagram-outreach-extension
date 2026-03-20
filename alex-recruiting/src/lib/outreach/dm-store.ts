// Shared in-memory DM store — used by /api/dms and seed routes
import type { DMMessage } from "@/lib/types";

export const dmStore: DMMessage[] = [];

export function insertDM(data: Omit<DMMessage, "id" | "createdAt">): DMMessage {
  const dm: DMMessage = {
    ...data,
    id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  dmStore.push(dm);
  return dm;
}
