"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Filter, UserPlus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Coach {
  id: string;
  name: string;
  title: string;
  schoolName: string;
  division: string;
  conference: string;
  xHandle: string;
  dmOpen: boolean;
  followStatus: string;
  dmStatus: string;
  priorityTier: string;
  olNeedScore: number;
  xActivityScore: number;
  notes: string;
}

export function CoachCRM() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function fetchCoaches() {
    try {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      setCoaches(data.coaches);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = coaches.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.schoolName.toLowerCase().includes(search.toLowerCase());
    const matchesTier = !tierFilter || c.priorityTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const tierCounts = {
    "Tier 1": coaches.filter((c) => c.priorityTier === "Tier 1").length,
    "Tier 2": coaches.filter((c) => c.priorityTier === "Tier 2").length,
    "Tier 3": coaches.filter((c) => c.priorityTier === "Tier 3").length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTierFilter(null)}>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{coaches.length}</p>
            <p className="text-xs text-slate-500">Total Coaches</p>
          </CardContent>
        </Card>
        {Object.entries(tierCounts).map(([tier, count]) => (
          <Card
            key={tier}
            className={cn("cursor-pointer hover:shadow-md transition-shadow", tierFilter === tier && "ring-2 ring-slate-900")}
            onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-slate-500">{tier}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search coaches or schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Coach Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Follow</TableHead>
              <TableHead>DM</TableHead>
              <TableHead>OL Need</TableHead>
              <TableHead>X Handle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Loading coach database...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No coaches found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{coach.name}</p>
                      <p className="text-xs text-slate-500">{coach.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{coach.schoolName}</TableCell>
                  <TableCell>
                    <span className="text-xs">{coach.division}</span>
                    <br />
                    <span className="text-xs text-slate-400">{coach.conference}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3"}>
                      {coach.priorityTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.followStatus === "followed_back" ? "posted" : coach.followStatus === "followed" ? "approved" : "secondary"}>
                      {coach.followStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.dmStatus === "responded" ? "responded" : coach.dmStatus === "sent" ? "sent" : "secondary"}>
                      {coach.dmStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-2 w-2 rounded-full",
                            i < coach.olNeedScore ? "bg-blue-500" : "bg-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coach.xHandle ? (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        {coach.xHandle}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
