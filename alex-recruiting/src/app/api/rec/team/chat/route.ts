import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt, detectTeamMember } from "@/lib/rec/team/personas";
import type { TeamMemberId } from "@/lib/rec/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { memberId: rawMemberId, messages } = await req.json();

  // Resolve the team member — explicit id, auto-detect from last message, or default to devin
  let memberId: TeamMemberId = rawMemberId as TeamMemberId;
  if (!memberId) {
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    memberId = (lastUserMsg ? detectTeamMember(lastUserMsg.content) : null) ?? "devin";
  }

  const systemPrompt = buildChatSystemPrompt(memberId);

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if ("text" in delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`)
              );
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
