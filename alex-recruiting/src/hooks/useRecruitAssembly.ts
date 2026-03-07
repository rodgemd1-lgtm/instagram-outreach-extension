"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────
   Universal Motion Narrative Protocol — GSAP Assembly Hook
   ──────────────────────────────────────────────────────────────
   LAAL Mechanism Legend (every animated target maps to one):
     K  = Known-ness          — establishes who the subject is
     TW = Temporal Window     — conveys urgency / timeline
     O  = Ownership           — coach takes psychological possession
     CT = Continuity Thread   — narrative flow between sections
     FS = Forgiving Stakes    — low-pressure invitation to act

   Wave 1 — entry timeline, fires once when component mounts
   Wave 2 — scroll-triggered, individual ScrollTrigger per element

   Easing language:
     back.out(1.7)  — primary lego-snap (hero elements, titles)
     power2.out     — secondary / mobile fallback
     sine.out       — subtle ambient transitions

   Timing budget:
     Hero total: 2.5–3 s
     Secondary pages: 1 s
     No individual element > 0.6 s

   Data attributes:
     data-gsap="name"       — Wave 1 named target
     data-gsap-wave="2"     — scroll-triggered target
   ────────────────────────────────────────────────────────────── */

// ─── Types ───────────────────────────────────────────────────

export interface Wave1Target {
  /** Matches data-gsap="<name>" */
  name: string;
  /** GSAP fromTo "from" vars */
  from: gsap.TweenVars;
  /** GSAP fromTo "to" vars (duration, ease, etc.) */
  to: gsap.TweenVars;
}

export interface Wave2Target {
  /** Matches data-gsap-wave="2" elements inside a container selector */
  containerSelector?: string;
  /** ScrollTrigger overrides */
  scrollTrigger?: ScrollTrigger.Vars;
  /** GSAP fromTo "from" vars */
  from: gsap.TweenVars;
  /** GSAP fromTo "to" vars */
  to: gsap.TweenVars;
  /** Apply to each matched element individually (true) or as a batch (false) */
  individual?: boolean;
  /** Stagger value when batched */
  stagger?: number;
}

export interface HorizontalScrollConfig {
  /** Selector for the pinned section wrapper */
  sectionSelector: string;
  /** Selector for the scrolling track */
  trackSelector: string;
  /** Selector for each panel inside the track */
  panelSelector: string;
  /** Per-panel reveal animations */
  panelReveal?: {
    from: gsap.TweenVars;
    to: gsap.TweenVars;
  };
}

export interface ParallaxBackgroundConfig {
  /** Selector for background image elements to parallax */
  selector: string;
  /** Y translation in pixels (desktop). Default 50 */
  desktopY?: number;
  /** Y translation in pixels (mobile). Default 25 */
  mobileY?: number;
}

export interface VideoAutoplayConfig {
  /** Selector for video elements to auto-play on scroll */
  selector: string;
  /** IntersectionObserver threshold. Default 0.5 */
  threshold?: number;
}

export interface AssemblyConfig {
  /** Wave 1 targets — entry timeline (fires once) */
  wave1?: Wave1Target[];
  /** Total hero timeline duration budget — default 1s */
  wave1Duration?: number;
  /** Wave 2 targets — scroll-triggered */
  wave2?: Wave2Target[];
  /** Horizontal scroll section config */
  horizontalScroll?: HorizontalScrollConfig;
  /** Parallax background images on scroll */
  parallaxBackground?: ParallaxBackgroundConfig;
  /** Auto-play/pause videos on scroll visibility */
  videoAutoplay?: VideoAutoplayConfig;
}

// ─── Hook ────────────────────────────────────────────────────

export function useRecruitAssembly(config: AssemblyConfig) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scopeRef.current;
    if (!el) return;

    // ── Reduced-motion bypass ──
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      // Immediately show every gsap-targeted element
      el.querySelectorAll("[data-gsap], [data-gsap-wave]").forEach(
        (target) => {
          const htmlTarget = target as HTMLElement;
          htmlTarget.style.opacity = "1";
          htmlTarget.style.transform = "none";
        }
      );
      return;
    }

    // ── Parent override — prevent CSS/GSAP conflict ──
    const parent = el.closest(".entrance-editorial");
    if (parent) {
      el.classList.add("gsap-entry-override");
    }

    // ── GSAP Context (auto-cleanup) ──
    const ctx = gsap.context(() => {
      // ── Responsive matchMedia ──
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions!;

          // ════════════════════════════════════════
          // WAVE 1 — Entry timeline (fires once)
          // ════════════════════════════════════════
          if (config.wave1 && config.wave1.length > 0) {
            const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

            config.wave1.forEach((target) => {
              const targetEl = el.querySelector(
                `[data-gsap="${target.name}"]`
              );
              if (!targetEl) return;

              // On mobile, collapse x-axis motion to y-axis only
              const fromVars = { ...target.from };
              const toVars = { ...target.to };

              if (!isDesktop) {
                if (fromVars.x !== undefined) {
                  fromVars.y = fromVars.y ?? fromVars.x;
                  delete fromVars.x;
                }
                if (toVars.x !== undefined) {
                  delete toVars.x;
                  toVars.y = 0;
                }
                // Downgrade easing for mobile
                if (
                  toVars.ease === "back.out(1.7)" ||
                  toVars.ease === undefined
                ) {
                  toVars.ease = "power2.out";
                }
              }

              // Enforce individual element timing budget: max 0.6s
              const dur =
                typeof toVars.duration === "number"
                  ? Math.min(toVars.duration, 0.6)
                  : 0.5;
              toVars.duration = dur;

              // Position in timeline — use the target's position or auto-stagger
              const position = toVars.position as string | undefined;
              delete toVars.position;

              tl.fromTo(targetEl, fromVars, toVars, position ?? "-=0.35");
            });
          }

          // ════════════════════════════════════════
          // WAVE 2 — Scroll-triggered reveals
          // ════════════════════════════════════════
          if (config.wave2 && config.wave2.length > 0) {
            config.wave2.forEach((w2) => {
              const container = w2.containerSelector
                ? el.querySelector(w2.containerSelector)
                : el;
              if (!container) return;

              const targets = container.querySelectorAll(
                '[data-gsap-wave="2"]'
              );
              if (targets.length === 0) return;

              if (w2.individual) {
                // Individual ScrollTrigger per element
                targets.forEach((target, i) => {
                  const fromVars = { ...w2.from };
                  const toVars = { ...w2.to };

                  if (!isDesktop) {
                    if (fromVars.x !== undefined) {
                      // Alternate direction based on index for visual interest
                      fromVars.y = Math.abs(fromVars.x as number);
                      delete fromVars.x;
                    }
                    if (toVars.x !== undefined) {
                      delete toVars.x;
                      toVars.y = 0;
                    }
                    if (
                      toVars.ease === "back.out(1.7)" ||
                      toVars.ease === undefined
                    ) {
                      toVars.ease = "power2.out";
                    }
                  }

                  // Enforce 0.6s max
                  const dur =
                    typeof toVars.duration === "number"
                      ? Math.min(toVars.duration, 0.6)
                      : 0.5;
                  toVars.duration = dur;

                  gsap.fromTo(target, fromVars, {
                    ...toVars,
                    scrollTrigger: {
                      trigger: target,
                      start: "top 85%",
                      toggleActions: "play none none reverse",
                      ...w2.scrollTrigger,
                    },
                  });
                });
              } else {
                // Batched with stagger
                const fromVars = { ...w2.from };
                const toVars = { ...w2.to };

                if (!isDesktop) {
                  if (fromVars.x !== undefined) {
                    fromVars.y = Math.abs(fromVars.x as number);
                    delete fromVars.x;
                  }
                  if (toVars.x !== undefined) {
                    delete toVars.x;
                    toVars.y = 0;
                  }
                  if (
                    toVars.ease === "back.out(1.7)" ||
                    toVars.ease === undefined
                  ) {
                    toVars.ease = "power2.out";
                  }
                }

                const dur =
                  typeof toVars.duration === "number"
                    ? Math.min(toVars.duration, 0.6)
                    : 0.5;
                toVars.duration = dur;

                gsap.fromTo(targets, fromVars, {
                  ...toVars,
                  stagger: w2.stagger ?? 0.1,
                  scrollTrigger: {
                    trigger: container,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                    ...w2.scrollTrigger,
                  },
                });
              }
            });
          }

          // ════════════════════════════════════════
          // Horizontal Scroll Section
          // ════════════════════════════════════════
          if (config.horizontalScroll) {
            const hs = config.horizontalScroll;
            const section = el.querySelector(hs.sectionSelector);
            const track = el.querySelector(hs.trackSelector) as HTMLElement;
            if (!section || !track) return;

            const panels = track.querySelectorAll(hs.panelSelector);
            const totalPanels = panels.length;
            if (totalPanels === 0) return;

            // Only do horizontal scroll on desktop
            if (isDesktop) {
              const tween = gsap.to(track, {
                xPercent: -((totalPanels - 1) * 100) / totalPanels,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  pin: true,
                  scrub: 1,
                  end: () => `+=${window.innerWidth * (totalPanels - 1)}`,
                  invalidateOnRefresh: true,
                },
              });

              // Per-panel reveal
              if (hs.panelReveal) {
                panels.forEach((panel) => {
                  const revealEls = panel.querySelectorAll(
                    '[data-gsap-wave="2"]'
                  );
                  if (revealEls.length === 0) return;

                  gsap.fromTo(revealEls, hs.panelReveal!.from, {
                    ...hs.panelReveal!.to,
                    stagger: 0.1,
                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: tween,
                      start: "left 80%",
                      end: "left 20%",
                      toggleActions: "play none none reverse",
                    },
                  });
                });
              }
            } else {
              // Mobile: stack panels vertically, simple y-reveal per panel
              track.style.display = "flex";
              track.style.flexDirection = "column";
              track.style.width = "100%";
              track.style.height = "auto";

              panels.forEach((panel) => {
                const p = panel as HTMLElement;
                p.style.width = "100%";
                p.style.height = "auto";
                p.style.minHeight = "100vh";

                const revealEls = p.querySelectorAll('[data-gsap-wave="2"]');
                if (revealEls.length === 0) return;

                gsap.fromTo(
                  revealEls,
                  { y: 40, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: panel,
                      start: "top 80%",
                      toggleActions: "play none none reverse",
                    },
                  }
                );
              });
            }
          }
          // ════════════════════════════════════════
          // Parallax Background Images
          // ════════════════════════════════════════
          if (config.parallaxBackground) {
            const pb = config.parallaxBackground;
            const bgEls = el.querySelectorAll(pb.selector);
            const yAmount = isDesktop
              ? (pb.desktopY ?? 50)
              : (pb.mobileY ?? 25);

            bgEls.forEach((bgEl) => {
              gsap.fromTo(
                bgEl,
                { y: -yAmount },
                {
                  y: yAmount,
                  ease: "none",
                  scrollTrigger: {
                    trigger: bgEl.parentElement || bgEl,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                }
              );
            });
          }

          // ════════════════════════════════════════
          // Video Autoplay on Scroll
          // ════════════════════════════════════════
          if (config.videoAutoplay && isDesktop) {
            // Only auto-play on desktop; mobile uses poster
            const va = config.videoAutoplay;
            const videoEls = el.querySelectorAll(va.selector);
            const threshold = va.threshold ?? 0.5;

            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  const video = entry.target as HTMLVideoElement;
                  if (entry.isIntersecting) {
                    video.play().catch(() => {});
                  } else {
                    video.pause();
                  }
                });
              },
              { threshold }
            );

            videoEls.forEach((v) => observer.observe(v));

            // Cleanup observer when GSAP context reverts
            return () => observer.disconnect();
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [config]);

  return scopeRef;
}
