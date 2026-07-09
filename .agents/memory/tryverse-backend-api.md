---
name: TryVerse backend API quirks
description: Non-obvious response shapes and gotchas of the tryverse-production.up.railway.app backend
---

# TryVerse backend API quirks

- **is_pro is nested**: `GET /api/subscription/status` returns `is_pro` inside the `credits` object, NOT top-level. Robust check: `status.is_pro === true || status.credits?.is_pro === true || (plan && plan !== 'free')`. Reading top-level `is_pro` makes every user look Free.
  - **Why:** Two separate bugs (auth enrichment + pricing screens) came from assuming top-level `is_pro`.
  - **How to apply:** Anywhere Pro status is derived from subscription status.
- Try-on history is `GET /api/tryon/history` (`/api/tryon/user/history` is 404). Notifications exist: `GET /api/notifications`, `POST /api/notifications/{id}/read`, `mark-all-read`.
- No server-side saved-looks endpoint exists; saved looks are local-only.

# Expo web auth-restore flash

- On direct URL loads, auth restores from storage asynchronously; screens gated on `!isAuthenticated` must first check auth `isLoading` and show a spinner, or e2e tests / users see a false "Sign in" gate.
