import { create } from "zustand";

export type CursorVariant = "default" | "link" | "view" | "hidden";

type UIState = {
  /** The preloader has started its exit; intro animations can run. */
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  /** WebGL is running and draws the project images (DOM images are hidden). */
  glImages: boolean;
  setGlImages: (v: boolean) => void;
  cursor: { variant: CursorVariant; label: string };
  setCursor: (variant: CursorVariant, label?: string) => void;
};

export const useUI = create<UIState>()((set) => ({
  introDone: false,
  setIntroDone: (introDone) => set({ introDone }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  sound: false,
  setSound: (sound) => set({ sound }),
  glImages: false,
  setGlImages: (glImages) => set({ glImages }),
  cursor: { variant: "default", label: "" },
  setCursor: (variant, label = "") => set({ cursor: { variant, label } }),
}));

type StageTrigger = { progress: () => number; delta: number };

/**
 * Per-frame values shared between the DOM and the WebGL scene.
 * Plain mutable objects: reading them never causes a React render.
 */
export const runtime = {
  pointer: { x: 0, y: 0, nx: 0, ny: 0, active: false, lastMove: 0 },
  scroll: { y: 0, velocity: 0 },
  /**
   * Particle shape: `base` plus the sum of every trigger's progress × delta.
   * Brightness works the same way (`data-dim` on a section), times a per-page multiplier.
   */
  stage: {
    base: 0,
    triggers: [] as StageTrigger[],
    dimBase: 1,
    dimTriggers: [] as StageTrigger[],
    pageDim: 1,
  },
  /** World-space shockwave origin and the scene time it started. */
  burst: { x: 0, y: 0, z: 0, time: -100, pending: false },
  intro: { value: 0 },
  scene: { ready: false, failed: false },
};

const accumulate = (base: number, triggers: StageTrigger[]) => {
  let value = base;
  for (const t of triggers) value += t.delta * t.progress();
  return value;
};

export const stageTarget = () => accumulate(runtime.stage.base, runtime.stage.triggers);

export const dimTarget = () =>
  accumulate(runtime.stage.dimBase, runtime.stage.dimTriggers) * runtime.stage.pageDim;
