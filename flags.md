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
- [ ] **Phase 10 — Capture from URL** — explicitly skippable per the doc
      ("skip this phase entirely if manual screenshots are working fine for
      you"). Needs a decision between urlbox.io and screenshotone.com plus a
      `SCREENSHOT_API_KEY` before it's built. Not started.
- [ ] **Font fallbacks** — CLAUDE.md allows falling back from Geist to Inter
      Tight (sans) or Geist Mono to JetBrains Mono if either causes friction.
      No friction hit so far (Phase 1.5) — still on Geist / Geist Mono.

## Feature flags (runtime)

No env-gated feature flags exist in the app yet — everything shipped so far
(Phases 1-4) is unconditional. The one candidate flag, tied directly to the
open decision above:

| Flag | Gates | Status |
|---|---|---|
| `SCREENSHOT_API_KEY` presence | Phase 10's "Capture from URL" upload path | Not implemented — Phase 10 hasn't been built |

If Phase 10 is built, the natural pattern is to only render the "Capture from
URL" option in the upload page when `SCREENSHOT_API_KEY` is set server-side
(checked via a server component or a small server action, not a public env
var, since the key must stay server-only).

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
