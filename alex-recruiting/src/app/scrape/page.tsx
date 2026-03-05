"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Database, Users, Loader2 } from "lucide-react";

interface ScrapeResult {
  source: string;
  results: { url: string; title: string; snippet: string }[];
  total: number;
}

export default function ScrapePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapeResult | null>(null);
  const [query, setQuery] = useState("");

  async function runCoachDiscovery() {
    setLoading("coaches");
    try {
      const res = await fetch("/api/coaches/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query || "D1 D2 OL recruiting coordinator Twitter X handle 2025" }),
      });
      const data = await res.json();
      setResults({ source: "Coach Discovery (Exa)", results: data.results || [], total: data.total || 0 });
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setLoading(null);
    }
  }

  async function runCompetitorSearch() {
    setLoading("competitors");
    try {
      const res = await fetch("/api/scrape/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults({ source: "Competitor Search (Exa)", results: data.results || [], total: data.total || 0 });
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scraping Tools</h1>
        <p className="text-sm text-slate-500">Run coach discovery, roster analysis, and competitor mapping workflows on demand</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Custom search query (optional)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Scraping Workflows */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" />
              Coach Discovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">
              Exa semantic search for D1/D2 OL coaching staff X handles, recruiting coordinators, and program contacts.
            </p>
            <Badge variant="secondary" className="mb-3 text-[10px]">Source: Exa AI</Badge>
            <Button
              size="sm"
              className="w-full"
              onClick={runCoachDiscovery}
              disabled={loading !== null}
            >
              {loading === "coaches" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Run Discovery
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              Roster Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">
              Firecrawl scrapes target school rosters to identify OL graduation gaps — schools with seniors leaving = higher recruiting priority.
            </p>
            <Badge variant="secondary" className="mb-3 text-[10px]">Source: Firecrawl</Badge>
            <Button size="sm" className="w-full" disabled={loading !== null}>
              <Database className="h-4 w-4 mr-2" />
              Analyze Rosters
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Competitor Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">
              Exa + Brave search for 2028 OL recruits in Wisconsin/Midwest — analyze posting cadence, engagement, and school interest signals.
            </p>
            <Badge variant="secondary" className="mb-3 text-[10px]">Source: Exa + Brave</Badge>
            <Button
              size="sm"
              className="w-full"
              onClick={runCompetitorSearch}
              disabled={loading !== null}
            >
              {loading === "competitors" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
              Find Competitors
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {results.source} — {results.total} results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.results.length === 0 ? (
                <p className="text-sm text-slate-500">No results found. Try a different query or check API key configuration.</p>
              ) : (
                results.results.map((r, i) => (
                  <div key={i} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-blue-600">{r.title}</p>
                    <p className="text-xs text-slate-400 truncate">{r.url}</p>
                    <p className="text-xs text-slate-600 mt-1">{r.snippet}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
