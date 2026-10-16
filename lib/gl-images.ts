/**
 * Registry of DOM images that the WebGL layer draws in their place.
 * <GLImage> registers its wrapper + <img>; the canvas reads rects every frame.
 */
export type GLImageEntry = {
  id: number;
  el: HTMLElement;
  img: HTMLImageElement;
  radius: number;
  parallax: number;
  hover: number;
  hoverTarget: number;
  mouse: { x: number; y: number };
  reveal: { value: number };
};

type Listener = () => void;

let nextId = 1;
const entries = new Map<number, GLImageEntry>();
const listeners = new Set<Listener>();
let snapshot: GLImageEntry[] = [];

const emit = () => {
  snapshot = [...entries.values()];
  listeners.forEach((l) => l());
};

export const glImageRegistry = {
  add(entry: Omit<GLImageEntry, "id">) {
    const id = nextId++;
    entries.set(id, { ...entry, id });
    emit();
    return id;
  },
  remove(id: number) {
    if (entries.delete(id)) emit();
  },
  get(id: number) {
    return entries.get(id);
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
};
