export function SCFooter() {
  return (
    <footer className="bg-sc-surface/50 border-t border-sc-border px-6 py-2 hidden lg:flex items-center justify-between">
      {/* Left */}
      <span className="text-[10px] font-bold uppercase tracking-widest text-sc-primary/40">
        &copy; 2024 Alex Recruiting Intel System
      </span>

      {/* Center: Status indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sc-accent-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-sc-primary/40">
            Mainframe Active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sc-accent-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-sc-primary/40">
            Uplink Secure
          </span>
        </div>
      </div>

      {/* Right */}
      <span className="text-[10px] font-bold uppercase tracking-widest text-sc-primary/40">
        Access Level: Commander
      </span>
    </footer>
  );
}
