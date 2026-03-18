"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCHeroBanner,
  SCPageTransition,
} from "@/components/sc";
import { motion, AnimatePresence } from "framer-motion";
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
  const router = useRouter();
  const [tasks, setTasks] = useState<RecTask[]>([]);
  const [leads, setLeads] = useState<NCSALead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/rec/tasks").then(r => r.json()).then(d => setTasks(d.tasks || [])).catch(() => {}),
      fetch("/api/rec/ncsa/leads").then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const activeLeads = leads.filter(l => l.outreachStatus !== "responded");

  return (
    <SCPageTransition>
    <div className="space-y-6">
      <SCPageHeader
        kicker="Virtual Agency"
        title="TEAM COMMAND"
        subtitle="Virtual recruiting team coordination center"
      />

      <SCHeroBanner screen="agency" className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SCStatCard label="Team Members" value={String(TEAM_MEMBERS.length)} icon="groups" />
        <SCStatCard label="Active Tasks" value={String(pendingTasks.length)} icon="task" />
        <SCStatCard label="Completed" value={String(completedTasks.length)} icon="task_alt" />
        <SCStatCard label="Active Leads" value={String(activeLeads.length)} icon="trending_up" />
      </div>

      {/* Loading State */}
      {loading && (
        <SCGlassCard className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
          <span className="ml-3 text-sm text-slate-400">Loading team data...</span>
        </SCGlassCard>
      )}

      {/* Team Grid */}
      {!loading && (
      <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-sc-primary">badge</span>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Team Roster
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id);
            const activeTasks = memberTasks.filter(t => t.status === "in_progress");
            const pendingMemberTasks = memberTasks.filter(t => t.status === "pending");
            const isExpanded = expandedMember === member.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
              >
                <SCGlassCard
                  className="p-4 transition-all hover:border-sc-primary/30 cursor-pointer"
                  onClick={() => router.push(`/agency/${member.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${MEMBER_COLORS[member.color] || "bg-white/10"}`}
                    >
                      <span className="text-sm font-black text-white">
                        {member.iconInitials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{member.name}</p>
                        {activeTasks.length > 0 && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{member.title}</p>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-white/20">
                      arrow_forward
                    </span>
                  </div>

                  {/* Task stats row */}
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {pendingMemberTasks.length} pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">play_circle</span>
                      {activeTasks.length} active
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      {memberTasks.filter(t => t.status === "completed").length} done
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <SCButton
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/agency/${member.id}`);
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      Chat
                    </SCButton>
                    <SCButton
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMember(isExpanded ? null : member.id);
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isExpanded ? "expand_less" : "checklist"}
                      </span>
                      {isExpanded ? "Hide Tasks" : "View Tasks"}
                    </SCButton>
                  </div>

                  {/* Expandable task list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mt-3 border-t border-white/5 pt-3 space-y-2">
                          {[...activeTasks, ...pendingMemberTasks].length === 0 ? (
                            <p className="text-[11px] text-slate-600 text-center py-2">
                              No active tasks
                            </p>
                          ) : (
                            [...activeTasks, ...pendingMemberTasks].slice(0, 5).map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
                              >
                                <SCBadge
                                  variant={task.status === "in_progress" ? "success" : "default"}
                                >
                                  {task.status === "in_progress" ? "Active" : "Pending"}
                                </SCBadge>
                                <p className="flex-1 text-[11px] text-slate-400 truncate">
                                  {task.title}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SCGlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Task Queue */}
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-slate-400">checklist</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Task Queue
            </h2>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 8).map((task) => (
              <SCGlassCard key={task.id} className="flex items-center gap-4 px-4 py-3">
                <SCBadge
                  variant={task.status === "in_progress" ? "success" : "default"}
                >
                  {task.status === "in_progress" ? "Active" : "Pending"}
                </SCBadge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{task.title}</p>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0">
                  {task.assignedTo}
                </span>
              </SCGlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Lead Pipeline Summary */}
      {leads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-slate-400">funnel</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Lead Pipeline
            </h2>
          </div>
          <SCGlassCard className="p-4">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {["new", "researched", "followed", "dm_drafted", "dm_sent", "responded"].map((status) => {
                const count = leads.filter(l => l.outreachStatus === status).length;
                return (
                  <div key={status} className="text-center">
                    <p className="text-2xl font-black text-white">{count}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600">
                      {status.replace(/_/g, " ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </SCGlassCard>
        </div>
      )}
      </>
      )}
    </div>
    </SCPageTransition>
  );
}
