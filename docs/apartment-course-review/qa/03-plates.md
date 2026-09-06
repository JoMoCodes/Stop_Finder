# QA 03 — Door plates, signs and banners

**Verdict: PASS WITH MINORS** (one MAJOR carried over from a pre-existing note, confirmed and fixed in probe)

## Passed checks
- Font stack: `PLATE_FONT`, `PLATE_FG/BG`, `BLANK_FG/ON_DARK`, `BLANK_DASH` constants present exactly as specified (apartment-mockup.html:550-554); `makeTextTexture` fit-to-width, resolution tiers (512×256 / 768×384), anisotropy/sRGB/mipmap texture settings, and glyph-by-glyph blank rendering all match the doc (lines 582-653).
- Stage 01 "?" plate: dashed red frame inset from the plate edge, confirmed crisp and confirmed still legible in a desaturated (greyscale) crop of `shots-merged/01-part1-quiz.png` — dashes + glyph shape carry the cue independent of colour (Sam's a11y check passes).
- Stage 08 blanks (`shots-merged/08-part3-quiz.png`): `710▢`, `71▢5`, `7▢07`, `▢109` all render with hollow rounded boxes at digit advance width and the dashed red frame; no underscore glyphs visible anywhere.
- Stage 09 (`shots-merged/09-part3-quiz.png`): `13▢▢2` shows two boxes; solved `13125` fills the plate width cleanly, crisp numerals, no visible pixel stair-stepping.
- Banner: "Building ?" renders with the dashed amber frame + two posts standing on the roof slab (`shots-merged/08-part3-quiz.png`); solved "Building 1" banner (`shots-merged/07-part3-example.png`) sits cleanly on the posts with no frame.
- `setPlateText`'s `plate.material.color.set('#ffffff')` reset survives the merge with doc 08 (hover tint) and doc 10 (pop/tint + solved dot): drove a live answer via a Playwright probe (stage 8, blank `710▢` → `7103`) and screenshotted at solve+0ms and solve+1000ms — by +1000ms the plate is back to a plain white background with normal dark numerals, no dashed frame, no hollow box, matching every other solved plate. Doc 10's green "solved" dot and confetti are visible but out of this doc's scope.
- Part 5 side signs (`shots-merged/12-part5-example-view-left.png`, `-right.png`): "Building 6" is legible, correctly sized (5.0×1.25 per the doc), and both signs face outward correctly — `buildSeqStructure`'s rotation convention (`sx>0 ? +PI/2 : -PI/2`) is the *correct* one.
- Doc 09's `addRowGuides` insertion next to the `'Building ?'` edit in `buildStageGroup` resolved cleanly (both present, line 892 vs the `'Building ?'` literal used at line ~1345).

## Findings

1. **MAJOR/BLOCKER (confirmed) — side number/letter signs on Parts 1, 2 *and* 4 face inward and are invisible from outside.**
   `buildShell` (apartment-mockup.html:752-756), `buildTowerShell` (:796-800), and `addBlockSideSigns` (:1083-1090, Part 4 — also owned by this doc per "May edit") all use:
   ```js
   sign.rotation.y = ex > 0 ? -Math.PI / 2 : Math.PI / 2;
   ```
   This is the *opposite* of the convention used correctly elsewhere in the same file (`buildSeqStructure`'s side signs, and every door plate's `yaw` in `buildSeqFacade`), which use `sx > 0 ? +Math.PI/2 : -Math.PI/2` to face a `PlaneGeometry`'s default +Z-normal outward on both sides.
   **Verified two ways:**
   - Static geometry check: with `ex=+1` (the +X side), `rotation.y = -π/2` rotates the plane's default +Z normal to **-X** (inward), not +X (outward). `label()`'s material has no `side: THREE.DoubleSide`, so the backface is culled and the sign is invisible from outside.
   - Live render: built a Playwright probe (raw camera placed 13 units outside the wall on both the +X and -X side, bypassing OrbitControls) against a served copy of the merged file. **Before fix:** Part 1 (side number), Part 2 (side letter), and Part 4 (`addBlockSideSigns`, "Building 10") all show a blank wall from both sides — no sign visible. **After** flipping all three occurrences to `ex > 0 ? Math.PI / 2 : -Math.PI / 2`: all three signs render correctly outward-facing ("1", "A", "Building 10").
   **Fix (one line, ×3):** in `buildShell`, `buildTowerShell`, and `addBlockSideSigns`, change
   `sign.rotation.y = ex > 0 ? -Math.PI / 2 : Math.PI / 2;` → `sign.rotation.y = ex > 0 ? Math.PI / 2 : -Math.PI / 2;`
   (Part 4/`addBlockSideSigns` is technically "Outside my doc" in curriculum terms but is explicitly in this doc's edit list and shares the identical bug/fix, so it's rolled in here rather than filed separately.)

2. **MINOR (doc-vs-implementation mismatch, not a functional bug) — banner Y offset.**
   The design doc's "Constants" section specifies `addTopBanner`'s plate `y = h + 0.95 (was h + 1.2)`. The merged code (and the implementer's own original commit `df03bcc`) actually uses `y = h + 1.9` (apartment-mockup.html:965, and the matching `SQH + 1.9` in `buildSeqStructure`:1150). Visually this is *correct* — posts span `h` to `h+0.9` (box height 0.9 centred at `h+0.45`), and a plate centred at `h+1.9` with half-height 1.0 sits with its bottom edge exactly on the post tops (`h+0.9`), which is what "stands on the roof" requires; the doc's stated `h+0.95` would instead sink the plate bottom to `h-0.05`, embedding it in the roof slab. No action needed — the doc's numeric example is simply superseded by the implementer's (correct) value; flagging only so the design doc text isn't taken as the source of truth on a future edit.

3. **Not independently verified** — "same glyph shapes on Chrome, Firefox and Safari": only Chromium (via Playwright) is available in this environment; the font stack (`"Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif`) is standard and platform-safe, but cross-browser rendering itself was not tested. Also did not independently re-render at 2× DPR (visual inspection at 1× showed no aliasing on `13125`).

## Outside my doc
None beyond finding 1's Part 4 note above (already folded in, since `addBlockSideSigns` is in this doc's explicit edit list).
