import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { fetchServerLooks, pushServerLooks, deleteServerLook } from './looks-sync';
import { getToken, getUser } from './api';

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

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type State = {
  selection: Selection;
  saved: SavedLook[];
  pendingDeletes: string[];
  syncedIds: string[];
  ownerId: number | null;
  syncStatus: SyncStatus;
  syncError: string | null;
};

const KEY = 'tryverse-state-v1';

const defaultState: State = {
  selection: { photo: null, outfit: null },
  saved: [],
  pendingDeletes: [],
  syncedIds: [],
  ownerId: null,
  syncStatus: 'idle',
  syncError: null,
};
let currentState: State = { ...defaultState };
const listeners = new Set<() => void>();

let isHydrated = false;
let hydrationPromise: Promise<void> | null = null;

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
      const parsed = JSON.parse(raw);
      currentState = {
        ...defaultState,
        ...parsed,
        pendingDeletes: Array.isArray(parsed.pendingDeletes) ? parsed.pendingDeletes : [],
        syncedIds: Array.isArray(parsed.syncedIds) ? parsed.syncedIds : [],
        ownerId: typeof parsed.ownerId === 'number' ? parsed.ownerId : null,
        syncStatus: 'idle',
        syncError: null,
      };
    }
  } catch {}
  isHydrated = true;
  listeners.forEach((l) => l());
}

function ensureHydrated(): Promise<void> {
  if (isHydrated) return Promise.resolve();
  if (!hydrationPromise) hydrationPromise = load();
  return hydrationPromise;
}

async function persist() {
  try {
    const { syncStatus, syncError, ...persisted } = currentState;
    await storage.setItem(KEY, JSON.stringify(persisted));
  } catch {}
}

function set(next: State) {
  currentState = next;
  persist();
  listeners.forEach((l) => l());
}

function setSyncState(syncStatus: SyncStatus, syncError: string | null = null) {
  currentState = { ...currentState, syncStatus, syncError };
  listeners.forEach((l) => l());
}

let syncInFlight = false;

async function getCurrentUserId(): Promise<number | null> {
  const token = await getToken();
  if (!token) return null;
  const user = await getUser();
  const id = user && typeof user.id === 'number' ? user.id : null;
  return id;
}

/**
 * Ensures local sync state belongs to the given account. If a different
 * account previously owned this device's saved looks, the local sync state is
 * cleared so one user's looks are never pushed to another user's account.
 */
async function adoptUser(userId: number): Promise<void> {
  await ensureHydrated();
  if (currentState.ownerId !== null && currentState.ownerId !== userId) {
    set({
      ...currentState,
      saved: [],
      syncedIds: [],
      pendingDeletes: [],
      ownerId: userId,
    });
  } else if (currentState.ownerId !== userId) {
    set({ ...currentState, ownerId: userId });
  }
}

/**
 * Reconciles local saved looks with the server:
 * 1. Applies any pending deletions on the server
 * 2. Fetches server looks and merges with local ones
 * 3. Pushes the merged set back so the server has everything
 * Errors are surfaced via syncStatus === 'error' (no silent fallbacks).
 */
async function syncSavedLooks(): Promise<void> {
  if (syncInFlight) return;
  await ensureHydrated();
  const userId = await getCurrentUserId();
  if (userId === null) {
    // Not signed in: local-only mode, nothing to sync.
    setSyncState('idle');
    return;
  }
  await adoptUser(userId);

  syncInFlight = true;
  setSyncState('syncing');
  try {
    // 1. Apply pending deletions first so deleted looks don't come back.
    const remainingDeletes: string[] = [];
    let deleteError: string | null = null;
    for (const id of currentState.pendingDeletes) {
      const res = await deleteServerLook(id);
      if (!res.ok && res.status !== 404) {
        remainingDeletes.push(id);
        deleteError = res.error || 'Failed to remove a deleted look from the server';
      }
    }
    if (remainingDeletes.length !== currentState.pendingDeletes.length) {
      set({ ...currentState, pendingDeletes: remainingDeletes });
    }
    if (deleteError) {
      setSyncState('error', deleteError);
      return;
    }

    // 2. Fetch server looks and merge.
    const res = await fetchServerLooks<SavedLook>();
    if (!res.ok) {
      setSyncState('error', res.error || 'Could not load your saved looks from the server');
      return;
    }
    const serverLooks = res.data?.looks ?? [];
    const serverIds = new Set(serverLooks.map((l) => l.id));
    const previouslySynced = new Set(currentState.syncedIds);

    // Keep local looks that are on the server, or are new (never synced).
    // Drop local looks that were synced before but no longer exist on the
    // server — they were deleted from another device.
    const keptLocal = currentState.saved.filter(
      (l) => serverIds.has(l.id) || !previouslySynced.has(l.id),
    );
    const localIds = new Set(keptLocal.map((l) => l.id));
    const merged: SavedLook[] = [
      ...keptLocal,
      ...serverLooks.filter((l) => !localIds.has(l.id)),
    ];
    merged.sort((a, b) => b.createdAt - a.createdAt);
    set({ ...currentState, saved: merged });

    // 3. Push looks the server doesn't have yet, plus local favorite changes.
    const toPush = merged.filter((l) => {
      const server = serverLooks.find((s) => s.id === l.id);
      return !server || (server.favorite ?? false) !== (l.favorite ?? false);
    });
    if (toPush.length > 0) {
      const push = await pushServerLooks(toPush);
      if (!push.ok) {
        setSyncState('error', push.error || 'Could not back up your saved looks');
        return;
      }
    }

    set({ ...currentState, syncedIds: merged.map((l) => l.id) });
    setSyncState('synced');
  } finally {
    syncInFlight = false;
  }
}

async function pushLook(look: SavedLook): Promise<void> {
  const userId = await getCurrentUserId();
  if (userId === null) return;
  if (currentState.ownerId !== null && currentState.ownerId !== userId) return;
  const res = await pushServerLooks([look]);
  if (!res.ok) {
    setSyncState('error', res.error || 'Could not back up this look');
  }
}

async function removeLook(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (userId === null) return;
  if (currentState.ownerId !== null && currentState.ownerId !== userId) return;
  const res = await deleteServerLook(id);
  if (!res.ok && res.status !== 404) {
    set({ ...currentState, pendingDeletes: [...currentState.pendingDeletes, id] });
    setSyncState('error', res.error || 'Could not remove this look from the server');
  }
}

export function useTryVerse() {
  const [state, setState] = useState<State>(currentState);

  useEffect(() => {
    if (!isHydrated) {
      ensureHydrated();
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
    pushLook(entry);
    return entry;
  },
  deleteLook(id: string) {
    set({ ...currentState, saved: currentState.saved.filter((l) => l.id !== id) });
    removeLook(id);
  },
  toggleFavorite(id: string) {
    set({
      ...currentState,
      saved: currentState.saved.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l)),
    });
    const updated = currentState.saved.find((l) => l.id === id);
    if (updated) pushLook(updated);
  },
  syncSavedLooks,
  adoptUser,
};
