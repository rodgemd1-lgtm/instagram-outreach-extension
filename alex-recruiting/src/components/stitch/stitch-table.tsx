import { cn } from "@/lib/utils";

export function StitchTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function StitchTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead className={cn("border-b border-white/5", className)}>
      {children}
    </thead>
  );
}

export function StitchTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/30",
        className
      )}
    >
      {children}
    </th>
  );
}

export function StitchTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={cn("divide-y divide-white/5", className)}>{children}</tbody>;
}

export function StitchTableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-white/[0.03]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function StitchTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 text-sm", className)}>{children}</td>;
}
