"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TEAM_MEMBERS } from "@/lib/rec/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MEMBER_AVATAR_COLORS: Record<string, string> = {
  slate: "bg-slate-700 text-white",
  amber: "bg-amber-600 text-white",
  purple: "bg-purple-600 text-white",
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  rose: "bg-rose-600 text-white",
  cyan: "bg-cyan-600 text-white",
};

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  devin: [
    "What's the team's status this week?",
    "What should we prioritize next?",
    "Run a system health check",
  ],
  marcus: [
    "Are we in a dead period right now?",
    "Which schools should we target first?",
    "What milestones should Jacob hit this year?",
  ],
  nina: [
    "Show me the NCSA lead pipeline",
    "Draft outreach for the top 3 leads",
    "Which coaches should we follow this week?",
  ],
  trey: [
    "Draft 3 posts for this week",
    "What content should we post next?",
    "Audit Jacob's X profile",
  ],
  jordan: [
    "Pick the best 5 clips for a highlight reel",
    "Which training clips should we post?",
    "What film do coaches want to see from an OL?",
  ],
  sophie: [
    "Give me this week's intelligence brief",
    "How do we compare to competitor recruits?",
    "Which schools are the best fit for Jacob?",
  ],
  casey: [
    "Who should Jacob follow this week?",
    "What's our follower growth strategy?",
    "Which recruiting accounts should we engage with?",
  ],
};

export function TeamChat({ memberId }: { memberId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const member = TEAM_MEMBERS.find((m) => m.id === memberId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!member) return null;

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/rec/team/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, messages: newMessages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
                }
              } catch {
                // skip unparseable
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
      {/* Member Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Link href="/agency">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${MEMBER_AVATAR_COLORS[member.color] || "bg-slate-700 text-white"}`}>
              {member.iconInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{member.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 ml-[76px]">
            {member.owns.map((item) => (
              <Badge key={item} variant="secondary" className="text-[10px]">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold mb-4 ${MEMBER_AVATAR_COLORS[member.color] || "bg-slate-700 text-white"}`}>
              {member.iconInitials}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Chat with {member.name}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">{member.specialty}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {(SUGGESTED_PROMPTS[memberId] || []).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${MEMBER_AVATAR_COLORS[member.color] || "bg-slate-700 text-white"}`}>
                {member.iconInitials}
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && msg.content === "" && isStreaming && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-200">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${member.name}...`}
          disabled={isStreaming}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isStreaming}
          className="rounded-full h-10 w-10 p-0"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
