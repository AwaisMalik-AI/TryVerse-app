import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

const AI_PATHS = ['/api/tryon/', '/api/pose/', '/api/stylist/', '/api/video/', '/api/fabric-studio/', '/api/ghost-mannequin/'];
const AI_TIMEOUT_MS = 600_000; // 10 minutes for AI generation paths
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

let _onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(cb: (() => void) | null): void {
  _onSessionExpired = cb;
}

export async function getToken(): Promise<string | null> {
  return storage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await storage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await storage.removeItem(TOKEN_KEY);
}

export async function getUser(): Promise<Record<string, unknown> | null> {
  const data = await storage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    await storage.removeItem(USER_KEY);
    return null;
  }
}

export async function setUser(user: Record<string, unknown>): Promise<void> {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await storage.removeItem(USER_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}

function isAiPath(path: string): boolean {
  return AI_PATHS.some((p) => path.startsWith(p));
}

function isRetryableStatus(status: number): boolean {
  return [429, 502, 503, 504].includes(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function authUrl(path: string, token: string): string {
  if (!path) return '';
  const base = path.startsWith('http') ? path : `${API_URL}${path}`;
  return `${base}${base.includes('?') ? '&' : '?'}token=${token}`;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const url = `${API_URL}${path}`;
  const method = options.method || 'GET';
  const timeout = isAiPath(path) ? AI_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (__DEV__) console.log(`[API] ${method} ${url}`);

  let lastError: Error | null = null;
  const retries = isAiPath(path) ? MAX_RETRIES : 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (__DEV__) console.log(`[API] ${method} ${url} -> status ${response.status}`);

      if (response.status === 401) {
        await clearSession();
        _onSessionExpired?.();
        return response;
      }

      if (isRetryableStatus(response.status) && attempt < retries) {
        if (__DEV__) console.log(`[API] Retrying ${method} ${url} (attempt ${attempt + 1}/${retries})`);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        if (__DEV__) console.log(`[API] Network error, retrying ${method} ${url} (attempt ${attempt + 1})`);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed');
}

export async function apiPost<T = unknown>(
  path: string,
  data: unknown,
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const response = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      return { ok: true, data: responseData as T, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
        else if (errData.detail?.message) errorDetail = errData.detail.message;
        else if (typeof errData.message === 'string') errorDetail = errData.message;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Connection failed. Please check your internet.', status: 0 };
  }
}

export async function apiGet<T = unknown>(
  path: string,
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const response = await apiFetch(path);
    if (response.ok) {
      const responseData = await response.json();
      return { ok: true, data: responseData as T, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Connection failed. Please check your internet.', status: 0 };
  }
}

export async function apiUpload(
  path: string,
  fileUri: string,
  fieldName: string = 'file',
  extraFields?: Record<string, string>,
): Promise<{ ok: boolean; data?: unknown; error?: string; status: number }> {
  try {
    const token = await getToken();
    const formData = new FormData();

    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpeg';
    const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    formData.append(fieldName, {
      uri: fileUri,
      name: filename,
      type,
    } as unknown as Blob);

    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_URL}${path}`;
    if (__DEV__) console.log(`[UPLOAD] POST ${url} file: ${filename}`);

    const timeout = isAiPath(path) ? AI_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (__DEV__) console.log(`[UPLOAD] POST ${url} -> status ${response.status}`);

    if (response.status === 401) {
      await clearSession();
      _onSessionExpired?.();
    }

    if (response.ok) {
      const data = await response.json();
      return { ok: true, data, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
        else if (errData.detail?.message) errorDetail = errData.detail.message;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Upload failed. Please check your connection.', status: 0 };
  }
}

export { API_URL };
