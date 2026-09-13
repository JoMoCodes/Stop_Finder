# What shipped: the phone chrome of the apartment course

Implemented on 2026-09-13 in all four `apartment-*.html` files (their CSS, DOM and
course JavaScript stay byte-identical; only the Sunbelt neighbour move is look-specific).
The spec is the game developer's final list (`review-gamedev-rin.md` §5) with the
reconciliations noted under "Deviations".

## The chrome model as shipped
V = visible · fold = folded to a compact form (tap opens it) · H = hidden · SR = visually hidden, still read by screen readers.

| Element | Worked example (tutorial) | Quiz building, idle | Options open | Building finished | Last building of a part finished |
|---|---|---|---|---|---|
| `#prompt` headline | V | V | V | "Building N ✓" | "Building N ✓" |
| `#prompt` body | V | first quiz building of the part: V until its first door is tapped; later buildings: fold (▾, tap the headline) | SR | H (no body) | H |
| `#jumpbar` part buttons | V | fold: strip "Part 2 · 5 of 14" + progress + caret; tap the strip to show them for 6 s | strip | strip, segment turns green | shown for 3 s after the sheet closes, next part's button pulses once |
| `#progress` | V | V (in the strip) | V | V | V |
| `#doorsleft` chip | H | V, on the strip's row (portrait) | SR | "Done ✓" | "Done ✓" (hidden under the peek) |
| `#lookbar` Home + Appearance | one `⋯` button on every phone layout (menu holds amber Home + the four looks) | same | under the sheet | same | same |
| `#bottombar` Back / Next | V | V | under the sheet (portrait) | V, Next | V, "Next: Part N ▸" |
| `#helpbtn` `?` | V (bottom right portrait; top right under `⋯` landscape) | V | H | V | V |
| `#resetview`, `#draghint` | as before | as before | H | as before | as before |
| `#viewbar`, `#minimap` (Part 5) | V, moved down/right to the freed corners | V | under the sheet / V | V | V |

Desktop keeps every element as it was. Only the completion prompt ("Building N ✓"), the
touch-independent fixes (sheet auto-close, confetti origin and clearing, part cannons, camera arcs,
no Reset chip during a Part 5 view) and the partial-number line in the sheet reach the desktop.

## Values
- Breakpoints: unchanged, `(max-width: 640px)` and `(max-height: 520px) and (orientation: landscape)`; the JavaScript uses the same two queries (`isPhoneLayout()`).
- Strip: 32 px tall, 44 px hit area (`::after`), portrait `top: var(--prompt-h) + 8px`, `left: 8px`, `right: calc(var(--chip-w) + 16px)` — `--chip-w` is the `#doorsleft` chip's rendered width, published by a `ResizeObserver` while the chip is visible, so "Name the building" sits beside the strip instead of over it (full width while expanded); landscape bottom-left 236 px wide (284 px expanded).
- Peek: 3000 ms, only when the finished stage is the last of its part; starts on `quizclose` if the sheet is still open. Manual expand: 6000 ms, kept while focus is inside.
- Bottom row (portrait): `⋯` 44 px at left 8 / bottom 12, Back / Next centred, `?` 44 px at right 8 / bottom 12; `#resetview` bottom 64, `#viewbar` bottom 64 (left), `#minimap` bottom 116 (right), `#draghint` bottom 130.
- Landscape: `⋯` top right, `?` under it (top 60), `#minimap` top 112 right 8, walk bar at left 250 with 44 px buttons, options as a 2×2 grid (48 px rows, 20 px numerals) so the miss reason stays on screen, drag hint directly under the prompt.
- Prompt: the `short` body is used on both phone layouts (it was portrait-only) and the prompt re-renders when the layout class changes; "click" reads "tap" on `(pointer: coarse)`. `nameBuilding` says "Tap the roof sign if the choices close": the sign (`buildingState.plate`) is in the raycast list, and `pickable()` admits it once every door is filled — the moment its halo and its keyboard door-list entry appear.
- Framing (portrait): `FOOTPRINT` per type (width, depth, fill: plex 14×9 @0.85, tower 18×9 @0.84, row 24×9 @0.78, block 16×10 @0.84, seq 16×26 @0.75); `portraitPos` backs off along the pose's view ray until the projected width fills that share of the screen, adds the near face's lead for straight-on views, never nearer than 0.75× the desktop distance. Result at 375×812: the 4-plex spans ~80 % of the width (was ~50 %), the Part 4 block fills the width with readable five-digit plates (was 34 %), the Part 3 row lands where the old 1.55× constant put it.
- View offset: `bandRect()` (below the prompt/strip/chip, above the sheet or the bottom row; beside the column in landscape) and `camera.setViewOffset` shift the picture into the free band, 250 ms ease, held while the sheet is open and after it closes (no bobbing per answer), recomputed on `stagechange`, `quizopen`, resize and prompt-height changes. Desktop: no offset.
- Sheet auto-close: `:hover` only counts on `(hover: hover)` devices; touch screens close 1100 ms after a correct tap (the P0 from the UX pass).
- Touch: tap slop 12 px for `pointerType: touch`; a tap that misses every plate opens the nearest unsolved plate within 32 px (`nearestBlank`); halos never shrink below 48 px on screen on coarse pointers; the opened plate tints for 700 ms; the sheet's subline repeats the plate's partial number ("The plate shows 71▢5 — pick the full number").
- Reward: the per-building burst comes from the solved plate (kept inside the free band), 90 pieces on touch / 170 otherwise; a part's last building fires two smaller cannons (60 a side); the finale keeps its 120-a-side cannons; confetti is cleared on every stage change.
- Camera: a move that keeps its pivot (Part 5 walks, Reset view) interpolates on an arc around the target instead of a chord through the building; the Reset chip stays hidden while a Front/Back/Left/Right view is active.
- Sunbelt: the front neighbour at x = 24 moved to x = 42, off every stage's view ray.
- Hints: idle tip once per run (was once per building); touch wording "Drag to look round · Pinch to zoom · Tap a glowing ? door to answer".

## Deviations from the reviews, and why
- Peek per part, not per building (Hollis's revision wanted every building): the owner's ask says "when a part is completed", the strip's segment already ticks per building, and the game developer called per-building peeks animation for its own sake.
- `⋯` from stage 0 on every phone layout (Hollis first proposed an animated collapse on the first quiz building): both revisions and the game developer converged on one rule per layout; the tutorial keeps its prompt and jump bar, which is what the owner asked to protect.
- The strip applies in landscape too (Hollis's revision would keep the full bar there): consistency across rotation, and the gain is real at 360 px tall.
- No decor-box guard on `controls.maxDistance` (Dara): the neighbour move plus the closer framing already keep every pose clear; the guard can come later if a look adds decor on a view ray.
- No dolly toward the tapped plate (Hollis, optional): the partial number is repeated in the sheet instead, so no camera move per tap.
- Halo floor of 48 px instead of a fixed 1.3×: the plates are 1.7-2 units wide, so a fixed factor is too small at the row/seq distances and too big up close.
- The Part 5 corner pose is still fairly wide (the diagonal footprint dominates); the walk-around views are much closer than before and show a full face.

## QA (Browser pane, Classic look unless stated)
- Portrait 375×812 with touch: tutorial keeps prompt + full jump bar; first quiz building keeps its body and reads "Tap a door marked ?"; a tap 24 px beside the plate opens the sheet (snap); the sheet closes itself after a correct tap; "Building 2 ✓", Done ✓ chip, Next in the bottom row; later buildings fold to the headline with ▾; tapping the headline unfolds it; finishing Part 1 expands the part buttons for 3 s with "2" pulsing and fires the small cannons; Part 4 fills the width with readable plates; Part 5 walk views swing round on an arc and show the whole face; Sunbelt Part 4 shows the block (the neighbour is gone from the view).
- Landscape 740×360 with touch: short body, `⋯` and `?` top right, strip bottom-left, 2×2 options with the miss reason on screen, picture shifts left while the column is open, completion beat as above.
- Desktop 1280×720: unchanged layout (full Home + Appearance pill, full jump bar, body copy visible), sheet on the right, completion prompt "Building N ✓".
- No console errors on any layout (an `error` listener was attached during the checks).
