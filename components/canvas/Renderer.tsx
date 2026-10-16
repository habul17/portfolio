"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { runtime } from "@/lib/store";
import { clamp } from "@/lib/utils";
import { overlay } from "./ImageLayer";

/** Owns the frame: particles (+ bloom on capable devices), then the DOM-synced image layer on top. */
export function Renderer({ effects }: { effects: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const post = useMemo(() => {
    if (!effects) return null;
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new BloomEffect({
      mipmapBlur: true,
      intensity: 1.25,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.35,
      radius: 0.72,
    });
    const vignette = new VignetteEffect({ offset: 0.3, darkness: 0.7 });
    const chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0004, 0.0004),
      radialModulation: true,
      modulationOffset: 0.2,
    });
    composer.addPass(new EffectPass(camera, bloom, vignette));
    composer.addPass(new EffectPass(camera, chroma));
    return { composer, chroma };
  }, [effects, gl, scene, camera]);

  useEffect(() => {
    post?.composer.setSize(size.width, size.height);
  }, [post, size]);

  useEffect(() => () => post?.composer.dispose(), [post]);

  useFrame((_, delta) => {
    if (post) {
      const v = clamp(Math.abs(runtime.scroll.velocity) * 0.00009, 0, 0.0035);
      post.chroma.offset.set(0.00035 + v, 0.00035 + v * 0.5);
      post.composer.render(delta);
    } else {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
    }
    if (overlay.scene.children.length) {
      gl.autoClear = false;
      gl.clearDepth();
      gl.render(overlay.scene, overlay.camera);
      gl.autoClear = true;
    }
  }, 1);

  return null;
}
