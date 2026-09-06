# QA — 07 Accessibility (merged page)

**Verdict: PASS WITH MINORS**

Verified against `/home/user/Stop_Finder/apartment-mockup.html` (2754 lines) with a
served copy (vendored Three.js) driven by Playwright/Chromium (swiftshader),
plus manual screenshot inspection.

## Passed checks
- **Contrast table + `.sr-only`/`:focus-visible` CSS** present verbatim at lines 15–31,
  inserted right after `.hidden` as specified.
- **ARIA attributes**: `#prompt` (`aria-live="polite" aria-atomic`), `#quiz`
  (`role="dialog" aria-labelledby="qhead"`), `#qmsg` (`aria-live="assertive"`),
  `#jumpbar` (`role="navigation"`, per-button `aria-label`s + `aria-current`),
  `#viewbar`/`#bottombar` (`role="group"`) — all present and attribute-only, no
  content edited.
- **`#scene-desc` / `#doorlist`**: inserted right after `#app`, correct text,
  and confirmed to update **synchronously in the same tick as the click**
  (checked with a pre/post-click synchronous read, no `setTimeout`) — so the
  door list genuinely reacts to the `blanksolved` event, not only the 200 ms
  poll.
- **Keyboard map**: Tab reaches door-list buttons, jump buttons, canvas, and
  bottombar (`#back`); Enter on a door-list button opens the quiz and moves
  focus to the first option; ↓/↓/↑ roving among `#qopts button.opt` verified
  index-by-index (0→1→2→1); digit key `1` clicks option 0 (confirmed via
  `#qmsg` text change); Escape closes the quiz and restores focus to the
  door-list button (still open blank) or to canvas (blank now solved,
  door-list button removed) — both paths tested and correct.
- **Camera keys**: ← rotates the camera (position changed via `orbitBy`);
  `Home` resets; in Part 5, `R`/`L` snap to right/left faces (`x` flips
  ±40, `z`→0) exactly as `setSeqView` should.
- **`prefers-reduced-motion`**: verified with Playwright's `reducedMotion:
  'reduce'` context —
  - wrong-answer shake: `getComputedStyle(btn).animationDuration === '0s'`
    (vs `0.42s`/`shake` with no preference) — CSS blanket works.
  - halo pulse: sampled opacity is a static `0.6` across two 600 ms-apart
    reads (vs oscillating without the preference) — doc 08 correctly
    self-checks.
  - camera glide (`flyTo`): with reduced motion, the very first
    post-`rAF` sample already shows the destination position; with no
    preference the same transition takes 2+ interpolated frames before
    landing — doc 02's `ms=0` short-circuit confirmed.
  - plate pop / confetti: code-reviewed (`popPlate` skips the scale
    animation and only runs the colour lerp when `REDUCED()`; `fireConfetti`
    returns early on `REDUCED()`) — consistent with the two motion checks
    above.
- **Target sizes**: `#viewbar button.vbtn` has `min-height:44px` (its owned
  line); `#jumpbar button.jbtn` is 40×40 with `.jbtns{gap:8px}`, matching the
  doc's own (not 44px) spec for that control; `button.opt` has
  `min-height:48px` per doc 05.
- **Focus-visible ring**: screenshot (`qa/07-focus-visible.png`) shows a clear
  amber ring + dark halo around the focused jump button "1".
- **Non-colour blank cue**: same screenshot shows the blank door as a dashed
  orange frame with a red "?" glyph — identifiable without colour.
- **Prompt announcement on building step**: `checkComplete` calls
  `setPrompt(PROMPTS.nameBuilding)` (title "All doors filled ✓") into the
  `aria-live="polite"` `#prompt`, before opening the building quiz.
- No console/page JS errors in any run (only the expected favicon 404).

## Findings

1. **MAJOR** — Tab order does not match the doc's own acceptance check.
   Expected (doc, "Acceptance checks"): *prompt (skipped) → jump buttons →
   canvas → door buttons → bottombar*. Observed (Playwright, stage 1,
   12-Tab walk from a page-top click): **canvas → door-list button → jump
   buttons (1–5) → helpbtn → `#back` → (browser chrome) → canvas …** — i.e.
   canvas and the door list are reached *before* the jump-to-part menu, the
   reverse of the intended order.
   Cause: `<div id="app">` (containing the canvas) is the first substantive
   child of `<body>` (before `#prompt`/`#jumpbar`/etc., per the file's
   existing structure — "nobody edits" `#app`'s position). Doc 07 gives the
   canvas `tabIndex = 0`, which makes it join the tab sequence at its DOM
   position, ahead of `#jumpbar`. This isn't caused by another doc's change
   colliding with doc 07 — it's inherent to the base layout — but it does
   mean the literal acceptance check fails on the merged page.
   Nothing is unreachable (jumpbar/back/canvas/doors are all still tabbable),
   so this is not a blocker, but a screen-reader user meets the 3D canvas and
   the door list before ever hearing the part-navigation menu exists.
   Proposed minimal fix (inside doc 07's own JS block, no other doc's lines
   touched): reorder the DOM once at init, e.g.
   `document.body.insertBefore(document.getElementById('jumpbar'), document.getElementById('app'));`
   (and optionally `#viewbar`/`#minimap` alongside it) — a pure DOM move, safe
   under fixed positioning, before `showStage(0)` runs.

2. **MINOR** — Not run: full Lighthouse/axe audits (no such tooling available
   in this sandbox). All of their major target categories (contrast, ARIA
   roles/names, focus order, live regions, target size) were checked
   manually/via Playwright above and passed except finding 1.

## Outside my doc
None observed — doc 05's auto-close/focus-containment (`ui.quiz.contains(document.activeElement)`),
doc 08's halo/hint, doc 02's `orbitBy`/`resetView`/`setSeqView`, and doc 10's
`stagechange`/`blanksolved` events all integrate with doc 07's code exactly as
the merge notes describe.
