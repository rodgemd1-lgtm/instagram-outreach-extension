import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function TeamPage() {
  const members = [
    { id: "devin", name: "Devin", role: "Technical Director", color: "bg-blue-500" },
    { id: "marcus", name: "Marcus Cole", role: "Recruiting Strategy", color: "bg-green-500" },
    { id: "nina", name: "Nina Banks", role: "Coach Intelligence", color: "bg-purple-500" },
    { id: "trey", name: "Trey Jackson", role: "Content Strategist", color: "bg-orange-500" },
    { id: "jordan", name: "Jordan Reeves", role: "Film & Media", color: "bg-red-500" },
    { id: "sophie", name: "Sophie Chen", role: "Analytics Lead", color: "bg-cyan-500" },
    { id: "casey", name: "Casey Ward", role: "Network Growth", color: "bg-yellow-500" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          REC Team
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Your 7-person virtual recruiting team. Chat with any member.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/agency/${member.id}`}
            className="group rounded-xl border border-dash-border bg-dash-surface p-5 transition-colors hover:border-dash-accent/30 hover:bg-dash-surface-raised"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${member.color} text-sm font-bold text-white`}
              >
                {member.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-dash-text">
                  {member.name}
                </p>
                <p className="text-xs text-dash-muted">{member.role}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-dash-accent opacity-0 transition-opacity group-hover:opacity-100">
              <MessageSquare className="h-3.5 w-3.5" />
              Start chat
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
