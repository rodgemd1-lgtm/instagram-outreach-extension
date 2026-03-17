import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, data_type, company_id } = body;

    if (!url || !data_type) {
      return NextResponse.json(
        { error: "url and data_type required" },
        { status: 400 }
      );
    }

    // This endpoint is called by the ingestion pipeline
    // In production, it calls Susan's ingest_url MCP tool
    // For now, log and return success shape
    void `[Research] Ingesting: ${url} as ${data_type} for ${company_id}`;

    return NextResponse.json({
      success: true,
      url,
      data_type,
      company_id,
      chunks_created: 0, // populated by Susan MCP
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error("[research/ingest] Ingestion failed:", error);
    return NextResponse.json(
      { error: "Ingestion failed", details },
      { status: 500 }
    );
  }
}
