import { NextRequest, NextResponse } from "next/server";
import { updateTask } from "@/lib/rec/tasks";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  const updated = await updateTask(id, {
    status: data.status,
    output: data.output,
  });

  if (!updated) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task: updated });
}
