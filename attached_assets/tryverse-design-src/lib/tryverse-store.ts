import { useSyncExternalStore } from "react";

export type Outfit = {
  slug: string;
  name: string;
  image: string;
  tint: string;
  price?: string;
  store?: string;
  color?: string;
};

export type SavedLook = {
  id: string;
  outfit: Outfit;
  photo: string;
  result: string;
  size: string;
  fitNote: string;
  createdAt: number;
  tag?: "try-on" | "stylo" | "compare";
  favorite?: boolean;
};

export type Selection = {
  photo: string | null;
  outfit: Outfit | null;
};

type State = {
  selection: Selection;
  saved: SavedLook[];
};

const KEY = "tryverse-state-v1";

function load(): State {
  if (typeof window === "undefined") return { selection: { photo: null, outfit: null }, saved: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {}
  return { selection: { photo: null, outfit: null }, saved: [] };
}

let state: State = { selection: { photo: null, outfit: null }, saved: [] };
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

function set(next: State) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    state = load();
  }
  listeners.add(l);
  return () => listeners.delete(l);
}

const serverSnap: State = { selection: { photo: null, outfit: null }, saved: [] };

export function useTryVerse() {
  const s = useSyncExternalStore(subscribe, () => state, () => serverSnap);
  return s;
}

export const tvActions = {
  setPhoto(photo: string | null) {
    set({ ...state, selection: { ...state.selection, photo } });
  },
  setOutfit(outfit: Outfit | null) {
    set({ ...state, selection: { ...state.selection, outfit } });
  },
  clearSelection() {
    set({ ...state, selection: { photo: null, outfit: null } });
  },
  saveLook(look: Omit<SavedLook, "id" | "createdAt">) {
    const entry: SavedLook = {
      ...look,
      id: `look-${Date.now()}`,
      createdAt: Date.now(),
    };
    set({ ...state, saved: [entry, ...state.saved] });
    return entry;
  },
  deleteLook(id: string) {
    set({ ...state, saved: state.saved.filter((l) => l.id !== id) });
  },
  toggleFavorite(id: string) {
    set({
      ...state,
      saved: state.saved.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l)),
    });
  },
};