"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { cx, prefersReducedMotion } from "@/lib/utils";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** What slides up from behind its line mask. */
  type?: "lines" | "words" | "chars";
  stagger?: number;
  delay?: number;
  duration?: number;
  /** ScrollTrigger start; ignored when `intro` is set. */
  start?: string;
  /** Wait for the preloader to finish instead of scrolling into view. */
  intro?: boolean;
};

const STAGGER = { lines: 0.08, words: 0.035, chars: 0.022 };

export function Reveal({
  as: Tag = "div",
  children,
  className,
  type = "lines",
  stagger,
  delay = 0,
  duration = 1.25,
  start = "top 88%",
  intro = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const introDone = useUI((s) => s.introDone);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      const split = SplitText.create(el, {
        type: type === "chars" ? "lines,words,chars" : type === "words" ? "lines,words" : "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          const t = gsap.from(targets, {
            yPercent: 115,
            rotate: type === "lines" ? 0 : 4,
            duration,
            delay,
            stagger: stagger ?? STAGGER[type],
            paused: intro,
            scrollTrigger: intro ? undefined : { trigger: el, start, once: true },
          });
          tween.current = t;
          if (intro && useUI.getState().introDone) t.play();
          return t;
        },
      });
      gsap.set(el, { autoAlpha: 1 });
      return () => split.revert();
    },
    { scope: ref },
  );

  useEffect(() => {
    if (intro && introDone) tween.current?.play();
  }, [intro, introDone]);

  return (
    <Tag ref={ref} className={cx("reveal", className)}>
      {children}
    </Tag>
  );
}
