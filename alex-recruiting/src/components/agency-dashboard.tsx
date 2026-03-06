"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Target,
  ClipboardList,
  ArrowRight,
  Search,
  PenSquare,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/rec/types";
import type { RecTask, NCSALead } from "@/lib/rec/types";

const MEMBER_AVATAR_COLORS: Record<string, string> = {
  slate: "bg-slate-700 text-white",
  amber: "bg-amber-600 text-white",
  purple: "bg-purple-600 text-white",
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  rose: "bg-rose-600 text-white",
  cyan: "bg-cyan-600 text-white",
};

const STATUS_ORDER = ["new", "researched", "followed", "dm_drafted", "dm_sent", "responded"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  researched: "Researched",
  followed: "Followed",
  dm_drafted: "DM Drafted",
  dm_sent: "DM Sent",
  responded: "Responded",
};

export function AgencyDashboard() {
  const [tasks, setTasks] = useState<RecTask[]>([]);
  const [leads, setLeads] = useState<NCSALead[]>([]);

  useEffect(() => {
    fetch("/api/rec/tasks").then(r => r.json()).then(d => setTasks(d.tasks || [])).catch(() => {});
    fetch("/api/rec/ncsa/leads").then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {});
  }, []);

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const leadsByStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.outreachStatus === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recruiting Agency</h1>
        <p className="text-sm text-slate-500 mt-1">Your 7-person virtual team, powered by AI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">7</p>
                <p className="text-xs text-slate-500">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <ClipboardList className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingTasks.length}</p>
                <p className="text-xs text-slate-500">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{leads.length}</p>
                <p className="text-xs text-slate-500">NCSA Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedTasks.length}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Your Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TEAM_MEMBERS.map((member) => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== "completed");
            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${MEMBER_AVATAR_COLORS[member.color] || "bg-slate-700 text-white"}`}>
                      {member.iconInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">{member.title}</p>
                    </div>
                    {memberTasks.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {memberTasks.length} task{memberTasks.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{member.specialty}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/agency/${member.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lead Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">NCSA Lead Pipeline</CardTitle>
            <Link href="/agency/leads">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View Pipeline <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STATUS_ORDER.map((status, i) => (
              <div key={status} className="flex items-center gap-2">
                <div className="flex flex-col items-center rounded-lg border border-slate-200 px-4 py-2 min-w-[80px]">
                  <p className="text-lg font-bold text-slate-900">{leadsByStatus[status] || 0}</p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap">{STATUS_LABELS[status]}</p>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Search className="h-3 w-3" /> Scan NCSA
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <PenSquare className="h-3 w-3" /> Draft Posts
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye className="h-3 w-3" /> Run Coach Intel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CheckCircle2 className="h-3 w-3" /> Review Approvals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
