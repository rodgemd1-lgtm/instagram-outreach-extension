import { cn } from "@/lib/utils";
import { StitchInput } from "./stitch-input";
import { StitchSelect } from "./stitch-select";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }[];
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filters,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
        <StitchInput
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-9"
        />
      </div>
      {filters?.map((filter) => (
        <StitchSelect
          key={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          options={filter.options}
        />
      ))}
    </div>
  );
}
