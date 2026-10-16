"use client";

import type { PointerEvent } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Reveal } from "@/components/ui/Reveal";
import { moreWork } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { pad } from "@/lib/utils";

/** Fill sweeps in from whichever edge the pointer crossed, and leaves through the other. */
function sweep(e: PointerEvent<HTMLElement>, entering: boolean) {
  const row = e.currentTarget;
  const fill = row.querySelector<HTMLElement>("[data-fill]");
  if (!fill) return;
  const r = row.getBoundingClientRect();
  const fromTop = e.clientY < r.top + r.height / 2;
  gsap.killTweensOf(fill);
  if (entering) {
    gsap.fromTo(
      fill,
      { clipPath: fromTop ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "out" },
    );
  } else {
    gsap.to(fill, { clipPath: fromTop ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.5, ease: "out" });
  }
}

export function MoreWork() {
  return (
    <section data-stage={shapeIndex("terrain")} className="relative px-gutter pb-[12vh] pt-[16vh]">
      <div className="mb-10 flex items-end justify-between gap-6">
        <Reveal as="h2" type="chars" className="text-[clamp(2.4rem,5.5vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
          Also built
        </Reveal>
        <span className="mono-label text-muted">Experiments &amp; coursework</span>
      </div>
      <ul className="border-t border-line">
        {moreWork.map((item, i) => (
          <li key={item.title} className="border-b border-line">
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={(e) => sweep(e, true)}
              onPointerLeave={(e) => sweep(e, false)}
              className="more-row group relative grid grid-cols-12 items-center gap-4 overflow-hidden px-1 py-6 md:py-8"
            >
              <span data-fill aria-hidden className="absolute inset-0 bg-accent" style={{ clipPath: "inset(100% 0% 0% 0%)" }} />
              <span className="mono-label relative col-span-2 text-muted transition-colors duration-300 group-hover:text-bg md:col-span-1">
                {pad(i + 1)}
              </span>
              <span className="relative col-span-9 text-[clamp(1.35rem,2.5vw,2.6rem)] font-medium leading-none tracking-[-0.035em] transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-bg md:col-span-4">
                {item.title}
              </span>
              <span className="relative col-span-4 hidden text-fg/60 transition-colors duration-300 group-hover:text-bg md:block">
                {item.description}
              </span>
              <span className="mono-label relative col-span-2 hidden text-muted transition-colors duration-300 group-hover:text-bg md:block">
                {item.stack}
              </span>
              <span className="relative col-span-1 text-right text-xl transition-[color,transform] duration-500 group-hover:rotate-45 group-hover:text-bg">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
