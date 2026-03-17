"use client";

import { useState } from "react";

export function SCHeader() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="sticky top-0 z-50 h-16 bg-sc-bg/80 backdrop-blur-md border-b border-sc-border flex items-center justify-between px-6 gap-4">
      {/* Left: Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sc-text-dim text-lg">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search coaches, schools, content..."
            className="w-full bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-sc-text placeholder:text-sc-text-dim focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
          />
        </div>
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
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-sc-text-muted text-xl">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sc-primary" />
        </button>

        {/* Settings */}
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-sc-text-muted text-xl">
            settings
          </span>
        </button>

        {/* User avatar */}
        <button
          type="button"
          className="w-8 h-8 rounded-full border-2 border-sc-primary/50 bg-sc-surface flex items-center justify-center hover:border-sc-primary transition-colors"
          aria-label="User menu"
        >
          <span className="text-[10px] font-bold text-sc-primary">CR</span>
        </button>
      </div>
    </header>
  );
}
