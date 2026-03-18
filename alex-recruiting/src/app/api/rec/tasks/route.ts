import { NextRequest, NextResponse } from "next/server";
import { createTask, getAllTasks, getTasksForMember, getTasksByStatus } from "@/lib/rec/tasks";
import type { TeamMemberId, RecTask } from "@/lib/rec/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const assignedTo = req.nextUrl.searchParams.get("assignedTo");
  const status = req.nextUrl.searchParams.get("status");

  try {
    let tasks;
    if (assignedTo) {
      tasks = await getTasksForMember(assignedTo as TeamMemberId);
    } else if (status) {
      tasks = await getTasksByStatus(status as RecTask["status"]);
    } else {
      tasks = await getAllTasks();
    }

    return NextResponse.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error("[GET /api/rec/tasks] Error:", error);
    // Return empty array on DB errors (e.g., missing columns not yet migrated)
    return NextResponse.json({ tasks: [], total: 0, error: "Failed to fetch tasks" });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.assignedTo || !data.title) {
    return NextResponse.json({ error: "assignedTo and title required" }, { status: 400 });
  }

  const task = await createTask({
    assignedTo: data.assignedTo,
    title: data.title,
    description: data.description || "",
    priority: data.priority || 3,
  });

  return NextResponse.json({ task });
}
