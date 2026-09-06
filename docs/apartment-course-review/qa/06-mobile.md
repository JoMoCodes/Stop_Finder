# QA — Doc 06: Responsive & mobile layout

**Verdict: FAIL** (3 blockers reproduce real overlaps/broken tap-targets on stock
phone viewports; 2 majors fail the doc's own acceptance checks)

Method: served the merged file with vendored Three.js on port 9142, drove it
with Playwright (`hasTouch:true`, verified `pointer:coarse` actually matches),
jumped to stages 0, 1(quizopen), 8(quizopen), 12, 13 at 390×844, 320×568,
844×390 (landscape) and 768×1024, took bounding-client-rects of `#prompt
#jumpbar #doorsleft #viewbar #minimap #helpbtn #resetview #draghint #bottombar
#quiz`, and pairwise-intersected them. Screenshots (incl. red-outline debug
shots) saved under `qa/shots-06/`.

## Passed checks
- No horizontal or vertical page scroll on any of the 20 viewport×stage combos.
- Quiz is a true bottom sheet at ≤640px: full width, height 238–255px (≤60vh),
  `#qopts` 2×2 grid, numerals 24px, letters hidden, `#qclose` exactly 44×44.
- 320×568: quiz options measure 138×58 (≥48px required).
- Landscape (844×390): prompt capped at `min(52vw,460px)` top-left; quiz
  becomes a 236px right column; no vertical scroll.
- 768×1024 (iPad): desktop layout holds, `#quiz` sits at 248px/right:12px,
  not clipped.
- Building stays visible (not covered by the prompt) on all 5 required stages.

## Findings

1. **BLOCKER — coarse-pointer 44px fix is undone by cascade order.**
   Acceptance check: "every tap target ≥44 px on coarse pointers." Measured
   `getComputedStyle` on `#jumpbar button.jbtn` at 390×844 with
   `pointer:coarse` confirmed true → **40×44** (width still fails). Cause:
   `@media (pointer:coarse)` (line 212) sets `width:44px;height:44px`, but
   `@media (max-width:640px)` (line 233) restates `width:40px;height:40px`
   *after* it in source order, so on any real phone (coarse + ≤640px, i.e.
   almost all of them) the later rule wins and silently cancels the fix —
   the exact "34×34 fails 44×44" complaint the doc exists to solve.
   Fix: delete the redundant `#jumpbar button.jbtn{width:40px;height:40px;}`
   at line 233 (base rule at line 127 is already 40×40; the phone block
   doesn't need to restate it, and restating it breaks the override).

2. **BLOCKER — `#draghint` inherits a bad transform in portrait, pushing it
   off-screen.** Base `#draghint` (doc 08) has `left:50%; transform:
   translateX(-50%)`. Doc06's `@media (max-width:640px)` override (line 250)
   sets `left:8px; right:8px; width:auto;` but never resets `transform`, so
   the box still shifts left by half its own width. Measured rect at
   390×844: `x:-179`, so roughly half the hint renders off the left edge;
   text is visibly truncated ("...ck around · Scroll / pinch to..."). See
   `qa/shots-06/390x844-stage00-debug.png` and
   `320x568-stage12-debug.png` (worse on the narrower phone). Fix: add
   `transform: none;` to the `#draghint` rule in that media query.

3. **BLOCKER — landscape walk-around row overlaps the jump bar.** In
   `@media (max-height:520px) and (orientation:landscape)`, the merged CSS
   places `#viewbar` at `left:232px; bottom:8px` as a horizontal row
   (this deviates from the doc's own spec of `top:50%; left:8px;
   flex-direction:column`), while `#jumpbar` sits at `bottom:8px; left:8px`
   and renders ~266px wide (5 icons). Measured rects at 844×390 stage 12:
   jumpbar right edge 274px vs viewbar left edge 232px → 42×62px overlap.
   Visually confirmed the "Front" button's label is clipped/covered
   (`qa/shots-06/844x390-stage12-debug.png`). Fails "no element overlaps
   another" for stage 12/13 in landscape. Fix: either move `#jumpbar` up
   (`bottom:auto; top:8px`) so the two rows don't share the same band, or
   restore the doc's column layout for `#viewbar` at `left:8px` (needs a
   scrollable/narrower column since 4×44px stacked buttons don't fit under
   520px height).

4. **MAJOR — `#jumpbar`/`#doorsleft` collide at 320px width, and barely at
   390px.** `#jumpbar` is left-anchored with a fixed ~246px width;
   `#doorsleft` is right-anchored with content-dependent width. At 320×568
   (stage 8/13, quiz open) overlap is 63–73px (jumpbar right 254 vs
   doorsleft left 191/181) — fails the doc's explicit "320×568... still no
   overlap" check. At 390×844 the same pair only just touches (3px, Part 5's
   longer "N doors left" text). Fix: stack `#doorsleft` below `#jumpbar`
   instead of beside it in the `max-width:640px` block, e.g. `top: calc(
   var(--prompt-h,140px) + 16px + 60px)`.

5. **MAJOR — 768×1024 prompt overlaps doors-left chip.** The "Tablets
   641–1024px" block only repositions `#quiz`/`#jumpbar` and assumes
   "desktop layout holds," but at 768px the centred `#prompt` (up to 680px
   wide, spans x44–724) collides with `#doorsleft` (default `top:16;
   right:16`, left≈639–723) by up to 103px on every quiz-open stage.
   Confirmed visually (`qa/shots-06/768x1024-stage01q-debug.png`). Fix: add
   `#doorsleft { top: calc(var(--prompt-h,140px) + 16px); }` inside the
   641–1024px (or a narrower ≤800px) block.

6. **MINOR — `#resetview` (40×40) and `#helpbtn` (40×44) stay under 44px on
   phones under `pointer:coarse`**, unlike `.jbtn`/`.opt` which get explicit
   coarse-pointer rules. Doesn't fail a named acceptance check but violates
   the doc's stated top-line goal ("every tap target ≥44px on coarse
   pointers").

7. **MINOR — `#viewbar`/`#draghint` touch by ~2px** at stage 12/13 portrait
   (390×844 & 320×568). Cosmetic rounding, independent of finding 2's x-shift.

## Outside my doc
None observed that belongs to another doc's scope beyond what's noted above
(findings 2, 6 touch ids owned by 02/08 at the base-rule level, but the bugs
are in doc06's own media-query overrides).
