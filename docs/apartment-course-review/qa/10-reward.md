# QA — Doc 10: Reward, progress and flow

**Verdict: PASS**

Verified on the merged `apartment-mockup.html` with a Playwright probe that
drives the real UI end to end: `showStage`/button clicks for flow, real
`.opt` button clicks (via `openQuiz`) to solve every blank in all 14 stages
(52+ solves), twice — once with default motion, once with
`reducedMotion:'reduce'` emulated — plus three focused follow-up probes for
plate-scale tracing, progress-bar mid-stage state, and finale timing.

## Passed checks
- Per-answer reward: every solved blank gets a green `solvedDot` mesh
  (confirmed on all 52 solves, both runs) and a mini burst — synchronous
  measurement of `confetti.length` around the click shows exactly **+14**
  particles on a non-completing blank, **+184** (14+170) when that answer
  finishes the building, and **+254** (14+240) on the very last building
  (cannons). Matches the design's numbers exactly.
- `popPlate`'s scale animation does run and settle: direct instrumentation
  (`window.__popPlate` called in isolation, per-frame logging) shows the
  scale bumps above 1 (e.g. 1.05–1.18) mid-animation and returns cleanly to
  `1,1,1` at the end — see "Findings" #1 for a harness-only caveat.
- Progress bar: 14 `.seg` spans, correct `.part` gap classes at indices
  4/7/10/12 (part boundaries), `.done`/`.now` toggle correctly — verified
  mid-stage (stage 2 with only its first of two blanks solved: segs
  0,1 = done, seg 2 = now, matching the doc's "first two green, third
  amber" example) and after full traversal (`doneSegs` grows 1→9 across
  the run, `nowSeg` clears once a stage completes).
- Jump-bar caption: `Part N · Building i of 14` on every one of the 14
  stages in both runs, exact string match.
- Button vocabulary: stage 3 → `Next: Part 2 ▸`, stage 5 → `Next ▸`,
  stage 13 → `Start over ▸`; every example stage's `#continue` reads
  `Next ▸`. All exact matches.
- Finale: two-cannon burst confirmed (254-particle delta above), dialog
  shown ~900 ms after the last confetti under normal motion (not yet
  visible at ~100 ms, visible by ~800 ms) and **instantly** under
  `prefers-reduced-motion: reduce` (already visible at ~100 ms). Escape
  closes it in both modes.
- Reduced motion: confirmed `REDUCED()` reports true, mini-burst delta is
  exactly 0 on every solve, plate scale never leaves 1 (tint-only), dot and
  progress bar still update, finale still appears (instantly).
- Start over: `completed`/`celebrated` sets empty, `currentIndex` back to
  0, progress bar fully cleared (`segsDone:0`), `#finale` hidden — in both
  motion modes.
- Revisit: after finishing stages 1–2 and pressing Back, stage 2 shows
  both solved dots, `#next` visible reading `Next ▸`, and `celebrated`
  unchanged (`[1,2]`) — no confetti re-fired on a revisit.
- Events: `stagechange` fired once per `showStage` call (14/14),
  `blanksolved` fired on every solve including both building-name steps
  (part 3), with docs 07/08/09's listeners (`a11ySync`, the doc-08
  halo/chip `reconcile`, doc-09's `mmSync`) all running without throwing.
- No JS errors in either full run except the expected favicon 404.

## Findings
1. **MINOR — pop animation is easy to miss under the QA harness's software
   renderer, not a real bug.** `popPlate` (line ~2043) nests its rAF loop as
   `(function step(t){...})(performance.now())` inside an outer
   `requestAnimationFrame`, so each frame's `e` (elapsed ms) depends on real
   frame pacing. Under `--use-gl=swiftshader` here, frames land ~150–180 ms
   apart (console shows repeated "GPU stall due to ReadPixels"), so the
   320 ms pop only gets ~2 visible frames before the `e < 500` cutoff ends
   it and snaps scale back to 1 — a naive single-sample probe at a fixed
   delay (e.g. 80 ms) will almost always land exactly on `scale.x === 1`
   even though the animation did run. Confirmed via frame-by-frame logging
   that `step()` does fire and does produce `scale.x` values like 1.05/1.18
   before settling. On a real hardware-accelerated browser (~60 fps) this
   renders as a smooth pop; no code change needed, but worth knowing if
   another agent's screenshot-diff probe flags "no visible pop" — it's a
   sampling artifact of this sandbox's renderer, not the feature.
2. **MINOR — my own probe's naive before/after confetti-length check
   around the async building-name-step click (separate `evaluate` calls
   with a 500 ms gap) undercounts because old particles decay during the
   gap.** Not a defect in the page; the per-blank synchronous measurement
   (which isn't affected by decay) already proves the burst math is
   correct for every blank, including building-name steps (same code
   path). No fix needed.

No BLOCKER or MAJOR findings against this doc's acceptance checks.

## Outside my doc
- None observed; doc 05/07/08/09 integration points (quiz options,
  `aria-*`, halo/chip, mini-map/place colours) all behaved correctly while
  driving doc 10's flow and did not throw.
