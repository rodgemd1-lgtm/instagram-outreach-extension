"use client";

import { HexBackground } from "./hex-background";
import { ScanlineOverlay } from "./scanline-overlay";
import { StitchSidebar } from "./stitch-sidebar";
import { StitchMobileNav } from "./stitch-mobile-nav";
import { StatusFooter } from "./status-footer";
import { PageTransition } from "@/components/motion/page-transition";

export function StitchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="stitch-shell relative min-h-screen">
      <HexBackground />
      <ScanlineOverlay />

      <StitchSidebar />

      <div className="relative z-10 md:ml-[240px]">
        <main className="px-4 pb-24 pt-6 md:px-8 md:pb-12 md:pt-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      <StatusFooter />
      <StitchMobileNav />
    </div>
  );
}
