# QA — Doc 02: Camera framing, transitions, orbit limits, Reset view

**Verdict: PASS**

Verified against `/home/user/Stop_Finder/apartment-mockup.html` (merged) via a
local vendored-Three.js server (`verify2.sh` + `shoot2.mjs`, port 9114) and
direct source inspection. No console/page errors other than the expected
favicon 404.

## Passed checks
- **Orbit limits** (lines 494–502): `enablePan:false`, `minDistance:8`,
  `maxDistance:95`, `minPolarAngle:0.18`, `maxPolarAngle:π*0.49`,
  `touches:{ONE:ROTATE,TWO:DOLLY_ROTATE}` — matches spec exactly, and probe
  confirms via `controls.*` read-out.
- **Eased transitions**: `flyTo()` (line 1677) is a cubic ease-out on its own
  rAF loop, `controls.enabled=false` mid-flight, cancels an in-flight move,
  and forces `ms=0` under `prefers-reduced-motion`. `MOVE_MS=350`,
  `RESET_MS=450`, `INTRO_MS=1400` all match spec.
- **`poseFor`/`POSES` table**: five stage types with the spec's exact
  pos/tgt triples; portrait (`aspect<1`) backs the camera off
  (`PORTRAIT_BACKOFF=1.55`, tuned/commented for the 390×844 Part-3 row) and
  `applyViewportFov` widens the FOV up to 74° only on that axis, leaving
  desktop FOV (50°) untouched.
- **Reset view chip**: appears on drift (`distanceTo(pose.pos)>4` or
  `target` drift `>1.5`), stays hidden during `flying`/`introRunning`, and
  hides again after `resetView()`'s 450 ms glide. Probe: `chip visible after
  drag: true`, `chip hidden after reset: true`. Screenshots
  `qa/shots-02/x-dragged-chip.png` / `x-after-reset.png` confirm visually.
- **Intro swing**: on the very first `frameStage`, camera starts rotated
  `INTRO_SWING_DEG=-18°` about the target, holds 300 ms, then eases to the
  resting pose over 1400 ms; reset chip never flashes mid-swing (probe:
  `chip hidden mid-swing/after-intro: true`). Under reduced motion it snaps
  straight to the final pose with no swing —
  `qa/shots-02/x-reduced-motion-load.png` matches the settled desktop pose.
  (Exact wall-clock timing of the 1.4 s swing could not be pinned down
  precisely in this sandbox — the swiftshader software renderer here only
  delivers ~2 rAF frames/sec under this scene's load, so intermediate
  samples are sparse — but the code is time-based off `performance.now()`,
  not frame-count-based, so real browsers will run the true 300+1400 ms
  timeline; behavior at the two testable endpoints — start position and end
  position — is correct.)
- **Part 5 walk-around**: `setSeqView` glides 350 ms; pressed button gets
  `.vbtn.active` (green `#57c97e`, inserted right after `button.ghost:hover`
  as owned); dragging or changing stage clears it (`markSeqViewButton(null)`
  wired to `controls` `'start'` and inside `frameStage`). Probe confirms all
  three clear conditions.
- **Portrait/landscape framing**: 390×844 Part 3 row shows all five ground
  doors + stair with visible margin (`x-mobile-part3.png`); Part 5 overview
  fits the whole building (`x-mobile-part5.png`). 844×390 landscape keeps
  desktop-style framing since `aspect>1` (`x-landscape-part3.png`).
- **Doc 07 keyboard integration**: `a11yOrbit` (line 2647) guard-calls
  `orbitBy` when present; doc 02's `orbitBy`/`resetView`/`setSeqView` are
  hoisted function declarations as required. Probe: `orbitBy(-15,0)` moved
  `getAzimuthalAngle()` by `-15.15°` (rounding-consistent with -15° plus the
  drag-induced offset already on the camera).
- **Doc 09 mini-map integration**: `mmSync` reads
  `controls.getAzimuthalAngle()` on `controls` `'change'`; `tick()` still
  calls `controls.update()` every frame (line 2745), so the mini-map keeps
  updating through `flyTo` moves and manual drags alike.

## Findings
None rated MAJOR/BLOCKER. One MINOR observation:

1. **MINOR** — In the short-landscape phone media query (`max-height:520px
   and (orientation:landscape)`, line 264), doc 06 fully hides `#resetview`
   (`#helpbtn, #resetview { display:none; }`, line 287) rather than only
   repositioning it as the merge notes describe for the portrait case. This
   isn't one of doc 02's acceptance checks (those only require framing
   parity in the 844×390 test, not chip visibility) and is a reasonable
   space trade-off on very short screens, but it means a learner who drifts
   the camera on a short landscape phone has no way back except reloading.
   Fix (owned by doc 06, not this doc): swap `display:none` for the same
   compact treatment used in the portrait block (icon-only, repositioned)
   rather than removing it.

## Outside my doc
None observed.
