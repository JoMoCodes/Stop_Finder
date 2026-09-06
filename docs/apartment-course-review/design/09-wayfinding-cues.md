# 09 — Wayfinding cues for the pattern

## Goal
Make the *structure* of a unit number visible everywhere with one consistent colour per digit place, sharpen the arrows and badges that already work, add a "digit key" sign to the Part 3 and Part 4 examples, and give Part 5 a top-down **mini-map** that shows the 20-door loop, its direction reversal on the right wall, and where the camera is now. As a driver I want the pattern before I read a single plate; these cues put it on the wall.

## Why
- Hiro (geometer): Part 5's "right wall reverses direction… your brain doesn't see a continuous walk around the building; it sees two opposite readings"; proposes "a top-down schematic diagram… showing the 20-unit layout as a numbered loop… make the asymmetry explicit."
- Tobias: the Walk-around buttons let learners "teleport"; wants "a compass rose or 'you are here' indicator that persists and updates as the camera moves."
- Ada: "each place (building, floor, door) gets a distinct color… consistent application across all five parts."
- Cyrus: the badge/banner/plate hierarchy is "textbook"; keep it and extend it.
- Marcus/Eleanor/Rosa: the yellow arrows and floor badges are the most-loved teaching devices ("GENIUS", "made the pattern click") — refine, don't replace.
- Luna: "is it clear to a new learner that they are about to be asked to *choose* a name?" — the Part 3 example should show the anatomy of the number.

## Design

### Shared palette and splitter (insert immediately after `const COLOR = {…};`)
```js
const PLACE_COLORS = { building: '#f28c6a', floor: '#7cc4ff', door: '#eef2f6', path: '#ffd54a' };
/* split a unit string into digit places for a stage type; masks ('_', '▢') keep their position */
function splitPlaces(str, type) {
  const n = str.length;
  if (type === 'building') return [{ text: str, place: 'building' }];
  if (type === 'tower' && n === 3) return [{ text: str[0], place: 'floor' }, { text: str.slice(1), place: 'door' }];
  if ((type === 'row' || type === 'block') && n >= 4)
    return [{ text: str.slice(0, n - 3), place: 'building' }, { text: str[n - 3], place: 'floor' }, { text: str.slice(n - 2), place: 'door' }];
  if (type === 'seq' && n >= 3) return [{ text: str.slice(0, n - 2), place: 'building' }, { text: str.slice(n - 2), place: 'door' }];
  return [{ text: str, place: 'door' }];                 // plex and anything unexpected
}
```
CSS (insert immediately after the `#viewbar button.vbtn` line):
```css
:root { --c-building:#f28c6a; --c-floor:#7cc4ff; --c-door:#eef2f6; --c-path:#ffd54a; }
.pl-building{color:var(--c-building)} .pl-floor{color:var(--c-floor)} .pl-door{color:var(--c-door)}
```
Semantics fixed for the whole course: **coral = building, blue = floor, white = door, yellow = reading order/path.** Doc 05 colours quiz digits, doc 04 the prompt examples, doc 10 the completion summary — all from these names.

### Part 1 arrows (`addArrows`)
Keep the three front arrows. Add the "continues round the back" cue: a fourth arrow from top-right plate (xr, yt, z) to the building's right edge (W/2 + 1.2, yt, z), then a fifth along the right end wall from (W/2 + 1.2, yt, z) to (W/2 + 1.2, yt, −HALF_D − 0.6). Colour `COLOR.arrow`. Learners who drag will see the numbers keep counting. — *Removed (2026-09): only the three front arrows remain in `addArrows`.*

### Part 2 badges (`addTowerArrows`)
Badge `fg` becomes `PLACE_COLORS.floor` (`#7cc4ff`) so "blue = floor" is learned here, where it is the only rule. Tidy the arrow: `arrowX = x − 1.4` (today's `x − 2` leaves a gap); shaft radius 0.1. Badge size 1.0 → 1.15.

### Digit key sign — `addPlaceKey(g, segments, x, y, z)` (new, after `addTowerArrows`)
A 1024×256 canvas drawn in this doc (do not call doc 03's `makeTextTexture`): dark panel `rgba(20,24,30,.92)`, digits 150 px bold in their place colour with a 0.14 em gap, and 46 px captions `BUILDING · FLOOR · DOOR` under them in the same colours. Plane 5.2 × 1.3.
- Part 3 example (`addRowGuides(g)`): key `[["1","building"],["1","floor"],["09","door"]]` at `(RW/2 − 3.2, RH + 0.95, RHALF_D + 0.12)` — right of the banner, on the roof line. Plus two floor badges (blue, 1.0 × 1.0) at `(−RW/2 − 1.0, fi·RFH + 2.55, RHALF_D + 0.6)` for fi 0,1.
- Part 4 example (`addBlockGuides(g)`): key `[["10","building"],["1","floor"],["01","door"]]` at `(BW/2 − 3.0, BH + 0.95, BHALF_D + 0.12)`; a yellow front→back arrow along the left end at floor 1: from `(−BW/2 − 0.9, 2.55, BHALF_D + 0.8)` to `(−BW/2 − 0.9, 2.55, −BHALF_D − 0.8)`, and a matching one back→front on the right end at floor 1, x = BW/2 + 3.0 (clear of the stair at x ≤ BW/2 + 2.3). Replace the comment `// no arrows or floor badges here…` with `if (st.kind === 'example') addBlockGuides(g);` and add `if (st.kind === 'example') addRowGuides(g);` after the `buildRowFacade(...)` line.

### Part 5 mini-map (`#minimap`)
DOM (immediately after `#viewbar`'s closing `</div>`):
```html
<div id="minimap" class="hidden" aria-hidden="true"><svg viewBox="0 0 132 200"></svg><div class="mmnote">9–16 upstairs, back &amp; front</div></div>
```
CSS: `#minimap{position:fixed;left:22px;bottom:28px;z-index:11;width:132px;padding:10px;border-radius:14px;background:rgba(20,24,30,.9);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.45)}` `#minimap svg{display:block;width:100%}` `#minimap .mmnote{color:#9fb0c0;font-size:10px;text-align:center;margin-top:4px}`.
Drawing (world x → svg x, world −z → svg y, so **front is the bottom edge**): rectangle 60 × 110 centred at (66, 100), stroke `#9fb0c0` 1.5. Door ticks from `SQ_LAYOUT` floor-1 slots only: L wall x=36, R wall x=96; a = z mapped to y = 100 + a·5 (front z=+7.5 → y=137.5, at the bottom); F/B doors at y = 155 / 45, x = 66 + a·5. Labels (11 px, `--c-door`) show the *unit number* (`base + d`) on the example stage; on the quiz stage show `?` for masked doors and the number once solved (`blanksolved`). Direction arrows (`--c-path`, 2 px, arrowheads): left wall ↑ (1→4), back → (5→6), front → (7→8), right wall ↓ (17→20). Highlight the wall currently facing the camera with a 3-px stroke in `--c-path`: azimuth `a = controls.getAzimuthalAngle()` (0 = front, +π/2 = right); nearest of {0, π/2, π, −π/2}. Camera wedge: a small triangle at radius 88 from centre at angle `a`, fill `#ffd9a0`. Update on `controls` `'change'` (register in your block after line 929).
Show on `stagechange` when `stage.type === 'seq'`, hide otherwise.

## Ownership
**May edit:** the block after `const COLOR`; `COLOR.arrow` value; `arrow()`; `addArrows`; `addTowerArrows`; new functions inserted immediately after `addTowerArrows` (`addPlaceKey`, `addRowGuides`, `addBlockGuides`); the two one-line calls in `buildStageGroup` (row branch after `buildRowFacade`; block branch replacing the comment); CSS at your anchor; the `#minimap` element; your mini-map JS block inserted immediately after the viewbar wiring loop (line 929).
**Must not edit:** `makeTextTexture`/`label`/banners (03); plate colours (plates stay monochrome — the digit key and the quiz carry the colours); `STAGES`, `SQ_LAYOUT`; `setSeqView`/`tick` (02 — you listen to `controls` events only); `showStage` (subscribe to `stagechange`); `#viewbar` rules other than your inserted block; `@media` (06 positions `#minimap` on phones).

## Acceptance checks
- Stage 00: three yellow arrows on the front façade (the "last two lead off the right end towards the back" cue was removed).
- Stage 04: floor badges are blue on dark; the big arrow sits 1.4 units left of the badges with no gap.
- Stage 07: right of "Building 1" a dark key reads **1 1 09** in coral/blue/white with captions; two blue floor badges on the left end.
- Stage 10: key **10 1 01**; a yellow arrow runs front→back along the left end at ground-floor height and back→front on the right end; none intersect the stairs.
- Stage 12: mini-map bottom-left: rectangle, 12 numbered ticks (601–608, 617–620), arrows ↑ → → ↓, note "9–16 upstairs"; the front wall is highlighted at the default view; press **Right** → right wall highlighted and the wedge sits on the right; drag → highlight follows.
- Stage 13: ticks show `?` for 1231, 1232, 1236, 1237, 1247, 1249, 1250 and numbers for the rest; solving 1236 fills it.
- Any stage: `splitPlaces('13117','row')` → `13 | 1 | 17`; `splitPlaces('1231','seq')` → `12 | 31`; `splitPlaces('222','tower')` → `2 | 22`; `splitPlaces('112','plex')` → `112`.
- Quiz options (doc 05) and prompt examples (doc 04) use the same three colours.

## Merge notes
- **Doc 03** edits the `'Building #'` literal one line above your `addRowGuides` insertion in `buildStageGroup`; expect an adjacent-line conflict, keep both.
- **Doc 01** edits values inside `COLOR` — you own only `arrow` and insert *after* the closing brace.
- **Doc 07** edits line 55 (`.vbtn` size) directly above your CSS anchor — adjacent, keep both.
- **Doc 05/04/10** consume `splitPlaces`/`--c-*` with fallbacks; if you merge last they light up.
- **Doc 08** adds halos as plate children; your badges/keys are separate meshes — no overlap. Do not add anything to `raycastList`.
- **Doc 06** gives `#minimap` its phone position (right: 8px; bottom: 166px; width: 88px); keep the id and the `viewBox` so it scales.

## Out of scope for this doc
Colouring digits on 3D plates (03 keeps them monochrome by design), changing `SQ_LAYOUT` or any numbering, a "trace the path" animation, adding Front/Back view buttons to Part 4, compass in Parts 1–4.
