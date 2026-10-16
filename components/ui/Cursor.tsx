"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/utils";

/**
 * A dot that tracks the pointer and a ring that trails it. Elements opt into states with
 * `data-cursor="view|link|hidden"` and an optional `data-cursor-label`.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pointer capability is only known in the browser
    setEnabled(!isTouchDevice() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!enabled || !el) return;
    const dot = el.querySelector<HTMLElement>("[data-dot]")!;
    const ring = el.querySelector<HTMLElement>("[data-ring]")!;
    const label = el.querySelector<HTMLElement>("[data-label]")!;
    document.documentElement.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.dataset.visible = "true";
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      let variant = tagged?.dataset.cursor ?? "default";
      if (!tagged && target?.closest("a, button, [role='button'], label, summary")) variant = "link";
      el.dataset.variant = variant;
      label.textContent = tagged?.dataset.cursorLabel ?? "";
    };
    const hide = () => {
      el.dataset.visible = "false";
    };
    const down = () => {
      el.dataset.pressed = "true";
    };
    const up = () => {
      el.dataset.pressed = "false";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={root} className="cursor" data-variant="default" data-visible="false" aria-hidden>
      <div data-ring className="cursor-ring">
        <span data-label className="cursor-label" />
      </div>
      <div data-dot className="cursor-dot" />
    </div>
  );
}
