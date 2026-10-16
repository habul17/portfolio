"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { Scramble } from "./Scramble";
import { SoundToggle } from "./SoundToggle";
import { TransitionLink } from "./TransitionLink";

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const introDone = useUI((s) => s.introDone);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.from(root.current!.querySelectorAll("[data-nav-item]"), {
        yPercent: -120,
        opacity: 0,
        duration: 1.1,
        stagger: 0.05,
        delay: 0.5,
      });
    },
    { scope: root, dependencies: [introDone] },
  );

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-[70] px-gutter pt-5 text-white mix-blend-difference">
      <div className="grid grid-cols-2 items-start gap-6 md:grid-cols-12">
        <div className="md:col-span-3" data-nav-item>
          <TransitionLink href="/" transitionLabel="Home" className="group inline-flex items-start text-[1.35rem] font-semibold leading-none tracking-[-0.04em]" aria-label={`${site.name}, home`}>
            {site.name}
            <span className="ml-0.5 text-[0.55rem] font-medium tracking-normal text-accent transition-transform duration-700 group-hover:rotate-[360deg]">®</span>
          </TransitionLink>
        </div>
        <div className="mono-label hidden leading-relaxed text-muted md:col-span-3 md:block" data-nav-item>
          {site.role}
          <br />
          Based on {site.location}
        </div>
        <nav className="hidden md:col-span-3 md:block" aria-label="Primary" data-nav-item>
          <ul className="mono-label flex flex-wrap gap-x-5 gap-y-1">
            {site.nav.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} transitionLabel="Home" className="link-underline inline-block py-0.5">
                  <Scramble text={item.label} />
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-start justify-end gap-5 md:col-span-3" data-nav-item>
          <SoundToggle className="hidden -mt-2 md:flex" />
          <span className="mono-label hidden items-center gap-2 lg:flex">
            <span className="pulse-dot" aria-hidden />
            {site.availability}
          </span>
          <button
            type="button"
            className="mono-label -mt-1 flex items-center gap-2 py-1 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            <span className="pulse-dot" aria-hidden />
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
