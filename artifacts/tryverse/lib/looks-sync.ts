import { getToken } from './api';

const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const SYNC_URL = domain ? `https://${domain.replace(/^https?:\/\//, '')}/api` : null;

const TIMEOUT_MS = 20_000;

type SyncResult<T = unknown> = { ok: boolean; data?: T; error?: string; status: number };

async function syncFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<SyncResult<T>> {
  if (!SYNC_URL) {
    return { ok: false, error: 'Sync server not configured', status: 0 };
  }
  const token = await getToken();
  if (!token) {
    return { ok: false, error: 'Not signed in', status: 401 };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(`${SYNC_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) {
      const data = (await response.json()) as T;
      return { ok: true, data, status: response.status };
    }
    let error = `Error ${response.status}`;
    try {
      const errData = await response.json();
      if (typeof errData.error === 'string') error = errData.error;
    } catch {}
    return { ok: false, error, status: response.status };
  } catch {
    return { ok: false, error: 'Could not reach the sync server', status: 0 };
  }
}

export function fetchServerLooks<T>(): Promise<SyncResult<{ looks: T[] }>> {
  return syncFetch<{ looks: T[] }>('/saved-looks');
}

export function pushServerLooks(looks: unknown[]): Promise<SyncResult> {
  return syncFetch('/saved-looks', {
    method: 'POST',
    body: JSON.stringify({ looks }),
  });
}

export function deleteServerLook(lookId: string): Promise<SyncResult> {
  return syncFetch(`/saved-looks/${encodeURIComponent(lookId)}`, { method: 'DELETE' });
}
