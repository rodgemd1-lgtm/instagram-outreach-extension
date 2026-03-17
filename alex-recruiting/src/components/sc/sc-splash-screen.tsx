"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/** Routes that skip the splash screen entirely. */
const SKIP_SPLASH_ROUTES = ["/recruit"];

export function SCSplashScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(
    !SKIP_SPLASH_ROUTES.some((r) => pathname.startsWith(r)),
  );

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          {/* Shield crest */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-sc-primary/20 blur-3xl" />
            <Image
              src="/images/image-1773714384388-1.png"
              alt="Shield Crest"
              width={200}
              height={200}
              priority
              className="relative z-10"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 font-display text-2xl font-black italic tracking-wider text-white"
          >
            JACOB&apos;S COMMAND
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-3 font-mono text-xs tracking-[0.3em] text-sc-accent-cyan"
          >
            INITIALIZING SYSTEMS...
          </motion.p>

          {/* Red scanline sweep */}
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: "100%" }}
            transition={{ delay: 1.2, duration: 1.0, ease: "linear" }}
            className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sc-primary to-transparent"
          />

          {/* Progress bar */}
          <div className="absolute bottom-16 h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.0, ease: "linear" }}
              className="h-full bg-sc-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
