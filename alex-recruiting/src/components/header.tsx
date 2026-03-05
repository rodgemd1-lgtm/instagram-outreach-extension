"use client";

import { MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Jacob Rogers | OL | 6&apos;4&quot; 285</h2>
          <p className="text-xs text-slate-500">Pewaukee HS, Wisconsin | Class of 2028 | @JacobRogersOL28</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-4 mr-4 text-xs">
          <div className="text-center">
            <p className="font-semibold text-slate-900">17</p>
            <p className="text-slate-500">Target Schools</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="font-semibold text-slate-900">0</p>
            <p className="text-slate-500">Coach Follows</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="font-semibold text-slate-900">0</p>
            <p className="text-slate-500">DMs Sent</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
