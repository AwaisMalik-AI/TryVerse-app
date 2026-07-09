---
name: Saved looks cross-device sync
description: Decisions behind syncing TryVerse saved looks when the Railway backend has no saved-looks endpoint
---

The production Railway backend has no saved-looks endpoint, so sync goes through the project's own API Server artifact + Replit Postgres. The server authenticates by validating the client's TryVerse Bearer token against Railway `GET /api/user/me` (short-lived cache) and scopes all rows by that verified user id.

**Why:** looks must persist per real TryVerse account without inventing endpoints on a backend we don't control; verifying the token server-side means we never mint or manage our own credentials.

**How to apply:** reuse the same auth-verification middleware for any future per-user data lacking a Railway endpoint. Critical lesson from code review: device-local sync state must be scoped to the owning account — persist the owner user id and reset local sync state on account switch, or one user's unsynced local data gets pushed into the next signed-in user's account.
