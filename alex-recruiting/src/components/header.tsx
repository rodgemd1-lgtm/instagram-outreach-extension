"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "@/components/mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileDrawer />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 truncate">
            <span className="md:hidden">Jacob Rogers</span>
            <span className="hidden md:inline">Jacob Rogers | OL | 6&apos;4&quot; 285</span>
          </h2>
          <p className="text-[11px] text-slate-500 truncate hidden sm:block">
            Pewaukee HS, Wisconsin | Class of 2028 | @JacobRogersOL28
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Quick Stats - desktop only */}
        <div className="hidden lg:flex items-center gap-4 mr-4 text-xs">
          <div className="text-center">
            <p className="font-semibold text-slate-900">17</p>
            <p className="text-slate-500">Schools</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="font-semibold text-slate-900">0</p>
            <p className="text-slate-500">Follows</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="font-semibold text-slate-900">0</p>
            <p className="text-slate-500">DMs</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
