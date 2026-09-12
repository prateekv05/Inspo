# Standing Prompts — use these in claude.ai, not in the app

These live outside the codebase. Keep them somewhere handy (a Claude Project's
custom instructions is a good spot for #1, since you'll use it constantly) and
paste the output straight into the webapp.

A couple of them ask you to paste in your current House DNA rules — copy those
from the House DNA panel in the app itself before running the prompt.

---

## 1. Bootstrap your House DNA (run this once, first)

Before tagging any items, it helps to have a first draft of your always/never
rules so every collection you build afterward is measured against something.
Gather 8–15 screenshots you already know you like — a genuinely mixed batch,
not all one style — attach them all in one message, and run:

> I'm building a personal design taste library. Attached are [n] screenshots of
> websites/apps I like. Look across all of them for what's actually consistent
> — not every individual trait, just the ones that repeat across most of the
> set. Return JSON only, no prose, with two arrays:
>
> - `always`: short phrases describing consistent choices across these
>   references (composition, imagery treatment, typography habits, color
>   approach — whatever actually repeats)
> - `never`: the generic/overused patterns these references are conspicuously
>   avoiding (be specific — "purple gradients," not "bad colors")
>
> Keep each array to 4–7 items. These will be the permanent constitution for my
> library, so favor things that will still be true in a year over anything tied
> to a current trend.

Paste the `always`/`never` arrays into the House DNA panel. You can keep
editing them by hand as your taste sharpens — this is just a starting draft.

---

## 2. Tag a single item (run this for every screenshot you add)

Attach one screenshot and run:

> Here's a screenshot I'm adding to my design library. Our House DNA — always:
> [paste your always list], never: [paste your never list]. Given that context,
> return JSON only, no prose, with these exact keys:
>
> - `title`: a short evocative name for this specific design (2-3 words)
> - `conceptLine`: one sentence on what makes this piece work
> - `styleTags`: array of 2-4 short tags, freeform (e.g. "editorial x voxel 3D")
> - `vocabTags`: array of 4-8 concrete descriptive terms someone could use to
>   brief a designer or an AI to recreate this look (e.g. "halftone texture",
>   "warm paper ground", "registration marks")
> - `imageRecipe`: a fill-in-the-blank prompt template, starting with a
>   `[SUBJECT: ...]` placeholder, describing exactly how to recreate this
>   visual treatment for a new, unspecified subject — detailed enough to send
>   directly to an image generation model
> - `platform`: `"web"`, `"mobile"`, or `"both"`
> - if platform is mobile or both, also include `screenType` (e.g.
>   "onboarding", "settings", "empty state"), `platformOS` (`"iOS"`,
>   `"Android"`, or `"both"`), and `aspectRatio` (e.g. `"9:19.5"`)
> - `suggestedCollection`: a short name for the style bucket this belongs to —
>   suggest an existing one if it's close to something I've described to you
>   in this conversation already, otherwise propose a new name
> - if `suggestedCollection` is a **new** bucket (not one I've already told
>   you about in this conversation), also include starter content for it —
>   `suggestedCollectionDescription` (1-2 sentences on what unifies this
>   style bucket), `suggestedCollectionDeployFor` (what kind of project this
>   style suits, e.g. "SaaS dashboards", "personal portfolios"),
>   `suggestedCollectionVocabTags` (array of 4-8 reusable vocabulary terms
>   for the whole bucket — distinct from this item's own `vocabTags`), and
>   `suggestedCollectionBriefBlock` (a paste-ready 2-4 sentence brief for
>   briefing a designer or AI on this whole style). Omit all four if you're
>   suggesting an existing collection I've already described.
>
> Don't guess at `captureMethod` — I set that manually in the app.

Paste the JSON into the upload form's parser field. If `suggestedCollection`
names a bucket you already have, the app auto-selects it; if it's new, the
app auto-fills the "create new collection" fields from the
`suggestedCollection*` keys so you're editing a draft instead of starting
from a blank page.

---

## 2b. Tag + extract design system from a live URL (via Claude for Chrome) — one shot

Use this instead of #2 (and skip #3/#4b separately) whenever you're looking at
a live site — public or gated (log in yourself first if gated; Claude for
Chrome only reads pages you already have access to, it won't sign in for you).
A plain claude.ai chat can't do this — pasting a bare URL there gets you the
page's text, not a visual read of it or access to its real CSS. This only
works through Claude for Chrome, which can navigate, see the rendered page,
*and* inspect the actual code behind it.

Doing tagging, colors/fonts, and motion together here isn't extra effort —
Claude for Chrome pays the cost of navigating and inspecting the page once
either way; running three separate prompts just means reloading and
re-inspecting the same page three times. One pass, three labeled sections in
the output.

Point Claude for Chrome at the URL and run:

> Navigate to [URL]. Our House DNA — always: [paste your always list], never:
> [paste your never list]. Do three things and return **one flat JSON object —
> all keys at the top level, no wrapper/grouping objects like `tagging` or
> `designTokens`**, no prose:
>
> **1. Tag this design** — `title`, `conceptLine`, `styleTags`, `vocabTags`,
> `imageRecipe`, `platform`, `screenType`/`platformOS`/`aspectRatio` (mobile
> only), `suggestedCollection` (plus `suggestedCollectionDescription`/
> `suggestedCollectionDeployFor`/`suggestedCollectionVocabTags`/
> `suggestedCollectionBriefBlock` if it's a new bucket), `sourceUrl` (echo the
> URL) — same definitions as the standard tagging prompt.
>
> **2. Read the real design tokens** — inspect computed styles, don't guess
> from appearance: `colorPalette` (array of `{ "hex": "#______", "role": "..." }`
> for ground/accent/text colors), `headingFont`, `bodyFont`, `monoFont` (real
> `font-family` values; `null` if you can't confidently identify one),
> `spacingNotes` (layout rhythm — corner radius, whitespace density, grid feel).
>
> **3. Read the real motion** — inspect the CSS `transition`/`animation`
> properties on elements that animate (buttons, cards, scroll reveals, hover
> states): `motionNotes`, one concise sentence built from the actual duration/
> easing values you found. If you find no explicit transition/animation CSS,
> say so explicitly rather than guessing from appearance.
>
> The three numbered groups above describe what to do, not how to shape the
> JSON — every key from all three ends up as a sibling at the top level of one
> object, like this shape (values omitted):
> ```json
> {
>   "title": "", "conceptLine": "", "styleTags": [], "vocabTags": [],
>   "imageRecipe": "", "platform": "", "sourceUrl": "", "suggestedCollection": "",
>   "colorPalette": [], "headingFont": "", "bodyFont": "", "monoFont": "",
>   "spacingNotes": "", "motionNotes": ""
> }
> ```
>
> Also take a screenshot of the page (or the specific section you're tagging)
> so I have an image to upload. Don't guess at `captureMethod` — I set that
> manually in the app.

Save the screenshot, then paste both the image and the JSON into the upload
form. The item fields (section 1) always save with the item. The design-system
fields (sections 2-3) are collection-level — **if the collection you're adding
to already has a design system set, the app should show you a diff and ask
before overwriting it**, rather than silently replacing what's there; if the
collection has nothing set yet, apply directly. `captureMethod`:
`CHROME_ASSISTED`.

---

## 3. Extract a Collection's design system (screenshot fallback — no live URL)

Use this when you don't have live access to the site — saved screenshots from
Dribbble/Pinterest/X with no URL to point Claude for Chrome at. If you do have
the live URL, use #2b instead — it gets real values in the same pass as
tagging instead of estimating from images here.

Only run this once you decide a collection is worth actually building with,
not just referencing. Attach 3-5 of the collection's best reference shots:

> For the collection "[collection name]", based on these reference screenshots,
> suggest a design system. Return JSON only, no prose, with these keys:
>
> - `colorPalette`: array of `{ "hex": "#______", "role": "..." }` — best-guess
>   hex values from the images, roles like "ground", "accent", "text". Say so
>   explicitly in a `notes` field if any value is a rough estimate rather than
>   a confident read.
> - `headingFont` / `bodyFont` / `monoFont`: name the closest *real* typeface
>   you recognize — don't invent a font name, and say `null` for any you can't
>   identify with reasonable confidence rather than guessing.
> - `spacingNotes`: a short description of the layout rhythm (corner radius
>   tendency, whitespace density, grid feel)
>
> Do not include a `motionNotes` field — motion can't be read from static
> images. I'll fill that in separately only if I've watched the site move.

If it's a live site rather than saved screenshots, get the real values instead
of estimates: open it with Claude for Chrome (or your browser's DevTools color
picker / computed-styles panel) and ask it to read the actual CSS colors and
`font-family` values rather than guessing from pixels.

---

## 4. Motion notes (only from something you've actually watched move)

Never invent these. Only run this after watching the live site, a screen
recording, or a video reference:

> I watched [collection/site name] in motion — here's what I noticed: [describe
> what you saw: transition speed, easing character, what triggers movement,
> whether it bounces or settles smoothly, etc.]. Turn that into one concise
> `motionNotes` sentence I can paste into my design library, in the voice of a
> design brief (e.g. "ease-out, 200-300ms, no bounce, fade+slight rise on
> scroll-in").

---

## 4b. Motion notes from real CSS (via Claude for Chrome, live URL) — standalone

If you used #2b, you already have this — it's folded into that one-shot pass.
Use this on its own only when you want to (re)check motion for a collection
later without redoing the full tagging pass — e.g. you tagged something a
while ago and want to fill in motion notes you skipped at the time. Only works
for a live site (public or gated, logged in yourself first) — there's no
equivalent for a saved screenshot or a native mobile app, since neither has CSS
to read.

> Navigate to [URL]. Inspect the CSS for the elements that animate — buttons,
> cards, scroll-triggered reveals, hover states, page transitions — and read
> the actual `transition`/`animation` properties (duration, timing-function/
> easing, what triggers each one), not just what it looks like. Return JSON
> only, no prose, with one key: `motionNotes`, a single concise sentence in the
> voice of a design brief, built from the real values you found (e.g.
> "ease-out, 220ms, hover-triggered scale on cards, no bounce"). If you can't
> find explicit transition/animation CSS on the elements you checked, say so
> explicitly rather than guessing from appearance.

Paste `motionNotes` into the Collection's design system panel, same as #4.

---

## Field-name cheat sheet

Keep these in sync with `prisma/schema.prisma` — if the schema changes, update
the JSON keys the prompts above ask for, or the paste-parser in the app won't
pre-fill correctly.

| Prompt output key | Maps to |
|---|---|
| `title`, `conceptLine`, `styleTags`, `vocabTags`, `imageRecipe`, `platform`, `screenType`, `platformOS`, `aspectRatio` | `Item` fields |
| `colorPalette`, `headingFont`, `bodyFont`, `monoFont`, `spacingNotes`, `motionNotes` | `Collection` design-system fields |
| `always`, `never` | `HouseDNA` fields |
| `suggestedCollection` | not a field — if it matches an existing Collection name, the app auto-selects it; otherwise it pre-fills the new Collection's `name` |
| `suggestedCollectionDescription`, `suggestedCollectionDeployFor`, `suggestedCollectionVocabTags`, `suggestedCollectionBriefBlock` | not fields — pre-fill the new Collection's `description`/`deployFor`/`vocabTags`/`briefBlock` when `suggestedCollection` is new; ignored if it matched an existing one |
