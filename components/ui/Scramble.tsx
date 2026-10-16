"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { ambient } from "@/lib/audio";
import { cx } from "@/lib/utils";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>";

/** Text that scrambles back into place when its parent link or button is hovered. */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const run = () => {
    const el = ref.current;
    if (!el || gsap.isTweening(el)) return;
    if (useUI.getState().sound) ambient.tick();
    gsap.to(el, {
      duration: 0.6,
      ease: "none",
      scrambleText: { text, chars: CHARS, speed: 0.6, revealDelay: 0.08 },
    });
  };
  return (
    <span className={cx("relative inline-block", className)} onPointerEnter={run} onFocus={run}>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span ref={ref} className="absolute inset-0 whitespace-nowrap">
        {text}
      </span>
    </span>
  );
}
