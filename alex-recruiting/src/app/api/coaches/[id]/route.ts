import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ message: `Coach ${params.id} endpoint ready` });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  return NextResponse.json({ message: `Coach ${params.id} updated`, data: body });
}
