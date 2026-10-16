"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { runtime } from "@/lib/store";
import { hasWebGL2 } from "@/lib/utils";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("WebGL scene disabled:", error);
    runtime.scene.failed = true;
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Tracks the pointer for the scene and mounts the canvas when WebGL2 is available. */
export function SceneMount() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const ok = hasWebGL2();
    if (!ok) runtime.scene.failed = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the browser
    setSupported(ok);

    const p = runtime.pointer;
    const move = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      p.nx = (e.clientX / window.innerWidth) * 2 - 1;
      p.ny = -(e.clientY / window.innerHeight) * 2 + 1;
      p.active = true;
      p.lastMove = performance.now();
    };
    const leave = () => {
      p.active = false;
    };
    const down = (e: PointerEvent) => {
      move(e);
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, label, [data-no-burst]")) return;
      runtime.burst.x = e.clientX;
      runtime.burst.y = e.clientY;
      runtime.burst.pending = true;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") window.setTimeout(leave, 250);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, []);

  if (!supported) return null;
  return (
    <SceneBoundary>
      <Scene />
    </SceneBoundary>
  );
}
