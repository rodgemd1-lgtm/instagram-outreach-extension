"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "coach" | "school" | "page";
  label: string;
  sub: string;
  href: string;
}

const QUICK_NAV: SearchResult[] = [
  { type: "page", label: "Dashboard", sub: "Command Center", href: "/dashboard" },
  { type: "page", label: "Outreach", sub: "DM Pipeline", href: "/dashboard/outreach" },
  { type: "page", label: "Coaches", sub: "Coach Database", href: "/dashboard/coaches" },
  { type: "page", label: "Analytics", sub: "X Analytics", href: "/dashboard/analytics" },
  { type: "page", label: "Content Queue", sub: "Post Calendar", href: "/content-queue" },
  { type: "page", label: "Intelligence", sub: "Coach Intel", href: "/intelligence" },
  { type: "page", label: "Messages", sub: "DM Console", href: "/dms" },
  { type: "page", label: "Agency", sub: "REC Team", href: "/agency" },
  { type: "page", label: "Competitors", sub: "Recruit Tracker", href: "/competitors" },
  { type: "page", label: "Map", sub: "School Map", href: "/map" },
];

export function SCHeader() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search coaches + pages
  const handleSearch = useCallback(async (query: string) => {
    setSearchValue(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    setNotifOpen(false);
    setSettingsOpen(false);
    setUserOpen(false);

    const q = query.toLowerCase();
    // Search pages first
    const pageMatches = QUICK_NAV.filter(
      (p) => p.label.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)
    );

    // Search coaches from API
    let coachMatches: SearchResult[] = [];
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data = await res.json();
        const coaches = Array.isArray(data) ? data : data.coaches || [];
        coachMatches = coaches
          .filter(
            (c: { name?: string; schoolName?: string }) =>
              c.name?.toLowerCase().includes(q) ||
              c.schoolName?.toLowerCase().includes(q)
          )
          .slice(0, 8)
          .map((c: { id?: string; name?: string; schoolName?: string }) => ({
            type: "coach" as const,
            label: c.name || "Unknown",
            sub: c.schoolName || "",
            href: `/dashboard/coaches?highlight=${c.id}`,
          }));
      }
    } catch {
      /* non-critical */
    }

    setSearchResults([...pageMatches.slice(0, 4), ...coachMatches]);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setSearchOpen(false);
    setSearchValue("");
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  // Close all dropdowns on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setSettingsOpen(false);
        setUserOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close other dropdowns when opening one
  const toggleNotif = () => { setNotifOpen(!notifOpen); setSettingsOpen(false); setUserOpen(false); };
  const toggleSettings = () => { setSettingsOpen(!settingsOpen); setNotifOpen(false); setUserOpen(false); };
  const toggleUser = () => { setUserOpen(!userOpen); setNotifOpen(false); setSettingsOpen(false); };

  return (
    <header className="sticky top-0 z-50 h-16 bg-sc-bg/80 backdrop-blur-md border-b border-sc-border flex items-center justify-between px-6 gap-4">
      {/* Left: Search bar */}
      <div ref={searchRef} role="search" className="flex items-center gap-3 flex-1 max-w-md relative">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sc-text-dim text-lg">
            search
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchValue.trim() && setSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search coaches, schools, content..."
            aria-label="Search coaches, schools, and content"
            aria-expanded={searchOpen && searchResults.length > 0}
            aria-controls={searchOpen && searchResults.length > 0 ? "search-results" : undefined}
            role="combobox"
            aria-autocomplete="list"
            className="w-full bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-sc-text placeholder:text-sc-text-dim focus:outline-none focus:ring-2 focus:ring-sc-primary/50"
          />
        </div>

        {/* Search results dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div id="search-results" role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-sc-surface border border-sc-border rounded-lg shadow-xl overflow-hidden z-[60]">
            {searchResults.map((r, i) => (
              <button
                key={`${r.type}-${r.href}-${i}`}
                role="option"
                aria-selected={false}
                onClick={() => handleResultClick(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left focus-visible:outline-none focus-visible:bg-white/10"
              >
                <span className="material-symbols-outlined text-sm text-sc-text-muted">
                  {r.type === "coach" ? "person" : r.type === "school" ? "school" : "dashboard"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.label}</p>
                  <p className="text-xs text-slate-500 truncate">{r.sub}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                  {r.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-4">
        {/* Live command status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sc-accent-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sc-accent-green" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sc-accent-green">
            Live Command
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleNotif}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <span className="material-symbols-outlined text-sc-text-muted text-xl">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sc-primary" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-sc-surface border border-sc-border rounded-lg shadow-xl z-[60] overflow-hidden">
              <div className="px-4 py-3 border-b border-sc-border">
                <p className="text-sm font-bold text-white">Notifications</p>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-sc-accent-green text-sm mt-0.5">check_circle</span>
                  <div>
                    <p className="text-xs text-white">OAuth credentials active</p>
                    <p className="text-[10px] text-slate-500">X API writes are now enabled</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-sc-primary text-sm mt-0.5">group</span>
                  <div>
                    <p className="text-xs text-white">424 coaches in database</p>
                    <p className="text-[10px] text-slate-500">305 OL + 119 DL coaches tracked</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">schedule</span>
                  <div>
                    <p className="text-xs text-white">Content queue ready</p>
                    <p className="text-[10px] text-slate-500">Generate posts to fill the calendar</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleSettings}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary"
            aria-label="Settings"
            aria-expanded={settingsOpen}
          >
            <span className="material-symbols-outlined text-sc-text-muted text-xl">
              settings
            </span>
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-sc-surface border border-sc-border rounded-lg shadow-xl z-[60] overflow-hidden">
              <div className="px-4 py-3 border-b border-sc-border">
                <p className="text-sm font-bold text-white">Settings</p>
              </div>
              <div className="py-1">
                {[
                  { icon: "person", label: "Profile", href: "/profile-studio" },
                  { icon: "edit_note", label: "Content Settings", href: "/content-queue" },
                  { icon: "smart_toy", label: "Agency Team", href: "/agency" },
                  { icon: "code", label: "API & Integrations", href: "/dashboard" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSettingsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-sc-text-muted text-sm">{item.icon}</span>
                    <span className="text-sm text-sc-text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleUser}
            className="w-8 h-8 rounded-full border-2 border-sc-primary/50 bg-sc-surface flex items-center justify-center hover:border-sc-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sc-bg"
            aria-label="User menu"
            aria-expanded={userOpen}
          >
            <span className="text-[10px] font-bold text-sc-primary">JR</span>
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-sc-surface border border-sc-border rounded-lg shadow-xl z-[60] overflow-hidden">
              <div className="px-4 py-3 border-b border-sc-border">
                <p className="text-sm font-bold text-white">Jacob Rodgers</p>
                <p className="text-[10px] text-slate-500">Class of 2029 | OL/DL | Pewaukee HS</p>
              </div>
              <div className="py-1">
                {[
                  { icon: "person", label: "Profile Studio", href: "/profile-studio" },
                  { icon: "description", label: "Recruiting Page", href: "/recruit" },
                  { icon: "monitoring", label: "Analytics", href: "/dashboard/analytics" },
                  { icon: "help", label: "About Alex", href: "/dashboard" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.href); setUserOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-sc-text-muted text-sm">{item.icon}</span>
                    <span className="text-sm text-sc-text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
