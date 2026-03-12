"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const members = [
  { id: "devin", name: "Devin", role: "Technical Director" },
  { id: "marcus", name: "Marcus Cole", role: "Recruiting Strategy" },
  { id: "nina", name: "Nina Banks", role: "Coach Intelligence" },
  { id: "trey", name: "Trey Jackson", role: "Content Strategist" },
  { id: "jordan", name: "Jordan Reeves", role: "Film & Media" },
  { id: "sophie", name: "Sophie Chen", role: "Analytics Lead" },
  { id: "casey", name: "Casey Ward", role: "Network Growth" },
];

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedMember) {
      inputRef.current?.focus();
    }
  }, [selectedMember]);

  const handleSelectMember = (memberId: string) => {
    if (selectedMember === memberId) return;
    setSelectedMember(memberId);
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedMember(null);
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedMember || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/rec/team/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember, message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add empty assistant message that we'll stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  const msg = assistantMessage;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "assistant", content: msg };
                    return updated;
                  });
                }
              } catch {
                assistantMessage += data;
                const msg = assistantMessage;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: msg };
                  return updated;
                });
              }
            }
          }
        }
      }

      // If we never got content, show a fallback
      if (!assistantMessage) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "I'm ready to help. What would you like to work on?",
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.role === "user" || m.content !== ""),
        {
          role: "assistant",
          content: "Unable to connect right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMemberData = members.find((m) => m.id === selectedMember);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
          REC Team
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Your 7-person virtual recruiting agency.
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          return (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member.id)}
              className={`group rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-[#ff000c]/50 bg-[#111111]"
                  : "border-white/5 bg-[#0A0A0A] hover:border-[#ff000c]/30 hover:bg-[#111111]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff000c]/20 text-sm font-bold text-[#ff000c]">
                  {member.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-white/40">{member.role}</p>
                </div>
              </div>
              <div
                className={`mt-3 flex items-center gap-1.5 text-xs font-medium text-[#ff000c] transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {isSelected ? "Active" : "Chat"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Chat Area */}
      {selectedMemberData && (
        <div className="mt-6 flex h-[400px] flex-col rounded-xl border border-white/5 bg-[#0A0A0A]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff000c]/20 text-xs font-bold text-[#ff000c]">
                {selectedMemberData.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedMemberData.name}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {selectedMemberData.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-white/30">
                  Send a message to start chatting with {selectedMemberData.name}.
                </p>
              </div>
            )}
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      message.role === "user"
                        ? "border border-[#ff000c]/20 bg-[#ff000c]/10 text-white"
                        : "border border-white/10 bg-white/5 text-white/90"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/40" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/40 [animation-delay:0.2s]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/40 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${selectedMemberData.name}...`}
                className="flex-1 rounded-lg border border-white/10 bg-[#111111] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c]/30 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff000c] text-white transition-colors hover:bg-[#cc000a] disabled:opacity-40 disabled:hover:bg-[#ff000c]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
