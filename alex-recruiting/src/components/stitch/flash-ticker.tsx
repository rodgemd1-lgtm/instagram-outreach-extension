import { cn } from "@/lib/utils";

interface FlashTickerProps {
  items: string[];
  className?: string;
}

export function FlashTicker({ items, className }: FlashTickerProps) {
  if (items.length === 0) return null;

  // Double items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-[#C5050C]/20 bg-[#C5050C]/5 py-2",
        className
      )}
      role="marquee"
      aria-label={`Intel alerts: ${items.join(". ")}`}
    >
      <div className="flex animate-ticker-scroll whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-2 text-xs font-semibold text-[#C5050C]"
          >
            <span className="h-1 w-1 rounded-full bg-[#C5050C]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
