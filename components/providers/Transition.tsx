"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { scrollTo, scroller } from "./SmoothScroll";

type Pending = { href: string; label: string; startedAt: number } | null;

const controller = {
  navigate: null as null | ((href: string, label?: string) => void),
  pending: null as Pending,
};

/** Called by <TransitionLink>: wipes the screen, routes, then reveals the new page. */
export function navigateWithTransition(href: string, label?: string) {
  if (controller.navigate) controller.navigate(href, label);
  else window.location.href = href;
}

const splitHash = (href: string) => {
  const [path, hash] = href.split("#");
  return { path: path || "/", hash: hash ? `#${hash}` : "" };
};

export function TransitionLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    controller.navigate = (href, nextLabel = "") => {
      const { path, hash } = splitHash(href);
      if (busy.current) return;
      if (path === window.location.pathname) {
        if (hash) scrollTo(hash);
        else scrollTo(0);
        useUI.getState().setMenuOpen(false);
        return;
      }
      busy.current = true;
      setLabel(nextLabel);
      const el = root.current;
      if (!el) {
        router.push(href);
        return;
      }
      const [accent, panel] = el.children as unknown as HTMLElement[];
      gsap
        .timeline({
          onComplete: () => {
            controller.pending = { href, label: nextLabel, startedAt: performance.now() };
            useUI.getState().setMenuOpen(false);
            router.push(path, { scroll: false });
          },
        })
        .set(el, { autoAlpha: 1 })
        .fromTo(accent, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "inOut" })
        .fromTo(panel, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "inOut" }, 0.12)
        .fromTo(panel.querySelector("[data-label]"), { yPercent: 110 }, { yPercent: 0, duration: 0.8 }, 0.45);
      scroller.lenis?.stop();
    };
    return () => {
      controller.navigate = null;
    };
  }, [router]);

  // The new route has rendered: jump to the top (or hash), refresh triggers, reveal.
  useEffect(() => {
    const pending = controller.pending;
    const el = root.current;
    if (!pending || !el) return;
    controller.pending = null;
    const { hash } = splitHash(pending.href);
    const [accent, panel] = el.children as unknown as HTMLElement[];
    let raf = 0;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        scroller.lenis?.start();
        scrollTo(0, true);
        ScrollTrigger.refresh();
        if (hash) scrollTo(hash, true);
        const wait = Math.max(0, 0.55 - (performance.now() - pending.startedAt) / 1000);
        gsap
          .timeline({
            delay: wait,
            onComplete: () => {
              gsap.set(el, { autoAlpha: 0 });
              busy.current = false;
            },
          })
          .to(panel.querySelector("[data-label]"), { yPercent: -110, duration: 0.6, ease: "inOut" })
          .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "inOut" }, 0.1)
          .to(accent, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "inOut" }, 0.2);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[90] invisible" aria-hidden>
      <div className="absolute inset-0 bg-accent" />
      <div className="absolute inset-0 flex items-center justify-center bg-bg-2">
        <div className="overflow-clip px-gutter">
          <div data-label className="text-center text-[clamp(2.5rem,8vw,8rem)] font-semibold uppercase leading-none tracking-[-0.05em]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
