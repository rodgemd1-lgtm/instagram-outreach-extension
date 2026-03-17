import { cn } from "@/lib/utils";

interface SCPageHeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  actions?: React.ReactNode;
}

export function SCPageHeader({
  title,
  subtitle,
  kicker,
  actions,
}: SCPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {kicker && (
          <span className="inline-block mb-2 bg-sc-primary/20 text-sc-primary text-[10px] font-black px-2 py-0.5 rounded border border-sc-primary/30 uppercase tracking-tighter">
            {kicker}
          </span>
        )}
        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 mt-2 font-medium">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3 mt-4 sm:mt-0">{actions}</div>}
    </div>
  );
}
