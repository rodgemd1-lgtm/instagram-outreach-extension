import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-6 w-6 text-white/40" />
      </div>
      <p className="mt-4 text-sm font-medium text-white">{title}</p>
      {description && <p className="mt-1 max-w-xs text-center text-xs text-white/40">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-[#ff000c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#cc000a]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
