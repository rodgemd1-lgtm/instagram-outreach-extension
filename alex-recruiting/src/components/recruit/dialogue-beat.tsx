"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

interface DialogueBeatProps {
  id: string;
  speaker: "jacob" | "coach" | "both" | "neutral";
  children: React.ReactNode;
  className?: string;
  pin?: boolean;
}

export function DialogueBeat({
  id,
  speaker,
  children,
  className = "",
  pin = false,
}: DialogueBeatProps) {
  const config = useMemo((): AssemblyConfig => {
    const direction = speaker === "coach" ? -60 : speaker === "both" ? 0 : 60;

    return {
      wave2: [
        {
          containerSelector: `[data-beat="${id}"]`,
          from: {
            x: direction,
            opacity: 0,
          },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.12,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, [id, speaker]);

  const scopeRef = useRecruitAssembly(config);

  const positionClasses = (() => {
    switch (speaker) {
      case "jacob":
        return "ml-auto md:w-2/3 md:pl-8";
      case "coach":
        return "mr-auto md:w-2/3 md:pr-8";
      case "both":
        return "mx-auto max-w-4xl";
      case "neutral":
        return "mx-auto max-w-3xl";
      default:
        return "";
    }
  })();

  const mobileBg =
    speaker === "coach" ? "md:bg-transparent bg-[#111111]" : "";

  return (
    <div
      id={id}
      ref={scopeRef}
      className={`relative px-6 py-16 md:py-24 ${mobileBg} ${className}`}
    >
      <div data-beat={id} className={positionClasses}>
        {children}
      </div>
    </div>
  );
}
