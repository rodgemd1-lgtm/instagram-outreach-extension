"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ExternalLink } from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  xHandle: string;
  position: string;
  classYear: number;
  school: string;
  state: string;
  height: string;
  weight: string;
  followerCount: number;
  postCadence: number;
  engagementRate: number;
  topContentTypes: string[];
  schoolInterestSignals: string[];
}

interface JacobStats {
  followers: number;
  postsPerWeek: number;
  engagementRate: number;
}

export function CompetitorMap() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [jacobStats, setJacobStats] = useState<JacobStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Jacob's live stats
        const dashRes = await fetch("/api/dashboard/live");
        if (dashRes.ok) {
          const data = await dashRes.json();
          setJacobStats({
            followers: data.followers?.count ?? 0,
            postsPerWeek: data.posts?.thisWeek ?? 0,
            engagementRate: data.engagement?.rate ?? 0,
          });
        }
      } catch {
        // Will show '--' if fetch fails
      }

      try {
        // Fetch competitor data
        const compRes = await fetch("/api/intelligence/competitors");
        if (compRes.ok) {
          const data = await compRes.json();
          setCompetitors(data.competitors || []);
        }
      } catch {
        // Empty state is fine
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Competitor Recruit Map</h2>
          <p className="text-sm text-slate-500">2029 OL recruits in the Wisconsin/Midwest region</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Discover Competitors
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Jacob's Comparison Row — fetched dynamically */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-blue-900">Jacob Rodgers</p>
                <p className="text-xs text-blue-600">@JacobRodge52987</p>
              </div>
              <Badge variant="performance">OL</Badge>
              <span className="text-sm">6&apos;4&quot; 285 | Pewaukee HS, WI | 2029</span>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-blue-900">
                  {jacobStats ? jacobStats.followers : (loading ? "..." : "--")}
                </p>
                <p className="text-[10px] text-blue-600">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">
                  {jacobStats ? jacobStats.postsPerWeek : (loading ? "..." : "--")}
                </p>
                <p className="text-[10px] text-blue-600">Posts/wk</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">
                  {jacobStats ? `${jacobStats.engagementRate}%` : (loading ? "..." : "--%")}
                </p>
                <p className="text-[10px] text-blue-600">Engagement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Table */}
      <Card className="overflow-x-auto">
        {competitors.length === 0 && !loading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No competitor data available yet. Click &quot;Discover Competitors&quot; to scan for 2029 OL recruits.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recruit</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Posts/wk</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Signals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{comp.name}</p>
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        {comp.xHandle} <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{comp.position}</Badge></TableCell>
                  <TableCell className="text-sm">{comp.height} {comp.weight}</TableCell>
                  <TableCell className="text-sm">{comp.school}, {comp.state}</TableCell>
                  <TableCell className="text-sm font-medium">{comp.followerCount}</TableCell>
                  <TableCell className="text-sm">{comp.postCadence}</TableCell>
                  <TableCell className="text-sm">{comp.engagementRate}%</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {comp.schoolInterestSignals.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
