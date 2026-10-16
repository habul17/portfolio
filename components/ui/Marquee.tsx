"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { runtime } from "@/lib/store";
import { cx, prefersReducedMotion } from "@/lib/utils";

/** An endless row that speeds up with scroll velocity and follows the scroll direction. */
export function Marquee({
  children,
  speed = 1,
  reverse = false,
  className,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let x = 0;
    let direction = reverse ? -1 : 1;
    let boost = 0;
    const tick = (_: number, deltaMs: number) => {
      const v = runtime.scroll.velocity;
      if (Math.abs(v) > 0.5) direction = Math.sign(v) * (reverse ? -1 : 1);
      boost += (Math.min(Math.abs(v) * 0.6, 14) - boost) * 0.08;
      const half = el.scrollWidth / 2;
      if (!half) return;
      const step = reduced ? 0.25 : (speed + boost) * direction;
      x = gsap.utils.wrap(-half, 0, x - step * deltaMs * 0.06);
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed, reverse]);

  return (
    <div className={cx("overflow-hidden", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
