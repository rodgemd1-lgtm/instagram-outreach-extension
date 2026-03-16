import { cn } from "@/lib/utils";

interface StitchPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function StitchPageHeader({
  title,
  subtitle,
  actions,
  className,
}: StitchPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="stitch-page-title">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-white/40">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
