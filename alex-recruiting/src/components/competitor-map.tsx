"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ExternalLink } from "lucide-react";

// Placeholder competitor data — will be populated via Exa + X API scraping
const sampleCompetitors = [
  {
    id: "1",
    name: "Sample Recruit A",
    xHandle: "@recruit_a_28",
    position: "OT",
    classYear: 2028,
    school: "Example HS",
    state: "WI",
    height: "6'3\"",
    weight: "275",
    followerCount: 145,
    postCadence: 3.5,
    engagementRate: 4.2,
    topContentTypes: ["Film clips", "Training videos"],
    schoolInterestSignals: ["3 coach follows"],
  },
  {
    id: "2",
    name: "Sample Recruit B",
    xHandle: "@recruit_b_ol",
    position: "OG",
    classYear: 2028,
    school: "Example HS 2",
    state: "MN",
    height: "6'2\"",
    weight: "290",
    followerCount: 89,
    postCadence: 2.0,
    engagementRate: 3.1,
    topContentTypes: ["Game highlights", "Workout posts"],
    schoolInterestSignals: ["1 coach follow"],
  },
];

export function CompetitorMap() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Competitor Recruit Map</h2>
          <p className="text-sm text-slate-500">2028 OL recruits in the Wisconsin/Midwest region</p>
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

      {/* Jacob's Comparison Row */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-blue-900">Jacob Rogers</p>
                <p className="text-xs text-blue-600">@JacobRogersOL28</p>
              </div>
              <Badge variant="performance">OL</Badge>
              <span className="text-sm">6&apos;4&quot; 285 | Pewaukee HS, WI | 2028</span>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-blue-900">0</p>
                <p className="text-[10px] text-blue-600">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">0</p>
                <p className="text-[10px] text-blue-600">Posts/wk</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">0%</p>
                <p className="text-[10px] text-blue-600">Engagement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Table */}
      <Card>
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
            {sampleCompetitors.map((comp) => (
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
      </Card>
    </div>
  );
}
