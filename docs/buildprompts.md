# Build Prompts — Design Inspiration Library

Small, sequential prompts to paste into Claude Code, one at a time. Do them in
order within each phase; phases are roughly sequential but 5 and 6 can be
reordered if that's more natural once you're in the code.

Before starting: put `claude.md` at the repo root as `CLAUDE.md` so Claude Code
reads it automatically as project context. You don't need to repeat its content
in these prompts — just reference it if a prompt needs to recall a rule.

---

## Phase 1 — Project setup

**1.1**
> Scaffold a new Next.js app in this directory using the App Router and
> TypeScript, with Tailwind CSS enabled. Use `npm` as the package manager.
> Follow the tech stack and conventions in CLAUDE.md.

**1.2**
> Install Prisma and initialize it for a Postgres database. Don't create a
> schema yet — just get `prisma/schema.prisma` scaffolded with the datasource
> block reading `DATABASE_URL` and `directUrl` reading `DIRECT_URL` from env,
> as required for Neon.

**1.3**
> Install `@vercel/blob` for image uploads. Create `lib/blob.ts` with a small
> helper function `uploadImage(file: File): Promise<string>` that uploads to
> Vercel Blob and returns the public URL. Don't wire it to any UI yet.

**1.4**
> Create a `.env.example` file listing `DATABASE_URL`, `DIRECT_URL`, and
> `BLOB_READ_WRITE_TOKEN` with placeholder values and one-line comments
> explaining each, matching the env vars section of CLAUDE.md.

**1.5**
> Set up the font per CLAUDE.md's visual direction: add Geist and Geist Mono
> via `next/font/google` (or `next/font/local` if Geist isn't available that
> way), apply Geist as the default sans and Geist Mono as a `--font-mono` CSS
> variable I can use for tags/timestamps/hex codes. Set the app to dark mode
> by default in `globals.css`.

---

## Phase 2 — Data model

**2.1**
> In `prisma/schema.prisma`, add the full data model: a `HouseDNA` model (single
> row, `always` and `never` string arrays), a `Collection` model (name, slug,
> description, deployFor, riskPrompt, vocabTags array, briefBlock, plus nullable
> design-system fields: colorPalette as Json, headingFont, bodyFont, monoFont,
> spacingNotes, motionNotes), a `Platform` enum (WEB, MOBILE, BOTH), a
> `CaptureMethod` enum (MANUAL_SCREENSHOT, PHONE_SCREENSHOT, SCREEN_RECORDING,
> SCREENSHOT_API, CHROME_ASSISTED), and an `Item` model belonging to Collection
> with title, conceptLine, styleTags array, vocabTags array, imageRecipe,
> imageUrl, sourceUrl (nullable), platform (default WEB), screenType/platformOS/
> aspectRatio (all nullable, mobile-only), captureMethod (default
> MANUAL_SCREENSHOT), createdAt.

**2.2**
> Run a Prisma migration against the Neon database (I'll provide the connection
> string in `.env`). Confirm the migration applied and show me the resulting
> tables.

**2.3**
> Create `lib/prisma.ts` with a singleton Prisma client following the standard
> Next.js pattern (reuse the client in dev to avoid exhausting connections on
> hot reload).

**2.4**
> Don't seed any data — the database should start empty. Just confirm
> `npx prisma studio` shows the three tables with zero rows.

---

## Phase 3 — Visual foundation

**3.1**
> Build a base layout shell in `app/layout.tsx`: a minimal top bar with the app
> name, a nav link to the upload page, and a slot for the House DNA panel below
> it. Follow CLAUDE.md's visual direction — dark background, generous spacing,
> thin single-pixel dividers instead of boxed cards, no heavy shadows.

**3.2**
> Create shared UI primitives in `/components`: `Card.tsx` (subtle bordered
> container, optional glass/blur variant using `backdrop-blur`), `Badge.tsx`
> (small pill for tags, monospace type), `CopyButton.tsx` (takes a `text` prop,
> writes to clipboard on click, shows a brief "Copied" state), and a generic
> `Modal.tsx` (centered overlay, closes on backdrop click or Escape).

**3.3**
> Add a simple dark/light theme toggle in the top bar using CSS variables and
> `data-theme` on `<html>` — no external theme library needed, just a small
> client component with `localStorage` persistence... actually, don't use
> localStorage inside any Artifact context — this is a real Next.js app so
> localStorage is fine here. Default to dark.

---

## Phase 4 — Library grid

**4.1**
> Build `app/page.tsx` as a server component that fetches all Collections
> (with item counts) and renders a horizontal row of filter tabs: "All (n)"
> plus one tab per Collection with its count, styled like a segmented control.
> Clicking a tab filters client-side (use a client component wrapper with
> `useState` for the active filter, or a URL search param — your call).

**4.2**
> Add a secondary filter row for platform: Web / Mobile / Both / All, sitting
> just under the collection tabs.

**4.3**
> Build `ItemGrid.tsx`: a responsive grid/masonry of item thumbnails for the
> active filter. Each thumbnail shows the image, title, and a small
> capture-method badge in a corner (use `Badge.tsx`). Mobile-platform items
> should render in a taller phone-aspect frame so they're visually distinct
> from web items at a glance.

**4.4**
> Clicking a thumbnail should open the Item detail modal (build the modal shell
> now, content comes in Phase 7 — for now just wire up the open/close state and
> pass the clicked item's id in).

---

## Phase 5 — House DNA panel

**5.1**
> Add an API route (`app/api/house-dna/route.ts`) with GET and PUT handlers for
> the single `HouseDNA` row (create it on first GET if it doesn't exist yet,
> with empty arrays).

**5.2**
> Build `HouseDnaPanel.tsx`: a collapsible panel showing "Always" and "Never"
> as two columns of editable list items (add/remove/edit inline, no separate
> edit mode — just make each list item directly editable with an add-new-item
> button at the bottom of each column). Saves to the API route above, debounced
> or on blur. Place it collapsed by default at the top of the library grid page.

---

## Phase 6 — Collection detail & design system

**6.1**
> Build a Collection detail view (inline expand under the active tab, or a
> `/collections/[slug]` route — pick whichever is simpler given how Phase 4 was
> structured) showing name, description, deployFor, and vocabTags as chips.

**6.2**
> Add `Copy Brief Block` and `Copy Vocab Only` buttons using `CopyButton.tsx`.
> Brief Block copies the `briefBlock` field as-is; Vocab Only copies the
> vocabTags joined as a comma-separated list.

**6.3**
> Build `DesignSystemPanel.tsx`: only renders if at least one design-system
> field is non-null on the Collection. Shows color swatches (hex + role label)
> from `colorPalette`, the three font names, spacingNotes, and motionNotes —
> each line omitted if that specific field is null. Include a
> `Copy Design Tokens` button that formats whatever is present into a short
> plain-text block.

**6.4**
> Add a simple form (can be a modal or inline edit) for creating a new
> Collection and for editing an existing Collection's fields, including the
> design-system fields. Keep it a plain controlled form, no external form
> library.

---

## Phase 7 — Item detail modal

**7.1**
> Fill in the Item modal content (shell already exists from 4.4): large image,
> title, conceptLine, styleTags as badges, vocabTags as chips, and the capture
> method shown as a labeled badge (e.g. "Screen recording — motion notes
> reliable" for SCREEN_RECORDING, "Manual screenshot — colors approximate" for
> MANUAL_SCREENSHOT, etc. — write a small label map for all five enum values).

**7.2**
> Add an "IMAGE RECIPE" box displaying the `imageRecipe` field in a
> monospace-styled block, plus `Copy Brief` (title + conceptLine + vocabTags
> formatted as a short paragraph) and `Copy Image Prompt` (just imageRecipe)
> buttons.

---

## Phase 8 — Upload flow

**8.1**
> Build `app/upload/page.tsx` with a screenshot drop/select zone. On file
> select, upload to Vercel Blob via the `uploadImage` helper from Phase 1.3 and
> show a preview once it's up.

**8.2**
> Add a `sourceUrl` text input (optional) below the image preview.

**8.3**
> Build `PasteJsonParser.tsx`: a textarea labeled "Paste Claude's JSON reply
> here." On paste or blur, try `JSON.parse`, validate it has the expected keys
> (title, conceptLine, styleTags, vocabTags, imageRecipe, platform, and
> optionally screenType/platformOS/aspectRatio), and pre-fill the rest of the
> form fields below. Show a clear inline error if parsing or validation fails —
> don't silently fail. All pre-filled fields must remain editable afterward.

**8.4**
> Add the rest of the form fields below the parser: title, conceptLine,
> styleTags (comma-separated input, parsed to array), vocabTags (same), platform
> select (Web/Mobile/Both), and — only shown when platform is Mobile or Both —
> screenType, platformOS, aspectRatio inputs.

**8.5**
> Add a `captureMethod` select (the five enum values, human-readable labels,
> default Manual Screenshot).

**8.6**
> Add a Collection picker: a searchable select of existing collections, plus a
> "create new" option that reveals inline fields for name + description +
> deployFor + vocabTags + briefBlock. On submit, create the Item (and Collection
> if new) via a server action or API route and redirect back to the library
> grid, filtered to the collection it was just added to.

---

## Phase 9 — Prompt composer

**9.1**
> Add a checkbox/"add to build" toggle to each item card in `ItemGrid.tsx`.
> Track selection in a client-side context or a simple Zustand store — your
> call, keep it lightweight. Selections should persist as the user changes
> filters (don't reset selection on tab switch).

**9.2**
> Build `SelectionTray.tsx`: a small fixed bar at the bottom of the screen that
> appears when 1+ items are selected, showing the count and a
> `Compose Prompt` button, plus a way to clear the selection.

**9.3**
> Build `PromptComposerModal.tsx`: opens on Compose Prompt click. Has one
> free-text field ("What are we building?") and a platform select
> (auto-inferred from the selected items' platforms, but overridable). On
> generate, assemble a prompt string using this structure — omit any section
> whose underlying fields are all null/empty:
>
> ```
> # Build brief
>
> ## What we're building
> [free text]
>
> ## Visual direction — [Collection name(s), deduped]
> [briefBlock per represented collection]
>
> Deploy for: [deployFor]
> Vocabulary to draw from: [merged vocabTags across selected items, deduped]
>
> ## Design system
> Colors: [...]
> Typography: [...]
> Spacing: [...]
> Motion: [...]
>
> ## House DNA — always / never
> Always: [...]
> Never: [...]
>
> ## Reference items
> - [title]: [conceptLine] — [styleTags]
>
> ## Platform
> [platform, with platformOS/aspectRatio if mobile]
> ```
>
> Show the assembled prompt in an editable textarea with a `Copy Prompt` button.

---

## Phase 10 — Optional: capture from a public URL

Skip this phase entirely if manual screenshots are working fine for you — it's
a pure add-on, nothing else in the app depends on it.

**10.1**
> Add a `Capture from URL` alternative on the upload page: a text input +
> button that calls a new `app/api/capture-url/route.ts`, which sends the URL
> to a screenshot API (I'll decide between urlbox.io and screenshotone.com and
> provide `SCREENSHOT_API_KEY`), gets back an image, uploads it to Vercel Blob
> the same way as a manual upload, and pre-fills the image preview and
> `sourceUrl` field.

---

## Phase 11 — Deploy

**11.1**
> Walk me through connecting this repo to a new Vercel project, and list
> exactly which environment variables I need to set in the Vercel dashboard
> (names only, I'll fill in values from Neon and Vercel Blob myself).

**11.2**
> After I confirm the env vars are set in Vercel, deploy to production and
> confirm the live URL loads the empty library grid without errors.

**11.3**
> Do a smoke test: walk me through manually creating one Collection and one
> Item through the deployed UI to confirm the full upload → grid → modal →
> compose-prompt loop works end to end.
