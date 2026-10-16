"use client";

import { useRef, useState } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { Magnetic } from "@/components/ui/Magnetic";
import { ProximityText } from "@/components/ui/ProximityText";
import { Reveal } from "@/components/ui/Reveal";
import { Scramble } from "@/components/ui/Scramble";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="group mt-7 flex w-full items-center justify-between gap-4 border-b border-line pb-3 text-left"
      aria-live="polite"
    >
      <span className="text-[clamp(1.05rem,1.7vw,1.6rem)] tracking-[-0.02em] [overflow-wrap:anywhere]">{site.email}</span>
      <span className="mono-label shrink-0 text-muted transition-colors group-hover:text-accent">
        {copied ? "Copied ✓" : "Copy"}
      </span>
    </button>
  );
}

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-contact-fade]", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1.3,
        scrollTrigger: { trigger: "[data-contact-bottom]", start: "top 90%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" data-stage={shapeIndex("galaxy")} className="relative flex min-h-[100svh] flex-col px-gutter pb-12 pt-[16vh]">
      <SectionLabel index="06" title="Contact" />
      <h2 className="mt-8 select-none">
        <span className="block text-[clamp(3.2rem,12.4vw,15rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
          <ProximityText text="Let’s build" min={560} max={900} />
        </span>
        <Reveal
          as="span"
          type="chars"
          className="block text-right font-serif text-[clamp(3.4rem,13vw,15.5rem)] italic leading-[0.82] tracking-[-0.035em]"
        >
          something real.
        </Reveal>
      </h2>

      <div data-contact-bottom className="mt-auto grid items-end gap-10 pt-[10vh] md:grid-cols-12">
        <div data-contact-fade className="md:col-span-5">
          <p className="max-w-[32ch] text-[clamp(1.1rem,1.55vw,1.5rem)] leading-snug text-fg/80">
            I&apos;m looking for {site.lookingFor}, and I&apos;m always up for an interesting project. The fastest way to reach me:
          </p>
          <CopyEmail />
        </div>
        <ul data-contact-fade className="mono-label flex gap-6 md:col-span-4 md:justify-center">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer" className="link-underline">
                <Scramble text={`${s.label} ${s.handle}`} />
              </a>
            </li>
          ))}
        </ul>
        <div data-contact-fade className="flex md:col-span-3 md:justify-end">
          <Magnetic strength={0.45}>
            <a
              href={`mailto:${site.email}?subject=Hello%20Abul`}
              data-cursor="hidden"
              className="cta-orb grid aspect-square w-[clamp(9rem,14vw,14rem)] place-items-center rounded-full bg-accent text-center text-bg"
            >
              <span className="text-[clamp(1.05rem,1.4vw,1.4rem)] font-semibold leading-tight tracking-[-0.03em]">
                Say hello
                <br />↗
              </span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
