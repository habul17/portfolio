"use client";

import { useRef } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { journey } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-line-fill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 65%", end: "bottom 65%", scrub: 0.4 },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-entry]").forEach((entry) => {
        gsap
          .timeline({ scrollTrigger: { trigger: entry, start: "top 65%", toggleActions: "play none none reverse" } })
          .to(entry.querySelector("[data-dot]"), { backgroundColor: "#d4ff3a", borderColor: "#d4ff3a", scale: 1.25, duration: 0.4 })
          .fromTo(entry.querySelector("[data-body]"), { opacity: 0.25, x: -12 }, { opacity: 1, x: 0, duration: 0.8 }, 0);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="journey" data-stage={shapeIndex("helix")} className="relative px-gutter pb-[12vh] pt-[14vh]">
      <div className="mb-[8vh] grid gap-6 md:grid-cols-12">
        <SectionLabel index="05" title="Journey" className="md:col-span-3 md:pt-4" />
        <Reveal as="h2" type="chars" className="text-[clamp(2.6rem,6.2vw,7rem)] font-semibold leading-[0.92] tracking-[-0.05em] md:col-span-9">
          The grind, so far.
        </Reveal>
      </div>

      <ol data-timeline className="relative md:ml-[25%] lg:w-[52%]">
        <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-line">
          <span data-line-fill className="absolute inset-0 origin-top bg-accent" />
        </span>
        {journey.map((item) => (
          <li key={item.title} data-entry className="relative pb-14 pl-12 last:pb-0">
            <span
              data-dot
              aria-hidden
              className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border border-line bg-bg"
            />
            <div data-body>
              <span className="mono-label text-accent">{item.date}</span>
              <h3 className="mt-2 text-[clamp(1.5rem,2.5vw,2.6rem)] font-semibold leading-none tracking-[-0.035em]">{item.title}</h3>
              <p className="mt-3 max-w-[54ch] leading-relaxed text-fg/68">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
