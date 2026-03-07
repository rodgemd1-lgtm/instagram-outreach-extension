"use client";

import { useEffect, useRef, useState } from "react";

export function RecruitHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Atmospheric background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A]" />
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      {/* Grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Jersey number - massive, ghosted */}
        <div
          className={`transition-all duration-[2000ms] ease-out ${
            loaded
              ? "opacity-[0.04] translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <span className="font-mono text-[20rem] md:text-[32rem] font-black leading-none tracking-tighter select-none text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            79
          </span>
        </div>

        {/* Name */}
        <h1 className="relative">
          <span
            className={`block font-mono text-sm md:text-base tracking-[0.5em] text-amber-400/80 mb-4 transition-all duration-1000 delay-300 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            CLASS OF 2029
          </span>
          <span
            className={`block text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] transition-all duration-1000 delay-500 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            JACOB
          </span>
          <span
            className={`block text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-1000 delay-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            RODGERS
          </span>
        </h1>

        {/* Position & measurables */}
        <div
          className={`mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-6 transition-all duration-1000 delay-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Measurable label="POS" value="DT / OG" />
          <Divider />
          <Measurable label="HT" value={`6'4"`} />
          <Divider />
          <Measurable label="WT" value="285" />
          <Divider />
          <Measurable label="SCHOOL" value="Pewaukee HS" />
          <Divider />
          <Measurable label="STATE" value="WI" />
        </div>

        {/* Core identity line */}
        <p
          className={`mt-8 md:mt-12 text-white/40 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-[1200ms] ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Two-way lineman. State Champion.
          <br />
          Training five days a week since he was twelve.
        </p>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-[1800ms] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function Measurable({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-[0.3em] text-white/30 mb-1">
        {label}
      </div>
      <div className="text-sm md:text-lg font-mono font-semibold text-white/90">
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/10 hidden md:block" />;
}
