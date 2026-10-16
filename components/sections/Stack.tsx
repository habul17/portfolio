"use client";

import { Fragment } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Scramble } from "@/components/ui/Scramble";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { stack } from "@/content/site";

export function Stack() {
  return (
    <section id="stack" data-stage={shapeIndex("helix")} className="relative overflow-hidden pb-[10vh] pt-[18vh]">
      <div className="mb-[8vh] grid gap-6 px-gutter md:grid-cols-12">
        <SectionLabel index="04" title="Stack" className="md:col-span-3 md:pt-4" />
        <div className="md:col-span-9">
          <Reveal
            as="h2"
            type="words"
            className="max-w-[16ch] text-[clamp(2.6rem,6.2vw,7rem)] font-semibold leading-[0.92] tracking-[-0.05em]"
          >
            What I reach for, and what I&apos;m sharpening.
          </Reveal>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-y border-line py-6" aria-hidden>
        {stack.marquee.map((row, r) => (
          <Marquee key={r} reverse={r % 2 === 1} speed={0.9 + r * 0.25}>
            {row.map((item, i) => (
              <Fragment key={item}>
                <span
                  className={
                    r % 2
                      ? "px-6 font-serif text-[clamp(3rem,7.5vw,8rem)] italic leading-[1.05] text-transparent [-webkit-text-stroke:1px_rgb(239_238_233/0.55)]"
                      : "px-6 text-[clamp(3rem,7.5vw,8rem)] font-semibold uppercase leading-[1.05] tracking-[-0.05em]"
                  }
                >
                  {item}
                </span>
                <span className="self-center text-[clamp(1.5rem,3vw,3rem)] text-accent">{i % 2 ? "✦" : "●"}</span>
              </Fragment>
            ))}
          </Marquee>
        ))}
      </div>

      <div className="mt-[10vh] grid gap-12 px-gutter sm:grid-cols-2 lg:w-[64%]">
        {stack.groups.map((group) => (
          <div key={group.title}>
            <h3 className="mono-label mb-4 flex justify-between border-b border-line pb-3 text-muted">
              {group.title}
              <span>{String(group.items.length).padStart(2, "0")}</span>
            </h3>
            <ul className="space-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="text-[clamp(1.1rem,1.45vw,1.45rem)] tracking-[-0.02em]">
                  <Scramble text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
