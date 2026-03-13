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

const MEMBER_COLORS: Record<string, string> = {
  devin: "#0F1720",
  marcus: "#0F1720",
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0F1720]">
          REC Team
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Your 7-person virtual recruiting agency
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          const color = MEMBER_COLORS[member.id];
          return (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member.id)}
              className={`group rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? "ring-2 ring-[#0F1720] border-[#E5E7EB] bg-white"
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar with colored ring */}
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
                  <p className="truncate text-sm font-semibold text-[#0F1720]">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">{member.role}</p>
                </div>
              </div>
              <div
                className={`mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0F1720] transition-opacity ${
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
        <div className="mt-6 flex min-h-[500px] flex-col rounded-lg border border-[#E5E7EB] bg-white">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
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
                <p className="text-sm font-semibold text-[#0F1720]">
                  {selectedMemberData.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280]">
                    {selectedMemberData.role}
                  </p>
                  <span className="text-[10px] text-[#D1D5DB]">|</span>
                  {MEMBER_TAGS[selectedMemberData.id]?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[9px] text-[#6B7280]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F5F5F4] hover:text-[#0F1720]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[#6B7280]">
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
                        ? "bg-[#0F1720] text-white"
                        : "bg-[#F5F5F4] text-[#0F1720]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-[#F5F5F4] px-4 py-3">
                    <p className="animate-pulse text-xs text-[#6B7280]">
                      {selectedMemberData.name} is analyzing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-[#E5E7EB] px-4 py-3">
            {/* Quick prompts */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {MEMBER_PROMPTS[selectedMemberData.id]?.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputValue(prompt)}
                  className="rounded-full border border-[#E5E7EB] px-2.5 py-1 text-[11px] text-[#6B7280] transition-colors hover:bg-[#F5F5F4] hover:text-[#0F1720]"
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
                className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#0F1720] placeholder:text-[#9CA3AF] focus:border-[#0F1720] focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F1720] text-white transition-colors hover:bg-[#1F2937] disabled:opacity-40 disabled:hover:bg-[#0F1720]"
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
