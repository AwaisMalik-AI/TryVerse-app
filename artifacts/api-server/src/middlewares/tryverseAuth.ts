import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

const TRYVERSE_API_URL =
  process.env.TRYVERSE_API_URL || "https://tryverse-production.up.railway.app";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { userId: number; expiresAt: number };
const tokenCache = new Map<string, CacheEntry>();

function pruneCache(): void {
  const now = Date.now();
  for (const [key, entry] of tokenCache) {
    if (entry.expiresAt <= now) tokenCache.delete(key);
  }
}

export interface AuthedRequest extends Request {
  tryverseUserId?: number;
}

export async function tryverseAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    req.tryverseUserId = cached.userId;
    next();
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const response = await fetch(`${TRYVERSE_API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 401 || response.status === 403) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    if (!response.ok) {
      res.status(502).json({ error: "Could not verify session with TryVerse" });
      return;
    }

    const user = (await response.json()) as { id?: unknown };
    const userId = typeof user.id === "number" ? user.id : Number(user.id);
    if (!Number.isFinite(userId)) {
      res.status(502).json({ error: "Could not verify session with TryVerse" });
      return;
    }

    pruneCache();
    tokenCache.set(token, { userId, expiresAt: Date.now() + CACHE_TTL_MS });
    req.tryverseUserId = userId;
    next();
  } catch (err) {
    logger.error({ err }, "TryVerse auth verification failed");
    res.status(502).json({ error: "Could not verify session with TryVerse" });
  }
}
