# UX review: Stop Finder apartment course on phones

Hands-on in the Browser pane: Classic at 375×812 portrait (touch), 740×360 landscape (touch), 1280×720 desktop; Sunbelt at 375×812. Played Part 1 to the end (6 doors, one deliberate wrong pick), Part 2 building B, the Part 3/4/5 worked examples, the Appearance menu and the `?` button. Pixel values are CSS px. Where I say "today" I mean current behaviour; where I say "should" it is my recommendation.

## 1. First-run narration (portrait, Classic)

**Screen 1 — Part 1 worked example.** The eye lands on the brightest thing on screen: the amber **Home** pill at (8,636), 125×106 with Appearance under it. A first-timer reads that as "the main button" and wonders whether they are already in the course. Above it, a tiny red building (y≈345–455, 110 px, 14 % of the height) with yellow arrows and readable but small plates (≈30×12). Top block = prompt 93 px + jump bar 70 px = 187 px (23 %). Thought: "Five circles — are those levels I have to unlock? Do I tap the building? Why is it so far away?" On a true first run the drag hint also drops in at `top:46%` for 7 s, straight across the building it is describing. Hesitation: `Next ▸` is 320 px below the building and the same colour as the "1" badge; nothing on the building invites a tap, which is correct for an example, but nothing says so either.

**Screen 2 — Building 2 (quiz).** A "1 door left" chip appears at (271,191), a plate shows a red `?` with a soft halo. Thought: "Tap the `?`." The target is 30×12 px under a 44 px thumb; the halo (1.16×) rescues it. If they read the prompt first and hesitate 10 s, the inactivity tip ("Click a door marked ? — the glowing ones.") slides in at y≈373–420 — over the building's ground floor, hiding the thing it names. I saw this on every quiz building (the tip re-arms per stage).

**Screen 3 — the sheet.** Good moment: 2×2 grid, 24 px numerals, 56 px options, the question in one line. A wrong pick shakes red with a hint at the sheet's bottom edge (y=778); the right pick gives "✓ Correct — 112", a small green pop at the plate, and a confetti burst… at the top of the screen over the prompt and jump bar, while the learner is looking at the sheet. Then nothing: **the sheet stays open** (see P0-1), the chip says "Done ✓", the prompt still says "Click a door marked ?", and `Next ▸` is under the sheet. Thought: "Did it register? What now?" They find the `×` at (326,577) by elimination; only then does `◀ Back  Next ▸` appear.

## 2. The five asks

**Ask 1 — more compact on phones without losing ease of use. Agree, with a condition.** Compactness must come from removing redundant and stale chrome and from framing the building larger, not from smaller targets. Concretely: (a) the `#lookbar` stacked list (106 px) is the most expensive element on the portrait screen — the bottom chrome is lookbar 106 + gap 12 + bottom bar 46 = 164 px; fold Home and Appearance into one 44 px row (see ask 2) and the bottom chrome becomes ~58 px. (b) On quiz stages collapse `#prompt` to its title (ask 4) and `#jumpbar` to a progress strip (ask 3): the top block drops from 187 px to ~60 px. (c) In landscape use the `short` prompt variant too (today `setPrompt` tests `(max-width: 640px)` only, so a 740 px-wide phone gets the long body: 385×99 px = 27 % of the height). (d) Fix the framing (ask 5) so the content, not the chrome, fills the freed space. Do NOT: drop below 44 px targets, shrink the 24 px numerals or the 56 px options, hide `◀ Back / Next ▸`, or touch the worked-example layout.

**Ask 2 — hide Home/Appearance until something is tapped. Partly agree.** Hide the *labels and the second row*, never the anchor. Home leaves the course and Appearance reloads a different HTML file (as far as I can see, progress is not carried across — worth confirming), so both are rare, flow-breaking actions that deserve demotion during quizzes. Proposal: on worked-example stages show the bar as today; on the first `stagechange` to a `kind:'quiz'` stage animate it (250 ms) down into a single amber **⌂** 44×44 button (portrait bottom-left at y≈754 in the bottom row; landscape top-right). Tapping ⌂ opens the existing `.lk-menu` with two groups: "Home — back to the menu" and "Appearance: Classic · Sunbelt · Brick · Suburban". Tap-outside, Escape and focus-out close it (the inline script already does this). The learner learns it three ways: they *watch* the labelled bar collapse into the button on the first quiz building; the button keeps the house glyph and an `aria-label`; and every worked example re-expands it. No edge-swipes, long-presses or tap-the-sky reveals — nothing teaches those. Keep the amber colour but at 44 px it stops dominating the hierarchy.

**Ask 3 — progress bar and buttons show briefly when a part completes, stay in tutorials. Agree, reading it as `#jumpbar` (part buttons + `#progress`) only.** Do not include `#bottombar`: after a completion the `Next: Part 2 ▸` button is the only way forward and must stay put. Model: worked example — jump bar fully visible, static. Quiz stage — collapse to an 8 px progress strip (full width of the bar, 14 segments, same colours) with a small "Part 2 ▾" label at its left; tapping the strip or label expands the five buttons for 4 s (or until a tap elsewhere). Building completed — the strip ticks its segment green, no expansion. **Last building of a part completed** — expand the full bar for 4 s (start the dwell when the sheet closes, not when the answer lands, otherwise it happens under the sheet), the next part's button pulses once, then collapse. Course complete — the finale dialog owns the screen. Reduced motion: no animation, same states.

**Ask 4 — no course description once out of the tutorial. Partly agree.** Quiz bodies are instructions, not descriptions, and most are redundant with the chip, the halos and the wrong-answer hints — but a few introduce a *new interaction* and must survive at least once. Per part, what is still needed during quizzes: Part 1 — "Tap a door marked ?" on building 2 only (the first quiz ever); buildings 3–4 title-only. Part 2 — nothing; the title already says "floor digit first" and `explainWrong` teaches the rule on a miss. Part 3 — the partial-number idea and the roof-sign step are new: keep one line on building B ("Fill each partial number, then the roof sign"), and keep the `nameBuilding` prompt always — it announces a state change. Part 4 — "Drag to spin — the back has doors too" on building 19 (the hidden doors are invisible otherwise). Part 5 — title-only; the walk bar is self-labelled. Reachability when collapsed: a ▾ caret on the title (44 px tall hit area) toggles the body for 8 s; the `?` button re-shows the controls hint; and the body auto-expands on the second wrong answer (the rule text is appended then anyway). Always show the body on worked examples. Also fix the stale body after completion (P1-5).

**Ask 5 — Sunbelt Part 4 portrait camera. Confirmed.** After jumping to Part 4 at 375×812 the whole middle of the screen is a beige stucco wall with one window; the course block is a sliver at the far left (x≈70–120) behind a tree. `Next ▸`/`◀ Back` are there, the prompt says "Drag to spin", and dragging does not help because the camera is inside the neighbour. On Classic the same stage is not blocked but the block is ~130 px tall with 20×7 px five-digit plates — unreadable. "Well framed" on a phone should mean: the course building's tallest face fills 55–65 % of the *free* height (between the top chrome and the bottom chrome: y≈190–560 in portrait today, more after asks 1–4), the whole footprint is inside the safe rect with ≥24 px margin, a 5-digit plate is ≥22 px tall (numeral cap height ≥14 px), and the view ray from the camera to the building is clear of decor. Replace the single `PORTRAIT_BACKOFF = 1.55` (tuned for the Part 3 row) with a per-stage fit: project the stage group's bounding box and choose the distance so its width ≤ 0.9 × viewport width and its height ≤ 0.65 × free height (the 4-plex ends up near 1.0–1.1×, the row near 1.55×). Then a clearance pass: if the camera position or the ray intersects a decor mesh, raise the camera and shorten the distance until clear — and, since the neighbour at x=24, z≈63 is Sunbelt-only, keep Sunbelt decor out of a "camera corridor" behind each stage's pose. Optionally dolly toward the tapped plate on `quizopen` in portrait, as `houses.html` does with `frameHouse`.

## 3. Heuristic findings (hands-on)

- **P0-1 The sheet never auto-closes after a correct tap, and `Next ▸` is under it.** `armAutoClose` (1100 ms) aborts when `#quiz:hover` is true; after a tap the hover state sticks to the sheet, so it never closes (observed at 2.6 s and later: `quizHidden:false`, `nextHidden:false`, `#bottombar` at y=754 under the z-index-30 sheet). Real Android/iOS browsers keep sticky hover after a tap too. Fix: only honour `:hover` when `matchMedia('(hover: hover)').matches`; and on portrait, when `stagecomplete` fires, put a `Next ▸` button in the sheet's footer (or close the sheet and let the bottom bar show).
- **P0-2 Sunbelt Part 4 portrait camera inside decor** (ask 5).
- **P1-1 Landscape: wrong-answer hint is off-screen.** The column is 236×344 at (496,8); four 54 px options plus the heading push `#qmsg` to y=367 while the column's visible bottom is y=352 (`scrollHeight` 413 vs `clientHeight` 342, no scroll cue). The learner sees the option turn red and no reason. Fix: in the landscape query make `#qmsg` a sticky footer, or move it under the heading, or trim the heading's subline and option height to 48 px there.
- **P1-2 Buildings too small in portrait** (Part 1 110 px, Part 4 125 px, plates 20–30 px wide). Fix: per-stage framing (ask 5).
- **P1-3 Hints cover the content.** `#draghint` at `top:46%` (y≈373–440) sits on the plates in every part; the inactivity tip fires on each quiz building after 10 s idle; the `?` hint uses mouse words. Fix: anchor the hint just above the bottom chrome (`bottom: 70px` portrait; `top` under the prompt in landscape), fire the tip once per session, and on `(pointer: coarse)` say "Drag to look round · Pinch to zoom · Tap a glowing ? door".
- **P1-4 Reward is out of the gaze path.** Building and part confetti burst at the top of the screen over the prompt and jump bar; the learner is looking at the sheet or the plate. Fix: emit from the solved plate's screen position (already computed for `popPlate`) or from the top edge of the sheet; keep the part-complete cannons.
- **P1-5 Stale prompt after completion.** With "Done ✓" in the chip and `Next: Part 2 ▸` below, `#prompt` still reads "Click a door marked ?, then pick…". Fix: on `stagecomplete` set the title to "Building 2 ✓" and drop the body (or "Next ▸ when you're ready").
- **P2-1 Landscape prompt uses the long body** (27 % of the height). Fix: choose `short` under `(max-height: 520px) and (orientation: landscape)` too.
- **P2-2 Part 5 portrait: the lower 45 % is chrome.** Walk bar (y 570–620) + minimap (283–367 × 495–645, with a note that needs 88 px) + lookbar (636–742) + bottom bar (754–800). With the lookbar collapsed to ⌂ the walk bar can drop to `bottom: 70px` and the minimap to `bottom: 130px`.
- **P2-3 Landscape Part 5: the minimap (`right: 252px`, x≈400–488, y 8–150) overlaps the building's roof.** Fix: dock it top-right under the ⌂ button when the column is closed.
- **P2-4 Appearance menu opens upward across the building and the walk bar** (y≈435–620). Acceptable as a menu; fine once it lives under ⌂. Confirm before switching if progress is lost.
- **P2-5 Confetti persists across a jump** (pieces still falling in Part 3 after Building B). Cosmetic; clear on `stagechange`.
- **P2-6 The `?` button floats in the sky at (323,241)** and reads as "hint about this building"; in landscape it is `display:none` with no replacement. Fix: put it at the right end of the collapsed jump-bar row in both phone layouts.
- **P2-7 Legibility of the plates** is fine on Sunbelt Part 1 (≈28×12) and Part 3 Classic (24×10) but not on towers/blocks; the halo, not the `?`, carries the tap target. Consider a 1.3× halo on `(pointer: coarse)`.

## 4. Chrome model (recommended)

V = visible · C = collapsed · H = hidden · T = revealed on tap. Motion 250 ms ease-out, none under reduced motion.

**Portrait phone (≤640 px)**

| element | worked example | quiz idle | sheet open | building done | last building of part done | course complete |
|---|---|---|---|---|---|---|
| #prompt title | V | V | V | V "Building n ✓" | V "Part n ✓" | H (finale) |
| #prompt body | V | C → T (▾ on title, 8 s); auto V on 1st quiz of a part & 2nd wrong | H | H | H | H |
| #jumpbar + #progress | V | C 8 px strip → T (tap strip, 4 s) | C strip | C, segment ticks | V 4 s after sheet closes, then C | H |
| #doorsleft | H | V | H | V "Done ✓" 2 s → H | same | H |
| #helpbtn | V | V (end of strip row) | H | V | V | H |
| #lookbar Home | V labelled | C → ⌂ 44 px | H (under sheet) | C ⌂ | C ⌂ | H |
| #lookbar Appearance | V | T (inside ⌂ menu) | H | T | T | H |
| #bottombar Back | V (from stage 2) | V | H | V | V | H |
| #bottombar Next | V | H | V in sheet footer once done | V | V "Next: Part n ▸" | finale buttons |
| #resetview | T after a far drag | T | H | T | T | H |
| #viewbar (P5) | V | V | H | V | V | H |
| #minimap (P5) | V | V | H | V | V | H |
| #draghint | first run 7 s, bottom-anchored | tip once per session at 10 s idle | H | H | H | H |

**Landscape phone (≤520 px tall)** — same states with these placements: prompt uses `short`; #lookbar collapses to ⌂ top-right; #jumpbar strip bottom-left with "Part n ▾"; #helpbtn shown at the right end of the strip (not `display:none`); #viewbar bottom-centre; #minimap top-right under ⌂ (never over the roof); #quiz column keeps `#qmsg` sticky above the fold; Next in the column footer once the building is done.

**Desktop (>1024 px)** — room is not the constraint: keep every element V in every state as today; adopt only the stale-prompt fix, the auto-close fix, the confetti origin and (optionally) Next in the panel footer. Recovery gestures everywhere: tap ▾ on the title for the body; tap the strip for the part buttons; tap ⌂ for Home/Appearance; `?` for the controls hint; `×`/Escape closes the sheet; Home key / `#resetview` resets the camera.

## 5. What NOT to do (my three vetoes)

1. **Do not auto-hide or tap-to-reveal `◀ Back / Next ▸`.** It is the only flow control; I already watched the course dead-end when the sheet covered it. Timed hiding turns every completion into a hunt.
2. **Do not hide Home/Appearance behind an invisible gesture** (edge swipe, long-press, tap-the-sky) or remove them entirely on quiz stages. A visible 44 px anchor with a house glyph, or nothing.
3. **Do not buy "compact" with smaller targets or smaller content** — no 40 px buttons, no 13 px body copy, no further camera back-off, and no collapsing chrome on the worked examples. The 44 px floor, the 56 px options and the 24 px numerals are the parts that already work.

## 6. Copy notes

1. `p1quiz` body → on touch "Tap a door marked ? and pick the number that continues the count." (building 2 only); buildings 3–4 title-only.
2. Completion state: title "Building 2 ✓", body none or "Next ▸ when you're ready" — replace the stale "Click a door marked ?".
3. `p3quiz.short` → "Tap a partial number (71▢5), pick the full one — then the roof sign." Keep `nameBuilding` always: "All doors filled ✓ — now tap the roof sign to name the building."
4. `HINT_FULL` on `(pointer: coarse)`: "Drag to look round · Pinch to zoom · Tap a glowing ? door to answer."
5. `p2quiz` title "Building B · Easy — floor digit first" reads as two ideas; prefer "Building B · Floor digit first (easy)".

— Hollis Grant, Senior UX Designer & Researcher
