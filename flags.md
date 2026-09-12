# Flags

Running list of things worth revisiting, plus the (currently none-yet)
runtime feature flags and a log of implementation judgment calls made so far.
Update this as the build-prompts phases progress.

## Open decisions / nice-to-haves

Things CLAUDE.md or `docs/buildprompts.md` called out as optional or
deferrable, tracked here so they don't get lost.

- [x] **Light/dark theme toggle** — CLAUDE.md marks this "nice-to-have, not
      required for v1," but it was built in 3.3 (`components/ThemeToggle.tsx`)
      since the buildprompts doc scheduled it into Phase 3 anyway.
- [x] **Phase 10 — Capture from URL** — built in 10.1. Chose screenshotone.com
      over urlbox.io since it has an ongoing 100-captures/month free tier
      (urlbox only offers a 7-day trial, no free tier). Needs
      `SCREENSHOTONE_ACCESS_KEY` and `SCREENSHOTONE_SECRET_KEY` (two keys, not
      the single `SCREENSHOT_API_KEY` CLAUDE.md/this doc originally sketched
      — ScreenshotOne uses an access key plus a secret key for HMAC-signing
      requests).
- [ ] **Font fallbacks** — CLAUDE.md allows falling back from Geist to Inter
      Tight (sans) or Geist Mono to JetBrains Mono if either causes friction.
      No friction hit so far (Phase 1.5) — still on Geist / Geist Mono.

## Feature flags (runtime)

| Flag | Gates | Status |
|---|---|---|
| `SCREENSHOTONE_ACCESS_KEY` + `SCREENSHOTONE_SECRET_KEY` presence | Phase 10's "Capture from URL" upload path | Implemented — `lib/screenshotone.ts`'s `isScreenshotCaptureConfigured()` is checked server-side in `app/upload/page.tsx` and passed down as a `captureUrlEnabled` boolean prop; the toggle in `UploadForm.tsx` only renders when true. Keys never reach the client. |

## Build log — judgment calls & risks

Notes from implementing Phases 1-4, for context on non-obvious choices.

- **2.1 schema** — `Collection.slug` is `@unique` (needed for the
  `/collections/[slug]` route option mentioned in 6.1); all six design-system
  fields on `Collection` are nullable per CLAUDE.md's "hide the UI section
  when nothing's set" rule.
- **3.3 theme init script** — a raw `<script>` tag in the layout triggered a
  React hydration warning ("Scripts inside React components are never
  executed when rendering on the client"). Switched to `next/script` with
  `strategy="beforeInteractive"`, which is Next's supported mechanism for
  pre-paint theme-flash prevention.
- **4.1 filtering** — used the URL-search-param option the prompt offered
  (`?collection=<slug>`) instead of a `useState` client wrapper. Keeps
  `CollectionTabs`/`PlatformTabs`/`page.tsx` as server components with no
  client JS needed for filtering, and both filter rows preserve each other's
  query param when clicked.
- **4.3 images** — added `images.remotePatterns` in `next.config.ts` for
  `*.public.blob.vercel-storage.com` ahead of Phase 8, since `next/image`
  rejects unlisted external hosts and Phase 8 will start writing real Vercel
  Blob URLs into `Item.imageUrl`.
- **4.4 ItemGrid** — became a `"use client"` component once thumbnails needed
  an `onClick` to drive the modal's open/close state; data fetching stays in
  `page.tsx` (server) and is passed down as props.
- **Testing note** — seeding/cleanup scripts run via `npx tsx --env-file=.env`
  against the live Neon DB during manual verification, each opening their own
  Prisma connection. Running several back-to-back briefly hit Neon's pooled
  connection limit (`P2024` timeout) once — self-recovered, not an app bug,
  but avoid stacking many concurrent one-off scripts against the same pooled
  connection string.
- **10.1 Capture from URL** — ScreenshotOne's request-signing isn't documented
  on their public docs page beyond "apply HMAC-SHA256"; the exact scheme
  (sign the full query string including `access_key`, hex-encode the digest,
  append as `&signature=`) was confirmed by reading their official Node SDK
  source (`screenshotone/jssdk`, `src/signature.ts` + `src/main.ts`) rather
  than guessed. Verified against the real API with a live call to
  `https://example.com` — got back a valid 1440×900 PNG, uploaded to Vercel
  Blob successfully. Defaults used: `full_page=true`, `block_ads=true`,
  `block_cookie_banners=true`, 1440×900 viewport — reasonable for capturing a
  whole page of design inspiration, easy to expose as form options later if
  needed.
