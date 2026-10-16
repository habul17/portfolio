"use client";

import { useRef } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Counter } from "@/components/ui/Counter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { about } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = gsap.utils.toArray<HTMLElement>("[data-word]");
        gsap
          .timeline({
            scrollTrigger: { trigger: "[data-about-pin]", start: "top top", end: "+=150%", pin: true, scrub: 0.7 },
          })
          .fromTo(words, { opacity: 0.13 }, { opacity: 1, stagger: 0.1, duration: 0.6, ease: "none" })
          .fromTo("[data-stat]", { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.25, duration: 1.2 }, "<+=30%");
      });
    },
    { scope: root },
  );

  let i = 0;
  return (
    <section ref={root} id="about" data-stage={shapeIndex("name")} className="relative">
      <div data-about-pin className="relative flex min-h-[100svh] flex-col justify-between gap-10 px-gutter pb-[7vh] pt-[13vh]">
        <div className="flex items-start justify-between">
          <SectionLabel index="01" title="About" />
          <span className="mono-label hidden text-muted md:block">Who&apos;s behind this</span>
        </div>

        <div className="grid items-end gap-10 md:grid-cols-12">
          <p className="text-[clamp(1.5rem,3.05vw,3.3rem)] font-medium leading-[1.1] tracking-[-0.035em] md:col-span-9">
            {about.segments.map((segment) =>
              segment.text.split(/(\s+)/).map((word) => {
                if (!word.trim()) return word;
                const key = i++;
                return "em" in segment && segment.em ? (
                  <em key={key} data-word className="font-serif font-normal italic tracking-[-0.01em] text-accent">
                    {word}
                  </em>
                ) : (
                  <span key={key} data-word>
                    {word}
                  </span>
                );
              }),
            )}
          </p>
          <dl className="grid grid-cols-3 gap-5 md:col-span-3 md:grid-cols-1 md:gap-7">
            {about.stats.map((stat) => (
              <div key={stat.label} data-stat className="flex flex-col-reverse border-t border-line pt-3">
                <dt className="mono-label mt-2 block text-muted">{stat.label}</dt>
                <dd className="text-[clamp(2.2rem,4vw,4.2rem)] font-light leading-none tracking-[-0.05em]">
                  <Counter value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
