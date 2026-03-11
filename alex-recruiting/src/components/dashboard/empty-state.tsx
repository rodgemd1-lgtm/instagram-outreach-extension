import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-16">
      <Icon className="h-10 w-10 text-dash-muted/40" />
      <p className="mt-4 text-sm font-medium text-dash-muted">{title}</p>
      {description && <p className="mt-1 max-w-xs text-center text-xs text-dash-muted/70">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
