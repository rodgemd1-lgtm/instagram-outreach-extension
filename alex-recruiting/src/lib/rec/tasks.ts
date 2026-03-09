// Supabase-backed task store using Drizzle ORM
// Migrated from file-backed .rec-tasks.json to PostgreSQL

import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { recTasks } from "@/lib/db/schema";
import type { RecTask, TeamMemberId } from "@/lib/rec/types";

let nextId = 1;

function generateId(): string {
  return `task-${Date.now()}-${nextId++}`;
}

// Map a database row to the RecTask type expected by API consumers
function rowToTask(row: typeof recTasks.$inferSelect): RecTask {
  return {
    id: row.id,
    assignedTo: row.assignedTo as TeamMemberId,
    title: row.title,
    description: row.description ?? "",
    status: row.status as RecTask["status"],
    priority: (row.priority ?? 3) as RecTask["priority"],
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    output: row.output ?? null,
  };
}

// ---- In-memory fallback for development without a database ----

const memoryTasks: RecTask[] = [
  {
    id: "task-design-studio-audit-recruit-website",
    assignedTo: "devin",
    title: "Bring in Susan's full design studio to audit and update Jake's recruit website",
    description:
      "Coordinate Susan's full design studio team to audit Jake's recruit website and implement updates across design, messaging, accessibility, trust signals, and conversion flow.",
    status: "pending",
    priority: 1,
    createdAt: "2026-03-08T00:00:00.000Z",
    completedAt: null,
    output: null,
  },
];

function memCreateTask(data: {
  assignedTo: TeamMemberId;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
}): RecTask {
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
  memoryTasks.push(task);
  return task;
}

function memGetAllTasks(): RecTask[] {
  return [...memoryTasks];
}

function memGetTasksForMember(memberId: TeamMemberId): RecTask[] {
  return memoryTasks.filter((t) => t.assignedTo === memberId);
}

function memGetTasksByStatus(status: RecTask["status"]): RecTask[] {
  return memoryTasks.filter((t) => t.status === status);
}

function memUpdateTask(
  id: string,
  updates: Partial<Pick<RecTask, "status" | "output">>
): RecTask | undefined {
  const index = memoryTasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const task = { ...memoryTasks[index], ...updates };
  if (updates.status === "completed" && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  }
  memoryTasks[index] = task;
  return task;
}

// ---- Public API (async, database-backed with in-memory fallback) ----

export async function createTask(data: {
  assignedTo: TeamMemberId;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
}): Promise<RecTask> {
  if (!isDbConfigured()) {
    return memCreateTask(data);
  }

  const id = generateId();
  const now = new Date();

  const [row] = await db
    .insert(recTasks)
    .values({
      id,
      assignedTo: data.assignedTo,
      title: data.title,
      description: data.description,
      status: "pending",
      priority: data.priority,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      output: null,
    })
    .returning();

  return rowToTask(row);
}

export async function getAllTasks(): Promise<RecTask[]> {
  if (!isDbConfigured()) {
    return memGetAllTasks();
  }

  const rows = await db.select().from(recTasks);
  return rows.map(rowToTask);
}

export async function getTasksForMember(
  memberId: TeamMemberId
): Promise<RecTask[]> {
  if (!isDbConfigured()) {
    return memGetTasksForMember(memberId);
  }

  const rows = await db
    .select()
    .from(recTasks)
    .where(eq(recTasks.assignedTo, memberId));
  return rows.map(rowToTask);
}

export async function getTasksByStatus(
  status: RecTask["status"]
): Promise<RecTask[]> {
  if (!isDbConfigured()) {
    return memGetTasksByStatus(status);
  }

  const rows = await db
    .select()
    .from(recTasks)
    .where(eq(recTasks.status, status));
  return rows.map(rowToTask);
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<RecTask, "status" | "output">>
): Promise<RecTask | undefined> {
  if (!isDbConfigured()) {
    return memUpdateTask(id, updates);
  }

  const values: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.status !== undefined) {
    values.status = updates.status;
    if (updates.status === "completed") {
      values.completedAt = new Date();
    }
  }
  if (updates.output !== undefined) {
    values.output = updates.output;
  }

  const [row] = await db
    .update(recTasks)
    .set(values)
    .where(eq(recTasks.id, id))
    .returning();

  if (!row) return undefined;
  return rowToTask(row);
}

export async function clearTasks(): Promise<void> {
  if (!isDbConfigured()) {
    memoryTasks.length = 0;
    return;
  }

  await db.delete(recTasks);
}
