import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type Outfit = {
  slug: string;
  name: string;
  image?: any;
  tint: string;
  price?: string;
  store?: string;
  color?: string;
};

export type SavedLook = {
  id: string;
  outfit: Outfit;
  photo: any;
  result: any;
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

const KEY = 'tryverse-state-v1';

const defaultState: State = { selection: { photo: null, outfit: null }, saved: [] };
let currentState: State = { ...defaultState };
const listeners = new Set<() => void>();

let isHydrated = false;

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  }
};

async function load() {
  try {
    const raw = await storage.getItem(KEY);
    if (raw) {
      currentState = JSON.parse(raw);
    }
  } catch {}
  isHydrated = true;
  listeners.forEach((l) => l());
}

async function persist() {
  try {
    await storage.setItem(KEY, JSON.stringify(currentState));
  } catch {}
}

function set(next: State) {
  currentState = next;
  persist();
  listeners.forEach((l) => l());
}

export function useTryVerse() {
  const [state, setState] = useState<State>(currentState);

  useEffect(() => {
    if (!isHydrated) {
      load();
    }
    const listener = () => setState(currentState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

export const tvActions = {
  setPhoto(photo: string | null) {
    set({ ...currentState, selection: { ...currentState.selection, photo } });
  },
  setOutfit(outfit: Outfit | null) {
    set({ ...currentState, selection: { ...currentState.selection, outfit } });
  },
  clearSelection() {
    set({ ...currentState, selection: { photo: null, outfit: null } });
  },
  saveLook(look: Omit<SavedLook, "id" | "createdAt">) {
    const entry: SavedLook = {
      ...look,
      id: `look-${Date.now()}`,
      createdAt: Date.now(),
    };
    set({ ...currentState, saved: [entry, ...currentState.saved] });
    return entry;
  },
  deleteLook(id: string) {
    set({ ...currentState, saved: currentState.saved.filter((l) => l.id !== id) });
  },
  toggleFavorite(id: string) {
    set({
      ...currentState,
      saved: currentState.saved.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l)),
    });
  },
};