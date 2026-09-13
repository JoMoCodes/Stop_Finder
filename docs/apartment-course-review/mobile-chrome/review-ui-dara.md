# Apartment course on phones — UI engineering review

Reviewer: Dara Okonkwo-Lind, senior UI engineer. Read-only review from the code and BASELINE.md; no browser.

## Where the numbers stand today (375×812, quiz stage, idle)
Top chrome ends at y=187 (`#prompt` 93 px + `#jumpbar` 70 px + gaps), with the `#doorsleft` chip and `#helpbtn` stacked to 285 on the right; bottom chrome starts at y=636 (`#lookbar` 106 px, `#bottombar` 46 px). 363 px of 812 (45%) is frame; the building gets 110 px (14%). Landscape is better, but the prompt still eats 99 px (26%) because the `short` copy only applies at ≤640 px wide. The 44 px targets and 15–16 px type are right and are not what we shrink; the waste is text nobody needs at that moment, two boxes where one would do, and a camera parked 1.55× too far away. Target: quiz stages idle ≤ 150 px of chrome (18%), free band ≥ 650 px, building ≥ 170 px tall, plates ≥ 45 px wide.

## 1. The five asks

**Ask 1 (more compact, still easy) — agree.** Three moves, none touching a tap target: prompt to its title on quiz stages (ask 4), jump bar to a progress strip on quiz stages (ask 3), Home + Appearance to one 44 px button (ask 2). Do NOT: go below 44×44 on any control, below 15 px portrait / 13 px landscape on copy, shrink the 2×2 option grid (56 px rows, 24 px numerals are correct), lower the sheet's 60vh cap, auto-hide the bottom bar, or hide anything without an always-visible way back.

**Ask 2 (hide Home / Appearance until tapped) — partly.** Collapse, don't hide: an invisible trigger fails the "how do I get out" test for a driver in a hurry. On phones `#lookbar` becomes one 44×44 ghost round button "⋯" (`aria-label="Home and appearance"`, `aria-haspopup`, `aria-expanded`); tapping it shows the existing two-row list (amber Home first, then Appearance ▾ dropping the four looks — two taps to switch look is fine, it is rare). Portrait: `left:8px; bottom:12px`, on the Back/Next row (the pill is centred at ≈ x 100…276 at 375 wide; at 320 wide tighten `#bottombar button` padding to `12px 14px`). Landscape: top-right 8,8 as now. Desktop: unchanged. Apply from stage 0 — a rule per layout, not per stage, so the button is learnt on the tutorial screen. The inline script only needs the new button wired to `setOpen`.

**Ask 3 (progress + buttons show briefly, then go) — agree for `#jumpbar` only, not `#bottombar`.** `Next ▸` is the only way forward after a building, and an auto-hiding primary action is the pattern people cannot find; `Back` is the undo path; and at 46 px the bottom bar is not what costs the screen — the 70 px jump bar and 106 px lookbar are. Recommended reading: on quiz stages, phones, `#jumpbar` collapses to a strip (label "Part 2 · 5/14", the 14-segment `#progress` bar, a caret), 28 px tall with a 44 px hit area; it expands to the five part buttons for a timed window on `stagecomplete` (2.5 s per building, 3 s when the completed stage is the last of its part) and on tap. Worked examples keep the full jump bar. I would peek on every building: the segment turning green is the feedback and it costs nothing; strictly per part is a one-line condition on `STAGES[i+1].part !== STAGES[i].part`.

**Ask 4 (no description after the tutorial) — agree, with two exceptions.** On quiz stages the body is an instruction, not a description; on phones show the title only, except: (a) the run's first quiz stage (index 1) keeps its body until the run's first `quizopen` — first-timers need "click a door marked ?"; (b) tapping the title expands it (a small aria-hidden caret marks it). The `nameBuilding` step is covered by the sheet's own header, which opens at once. Desktop: keep the body; it costs 40 px of 720 above the roofline and solves no problem. Two copy bugs to fix alongside: `setPrompt` picks `short` only at ≤640 px, so landscape phones get the long body — widen the test to the phone media query; and it runs at stage start only, so re-run `setPrompt(promptFor(currentStage))` on `resize`.

**Ask 5 (Sunbelt Part 4 portrait) — agree; the bug is the framing rule, the neighbour is the symptom.** One back-off (1.55, tuned for the 24-wide row) is applied to every type, so the block camera sits 67 units out, inside `neighbour(F, 24, HALF_D+58, 22, 10, 3)` (x 13…35, z 57.5…67.5, 9.6 tall). The desktop pose ray hits the same box at distance ≈ 59, within `controls.maxDistance = 95`, so scrolling out on Part 4 enters it on desktop too. Proposed framing, per type in `poseFor`:

- Keep the pose direction (`pos − tgt` normalised) and `applyViewportFov` (vfov 73.6° at 375×812 → hfov 38.1°).
- Distance `d = max(w / (2·FILL_W·tan(hfov/2)), h / (2·FILL_H·bandFrac·tan(vfov/2)), minDistance + 2)`, capped at today's 1.55× so nothing gets worse. `FILL_W = 0.84`, `FILL_H = 0.9`. `bandFrac` = free band height / `innerHeight`, where the band is a `safeRect()` like Houses': below `#prompt` (+ the strip), above the quiz sheet when open, otherwise above `#viewbar`/`#bottombar`.
- Extents table (shared constants, apparent width from the pose azimuth): plex 14×7.5 · tower 18×14.5 · row 24×8.5 · block 17.9×14.5 · seq 23.5×11 (front view 12 wide, side views 22). Resulting portrait distances at 375×812: plex 24 (was 39.5), tower 30 (60), row 40 (50), block 30 (67), seq 40 (71). Width binds on every type in portrait; the band only decides vertical placement. Block plates go from ≈20 px to ≈45 px wide, plex from 30 to 50.
- Vertical placement: `camera.setViewOffset(W, H, 0, round(H/2 − (band.top + band.bottom)/2), W, H)` on phone layouts, `clearViewOffset()` elsewhere. It shifts the picture, not the orbit pivot, so drags still orbit the building and `driftedFromPose` does not flicker. Re-apply on `resize`, `quizopen`, `quizclose` (a 250 ms tween of one number; a cut under reduced motion). With the sheet open the picture rises ≈95 px, keeping ground-floor plates above it.
- Landscape: the desktop distance is already the larger one, so only the band centring applies.
- Sunbelt fallback, two layers: move that neighbour to `x = 42` (box x 31…53; every pose ray misses it) in `apartment-realistic-a.html`; and, shared, a `DECOR_BOXES` list of `Box3` pushed by the looks' neighbour builders, used by `stageMaxDistance(st)` on `stagechange` to set `controls.maxDistance = firstHitAlongPoseRay − 3` and to clamp `d`. Classic pushes nothing.

## 2. Change list

**P0**
1. Per-type portrait framing + view offset + decor guard (above). 375×812: plex ≈ 315×170 px centred in the band; block ≈ 300×255 px. 740×360: unchanged distance, building centred between prompt and strip.
2. Quiz-stage prompt = title only (phones). 375: `#prompt` 8…50 (42 px). 740×360: 8…44.
3. Jump bar strip on quiz stages (phones). 375: `top: calc(var(--prompt-h) + 8px)`, `left:8px; right:112px`, 28 px; `#doorsleft` on the same row at `right:8px`, restyled `padding:5px 12px; font-size:13px` (28 px). Top chrome ends at ≈94 px. 740×360: strip bottom-left 8,324, 246×28; chip under the prompt as now.
4. `#lookbar` → ⋯ button (above). Bottom row at 375: [⋯ 8…52] [Back Next centred] [? 323…367], all 44 px; `#helpbtn` moves down to `right:8px; bottom:12px`; `#resetview` to `bottom:64px`; `#minimap` to `bottom:116px`; `#viewbar` row to `bottom:64px`.
5. Move the Sunbelt neighbour.

**P1**
6. `body.quiz-open` on phones, Houses-style: strip, `#helpbtn`, `#draghint`, `#resetview` hidden; `#doorsleft` visually hidden only (it is a live region — see §4); prompt title-only even on examples.
7. Timed peek of the part buttons on `stagecomplete` (§1, ask 3).
8. `short` copy in landscape + re-render on resize.

**P2**
9. On `quizopen` in portrait, if the tapped plate projects below 40 px wide, dolly 1.4× toward it (Houses' `MIN_PLATE_PX` idea) — optional; it adds a camera move per tap.

## 3. Chrome model
Cell = portrait / landscape / desktop. V visible · C collapsed to a compact form (tap expands) · T hidden, revealed on tap · R revealed for a timed window, then C · H hidden · S under the sheet/column (comes back on close) · D appears only after camera drift · B behind the finale dialog.

| Element | Worked example | Quiz idle | Sheet open | Building done | Last of part done | Course complete |
|---|---|---|---|---|---|---|
| #prompt title | V/V/V | V/V/V | V/V/V | V/V/V | V/V/V | B/B/B |
| #prompt body | V/V/V | T/T/V (V on run's first quiz until 1st quizopen) | H/H/V | T/T/V | T/T/V | B |
| #jumpbar buttons | V/V/V | T/T/V | H/H/V | R 2.5 s/R/V | R 3 s/R/V | B |
| #progress | V/V/V | V/V/V (in the strip) | H/H/V | V/V/V | V/V/V | B |
| #doorsleft | H/H/H | V/V/V | S*/S*/V | V "Done ✓" | V | B |
| #helpbtn | V/H/V | V/H/V | H/H/V | V/H/V | V/H/V | B |
| #lookbar Home | T/T/V | T/T/V | S/S/V | T/T/V | T/T/V | B |
| #lookbar Appearance | T/T/V | T/T/V | S/S/V | T/T/V | T/T/V | B |
| #bottombar Back | V/V/V (from stage 1) | V/V/V | S/V/V | V/V/V | V/V/V | B |
| #bottombar Next | V/V/V | H/H/H | H/H/H | V/V/V | V "Next: Part N" | B, then "Start over" |
| #resetview | D/D/D | D/D/D | H/H/D | D/D/D | D/D/D | B |
| #viewbar (Part 5) | V/V/V | V/V/V | S/V/V | V/V/V | V/V/V | B |
| #minimap (Part 5) | V/V/V | V/V/V | S/V/V | V/V/V | V/V/V | B |
| #draghint | R 7 s first run | R 5 s after 10 s idle | H/H/H | H | H | B |

\* visually hidden, still a live region. Timing: the peek starts on `stagecomplete`; if the sheet is open then (it is, for the last correct answer) restart it on the following `quizclose` so 2.5 s is actually seen; `stagechange` does not cancel it — the new stage's strip shows the buttons for the remainder, which is when "Next: Part 2" lights the next part. Manual expansions reset on `stagechange`. Getting things back: prompt body — tap the title; part buttons — tap the strip or wait for the next completion; Home/Appearance — the ⋯ button; anything under the sheet — ×, Escape or answering; the drag hint — `?`; the reset chip appears by itself. No swipes, no gestures, nothing findable only by accident.

## 4. Risks and accessibility
- Targets: every trigger stays ≥ 44 px on `pointer: coarse` — the strip gets its hit area from a `::after { inset:-8px 0 }` so it can look 28 px; the ⋯, `?`, reset, `#qclose` are 44 px.
- Toggles are real `<button>`s with `aria-expanded` + `aria-controls` (`#jbtoggle` → `#jbtns`, `.lk-menubtn` → `#lk-menu`). Never move focus on expand/collapse; skip an auto-collapse while the element `contains(document.activeElement)`.
- `#prompt` is `aria-live="polite" aria-atomic="true"`: toggling `display` inside it can re-announce the whole banner. Collapse the body with `.sr-only` rules instead — visually gone, still read by screen readers, no announcement. Same for `#doorsleft` during `quiz-open`, otherwise "1 door left" after a solve is lost (Houses' `display:none` has that defect).
- `.jbtns { display:none }` drops five buttons from the tab order; intended — the toggle stands in for them.
- `prefers-reduced-motion`: the global rule already zeroes transitions; the peek is timed, not animated; the view-offset ease must go through the same `prefersReducedMotion()` cut as `flyTo`.
- Camera: `setViewOffset` feeds the projection matrix, so `Raycaster.setFromCamera`, `pickBlank` and `plateBurst` stay correct; call `applyViewOffset()` after `renderer.setSize` in the resize handler. The pose ray guard must also cover `SEQ_VIEWS` and the resize re-frame.
- Layout: `--prompt-h` comes from the `ResizeObserver`, so the strip and chip follow the collapsed prompt for free; do not animate the prompt's height or they lag. Check 320×568 for the ⋯/bottombar collision. BASELINE's landscape numbers were taken without touch emulation; specs here assume `pointer: coarse`.
- Four files: every CSS/DOM/JS change goes into all four apartment files; diff the non-visual segments afterwards to prove they are still byte-identical. Only the neighbour move and the `DECOR_BOXES.push` are look-specific.

## 5. Implementation sketch (smallest diff)
- **DOM** (+2 elements): `<button id="jbtoggle" class="ghost" aria-expanded="false" aria-controls="jbtns">` inside `#jumpbar` and `id="jbtns"` on `.jbtns`; `<button class="lk-menubtn" aria-label="Home and appearance" aria-haspopup="true" aria-expanded="false" aria-controls="lk-menu">⋯</button>` as `#lookbar`'s first child. Both `display:none` outside the phone media queries.
- **Body classes**: `stage-example` / `stage-quiz` (from `stagechange` → `e.detail.stage.kind`), `first-quiz` (index 1 until the run's first `quizopen`), `quiz-open` (`quizopen`/`quizclose`), and element states `#prompt.expanded`, `#jumpbar.expanded`, `#jumpbar.peek`, `#lookbar.open` (exists).
- **CSS**, inside the two phone media queries only: `body.stage-quiz #prompt:not(.expanded) .pbody { sr-only rules }`; `body.stage-quiz #jumpbar:not(.expanded):not(.peek) .jbtns { display:none }` plus the strip geometry; `body.quiz-open` hides (§3); `#lookbar:not(.open) > .lk-home, #lookbar:not(.open) > .lk-toggle { display:none }` with `.lk-menubtn { display:flex }`; the bottom-row repositioning; `body.first-quiz #prompt .pbody { position:static; ... }` to undo the collapse.
- **JS**, one new "chrome" block after the 08 block (it may read `currentStage`, `STAGES`, `ui` like 08 does): `isPhoneLayout()` copied from Houses; listeners on `stagechange`, `stagecomplete` (peek timer), `quizopen`, `quizclose`; click handlers for `#jbtoggle` and the prompt title. No edits to `showStage`, `openQuiz`, `chooseOption`, `checkComplete`. Lookbar inline script: +3 lines wiring `.lk-menubtn` to `setOpen`.
- **Camera**: `EXTENTS`, `fitDistance()`, `safeRect()`, `applyViewOffset()`, `stageMaxDistance()`; `poseFor` and `setSeqView` use `fitDistance` instead of `PORTRAIT_BACKOFF` (keep the constant as the cap); `frameStage`, the resize handler and the `quizopen`/`quizclose` listeners call `applyViewOffset()`.
- **Sunbelt**: `neighbour(F, 42, HALF_D + 58, 22, 10, 3)` and a `DECOR_BOXES.push(box)` inside `neighbour()`.
- **QA**: screenshots at 375×812 and 740×360 on stages 0, 1, 4 (tower), 7 (row), 10–11 (block, all four looks), 12 (seq); one pass with VoiceOver on the strip and ⋯ button; confirm `#doorsleft` still announces with the sheet open.

— Dara Okonkwo-Lind, senior UI engineer (mobile-first design systems)
