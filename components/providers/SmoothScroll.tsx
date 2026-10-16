"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { runtime, useUI } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/utils";

export const scroller: { lenis: Lenis | null } = { lenis: null };

/** Scrolls to an element, a selector or a y position, smoothly when Lenis is running. */
export function scrollTo(target: string | number | HTMLElement, immediate = false) {
  const lenis = scroller.lenis;
  if (lenis) {
    lenis.scrollTo(target, { immediate, duration: 1.6, force: true });
    return;
  }
  const y =
    typeof target === "number"
      ? target
      : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect()
          .top ?? 0;
  window.scrollTo({ top: typeof target === "number" ? y : window.scrollY + y, behavior: immediate ? "auto" : "smooth" });
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const reduced = prefersReducedMotion();
    const lenis = new Lenis({
      autoRaf: false,
      lerp: reduced ? 1 : 0.085,
      smoothWheel: !reduced,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.3,
    });
    scroller.lenis = lenis;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    // The preloader owns the first seconds; it starts scrolling when it leaves.
    if (!useUI.getState().introDone) lenis.stop();
    lenis.on("scroll", (l: Lenis) => {
      runtime.scroll.y = l.scroll;
      runtime.scroll.velocity = l.velocity;
      ScrollTrigger.update();
    });
    // First in the ticker so the WebGL frame that follows sees this frame's scroll.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf, false, true);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, []);

  return children;
}
