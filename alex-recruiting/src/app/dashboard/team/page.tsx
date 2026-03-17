"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

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

const MEMBER_COLORS: Record<string, string> = {
  devin: "#C5050C",
  marcus: "#3B82F6",
  nina: "#D4A853",
  trey: "#22C55E",
  jordan: "#F59E0B",
  sophie: "#3B82F6",
  casey: "#22C55E",
};

const MEMBER_TAGS: Record<string, string[]> = {
  devin: ["Architecture", "Integrations", "Coordination"],
  marcus: ["NCAA Rules", "School Targeting", "Camp Strategy"],
  nina: ["Coach Intel", "NCSA", "DM Strategy"],
  trey: ["Content Calendar", "Hashtags", "Post Drafting"],
  jordan: ["Video Library", "Highlight Reels", "Clip Editing"],
  sophie: ["Scoring Engine", "Engagement Metrics", "Competitor Analysis"],
  casey: ["Follow Strategy", "Peer Network", "Community"],
};

const MEMBER_PROMPTS: Record<string, string[]> = {
  devin: ["System status report", "What needs attention today?", "Recruiting pipeline summary"],
  marcus: ["NCAA calendar update", "Which camps to register for?", "Recruiting strategy check"],
  nina: ["Who should I DM next?", "Any new coach activity?", "Draft a follow-up message"],
  trey: ["What should I post today?", "Content performance recap", "Draft a training post"],
  jordan: ["Film highlight status", "Best clips this week", "What footage needs editing?"],
  sophie: ["Weekly analytics report", "Engagement trends", "Profile audit score"],
  casey: ["New connections to make", "Peer recruit updates", "Engagement opportunities"],
};

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
    <div className="space-y-6">
      {/* Header */}
      <SCPageHeader
        title="TEAM ROSTER"
        subtitle="Your 7-person virtual recruiting agency"
      />

      {/* Team Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          const color = MEMBER_COLORS[member.id];
          return (
            <SCGlassCard
              key={member.id}
              variant={isSelected ? "strong" : "default"}
              className={`cursor-pointer transition-all ${
                isSelected ? "ring-1 ring-sc-primary" : "hover:border-white/20"
              }`}
            >
              <button
                onClick={() => handleSelectMember(member.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      boxShadow: `0 0 0 2px ${color}`,
                      color: color,
                      backgroundColor: `${color}15`,
                    }}
                  >
                    {member.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold transition-opacity ${
                  isSelected ? "text-sc-primary opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
                }`}>
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  {isSelected ? "Active" : "Chat"}
                </div>
              </button>
            </SCGlassCard>
          );
        })}
      </div>

      {/* Inline Chat Area */}
      {selectedMemberData && (
        <SCGlassCard variant="strong" className="flex min-h-[500px] flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-sc-border px-5 py-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  boxShadow: `0 0 0 2px ${MEMBER_COLORS[selectedMemberData.id]}`,
                  color: MEMBER_COLORS[selectedMemberData.id],
                  backgroundColor: `${MEMBER_COLORS[selectedMemberData.id]}15`,
                }}
              >
                {selectedMemberData.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedMemberData.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    {selectedMemberData.role}
                  </p>
                  <span className="text-[10px] text-slate-600">|</span>
                  {MEMBER_TAGS[selectedMemberData.id]?.map((tag) => (
                    <SCBadge key={tag} variant="default" className="text-[9px]">
                      {tag}
                    </SCBadge>
                  ))}
                </div>
              </div>
            </div>
            <SCButton variant="ghost" size="sm" onClick={handleClose}>
              <span className="material-symbols-outlined text-[16px]">close</span>
            </SCButton>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
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
                        ? "bg-sc-primary text-white"
                        : "bg-white/5 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-white/5 px-4 py-3">
                    <p className="animate-pulse text-xs text-slate-500">
                      {selectedMemberData.name} is analyzing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-sc-border px-4 py-3">
            {/* Quick prompts */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {MEMBER_PROMPTS[selectedMemberData.id]?.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputValue(prompt)}
                  className="rounded-full border border-sc-border px-2.5 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
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
                className="flex-1 rounded-lg border border-sc-border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sc-primary/50 focus:outline-none"
                disabled={isLoading}
              />
              <SCButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </SCButton>
            </div>
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}
