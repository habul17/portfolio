"use client";

import { useEffect, useRef } from "react";
import { scroller } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { LocalTime } from "./LocalTime";
import { SoundToggle } from "./SoundToggle";
import { TransitionLink } from "./TransitionLink";

/** Full-screen menu for small screens, opened from the nav. */
export function Menu() {
  const root = useRef<HTMLDivElement>(null);
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      tl.current = gsap
        .timeline({ paused: true })
        .set(el, { visibility: "visible" })
        .fromTo(
          el,
          { clipPath: "circle(0% at 92% 3%)" },
          { clipPath: "circle(150% at 92% 3%)", duration: 1.1, ease: "inOut" },
        )
        .from(el.querySelectorAll("[data-menu-link]"), { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.35)
        .from(el.querySelectorAll("[data-menu-meta]"), { opacity: 0, y: 20, duration: 0.8, stagger: 0.05 }, 0.6);
    },
    { scope: root },
  );

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      tl.current?.timeScale(1).play();
      scroller.lenis?.stop();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      tl.current?.timeScale(1.6).reverse();
      scroller.lenis?.start();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div
      ref={root}
      id="site-menu"
      className="invisible fixed inset-0 z-[65] flex flex-col justify-between bg-bg-2 px-gutter pb-8 pt-28"
      aria-hidden={!open}
      inert={!open}
    >
      <nav aria-label="Menu">
        <ul>
          {site.nav.map((item, i) => (
            <li key={item.href} className="overflow-clip border-b border-line">
              <TransitionLink
                href={item.href}
                transitionLabel="Home"
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-3"
                data-menu-link
              >
                <span className="text-[clamp(3rem,15vw,7rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em]">
                  {item.label}
                </span>
                <span className="mono-label text-muted">0{i + 1}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mono-label grid grid-cols-2 gap-6 text-muted">
        <div data-menu-meta className="flex flex-col gap-2">
          {site.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="text-fg">
              {s.label} ↗
            </a>
          ))}
        </div>
        <div data-menu-meta className="flex flex-col items-end gap-2 text-right">
          <SoundToggle />
          <LocalTime />
        </div>
      </div>
    </div>
  );
}
