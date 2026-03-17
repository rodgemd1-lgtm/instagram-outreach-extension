import { cn } from "@/lib/utils";
import { SCGlassCard } from "./sc-glass-card";

interface SCTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

interface SCTableProps<T> {
  columns: SCTableColumn<T>[];
  data: T[];
  className?: string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function SCTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
}: SCTableProps<T>) {
  return (
    <SCGlassCard className={cn("rounded-xl overflow-hidden", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-sc-surface/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-black",
                  alignClass[col.align ?? "left"]
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sc-border">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-sc-primary/5 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-white",
                    alignClass[col.align ?? "left"]
                  )}
                >
                  {col.render
                    ? col.render(row, rowIndex)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SCGlassCard>
  );
}
