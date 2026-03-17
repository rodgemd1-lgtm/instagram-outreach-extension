import { NextResponse } from "next/server";
import { getAllStreams, getStreamByName } from "@/lib/research/streams";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const { streamName } = body;

  const streams = streamName
    ? [getStreamByName(streamName)].filter(Boolean)
    : getAllStreams();

  const results = [];

  for (const stream of streams) {
    if (!stream) continue;
    for (const url of stream.urls) {
      if (stream.scrapeStrategy === "susan_ingest") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/research/ingest`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url,
                data_type: stream.dataType,
                company_id: "alex-recruiting",
              }),
            }
          );
          const data = await res.json();
          results.push({ url, stream: stream.name, ...data });
        } catch (error) {
          results.push({ url, stream: stream.name, success: false, error: String(error) });
        }
      }
    }
  }

  return NextResponse.json({ results, total: results.length });
}
