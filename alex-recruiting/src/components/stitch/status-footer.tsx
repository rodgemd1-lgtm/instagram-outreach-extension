import { FlashDot } from "./flash-dot";

export function StatusFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 flex h-8 items-center justify-between border-t border-white/5 bg-[#0a0a0a]/90 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <FlashDot color="green" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
          System Status: Optimal
        </span>
      </div>
      <span className="text-[10px] font-mono text-white/20">
        ALEX v2.0 — STITCH
      </span>
    </footer>
  );
}
