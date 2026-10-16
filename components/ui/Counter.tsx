"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad, prefersReducedMotion } from "@/lib/utils";

/** Counts up from zero the first time it scrolls into view. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.textContent = pad(0);
    const state = { v: 0 };
    gsap.to(state, {
      v: value,
      duration: 2,
      ease: "out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: () => {
        el.textContent = pad(Math.round(state.v));
      },
    });
  });
  return (
    <span ref={ref} className={className}>
      {pad(value)}
    </span>
  );
}
