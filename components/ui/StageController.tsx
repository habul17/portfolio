"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { runtime } from "@/lib/store";

/**
 * Maps scroll position to the particle scene. Every element with `data-stage` holds a shape
 * index (and optionally `data-dim`, a brightness from 0 to 1); crossing into a section morphs
 * from the previous section's values to its own.
 */
export function StageController({ dim = 1 }: { dim?: number }) {
  useGSAP(() => {
    // A section with only `data-dim` keeps the previous section's shape.
    const sections = gsap.utils.toArray<HTMLElement>("[data-stage], [data-dim]");
    const stages: number[] = [];
    sections.forEach((s, i) => stages.push(s.dataset.stage !== undefined ? Number(s.dataset.stage) : (stages[i - 1] ?? 0)));
    const dims = sections.map((s) => Number(s.dataset.dim ?? 1));
    const triggers: { progress: () => number; delta: number }[] = [];
    const dimTriggers: { progress: () => number; delta: number }[] = [];
    for (let i = 1; i < sections.length; i++) {
      const delta = stages[i] - stages[i - 1];
      const dimDelta = dims[i] - dims[i - 1];
      if (!delta && !dimDelta) continue;
      const st = ScrollTrigger.create({ trigger: sections[i], start: "clamp(top 85%)", end: "clamp(top 20%)" });
      if (delta) triggers.push({ progress: () => st.progress, delta });
      if (dimDelta) dimTriggers.push({ progress: () => st.progress, delta: dimDelta });
    }
    Object.assign(runtime.stage, {
      base: stages[0] ?? 0,
      dimBase: dims[0] ?? 1,
      pageDim: dim,
      triggers,
      dimTriggers,
    });
    return () => {
      runtime.stage.triggers = [];
      runtime.stage.dimTriggers = [];
    };
  });
  return null;
}
