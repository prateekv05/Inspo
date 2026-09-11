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
>
> Don't guess at `captureMethod` — I set that manually in the app.

Paste the JSON into the upload form's parser field. `suggestedCollection` isn't
a form field — it's just there to help you decide where to file it.

---

## 3. Extract a Collection's design system

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

## Field-name cheat sheet

Keep these in sync with `prisma/schema.prisma` — if the schema changes, update
the JSON keys the prompts above ask for, or the paste-parser in the app won't
pre-fill correctly.

| Prompt output key | Maps to |
|---|---|
| `title`, `conceptLine`, `styleTags`, `vocabTags`, `imageRecipe`, `platform`, `screenType`, `platformOS`, `aspectRatio` | `Item` fields |
| `colorPalette`, `headingFont`, `bodyFont`, `monoFont`, `spacingNotes`, `motionNotes` | `Collection` design-system fields |
| `always`, `never` | `HouseDNA` fields |
| `suggestedCollection` | not a field — informs your manual choice of Collection when saving an Item |
