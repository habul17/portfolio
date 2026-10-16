"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { glImageRegistry } from "@/lib/gl-images";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { cx, prefersReducedMotion } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  radius?: number;
  /** 0–0.2: how far the image drifts inside its frame while scrolling. */
  parallax?: number;
  priority?: boolean;
};

/**
 * An image the WebGL layer can take over (ripples, bends with motion, wipes in).
 * The real <img> stays in the DOM for layout, accessibility and as the texture source;
 * without WebGL it simply fades in.
 */
export function GLImage({ src, alt, width, height, sizes = "100vw", className, radius = 0, parallax = 0, priority }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const glImages = useUI((s) => s.glImages);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const image = img.current;
    if (!el || !image) return;

    // IntersectionObserver also sees cards entering sideways in the horizontal gallery.
    const onVisible = (cb: () => void) => {
      const io = new IntersectionObserver(
        (records) => {
          if (records.some((r) => r.isIntersecting)) {
            io.disconnect();
            cb();
          }
        },
        { rootMargin: "0px -6% -8% 0px", threshold: 0.01 },
      );
      io.observe(el);
      return io;
    };

    if (!glImages) {
      const io = onVisible(() => setShown(true));
      return () => io.disconnect();
    }

    const id = glImageRegistry.add({
      el,
      img: image,
      radius,
      parallax,
      hover: 0,
      hoverTarget: 0,
      mouse: { x: 0.5, y: 0.5 },
      reveal: { value: prefersReducedMotion() ? 1 : 0 },
    });
    const entry = glImageRegistry.get(id)!;
    const io = onVisible(() => gsap.to(entry.reveal, { value: 1, duration: 1.9, ease: "out" }));
    const hoverEl = el.closest<HTMLElement>("a, [data-hover-root]") ?? el;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      entry.mouse.x = (e.clientX - r.left) / r.width;
      entry.mouse.y = 1 - (e.clientY - r.top) / r.height;
    };
    const enter = () => {
      entry.hoverTarget = 1;
    };
    const leave = () => {
      entry.hoverTarget = 0;
    };
    hoverEl.addEventListener("pointermove", move);
    hoverEl.addEventListener("pointerenter", enter);
    hoverEl.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      gsap.killTweensOf(entry.reveal);
      glImageRegistry.remove(id);
      hoverEl.removeEventListener("pointermove", move);
      hoverEl.removeEventListener("pointerenter", enter);
      hoverEl.removeEventListener("pointerleave", leave);
    };
  }, [glImages, radius, parallax]);

  return (
    <div ref={wrap} className={cx("relative overflow-hidden", className)} style={{ borderRadius: radius }}>
      <Image
        ref={img}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "eager"}
        className={cx(
          "h-full w-full object-cover transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-out)]",
          glImages ? "opacity-0" : shown ? "scale-100 opacity-100" : "scale-[1.08] opacity-0",
        )}
      />
    </div>
  );
}
