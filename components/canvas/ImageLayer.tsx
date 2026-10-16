"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { glImageRegistry, type GLImageEntry } from "@/lib/gl-images";
import { clamp, damp } from "@/lib/utils";
import { imageFragment, imageVertex } from "./shaders/image";

/** Drawn after post-processing with a pixel-space camera, so planes line up with the DOM. */
export const overlay = {
  scene: new THREE.Scene(),
  camera: new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100),
};

const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const loader = new THREE.TextureLoader();
const EMPTY: GLImageEntry[] = [];

type Item = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  texture: THREE.Texture | null;
  src: string;
  prev: { x: number; y: number } | null;
  vel: { x: number; y: number };
  cleanup: () => void;
};

function createItem(entry: GLImageEntry): Item {
  const material = new THREE.ShaderMaterial({
    vertexShader: imageVertex,
    fragmentShader: imageFragment,
    uniforms: {
      uTexture: { value: null },
      uSize: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2() },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uRadius: { value: entry.radius },
      uParallax: { value: 0 },
      uParallaxAmount: { value: entry.parallax },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  mesh.frustumCulled = false;

  const item: Item = { mesh, texture: null, src: "", prev: null, vel: { x: 0, y: 0 }, cleanup: () => {} };
  let disposed = false;
  // Load the candidate the browser picked from srcset as a plain image: a srcset <img>
  // reports a density-scaled naturalWidth, which would undersize the GPU texture.
  const sync = () => {
    const img = entry.img;
    if (!img.complete || !img.naturalWidth) return;
    const src = img.currentSrc || img.src;
    if (item.src === src) return;
    item.src = src;
    loader.load(src, (texture) => {
      if (disposed || item.src !== src) return texture.dispose();
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 4;
      item.texture?.dispose();
      item.texture = texture;
      material.uniforms.uTexture.value = texture;
      const image = texture.image as HTMLImageElement;
      material.uniforms.uImageSize.value.set(image.naturalWidth, image.naturalHeight);
    });
  };
  sync();
  entry.img.addEventListener("load", sync);
  item.cleanup = () => {
    disposed = true;
    entry.img.removeEventListener("load", sync);
  };
  return item;
}

export function ImageLayer() {
  const entries = useSyncExternalStore(glImageRegistry.subscribe, glImageRegistry.getSnapshot, () => EMPTY);
  const size = useThree((s) => s.size);
  const items = useRef(new Map<number, Item>());

  useEffect(() => {
    const cam = overlay.camera;
    cam.left = -size.width / 2;
    cam.right = size.width / 2;
    cam.top = size.height / 2;
    cam.bottom = -size.height / 2;
    cam.updateProjectionMatrix();
  }, [size]);

  useEffect(() => {
    const map = items.current;
    const ids = new Set(entries.map((e) => e.id));
    for (const entry of entries) {
      if (map.has(entry.id)) continue;
      const item = createItem(entry);
      overlay.scene.add(item.mesh);
      map.set(entry.id, item);
    }
    for (const [id, item] of map) {
      if (ids.has(id)) continue;
      item.cleanup();
      overlay.scene.remove(item.mesh);
      item.mesh.material.dispose();
      item.texture?.dispose();
      map.delete(id);
    }
  }, [entries]);

  useEffect(() => {
    const map = items.current;
    return () => {
      for (const item of map.values()) {
        item.cleanup();
        overlay.scene.remove(item.mesh);
        item.mesh.material.dispose();
        item.texture?.dispose();
      }
      map.clear();
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const vw = size.width;
    const vh = size.height;
    for (const entry of entries) {
      const item = items.current.get(entry.id);
      if (!item) continue;
      const rect = entry.el.getBoundingClientRect();
      const onScreen =
        rect.width > 0 && rect.bottom > -50 && rect.top < vh + 50 && rect.right > -50 && rect.left < vw + 50;
      item.mesh.visible = onScreen && !!item.texture;
      if (!onScreen) {
        item.prev = null;
        continue;
      }

      const dx = item.prev ? rect.left - item.prev.x : 0;
      const dy = item.prev ? rect.top - item.prev.y : 0;
      item.prev = { x: rect.left, y: rect.top };
      item.vel.x = damp(item.vel.x, clamp(dx, -70, 70), 9, dt);
      item.vel.y = damp(item.vel.y, clamp(dy, -70, 70), 9, dt);

      entry.hover = damp(entry.hover, entry.hoverTarget, 5, dt);

      item.mesh.position.set(rect.left + rect.width / 2 - vw / 2, vh / 2 - rect.top - rect.height / 2, 0);
      item.mesh.scale.set(rect.width, rect.height, 1);

      const u = item.mesh.material.uniforms;
      u.uSize.value.set(rect.width, rect.height);
      u.uVelocity.value.set(item.vel.x, item.vel.y);
      u.uMouse.value.set(entry.mouse.x, entry.mouse.y);
      u.uHover.value = entry.hover;
      u.uReveal.value = entry.reveal.value;
      u.uTime.value = state.clock.elapsedTime;
      u.uParallax.value = clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2), -1, 1);
    }
  });

  return null;
}
