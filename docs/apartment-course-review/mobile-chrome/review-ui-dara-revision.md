# Revision after the player tests

Read: Marrow, Zippy, ux.md. `player-3-perpetua.md` is missing from the review folder; her points come from the coordinator's summary.

## 1. What I change
- **Tap reliability is P0, ahead of chrome.** `pickBlank` accepts only the plate or the door beside/below it, and the click handler drops taps that moved > 6 px — touch wobble is 8–12 px. Fix: 12 px slop on touch, the snap (§4), a screen-sized halo.
- **Framing applies in landscape too** — I wrongly said the desktop distance wins there. Against the 264 px quiz-idle band the tower fits at ≈24 units, not 38.7: plates ≈36 px, not 22.
- **Prompt body on each part's first quiz building** (all three players), not the run's first; title-only after; ▾ expands it.
- **Strip label "Part 2 ▾"** so the escape route is obvious (Zippy, Perpetua); a manual expand stays until the stage changes. No "Jump to Part X?" dialog — jumps are reversible and keep progress.
- **Lookbar button: ghost, house glyph + ▾** — not amber (Marrow, Zippy), not "⋯": the glyph says where, the caret says menu.
- **From ux.md:** honour `#quiz:hover` only under `(hover: hover)` so the sheet auto-closes on touch; `Next ▸` in the sheet footer and "Building 2 ✓" on completion.

## 2. What I keep
- The strip, not always-visible buttons: one labelled tap is an escape route; the 70 px bar is the largest top cost and Marrow mis-tapped it.
- `#bottombar` never hides; 44 px floor, 56 px options, 24 px numerals; per-type framing, view offset, `DECOR_BOXES` guard, neighbour move.

## 3. Player questions
- Marrow 1: not offset — 20–30 px plates plus the 6 px slop; see §4.
- Marrow 2: hide the buttons, keep the bar, expand on tap; no confirmation.
- Marrow 3: behind ▾ on the title (44 px row); full on each part's first quiz building.
- Zippy 1: the raycast is exact; the slop and the beside/below rule reject near-misses.
- Zippy 2: fit framing brings the tower to ≈24 units; no per-door auto-frame needed.
- Zippy 3: portrait is primary; landscape gets identical rules.
- Perpetua 1–3: file missing; owed.

## 4. Snap spec
On `pointerup` with no `pickBlank` hit: project each unsolved plate (or the roof sign when that is the question) to screen; keep those facing the camera (normal·view < 0) and on screen; grow each rect by N = 40 px coarse, 12 px fine; open the one whose grown rect contains the tap, nearest centre first; else nothing. Halo: scale it per frame so its screen width is ≥ 48 px on coarse pointers (`max(1.16, 48/platePx)`), matching the snap radius.

— Dara Okonkwo-Lind, senior UI engineer
