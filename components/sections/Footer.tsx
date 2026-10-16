"use client";

import { useRef } from "react";
import { scrollTo } from "@/components/providers/SmoothScroll";
import { LocalTime } from "@/components/ui/LocalTime";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-footer-char]", {
        yPercent: 100,
        duration: 1.4,
        stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} data-dim="0.3" className="relative overflow-hidden px-gutter pt-10">
      <div className="mono-label grid grid-cols-2 gap-8 border-t border-line pt-8 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <span className="text-muted">Menu</span>
          {site.nav.map((item) => (
            <TransitionLink key={item.href} href={item.href} transitionLabel="Home" className="link-underline w-fit">
              {item.label}
            </TransitionLink>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-muted">Elsewhere</span>
          {site.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="link-underline w-fit">
              {s.label} ↗
            </a>
          ))}
          <a href={`mailto:${site.email}`} className="link-underline w-fit">
            Email ↗
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-muted">Local time</span>
          <LocalTime />
          <span className="text-muted">{site.availability}</span>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="text-muted">You made it</span>
          <button type="button" onClick={() => scrollTo(0)} className="link-underline">
            Back to top ↑
          </button>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none mt-6 select-none overflow-hidden">
        <div className="flex justify-center text-[30vw] font-semibold uppercase leading-[0.74] tracking-[-0.07em] text-fg">
          {Array.from(site.name).map((ch, i) => (
            <span key={i} data-footer-char className="inline-block">
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="mono-label flex flex-col justify-between gap-2 border-t border-line py-5 text-muted md:flex-row">
        <span>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <span>Built with Next.js, Three.js &amp; GSAP</span>
      </div>
    </footer>
  );
}
