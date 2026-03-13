"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function SlideOver({ open, onClose, title, subtitle, children, wide }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative flex h-full flex-col bg-white border-l border-[#E5E7EB] ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-tight text-[#0F1720]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#9CA3AF]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#0F1720]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
