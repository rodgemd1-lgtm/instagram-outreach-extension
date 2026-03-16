"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  StitchPageHeader,
  StatCard,
  GlassCard,
  StitchButton,
  StitchBadge,
  FlashDot,
} from "@/components/stitch";
import { TEAM_MEMBERS } from "@/lib/rec/types";
import type { RecTask, NCSALead } from "@/lib/rec/types";

const MEMBER_COLORS: Record<string, string> = {
  slate: "bg-white/10",
  amber: "bg-amber-500/20",
  purple: "bg-purple-500/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
  rose: "bg-rose-500/20",
  cyan: "bg-cyan-500/20",
};

export default function AgencyPage() {
  const [tasks, setTasks] = useState<RecTask[]>([]);
  const [leads, setLeads] = useState<NCSALead[]>([]);

  useEffect(() => {
    fetch("/api/rec/tasks").then(r => r.json()).then(d => setTasks(d.tasks || [])).catch(() => {});
    fetch("/api/rec/ncsa/leads").then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {});
  }, []);

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const activeLeads = leads.filter(l => l.outreachStatus !== "responded");

  return (
    <div className="space-y-6">
      <StitchPageHeader
        title="Agency"
        subtitle="Virtual recruiting team coordination center"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Team Members" value={TEAM_MEMBERS.length} />
        <StatCard label="Active Tasks" value={pendingTasks.length} />
        <StatCard label="Completed" value={completedTasks.length} />
        <StatCard label="Active Leads" value={activeLeads.length} />
      </div>

      {/* Team Grid */}
      <div>
        <h2 className="stitch-label mb-4">Team Roster</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id);
            const activeTasks = memberTasks.filter(t => t.status === "in_progress");

            return (
              <Link key={member.id} href={`/agency/${member.id}`}>
                <GlassCard className="p-4 transition-all hover:border-white/10 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${MEMBER_COLORS[member.color] || "bg-white/10"}`}
                    >
                      <span className="text-sm font-bold text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{member.name}</p>
                        {activeTasks.length > 0 && <FlashDot color="green" />}
                      </div>
                      <p className="text-[11px] text-white/40 truncate">{member.role}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20" />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-white/30">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {memberTasks.filter(t => t.status === "pending").length} pending
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {memberTasks.filter(t => t.status === "completed").length} done
                    </span>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="stitch-label mb-4">Active Tasks</h2>
          <div className="space-y-2">
            {pendingTasks.slice(0, 8).map((task) => (
              <GlassCard key={task.id} className="flex items-center gap-4 px-4 py-3">
                <StitchBadge
                  variant={task.status === "in_progress" ? "green" : "default"}
                  dot
                >
                  {task.status === "in_progress" ? "Active" : "Pending"}
                </StitchBadge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{task.title}</p>
                </div>
                <span className="text-[10px] text-white/25 shrink-0">
                  {task.assignedTo}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Lead Pipeline Summary */}
      {leads.length > 0 && (
        <div>
          <h2 className="stitch-label mb-4">Lead Pipeline</h2>
          <GlassCard className="p-4">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {["new", "researched", "followed", "dm_drafted", "dm_sent", "responded"].map((status) => {
                const count = leads.filter(l => l.outreachStatus === status).length;
                return (
                  <div key={status} className="text-center">
                    <p className="text-2xl font-black text-white">{count}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">
                      {status.replace(/_/g, " ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
