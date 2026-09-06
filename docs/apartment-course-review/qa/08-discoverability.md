# QA — Doc 08: Discoverability and affordance in the 3D scene

**Verdict: PASS**

## Passed checks
- Halo behind every unsolved plate: confirmed on stages 0 (0 halos, example), 1 (1 halo, Part 1), 8 (4 halos, Part 3). Halo opacity samples 400 ms apart differ and stay within [0.35, 0.65] — genuine ~0.9 Hz pulse, not static. Zoomed crop (`qa/shots-08/zoom-questionplate-shots-merged.png`, cropped from `shots-merged/01-part1-quiz.png`) shows the yellow halo rim sitting cleanly *behind* doc 03's white plate + red dashed blank frame + "?" glyph — the two features layer correctly with no visual collision.
- Building banner gets a halo once all doors are solved: stage 8 chip sequence was exactly `4 doors left → 3 → 2 → 1 → Name the building → Done ✓` (probe on `groups[i].userData`, see `qa/shots-08/probe-stage8-done.png`).
- Halo removed on solve, doc 10's dot unaffected: after solving stage 1's door, `bs.halo` is null and `bs.plate.userData.solvedDot` is present — halo (z=-0.006) and dot (z=0.004) coexist as designed.
- Cursor + hover tint: default `grab` over empty canvas; hovering an unsolved plate gives `pointer` cursor, fill `#fff1c2`, scale `1.06`; leaving resets to `#ffffff`/`1`. Dragging gives `grabbing`.
- Click precision, Part 5 stacked doors (stage 13): grid-scanned `pickBlank()` across the canvas, found a vertically stacked column of 3 doors (values 1245/1241/1237); the screen-space midpoint between two different doors' hit regions returned `null` (opens nothing), matching the acceptance check.
- "N doors left" chip: text and pluralisation correct at each count, `Name the building` when doors are done but the banner isn't, `Done ✓` with `.done` (green) class at the end. Hidden (`class="hidden"`) on example stages.
- First-run drag hint: shows on first stage load, hides on a >20 px pointer drag, sets `localStorage['sf.hintSeen']='1'`. A fresh page load in the same origin (simulated reload) does **not** show it again. `#helpbtn` click restores the full hint, which auto-hides after ~6 s.
- 10 s idle tip: absent before 10 s on a fresh quiz stage, appears at ~10.2 s with the exact "Click a door marked **?** — the glowing ones." copy, once per stage (`tipUsed` latch).
- Reduced motion: with `prefers-reduced-motion: reduce`, halo opacity sampled twice 500 ms apart was `0.6` both times (steady, no pulse).
- Mobile viewport (`shots-merged/mobile-part1-quiz.png`): doc 06 correctly relocates `#doorsleft` below the jump bar and keeps `#helpbtn` bottom-right; halo still visible at this size.
- No console/page errors from any probe except the expected favicon 404.

## Findings
None — every acceptance check in the design doc reproduced correctly on the merged file. No BLOCKER/MAJOR/MINOR issues found in this doc's scope.

## Outside my doc
None observed.

## Method
`BASE/verify.sh` full-page screenshot pass (14 stages, quiz-open, Part 5 views, mobile) plus four targeted Playwright probes against a copy of `apartment-mockup.html` with vendored Three.js (port 9156), driving `showStage`/`openQuiz`/`chooseOption` via a small `window.__*` hook block appended before the final `</script>` (probe copy only, not the repo file). Covered: hover/cursor/tint, drag-to-grabbing, halo pulse + reduced-motion opacity, chip text across a full building solve, stacked-door click precision, first-run hint lifecycle across a simulated reload, `?` button, and the 10 s idle tip.
