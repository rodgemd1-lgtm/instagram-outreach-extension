import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt, detectTeamMember } from "@/lib/rec/team/personas";
import { getHistory, saveMessage } from "@/lib/rec/conversation-store";
import type { TeamMemberId } from "@/lib/rec/types";

export const dynamic = "force-dynamic";

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

  const systemPrompt = await buildChatSystemPrompt(memberId);

  // Load prior conversation history for this persona
  const history = await getHistory(memberId, 20);

  // Build the full messages array: persisted history + current session messages
  const currentMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const allMessages = [...history, ...currentMessages].map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Save the latest user message (the last user message in the current request)
  const lastUserMsg = [...currentMessages].reverse().find(
    (m: { role: string }) => m.role === "user"
  );
  if (lastUserMsg) {
    await saveMessage(memberId, "user", lastUserMsg.content);
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: allMessages,
  });

  const encoder = new TextEncoder();

  // Accumulate the full assistant response so we can persist it after streaming
  let fullAssistantResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if ("text" in delta) {
              fullAssistantResponse += delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`)
              );
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // Persist the assistant response after the stream is fully delivered
        if (fullAssistantResponse) {
          await saveMessage(memberId, "assistant", fullAssistantResponse);
        }
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
