import { SHAPE_COUNT } from "./shaders/particles";

/** Order matters: it is the scroll journey. Sections reference shapes by index. */
export const SHAPES = ["core", "name", "terrain", "lattice", "helix", "galaxy"] as const;
export type ShapeName = (typeof SHAPES)[number];
export const shapeIndex = (name: ShapeName) => SHAPES.indexOf(name);

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Writer = (i: number, x: number, y: number, z: number) => void;

function sphere(count: number, rand: () => number, write: Writer) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    let r = 1 + (rand() - 0.5) * 0.05;
    if (rand() < 0.14) r = Math.cbrt(rand()) * 0.92; // a little volume inside the shell
    write(i, Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r);
  }
}

function text(count: number, rand: () => number, write: Writer, label: string, fontFamily: string) {
  const W = 1800;
  const H = 600;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return sphere(count, rand, write);

  let size = 460;
  ctx.font = `700 ${size}px ${fontFamily}`;
  const measured = ctx.measureText(label).width;
  size *= Math.min(1, (W * 0.92) / measured);
  ctx.font = `700 ${size}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  const m = ctx.measureText(label);
  ctx.fillText(label, W / 2, H / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);

  const { data } = ctx.getImageData(0, 0, W, H);
  const alpha = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : data[(y * W + x) * 4 + 3]);
  const fill: number[] = [];
  const edge: number[] = [];
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (alpha(x, y) < 128) continue;
      const isEdge = alpha(x + 3, y) < 128 || alpha(x - 3, y) < 128 || alpha(x, y + 3) < 128 || alpha(x, y - 3) < 128;
      (isEdge ? edge : fill).push(x, y);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (fill.length === 0) return sphere(count, rand, write);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const half = (maxX - minX) / 2;
  for (let i = 0; i < count; i++) {
    const source = edge.length && rand() < 0.38 ? edge : fill;
    const k = Math.floor(rand() * (source.length / 2)) * 2;
    const x = (source[k] - cx + (rand() - 0.5) * 2) / half;
    const y = -(source[k + 1] - cy + (rand() - 0.5) * 2) / half;
    write(i, x, y, (rand() - 0.5) * 0.07);
  }
}

function terrain(count: number, rand: () => number, write: Writer) {
  const side = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    const gx = i % side;
    const gz = Math.floor(i / side);
    const x = (gx / (side - 1)) * 2 - 1 + (rand() - 0.5) * 0.004;
    const z = (gz / (side - 1)) * 2 - 1 + (rand() - 0.5) * 0.004;
    write(i, x, 0, z);
  }
}

function lattice(count: number, rand: () => number, write: Writer) {
  // A 3×3×3 wireframe: lines along each axis through a 4×4 grid of the other two.
  const stops = [-1, -1 / 3, 1 / 3, 1];
  for (let i = 0; i < count; i++) {
    if (rand() < 0.06) {
      // bright clusters on the eight corners
      const c = () => (rand() < 0.5 ? -1 : 1) + (rand() - 0.5) * 0.08;
      write(i, c(), c(), c());
      continue;
    }
    const axis = Math.floor(rand() * 3);
    const a = stops[Math.floor(rand() * 4)];
    const b = stops[Math.floor(rand() * 4)];
    const t = rand() * 2 - 1;
    const j = () => (rand() - 0.5) * 0.012;
    if (axis === 0) write(i, t, a + j(), b + j());
    else if (axis === 1) write(i, a + j(), t, b + j());
    else write(i, a + j(), b + j(), t);
  }
}

function helix(count: number, rand: () => number, write: Writer) {
  const turns = 2.6;
  const rungs = 34;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.8) {
      const t = rand();
      const a = t * turns * Math.PI * 2 + (i % 2) * Math.PI;
      const r = 1 + (rand() - 0.5) * 0.14;
      write(i, Math.cos(a) * r, t * 2 - 1 + (rand() - 0.5) * 0.01, Math.sin(a) * r);
    } else {
      const k = Math.floor(rand() * rungs);
      const t = (k + 0.5) / rungs;
      const a = t * turns * Math.PI * 2;
      const f = rand() * 2 - 1;
      write(i, Math.cos(a) * f, t * 2 - 1, Math.sin(a) * f);
    }
  }
}

function galaxy(count: number, rand: () => number, write: Writer) {
  const arms = 3;
  const spin = 4.2;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.12) {
      // dense glowing core
      const r = Math.pow(rand(), 2) * 0.16;
      const a = rand() * Math.PI * 2;
      write(i, Math.cos(a) * r, (rand() - 0.5) * 0.06, Math.sin(a) * r);
      continue;
    }
    const r = Math.pow(rand(), 1.4);
    const branch = ((i % arms) / arms) * Math.PI * 2;
    const angle = branch + r * spin;
    const scatter = (1 - r * 0.45) * 0.3;
    const off = () => Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * scatter;
    write(i, Math.cos(angle) * r + off(), off() * 0.35, Math.sin(angle) * r + off());
  }
}

/** One RGBA float texture holding every shape: tile `s` occupies rows [s·size, (s+1)·size). */
export function buildShapeAtlas(size: number, label: string, fontFamily: string) {
  const count = size * size;
  const data = new Float32Array(count * 4 * SHAPE_COUNT);
  const builders = [
    sphere,
    (c: number, r: () => number, w: Writer) => text(c, r, w, label, fontFamily),
    terrain,
    lattice,
    helix,
    galaxy,
  ];
  builders.forEach((build, shape) => {
    const rand = mulberry32(1337 + shape * 7919);
    build(count, rand, (i, x, y, z) => {
      const o = (shape * count + i) * 4;
      data[o] = x;
      data[o + 1] = y;
      data[o + 2] = z;
      data[o + 3] = 1;
    });
  });
  return data;
}
