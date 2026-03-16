import { cn } from "@/lib/utils";

interface StitchSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function StitchSelect({
  className,
  options,
  ...props
}: StitchSelectProps) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/70 outline-none focus:border-[#C5050C]/40 focus:ring-1 focus:ring-[#C5050C]/20",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#141414] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
