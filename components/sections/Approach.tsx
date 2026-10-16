"use client";

import { useRef } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Code } from "@/components/ui/Code";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { principles } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad } from "@/lib/utils";

export function Approach() {
  const root = useRef<HTMLElement>(null);

  // Each card sinks back and dims as the next one slides over it.
  useGSAP(
    () => {
      const wrappers = gsap.utils.toArray<HTMLElement>("[data-principle]");
      wrappers.forEach((wrapper, i) => {
        const next = wrappers[i + 1];
        if (!next) return;
        const card = wrapper.querySelector<HTMLElement>("[data-card]");
        gsap.to(card, {
          scale: 0.9,
          filter: "brightness(0.45)",
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="approach" data-stage={shapeIndex("lattice")} className="relative px-gutter pb-[10vh] pt-[18vh]">
      <div className="mb-[9vh] grid gap-6 md:grid-cols-12">
        <SectionLabel index="03" title="Approach" className="md:col-span-3 md:pt-4" />
        <Reveal
          as="h2"
          type="words"
          className="text-[clamp(2.6rem,6.2vw,7rem)] font-semibold leading-[0.92] tracking-[-0.05em] md:col-span-9"
        >
          How I build: four rules, each learned on a real project.
        </Reveal>
      </div>

      <div>
        {principles.map((p, i) => (
          <div
            key={p.title}
            data-principle
            className="sticky mb-[14vh] last:mb-0"
            style={{ top: `calc(11vh + ${i * 1.4}rem)` }}
          >
            <article
              data-card
              className="grid min-h-[min(70vh,660px)] origin-top gap-8 rounded-[20px] border border-line bg-[rgb(17_17_19/0.8)] p-6 backdrop-blur-xl md:grid-cols-12 md:gap-10 md:p-12"
            >
              <div className="flex flex-col justify-between gap-8 md:col-span-6">
                <div>
                  <span className="font-serif text-[clamp(3.2rem,6vw,6.5rem)] italic leading-[0.8] text-accent">{pad(i + 1)}</span>
                  <h3 className="mt-6 max-w-[16ch] text-[clamp(2rem,3.9vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                    {p.title}
                  </h3>
                </div>
                <div>
                  <p className="max-w-[48ch] text-[clamp(1rem,1.2vw,1.2rem)] leading-relaxed text-fg/72">{p.body}</p>
                  <p className="mono-label mt-6 text-muted">
                    Learned on <span className="text-fg">{p.source}</span>
                  </p>
                </div>
              </div>
              <Code code={p.code} file={p.file} className="self-center md:col-span-6" />
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
