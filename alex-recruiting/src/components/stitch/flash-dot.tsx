import { cn } from "@/lib/utils";

interface FlashDotProps {
  color?: "red" | "green" | "blue" | "amber";
  className?: string;
}

const colorMap = {
  red: "bg-[#C5050C]",
  green: "bg-[#0bda7d]",
  blue: "bg-[#00f2ff]",
  amber: "bg-amber-400",
};

export function FlashDot({ color = "green", className }: FlashDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full animate-flash-dot",
        colorMap[color],
        className
      )}
      aria-hidden="true"
    />
  );
}
