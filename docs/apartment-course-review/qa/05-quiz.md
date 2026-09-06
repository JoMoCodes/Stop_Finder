# QA — Doc 05: Quiz panel (option formatting, feedback, timing, close control)

**Verdict: PASS**

Verified on the merged `apartment-mockup.html` via screenshots
(`shots-merged/05-*`, `08-*`, `13-*`) and a Playwright probe against a local
copy served with the vendored Three.js (port 9135; see
`qa/probe-05.mjs` + `qa/debug{1..9}.mjs`, raw output in `qa/probe-05.out.json`).

## Passed checks
- **DOM/CSS**: `#quiz` still has `#qclose`, `#qhead`+`<small>`, `#qkey`,
  `#qopts`, `#qmsg`, exactly as specified; width 248px; `button.opt` uses
  `tabular-nums`, `line-height:1.5`, min-height 48px.
- **Per-digit-place colour, all 5 parts** (screenshots + probe): Part 2
  tower options (`122/222/…`) — first digit blue, rest white, `#qkey` shows
  `floor · door`. Part 3 row options (`7103` family) — building coral, floor
  blue, door white; the building-name question (`7/1/71/17`) is all-coral.
  Part 4 block options — building/floor/door coloured correctly. Part 5 seq
  options — building coral + door white, no floor place, `#qkey` shows
  `building · door` (no "floor" chip, correctly omitted for `seq`).
- **Wrong-answer explanations** match the doc's table exactly, confirmed by
  probe: plex → `Count on from the door next to it.`; row/block floor-wrong →
  `Right building, wrong floor.`; second wrong pick on the same blank appends
  the part rule (`Leading digits = building.` for Part 3).
- **Correct feedback**: `✓ Correct — ${val}` shown; plate updated via
  `setPlateText` before `checkComplete(bstate)` is called with the real
  bstate (confirmed indirectly: `blanksolved` only fires when `bstate` is
  truthy, and it fired correctly).
- **Auto-close timing**: with the pointer genuinely off the panel (verified
  via synthetic dispatch to avoid Playwright's real-cursor `.click()`, which
  otherwise skews timing — see below), the panel closes at ~1.1–1.3s, not
  early. With the pointer parked over the panel, it stays open past 1.1s,
  and staying open **is not re-armed** after moving away — matches "never
  taken from someone still reading."
- **`#qclose`** closes the panel; **`quizopen`/`quizclose`** events fire
  correctly (with `bstate` in the `quizopen` detail).
- **Focus**: opening the quiz moves focus to the first `.opt` (doc 07's
  behaviour, confirmed still working post-merge); Escape closes the panel
  and returns focus to the canvas.
- **Reduced motion**: `prefers-reduced-motion` correctly zeroes the shake
  animation (`animationDuration: 0s`) while the `.wrong` red state still
  applies — doc 07's guard is intact and doesn't fight doc 05's animation.
- **Mobile (390px)**: bottom-sheet `#quiz` spans full width from y≈606 to
  the viewport bottom; `#qopts` is a 2-column grid (`173px 173px`); all four
  options measure 58px tall (≥56px per doc 06); `#qclose` is 44×44 with a
  5px margin from the right edge — reachable.
- Base `#qopts{display:flex;flex-direction:column}` is untouched outside the
  media query, so doc 06's grid override stays clean (no specificity fight).

## Findings
None rated MAJOR or BLOCKER. One MINOR, environment-only:

1. **MINOR — test artifact, not a product bug.** A first pass measuring
   auto-close with Playwright's `elementHandle.click()` looked like it never
   closed within 1.4s. Root cause: under headless swiftshader rendering,
   `.click()`'s actionability wait itself took 5-6.5s before the click even
   registered (confirmed with `performance.now()` timestamps in
   `debug5.mjs`/`debug8.mjs`), so the fixed post-click waits undershot. A
   synthetic `dispatchEvent(new MouseEvent('click', {detail:1}))` (no real
   cursor motion) shows the true timer firing at ~1.1–1.3s as designed
   (`debug7.mjs`). No code change needed; noting this so nobody miscredits a
   future flaky timing test in this environment as a real regression.

## Outside my doc
None observed — no interaction from the other nine docs disturbed doc 05's
DOM, CSS region, or function bodies.
