"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { site } from "@/content/site";
import { dimTarget, runtime, stageTarget } from "@/lib/store";
import { clamp, damp, prefersReducedMotion } from "@/lib/utils";
import { SHAPE_COUNT, pointsFragment, pointsVertex, positionShader, velocityShader } from "./shaders/particles";
import { buildShapeAtlas } from "./shapes";

const BASE = "#efeee9";
const ACCENT = "#d4ff3a";
const DIM = "#8a8a84";
/** Particle opacity per shape: content-heavy sections get a quieter backdrop. */
const SHAPE_OPACITY = [1, 0.95, 0.5, 0.7, 0.62, 1];
/** On narrow portrait screens text sits on top of every shape, so the backdrop steps back further. */
const SHAPE_OPACITY_PORTRAIT = [0.85, 0.95, 0.4, 0.4, 0.38, 0.55];

type Sim = {
  gpgpu: GPUComputationRenderer;
  pos: Variable;
  vel: Variable;
  targets: THREE.DataTexture;
};

function createSimulation(gl: THREE.WebGLRenderer, size: number, atlas: Float32Array): Sim {
  const gpgpu = new GPUComputationRenderer(size, size, gl);
  if (!gl.extensions.has("EXT_color_buffer_float")) gpgpu.setDataType(THREE.HalfFloatType);

  const pos0 = gpgpu.createTexture();
  const vel0 = gpgpu.createTexture();
  const p = pos0.image.data as Float32Array;
  for (let i = 0; i < size * size; i++) {
    // Born in a tiny dense core; the intro blooms it outward.
    const r = Math.cbrt(Math.random()) * 0.06;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    p[i * 4] = r * Math.sin(phi) * Math.cos(theta);
    p[i * 4 + 1] = r * Math.sin(phi) * Math.sin(theta);
    p[i * 4 + 2] = r * Math.cos(phi);
    p[i * 4 + 3] = Math.random();
  }

  const pos = gpgpu.addVariable("tPosition", positionShader, pos0);
  const vel = gpgpu.addVariable("tVelocity", velocityShader, vel0);
  gpgpu.setVariableDependencies(pos, [pos, vel]);
  gpgpu.setVariableDependencies(vel, [pos, vel]);

  const targets = new THREE.DataTexture(atlas, size, size * SHAPE_COUNT, THREE.RGBAFormat, THREE.FloatType);
  targets.minFilter = THREE.NearestFilter;
  targets.magFilter = THREE.NearestFilter;
  targets.needsUpdate = true;

  Object.assign(vel.material.uniforms, {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uStage: { value: 0 },
    uIntro: { value: 0 },
    uSpring: { value: 9 },
    uDamping: { value: 0.885 },
    uNoise: { value: 0.45 },
    uScrollWind: { value: 0 },
    uTargets: { value: targets },
    uScale: { value: Array.from({ length: SHAPE_COUNT }, () => new THREE.Vector3(1, 1, 1)) },
    uOffset: { value: Array.from({ length: SHAPE_COUNT }, () => new THREE.Vector3()) },
    uPointer: { value: new THREE.Vector3(999, 999, 0) },
    uPointerVel: { value: new THREE.Vector3() },
    uPointerRadius: { value: 1.25 },
    uPointerForce: { value: 26 },
    uBurst: { value: new THREE.Vector4(0, 0, 0, -1) },
  });
  Object.assign(pos.material.uniforms, { uDelta: { value: 0 } });

  const error = gpgpu.init();
  if (error) throw new Error(error);
  return { gpgpu, pos, vel, targets };
}

/** Where each shape sits and how big it is, in world units, for the current viewport. */
function layoutShapes(vw: number, vh: number, scale: THREE.Vector3[], offset: THREE.Vector3[]) {
  const portrait = vw / vh < 0.85;
  // core
  const r = portrait ? Math.min(vw * 0.4, vh * 0.22) : Math.min(vh * 0.33, vw * 0.24);
  scale[0].setScalar(r);
  offset[0].set(portrait ? 0 : vw * 0.1, portrait ? vh * 0.13 : vh * 0.1, 0);
  // name (normalised to width 2)
  const half = portrait ? vw * 0.44 : Math.min(vw * 0.4, vh * 1.1);
  scale[1].setScalar(half);
  offset[1].set(0, portrait ? vh * 0.2 : vh * 0.16, 0);
  // terrain floor
  scale[2].set(vw * 0.9, 1, 5.5);
  offset[2].set(0, portrait ? -vh * 0.48 : -vh * 0.43, -3);
  // lattice
  const l = portrait ? vw * 0.26 : vh * 0.2;
  scale[3].setScalar(l);
  offset[3].set(portrait ? vw * 0.22 : vw * 0.27, portrait ? vh * 0.28 : vh * 0.12, -0.5);
  // helix (radius, half-height, radius)
  const hr = portrait ? vw * 0.2 : vh * 0.13;
  scale[4].set(hr, vh * 0.62, hr);
  offset[4].set(portrait ? vw * 0.4 : vw * 0.28, 0, -0.8);
  // galaxy
  scale[5].setScalar(portrait ? vw * 0.62 : vw * 0.34);
  offset[5].set(portrait ? vw * 0.1 : vw * 0.12, portrait ? vh * 0.1 : vh * 0.02, -1.4);
  return portrait;
}

export function Particles({ size }: { size: number }) {
  const gl = useThree((s) => s.gl);
  const viewport = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const dpr = useThree((s) => s.viewport.dpr);
  const [atlas, setAtlas] = useState<Float32Array | null>(null);

  // The name is drawn with the site font, so wait for it before sampling.
  useEffect(() => {
    let cancelled = false;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-geist").trim() || "sans-serif";
    const label = site.name.toUpperCase();
    const build = () => !cancelled && setAtlas(buildShapeAtlas(size, label, family));
    Promise.race([
      document.fonts.load(`700 200px ${family}`, label),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).then(build, build);
    return () => {
      cancelled = true;
    };
  }, [size]);

  const sim = useMemo(() => {
    if (!atlas) return null;
    try {
      return createSimulation(gl, size, atlas);
    } catch (error) {
      console.warn("Particle simulation unavailable:", error);
      runtime.scene.failed = true;
      return null;
    }
  }, [gl, size, atlas]);

  useEffect(() => {
    if (!sim) return;
    runtime.scene.ready = true;
    return () => {
      sim.gpgpu.dispose();
      sim.targets.dispose();
    };
  }, [sim]);

  const { geometry, material } = useMemo(() => {
    const count = size * size;
    const geo = new THREE.BufferGeometry();
    const ref = new Float32Array(count * 2);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const base = new THREE.Color(BASE);
    const accent = new THREE.Color(ACCENT);
    const dim = new THREE.Color(DIM);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      ref[i * 2] = ((i % size) + 0.5) / size;
      ref[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
      const roll = Math.random();
      c.copy(roll < 0.1 ? accent : roll < 0.2 ? dim : base).multiplyScalar(0.75 + Math.random() * 0.35);
      colors.set([c.r, c.g, c.b], i * 3);
      seeds[i] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aRef", new THREE.BufferAttribute(ref, 2));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      uniforms: {
        uPositions: { value: null },
        uVelocities: { value: null },
        uSize: { value: size > 150 ? 30 : 31 },
        uPixelRatio: { value: 1 },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uAccent: { value: accent },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [size]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const scratch = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      point: new THREE.Vector3(),
      prev: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      stage: 0,
      dim: 1,
      opacity: SHAPE_OPACITY,
      force: 0,
      reduced: prefersReducedMotion(),
      // Dev only: `?sim=6` runs six simulation steps per frame (handy for slow screenshot browsers).
      steps:
        process.env.NODE_ENV === "production"
          ? 1
          : Math.max(1, Math.min(12, Number(new URLSearchParams(window.location.search).get("sim")) || 1)),
    }),
    [],
  );

  useEffect(() => {
    if (!sim) return;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const vw = vh * (viewport.width / viewport.height);
    const u = sim.vel.material.uniforms;
    scratch.opacity = layoutShapes(vw, vh, u.uScale.value, u.uOffset.value) ? SHAPE_OPACITY_PORTRAIT : SHAPE_OPACITY;
  }, [sim, viewport, camera, scratch]);

  useFrame((state, delta) => {
    if (!sim) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const u = sim.vel.material.uniforms;
    const { pointer, scroll, burst } = runtime;

    // Camera drifts with the pointer for parallax.
    const cam = state.camera;
    cam.position.x = damp(cam.position.x, pointer.nx * 0.5, 2, dt);
    cam.position.y = damp(cam.position.y, pointer.ny * 0.3, 2, dt);
    cam.lookAt(0, 0, 0);

    // Pointer → world position on the z = 0 plane.
    const { raycaster, ndc, point, prev, vel } = scratch;
    ndc.set(pointer.nx, pointer.ny);
    raycaster.setFromCamera(ndc, cam);
    const ray = raycaster.ray;
    const hit = -ray.origin.z / ray.direction.z;
    point.copy(ray.origin).addScaledVector(ray.direction, hit);
    vel.lerp(prev.sub(point).multiplyScalar(-1 / Math.max(dt, 1e-3)).clampLength(0, 14), 0.25);
    prev.copy(point);
    const idle = (performance.now() - pointer.lastMove) / 1000;
    const wanted = pointer.active && !scratch.reduced ? 1 - clamp((idle - 2.5) / 2) : 0;
    scratch.force = damp(scratch.force, wanted, 4, dt);
    u.uPointer.value.copy(point);
    u.uPointerVel.value.copy(vel);
    u.uPointerForce.value = 26 * scratch.force;

    if (burst.pending) {
      burst.pending = false;
      ndc.set((burst.x / viewport.width) * 2 - 1, -(burst.y / viewport.height) * 2 + 1);
      raycaster.setFromCamera(ndc, cam);
      const r = raycaster.ray;
      const b = r.origin.clone().addScaledVector(r.direction, -r.origin.z / r.direction.z);
      u.uBurst.value.set(b.x, b.y, 0, 0);
      burst.time = t;
    }
    u.uBurst.value.w = burst.time > -50 ? t - burst.time : -1;

    scratch.stage = damp(scratch.stage, stageTarget(), 3.2, dt * scratch.steps);
    scratch.dim = damp(scratch.dim, dimTarget(), 3, dt * scratch.steps);
    u.uStage.value = scratch.stage;
    u.uIntro.value = runtime.intro.value;
    u.uTime.value = t;
    u.uDelta.value = dt;
    u.uScrollWind.value = scratch.reduced ? 0 : clamp(scroll.velocity * 0.12, -4, 4);
    sim.pos.material.uniforms.uDelta.value = dt;
    for (let i = 0; i < scratch.steps; i++) sim.gpgpu.compute();

    const s0 = Math.floor(scratch.stage);
    const s1 = Math.min(s0 + 1, scratch.opacity.length - 1);
    const f = scratch.stage - s0;
    const m = material.uniforms;
    m.uOpacity.value = THREE.MathUtils.lerp(scratch.opacity[s0], scratch.opacity[s1], f) * scratch.dim;
    m.uPositions.value = sim.gpgpu.getCurrentRenderTarget(sim.pos).texture;
    m.uVelocities.value = sim.gpgpu.getCurrentRenderTarget(sim.vel).texture;
    m.uTime.value = t;
    m.uPixelRatio.value = dpr;
  });

  if (!sim) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
