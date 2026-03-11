"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export interface CoachFilterValues {
  search: string;
  division: string;
  tier: string;
  dmStatus: string;
}

interface CoachFiltersProps {
  onFilterChange: (filters: CoachFilterValues) => void;
}

const inputClass =
  "rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-xs text-dash-text focus:border-dash-accent focus:outline-none";

export function CoachFilters({ onFilterChange }: CoachFiltersProps) {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("All");
  const [tier, setTier] = useState("All");
  const [dmStatus, setDmStatus] = useState("All");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search, division, tier, dmStatus });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Immediate update for dropdowns
  useEffect(() => {
    onFilterChange({ search, division, tier, dmStatus });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, tier, dmStatus]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
        <input
          type="text"
          placeholder="Search coaches or schools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-56 pl-8`}
        />
      </div>

      <select
        value={division}
        onChange={(e) => setDivision(e.target.value)}
        className={inputClass}
      >
        <option value="All">All Divisions</option>
        <option value="D1 FBS">D1 FBS</option>
        <option value="D1 FCS">D1 FCS</option>
        <option value="D2">D2</option>
        <option value="D3">D3</option>
        <option value="NAIA">NAIA</option>
      </select>

      <select
        value={tier}
        onChange={(e) => setTier(e.target.value)}
        className={inputClass}
      >
        <option value="All">All Tiers</option>
        <option value="Tier 1">Tier 1</option>
        <option value="Tier 2">Tier 2</option>
        <option value="Tier 3">Tier 3</option>
      </select>

      <select
        value={dmStatus}
        onChange={(e) => setDmStatus(e.target.value)}
        className={inputClass}
      >
        <option value="All">All DM Status</option>
        <option value="not_sent">Not Sent</option>
        <option value="drafted">Drafted</option>
        <option value="sent">Sent</option>
        <option value="responded">Responded</option>
      </select>
    </div>
  );
}
