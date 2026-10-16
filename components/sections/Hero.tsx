"use client";

import { useRef } from "react";
import { scrollTo } from "@/components/providers/SmoothScroll";
import { LocalTime } from "@/components/ui/LocalTime";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { shapeIndex } from "@/components/canvas/shapes";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useUI((s) => s.introDone);

  // Meta row and hint fade in after the headline.
  useGSAP(
    () => {
      if (!introDone) return;
      gsap.fromTo("[data-hero-fade]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.08, delay: 0.9 });
      gsap.fromTo(
        "[data-hero-rule]",
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: "left", duration: 1.6, ease: "inOut", delay: 0.6 },
      );
    },
    { scope: root, dependencies: [introDone] },
  );

  // Leaving the hero: the headline drifts up and fades, as if the scene pulls away.
  useGSAP(
    () => {
      gsap.to("[data-hero-inner]", {
        yPercent: -14,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" data-stage={shapeIndex("core")} className="relative h-[100svh] min-h-[620px]">
      <div data-hero-inner className="absolute inset-x-0 bottom-0 px-gutter pb-5 md:pb-7">
        <div className="mb-5 flex items-end justify-between gap-8 md:mb-7">
          <p data-hero-fade className="max-w-[23ch] text-[clamp(1.05rem,1.45vw,1.45rem)] leading-[1.25] tracking-[-0.015em] text-fg/85">
            {site.intro}
          </p>
          <div data-hero-fade className="mono-label hidden text-right text-muted md:block">
            Move to disturb the particles
            <br />
            Click anywhere for a shockwave
          </div>
        </div>

        <h1 className="sr-only">
          {site.name}, {site.role}
        </h1>
        <div aria-hidden className="select-none">
          <Reveal
            intro
            type="chars"
            delay={0.25}
            stagger={0.03}
            duration={1.4}
            className="whitespace-nowrap text-[clamp(3.4rem,16.6vw,20rem)] font-semibold uppercase leading-[0.8] tracking-[-0.065em]"
          >
            Full-stack
          </Reveal>
          <Reveal
            intro
            type="chars"
            delay={0.55}
            stagger={0.035}
            duration={1.4}
            className="-mt-[0.04em] whitespace-nowrap pr-[0.04em] text-right font-serif text-[clamp(3.6rem,16vw,19.5rem)] italic leading-[0.8] tracking-[-0.035em] text-fg"
          >
            developer
          </Reveal>
        </div>

        <div data-hero-rule className="mt-5 h-px bg-line md:mt-7" />
        <div className="mono-label mt-4 grid grid-cols-2 gap-3 text-muted md:grid-cols-4">
          <span data-hero-fade>Based on {site.location}</span>
          <span data-hero-fade className="text-right md:text-left">
            <LocalTime />
          </span>
          <span data-hero-fade className="flex items-center gap-2 text-fg">
            <span className="pulse-dot" aria-hidden />
            {site.availability}
          </span>
          <button
            type="button"
            data-hero-fade
            onClick={() => scrollTo("#about")}
            className="group flex items-center justify-end gap-2 text-right"
          >
            Scroll to explore
            <span className="inline-block transition-transform duration-500 group-hover:translate-y-1">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
