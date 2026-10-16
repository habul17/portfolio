"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/utils";

/** Letters thicken (variable font weight) and lift as the pointer gets close. */
export function ProximityText({ text, className, min = 500, max = 900 }: { text: string; className?: string; min?: number; max?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || prefersReducedMotion()) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
    const weights = letters.map(() => min);
    let px = -9999;
    let py = -9999;
    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
    };
    const tick = () => {
      if (!visible) return;
      const radius = Math.max(160, window.innerWidth * 0.16);
      letters.forEach((letter, i) => {
        const r = letter.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const t = Math.max(0, 1 - d / radius);
        const target = min + (max - min) * t * t;
        weights[i] += (target - weights[i]) * 0.15;
        letter.style.fontVariationSettings = `"wght" ${weights[i].toFixed(0)}`;
        letter.style.transform = `translateY(${(-t * t * 0.06).toFixed(3)}em)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", move);
      gsap.ticker.remove(tick);
    };
  }, [min, max]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-letter
          aria-hidden
          className="inline-block"
          style={{ fontVariationSettings: `"wght" ${min}`, whiteSpace: ch === " " ? "pre" : undefined }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
