"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const heroImages: Record<string, string> = {
  command: "/images/image-1773714341416-1.png",
  outreach: "/images/image-1773714351342-1.png",
  analytics: "/images/image-1773714357630-1.png",
  agency: "/images/image-1773714364680-1.png",
};

interface SCHeroBannerProps {
  screen: string;
  className?: string;
}

export function SCHeroBanner({ screen, className = "" }: SCHeroBannerProps) {
  const src = heroImages[screen];
  if (!src) return null;

  return (
    <div className={`relative h-48 w-full overflow-hidden rounded-xl md:h-64 ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <Image src={src} alt="" fill className="object-cover" priority />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-sc-bg via-sc-bg/60 to-transparent" />
    </div>
  );
}
