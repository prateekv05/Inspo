# Design System Extraction Guide

How to get colors, fonts, spacing, and motion out of a reference and into the
app accurately — the right method depends entirely on what kind of thing
you're looking at. This guide covers three sources: **public websites**,
**gated webapps** (login required, but browser-based), and **mobile apps**
(native, phone-only). Each has a different ceiling on accuracy — know which
one you're in before you trust the numbers.

Reliability, roughly best to worst: **live-site DevTools inspection** > **Claude
for Chrome reading computed styles** > **color-picking a screenshot** >
**eyeballing a screenshot by description alone**. Use the best one available
for what you're looking at.

---

## A. Public websites (no login needed)

This is the easy case — you have full access to the live page.

**Step 1 — Get exact colors and fonts, not estimates**

Open the site, right-click the element you care about → **Inspect**. In
DevTools:
- The **Styles** panel shows the exact `color`, `background-color`, and
  `font-family` values as authored — no guessing.
- Click a color swatch next to any color value to open the eyedropper/picker
  and confirm the hex.
- Check the **Computed** tab for the final resolved font stack if the authored
  CSS uses a variable or fallback chain.

Do this for: the background/"ground" color, one or two accent colors, body
text color, heading font, body font, and (if used) a monospace/label font.

**Step 2 — Capture the screenshot**

A full-page or hero screenshot, however you normally do it (browser screenshot
tool, `Cmd+Shift+4`, etc.). This is what goes into the app as the Item's image.

**Step 3 — Run the tagging prompt**

`standing-prompts.md` prompt **#2**, attach the screenshot. This gives you
title/conceptLine/vocabTags/imageRecipe/platform for the Item.

**Step 4 — Run the design-system prompt (once, per Collection, not per item)**

`standing-prompts.md` prompt **#3**, attaching 3-5 of the collection's best
shots. Then **override** the `colorPalette` and font fields it returns with
the exact values you got from DevTools in Step 1 — the prompt's guesses are a
convenience for when you can't inspect the live page (case B and C below);
here, you can, so use the real numbers.

**Step 5 — Motion, only if the site actually animates**

Watch it scroll/interact for a minute, then run prompt **#4** describing what
you saw. Skip this entirely if nothing moves.

**captureMethod to set:** `MANUAL_SCREENSHOT` (or `SCREENSHOT_API` if you used
the optional URL-capture feature from Phase 10).

---

## B. Gated webapps (login required, but it's a browser)

Same as above, with one constraint: you have to be logged in yourself first —
that part is never automated.

**Step 1 — Log in yourself**

In your own browser, sign up/log in normally. This is always a manual step.

**Step 2 — Navigate with Claude for Chrome**

Once you're authenticated, point Claude for Chrome at the screen you want. It
can navigate the authenticated pages and read the page for you — since you're
already logged in, this is just reading a page you have access to.

**Step 3 — Get colors/fonts**

Two options, in order of preference:
- Ask Claude for Chrome to read the computed CSS (colors, `font-family`) off
  the specific elements you care about — same reliability as DevTools, since
  it's reading the real live page.
- Or open DevTools yourself on the authenticated page directly, same as
  section A Step 1.

**Step 4 — Capture screenshots**

Screenshot the 3-5 screens worth keeping as references.

**Step 5 — Tag and extract**

Same as A Steps 3-5 — prompts #2, #3, #4 as applicable.

**One difference: `sourceUrl`.** Gated content usually isn't a shareable
public link. Leave `sourceUrl` blank and instead put something identifying in
the item's title or conceptLine, e.g. "Acme Dashboard — settings screen,
logged-in view."

**captureMethod to set:** `CHROME_ASSISTED`.

---

## C. Mobile apps (native, phone-only — often also gated)

The hardest case: no DevTools, no computed CSS, often no public URL at all.
Everything here is manual — there's no automation path for a native app.

**Step 1 — Log in on your phone**

Same rule as always: you do this yourself.

**Step 2 — Capture screens**

- **Static screens**: native OS screenshot (side/volume buttons on iOS/Android).
- **Anything with motion you want to capture accurately**: use the phone's
  built-in screen recording instead of a static shot — this is the *only* way
  to get real motion notes for a native app, since there's no live site to
  re-watch later.

**Step 3 — Get the images onto your computer**

AirDrop (iOS → Mac), Google Photos / iCloud Photos sync, or a cable transfer.
Once they're on your computer, the rest of the flow is identical to any other
upload.

**Step 4 — Colors: pick from the screenshot, don't eyeball**

Since there's no CSS to inspect, use an actual color-picker tool on the
screenshot pixels rather than describing colors from memory or letting Claude
guess purely from a JPEG:
- macOS: **Digital Color Meter** (built-in) or the eyedropper in Preview/
  Keynote's color picker.
- Windows: the color picker built into Paint or PowerPoint.
- Any of these give you a real hex value sampled from the actual pixels — more
  reliable than a model's visual estimate, though still only as accurate as
  the screenshot's color compression.

**Step 5 — Fonts: don't force an ID**

Native apps often use system fonts (SF Pro on iOS, Roboto on Android) or a
custom font you can't identify from a screenshot alone. It's fine — often
correct — to record `headingFont`/`bodyFont` as `"System default"` rather than
guessing a specific typeface name.

**Step 6 — Tag and extract**

Run prompt **#2** per screen (set `platform: "mobile"`, fill in `screenType`/
`platformOS`/`aspectRatio`). Run prompt **#3** once for the collection, but
mention in the message that these are phone screenshots with hand-picked hex
values, not DevTools reads — this keeps Claude from overstating confidence in
its own guesses when you've already got better data from Step 4.

**Step 7 — Motion**

Only run prompt **#4** if you did a screen recording in Step 2. Describe what
you actually watched — don't infer motion from a static screenshot.

**captureMethod to set:** `PHONE_SCREENSHOT` (static) or `SCREEN_RECORDING`
(if captured from a recorded clip).

---

## Quick reference

| Source | Colors/fonts source of truth | captureMethod |
|---|---|---|
| Public website | DevTools inspect (exact) | `MANUAL_SCREENSHOT` or `SCREENSHOT_API` |
| Gated webapp | Claude for Chrome / DevTools on the authenticated page (exact) | `CHROME_ASSISTED` |
| Mobile app | Color-pick the screenshot pixels (approximate); fonts often "System default" | `PHONE_SCREENSHOT` or `SCREEN_RECORDING` |

The `captureMethod` badge shown on each item in the app (Phase 7.1 of
`buildprompts.md`) exists specifically so that, months from now, you can tell
at a glance which collections have real design-system data behind them and
which are still educated guesses.
