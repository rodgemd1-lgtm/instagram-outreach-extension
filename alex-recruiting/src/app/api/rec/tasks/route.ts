import { NextRequest, NextResponse } from "next/server";
import { createTask, getAllTasks, getTasksForMember, getTasksByStatus } from "@/lib/rec/tasks";
import type { TeamMemberId, RecTask } from "@/lib/rec/types";

export async function GET(req: NextRequest) {
  const assignedTo = req.nextUrl.searchParams.get("assignedTo");
  const status = req.nextUrl.searchParams.get("status");

  let tasks;
  if (assignedTo) {
    tasks = getTasksForMember(assignedTo as TeamMemberId);
  } else if (status) {
    tasks = getTasksByStatus(status as RecTask["status"]);
  } else {
    tasks = getAllTasks();
  }

  return NextResponse.json({ tasks, total: tasks.length });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.assignedTo || !data.title) {
    return NextResponse.json({ error: "assignedTo and title required" }, { status: 400 });
  }

  const task = createTask({
    assignedTo: data.assignedTo,
    title: data.title,
    description: data.description || "",
    priority: data.priority || 3,
  });

  return NextResponse.json({ task });
}
