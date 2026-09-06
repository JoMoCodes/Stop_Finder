# 03 — Door plates, signs and banners (canvas typography)

## Goal
Every number the learner must read comes out of `makeTextTexture`. Give it a real font stack, numerals that fill the plate, sharper textures for 4–5 digit units, a blank style that is recognisable without colour, a placeholder glyph that cannot be mistaken for a minus sign, and a building banner that sits on the roof instead of hovering. No call site outside this doc's list changes — the texture function detects blanks itself.

## Why
- Ingrid (typographer): "`sans-serif` is not a font; it is a plea for the browser to pick something… numerals that look different on an iPhone 14 than on a Galaxy." Also: underscores "sit at the baseline and are visually ambiguous (looks like a minus)"; recommends 1024×512 canvases and anisotropy 16.
- Dev: canvas text "can look slightly blurry or aliased" on Part 5's 5-digit numbers; "increase canvas resolution."
- Cyrus (wayfinding): "the canvas text starts to pixelate under perspective… real navigation is oblique"; wants higher resolution for side-facing plates.
- Sam (a11y): blanks are "distinguished ONLY by their red color" (WCAG 1.4.1) — needs a shape cue.
- Priya + Omar: "Building #" "looks like a typo or missing data" / "looks like a bug, not a design choice."
- Bea: the banner is "a gray box hovering above the roof like a UFO."
- Eleanor / Marcus / Bea: numbers "a bit small" on bigger buildings; "too small to read in a dark stairwell on a 390px viewport."

## Design

### Constants (insert immediately before `function makeTextTexture`)
```js
const PLATE_FONT = '"Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif';
const PLATE_FG = '#16202b', PLATE_BG = 'rgba(255,255,255,0.96)';
const BLANK_FG = '#c0392b';            // 5.4:1 on white — keep
const BLANK_DASH = { color: '#c0392b', width: 14, dash: [40, 26], inset: 22 };   // in 1024-px canvas units
```

### `makeTextTexture(text, opts)` — new behaviour
1. **Resolution:** default `w,h` = `512×256` for texts ≤ 3 characters, `768×384` for 4–5 characters, unchanged when the caller passes `w/h` (banners pass 1024×256). Memory budget note: ~100 four-plus-digit plates × 768×384 RGBA + mips ≈ 160 MB GPU across the whole cached course — acceptable; do **not** go to 1024×512 for plates.
2. **Fit-to-width:** start from `font` size, then `ctx.measureText`; scale the font down until width ≤ 0.86·w and up until cap height ≤ 0.72·h (cap at 1.35× the requested size). A "?" or "112" therefore renders ~45 % larger than today; "13125" fills 86 % of the plate.
3. **Font:** `${weight} ${px}px ${PLATE_FONT}` — always `PLATE_FONT`; callers that pass `font:` keep their size/weight but the family is replaced.
4. **Blank detection:** `const isBlank = /[?_]/.test(text)`. When blank:
   - draw a dashed inner border (`BLANK_DASH`, scaled to canvas width) in `BLANK_FG` on light backgrounds or `#ffd9a0` on dark banner backgrounds;
   - replace every `_` with a **hollow rounded box** the width of a digit ("0" advance) and 0.78 cap-height tall, stroke = 9 % of digit height, baseline-aligned; draw digits and boxes glyph by glyph with equal advances so `71▢5` keeps `7105`'s spacing;
   - "?" stays as text, in `BLANK_FG`.
   Result: blank plates differ from solved ones by **shape** (dashed frame, boxes) as well as colour.
5. **Texture settings:** `tex.anisotropy = renderer.capabilities.getMaxAnisotropy()`, `tex.colorSpace = THREE.SRGBColorSpace`, `tex.generateMipmaps = true`, `minFilter = LinearMipmapLinearFilter`.
6. `label()` / `setPlateText()`: unchanged signatures. In `setPlateText`, after swapping the map also set `plate.material.color.set('#ffffff')` so a doc 08 hover tint never survives a solve.

### Banner anchored to the roof (`addTopBanner`, `BANNER_OPTS`)
- Plate `9.6 × 2.0`, `y = h + 0.95` (was `h + 1.2`), `z = halfD + 0.12`, `w:1024, h:256`, font `bold 150px` → auto-fit.
- Two posts: `box(g, 0.16, 0.9, 0.16, COLOR.roof, ±4.2, h + 0.45, halfD + 0.05)` so the sign visibly stands on the roof slab. (`box` is doc 01's helper; calling it is fine.)
- `BANNER_OPTS.fg` stays `#ffe4c2`.

### "Building #" → a real blank (`buildStageGroup` line 863)
`'Building #'` → `'Building ?'`. Blank detection gives it the dashed amber frame and red-on-dark is avoided: on dark backgrounds the "?" is drawn in `#ffd9a0`. Doc 04's prompt says "the roof sign asks for the building number", doc 05's header says "Which building is this?" — all three now agree it is a question, not a bug.

### Side signs (`buildShell`, `buildTowerShell`, `addBlockSideSigns`, `buildSeqStructure`)
Only the `label(...)` calls: sizes stay; fonts become `PLATE_FONT` automatically. In `buildSeqStructure`, the two side signs grow from `4.2 × 1.05` to `5.0 × 1.25` (Cyrus: gable-end signs are bigger in real life).

## Ownership
**May edit:** the new constants block; `makeTextTexture`, `label`, `setPlateText` bodies; `BANNER_OPTS`; `addTopBanner`; `addBlockSideSigns`; the `label(...)` sign calls inside `buildShell` (line 366), `buildTowerShell` (406), `buildSeqStructure` (694–702); the `'Building #'` literal in `buildStageGroup` (863).
**Must not edit:** any door-plate `label(...)` call inside `buildFacade`, `buildTowerFacade`, `buildRowFacade`, `buildBlockFacade`, `buildSeqFacade` (blank styling is automatic — you do not need them); `addTowerArrows` badges (09); `box()` internals (01); `openQuiz`/`chooseOption` (05); anything in `<style>` or the DOM; `STAGES` masks (curriculum). Do not load web fonts (no new network dependency; `fonts.googleapis` is not in the import map and offline `http.server` must work).

## Acceptance checks
- Stage 01: plate "109" numerals ≈ 1.45× today's glyph height; "?" plate shows a dashed red frame inset from the edge; in a greyscale screenshot the blank is still obvious.
- Stage 08: `710_` renders as `710▢` with a hollow box the same advance as a digit; `_109` → `▢109`; no underscore glyphs remain anywhere.
- Stage 09: `13__2` shows two boxes; "13125" fills ~86 % of plate width, crisp at 1440×900 and at 2× DPR.
- Stage 08/09 banner: reads "Building ?" with dashed amber frame; two posts visible between roof and sign; after naming, `setPlateText` → "Building 7" with no frame.
- Stage 12 Left view: 601–604 legible at 1440×900 with no visible pixel stair-stepping at the default zoom; side signs "Building 6" larger than before.
- Every sign/plate uses the same glyph shapes on Chrome, Firefox and Safari (compare "1", "7", "4").
- No plate's background or numeral colour changes on solved plates.

## Merge notes
- Doc 09 inserts `addRowGuides(g)` immediately after the `buildRowFacade(...)` line in `buildStageGroup`'s `row` branch — one line below your `'Building ?'` edit. Expect an adjacent-line conflict; resolution: keep both.
- Doc 08 tints `plate.material.color` on hover and scales the plate; doc 10 pops `plate.scale` and adds a child dot mesh on solve. None of them touch the texture. Your `setPlateText` colour reset is the only cross-over — keep it.
- Doc 05 renders quiz options from `String(val)`; your box glyphs live only in canvas, so the panel is unaffected.
- Doc 01 changes `renderer` options; you only *read* `renderer.capabilities`.
- Doc 07 verifies the non-colour cue with a greyscale pass — if it fails, the fix is here, not in 07.

## Out of scope for this doc
Colouring digits by place on 3D plates (deliberately monochrome — real plates are), pre-skewed textures, SVG/bitmap font atlases, kerning tables, changing mask strings in `STAGES`, banner wording, staircase or facade geometry.
