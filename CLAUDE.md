# CLAUDE.md — Design Inspiration Library

Project instructions for Claude Code. Read this before making changes.

## What this is

A personal, single-user web app that turns saved design screenshots (web + mobile)
into a searchable library of style Collections, each with reusable vocabulary,
a paste-ready brief, an optional design system (colors/fonts/spacing/motion), and
per-item "image recipe" prompts — plus a composer that assembles everything into
one build-ready prompt for Claude Code sessions on other projects.

This tool is for one person. Don't add multi-tenancy, roles, or anything that
assumes more than one user.

## Tech stack — do not substitute without asking

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| Database | **Neon** (serverless Postgres) via **Prisma** — used directly in dev and prod, no local SQLite step |
| Image storage | Vercel Blob |
| Hosting | Vercel |
| Auth | **None.** Do not add login, sessions, or middleware auth. This is a personal tool — if it needs to not be publicly discoverable later, that's a hosting-level decision (e.g. a Vercel deployment protection toggle), not app code. |
| Tagging / AI | **No backend AI calls, no Anthropic API key anywhere in this app.** Tagging happens by the user pasting a screenshot into claude.ai and pasting Claude's JSON reply into the upload form. See `standing-prompts.md` for those prompts — they live outside this codebase. |

## Visual direction

The user referenced **haoqi.design** as inspiration — a retro-futurist portfolio
with a custom WebGL glass-shader engine synced to scroll. **We are not recreating
that engine.** It's a multi-month specialist build and the wrong scope for a
personal utility app. What we're borrowing is the *vocabulary*, applied with plain
CSS/Tailwind:

- Dark theme by default (a light-mode toggle is a nice-to-have, not required for v1)
- A geometric sans typeface — default to **Geist** (free, pairs naturally with the
  Vercel/Neon stack); fall back to **Inter Tight** if Geist causes any friction
- Generous negative space, minimal chrome, thin single-pixel dividers rather than
  boxed cards everywhere
- Monospace type (e.g. **Geist Mono** or **JetBrains Mono**) for anything
  data-like: tags, timestamps, hex codes, counts, IDs — mirrors the "technical
  marginalia" habit visible in the reference screenshots this project started from
- Subtle glass/blur surfaces (`backdrop-blur` + low-opacity fills) for modals and
  panels — restrained, not a centerpiece effect
- No WebGL, no custom shaders, no scroll-sync canvas layer

**This is a starting point, not a locked spec.** The user is going to collect their
own reference screenshots through the app itself and may ask for a visual pass
later once they have real references loaded. Keep components reasonably decoupled
from styling (Tailwind utility classes, no deeply nested style logic) so a later
restyle is a CSS pass, not a rewrite.

## Data model

Full schema lives in `prisma/schema.prisma`. Summary:

- `HouseDNA` — one row, global always/never style rules, editable from the UI.
- `Collection` — a named style bucket (name, description, deployFor, riskPrompt,
  vocabTags, briefBlock) plus an **optional** design system (colorPalette JSON,
  headingFont, bodyFont, monoFont, spacingNotes, motionNotes). Every design-system
  field is nullable — don't require them, don't fake defaults for empty ones, just
  hide that UI section when nothing's set.
- `Item` — belongs to a Collection. Title, conceptLine, styleTags, vocabTags,
  imageRecipe, imageUrl, sourceUrl, platform (`WEB | MOBILE | BOTH`), mobile-only
  fields (screenType, platformOS, aspectRatio), and `captureMethod` (enum — how
  the screenshot was obtained, which signals how trustworthy its color/font data
  is; see schema for the five values).

## Key behavioral rules

1. **Every "Copy ___" button writes to the clipboard client-side.** None of them
   should be a server round-trip.
2. **The paste-JSON tagging flow is purely client-side parsing** (`JSON.parse` +
   validation against expected keys), not a server route. There is no
   `/api/tag-image` in this app.
3. **The prompt composer (selection tray → assembled build prompt) is also
   client-side.** It reads already-loaded Collection/Item data and formats a
   string. No new persistence is required for v1 — don't add a `BuildPrompt`
   table unless explicitly asked.
4. **Blank/optional fields should be omitted from composed output**, not
   rendered as empty sections — this applies to the composer prompt and to the
   `Copy Brief Block` / `Copy Design Tokens` outputs.
5. **Nothing in this repo should require an `ANTHROPIC_API_KEY`.** If a future
   phase adds server-side AI tagging, that's an intentional, explicitly-requested
   add-on — don't introduce it speculatively.

## Environment variables

```
DATABASE_URL=            # Neon connection string (pooled)
DIRECT_URL=               # Neon direct connection string (for Prisma migrations)
BLOB_READ_WRITE_TOKEN=    # Vercel Blob
# Optional, only if the URL-capture feature is built:
SCREENSHOT_API_KEY=
```

## Commands

```
npm run dev                  # local dev server
npx prisma migrate dev        # apply schema changes (Neon dev branch or same DB)
npx prisma studio             # inspect data
npm run build                 # production build
vercel deploy --prod          # deploy
```

## Conventions

- App Router, server components by default; mark client components explicitly
  (`"use client"`) only where interactivity requires it (modals, forms, copy
  buttons, the selection tray).
- One Prisma client singleton in `lib/prisma.ts` — never instantiate `PrismaClient`
  elsewhere.
- Components in `/components`, PascalCase filenames matching the export.
- Keep forms native/simple (controlled inputs + local state) — no form library
  needed for a single-user tool this size.
- Favor small, composable components over large page files — this keeps each
  build-prompt step in `buildprompts.md` scoped to one or two files.
