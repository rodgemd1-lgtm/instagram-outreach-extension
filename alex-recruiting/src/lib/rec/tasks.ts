// File-backed task store for development without a database
// Persists to .rec-tasks.json so data survives hot reloads
// Pattern follows src/lib/rec/knowledge/ncsa-leads.ts

import fs from "fs";
import path from "path";
import type { RecTask } from "@/lib/rec/types";
import type { TeamMemberId } from "@/lib/rec/types";

const STORE_PATH = path.join(process.cwd(), ".rec-tasks.json");

let nextId = 1;

function generateId(): string {
  return `task-${Date.now()}-${nextId++}`;
}

function readStore(): RecTask[] {
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeStore(tasks: RecTask[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(tasks, null, 2));
}

export function createTask(data: {
  assignedTo: TeamMemberId;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
}): RecTask {
  const store = readStore();
  const task: RecTask = {
    id: generateId(),
    assignedTo: data.assignedTo,
    title: data.title,
    description: data.description,
    status: "pending",
    priority: data.priority,
    createdAt: new Date().toISOString(),
    completedAt: null,
    output: null,
  };
  store.push(task);
  writeStore(store);
  return task;
}

export function getAllTasks(): RecTask[] {
  return readStore();
}

export function getTasksForMember(memberId: TeamMemberId): RecTask[] {
  return readStore().filter((t) => t.assignedTo === memberId);
}

export function getTasksByStatus(status: RecTask["status"]): RecTask[] {
  return readStore().filter((t) => t.status === status);
}

export function updateTask(
  id: string,
  updates: Partial<Pick<RecTask, "status" | "output">>
): RecTask | undefined {
  const store = readStore();
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return undefined;

  const task = { ...store[index], ...updates };
  if (updates.status === "completed" && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  }
  store[index] = task;
  writeStore(store);
  return task;
}

export function clearTasks(): void {
  writeStore([]);
}
