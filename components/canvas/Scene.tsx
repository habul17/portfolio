"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { isTouchDevice } from "@/lib/utils";
import { ImageLayer } from "./ImageLayer";
import { Particles } from "./Particles";
import { Renderer } from "./Renderer";

/** Renders on GSAP's ticker, right after Lenis, so WebGL and DOM never drift by a frame. */
function Driver() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const tick = (time: number) => advance(time);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);
  return null;
}

export default function Scene() {
  const setGlImages = useUI((s) => s.setGlImages);
  const [tier] = useState<"high" | "low">(() =>
    isTouchDevice() || window.innerWidth < 768 ? "low" : "high",
  );

  useEffect(() => {
    setGlImages(tier === "high");
    return () => setGlImages(false);
  }, [tier, setGlImages]);

  return (
    <Canvas
      frameloop="never"
      flat
      dpr={tier === "high" ? [1, 1.75] : [1, 1.5]}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 35, near: 0.1, far: 60, position: [0, 0, 9] }}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearColor("#0a0a0b", 1)}
      aria-hidden
    >
      <Driver />
      <Particles size={tier === "high" ? 180 : 112} />
      {tier === "high" && <ImageLayer />}
      <Renderer effects={tier === "high"} />
    </Canvas>
  );
}
