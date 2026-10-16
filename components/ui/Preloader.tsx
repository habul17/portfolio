"use client";

import { useRef, useState } from "react";
import { scroller } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { runtime, useUI } from "@/lib/store";
import { pad, prefersReducedMotion } from "@/lib/utils";

const STEPS = ["Booting", "Compiling shaders", "Sampling the name", "Seeding particles", "Hydrating", "Ready"];

const ready = () =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    const check = () => {
      const sceneDone = runtime.scene.ready || runtime.scene.failed;
      if ((sceneDone && document.fonts.status === "loaded") || performance.now() - start > 6000) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const counter = el.querySelector<HTMLElement>("[data-counter]")!;
      const step = el.querySelector<HTMLElement>("[data-step]")!;
      const bar = el.querySelector<HTMLElement>("[data-bar]")!;
      const reduced = prefersReducedMotion();
      let repeat = false;
      try {
        repeat = sessionStorage.getItem("visited") === "1";
        sessionStorage.setItem("visited", "1");
      } catch {}

      scroller.lenis?.stop();
      window.scrollTo(0, 0);
      runtime.intro.value = 0;

      const progress = { v: 0 };
      const render = () => {
        const v = Math.round(progress.v);
        counter.textContent = pad(v, 3);
        bar.style.transform = `scaleX(${progress.v / 100})`;
        step.textContent = STEPS[Math.min(STEPS.length - 1, Math.floor((v / 100) * (STEPS.length - 1)))];
      };
      const fill = gsap.to(progress, {
        v: 88,
        duration: reduced ? 0.2 : repeat ? 0.9 : 2.4,
        ease: "soft",
        onUpdate: render,
      });

      let cancelled = false;
      Promise.all([fill.then(), ready()]).then(() => {
        if (cancelled) return;
        gsap
          .timeline({
            onComplete: () => {
              setGone(true);
              scroller.lenis?.start();
              ScrollTrigger.refresh();
            },
          })
          .to(progress, { v: 100, duration: 0.45, ease: "inOut", onUpdate: render })
          .to(el.querySelectorAll("[data-out]"), { yPercent: -110, duration: 0.8, ease: "inOut", stagger: 0.04 }, "+=0.1")
          .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.25, ease: "inOut" }, "-=0.45")
          .add(() => {
            useUI.getState().setIntroDone(true);
            gsap.to(runtime.intro, { value: 1, duration: reduced ? 0.01 : 3.2, ease: "power2.out" });
          }, "-=0.95");
      });
      return () => {
        cancelled = true;
      };
    },
    { scope: root },
  );

  if (gone) return null;
  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex flex-col justify-between bg-bg px-gutter py-6 text-fg"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <div className="mono-label flex justify-between text-muted">
        <span className="overflow-clip">
          <span data-out className="block">
            {site.name} · Portfolio
          </span>
        </span>
        <span className="overflow-clip">
          <span data-out className="block">
            ©{new Date().getFullYear()}
          </span>
        </span>
      </div>

      <div>
        <div className="mono-label mb-3 overflow-clip text-muted">
          <span data-out className="block">
            <span className="text-accent">●</span> <span data-step>{STEPS[0]}</span>
          </span>
        </div>
        <div className="h-px w-full bg-line">
          <div data-bar className="h-full w-full origin-left scale-x-0 bg-fg" />
        </div>
        <div className="mt-3 flex items-end justify-between gap-6">
          <span className="mono-label overflow-clip text-muted">
            <span data-out className="block">
              {site.role}
            </span>
          </span>
          <span className="overflow-clip leading-[0.8]">
            <span
              data-out
              data-counter
              className="block text-[clamp(5.5rem,22vw,21rem)] font-light tabular-nums tracking-[-0.06em]"
            >
              000
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
