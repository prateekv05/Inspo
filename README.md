# Design Inspiration Library

A personal, single-user design taste library: save reference screenshots (web +
mobile), tag them with reusable vocabulary and briefs, optionally capture a
design system per style, and compose everything into a build-ready prompt for
Claude Code sessions on other projects.

## The docs in this repo

| File | Who reads it | What it's for |
|---|---|---|
| `CLAUDE.md` | Claude Code | Project instructions — tech stack, visual direction, data model, behavioral rules. |
| `docs/buildprompts.md` | You → Claude Code | The build, broken into ~35 small numbered prompts (1.1–11.3) across 11 phases. Paste them one at a time. |
| `docs/standing-prompts.md` | You → claude.ai | Reusable prompts for tagging items, extracting a collection's design system, and bootstrapping your House DNA rules. Live outside the app entirely. |
| `docs/design-system-extraction-guide.md` | You | Step-by-step workflow for getting accurate colors/fonts/spacing/motion out of public sites, gated webapps, and mobile apps. |

## Quick start

1. Work through `docs/buildprompts.md` Phase 1 → Phase 11 with Claude Code (Phase 1 is done — this app was scaffolded with `create-next-app`).
2. Once deployed, use `docs/standing-prompts.md` prompt #1 once, against a batch of references you already like, to draft your House DNA. Paste the result into the app.
3. From there it's the day-to-day loop below.

## Day-to-day loop, once the app is live

1. Find something you like → capture it (see `docs/design-system-extraction-guide.md` for the right method depending on whether it's a public site, a gated app, or mobile).
2. Run `docs/standing-prompts.md` prompt #2 in claude.ai, attach the screenshot, paste your current House DNA into the prompt.
3. Copy Claude's JSON reply → paste into the app's upload form → review the pre-filled fields → set platform + capture method → assign to a Collection → save.
4. Occasionally, once a Collection has enough reference items to be worth building with: run prompt #3 (design system) and, only if you've actually watched it move, prompt #4 (motion notes).
5. When you're ready to build something: select items in the grid → Compose Prompt → copy → paste into a fresh Claude Code session for whatever you're actually building.

## Scope notes worth remembering

- No auth, no login — personal tool.
- No Anthropic API key anywhere in the app — all tagging is manual, via claude.ai, pasted in as JSON.
- Neon (Postgres) + Vercel Blob + Vercel hosting.
- Visually inspired by haoqi.design's vocabulary (dark theme, geometric sans, glass panels, generous space) — not a literal WebGL/shader recreation.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
