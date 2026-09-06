# 10 — Reward, progress and flow

## Goal
Reward every correct answer, not just the last one on a building: a 320 ms plate pop and a persistent green **solved dot** on the plate, a **14-segment progress bar** in the jump bar with a "Part 2 · Building 5 of 14" caption, a **completion summary** that names the five patterns learned (with the digit colours), confetti that is louder at the very end and absent under reduced motion, and a Back/Next/Start-over flow that behaves identically everywhere.

## Why
- Viktor: "confetti fires once per building… if you solve 1 blank out of 3, nothing happens"; wants a per-blank reward and "a milestone screen after each part"; suggests "confetti cannons left/right" for the finale.
- Nadia: "no persistent visual *mark* on the door itself after solving… the learner can't step back and count."
- Kai: "No streaks, no score, no progress… I can't see how I'm doing across the whole course… the confetti is the only thing that makes me feel rewarded."
- Leilani: "a literal progress bar ('Part 1 [2/5 buildings complete]')."
- Tobias: confetti "has no connection to the learning goal… show a summary — 'You solved 14 buildings and learned the five numbering patterns.'" Rosa likes the confetti as is ("celebratory without being corny") — keep it, add meaning.
- Sam: 170-particle burst needs a `prefers-reduced-motion` guard.
- Priya/Omar: "Continue / Ready / Next Building" must become one vocabulary (doc 04 fixed the words; you apply them in `showNext`).

## Design

### Events (the glue for docs 07/08/09)
- Last statement of `showStage(i)` (after `if (currentStage.kind === 'quiz') resumeQuizState();`):
  `document.dispatchEvent(new CustomEvent('stagechange', { detail: { index: i, stage: currentStage } }));`
- `checkComplete(bstate)` (signature change; doc 05 passes it): first line `if (bstate) { popPlate(bstate); markSolved(bstate); document.dispatchEvent(new CustomEvent('blanksolved', { detail: { bstate, index: currentIndex } })); }` — this also fires for the building-name step. Tolerate `bstate === undefined`.

### Per-answer micro-feedback (new functions after `showNext`)
```js
const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function popPlate(bstate) {                 // 320 ms scale 1 → 1.18 → 1 with ease-out-back; tint white → #c8ffd8 → white over 500 ms
  const p = bstate.plate, t0 = performance.now();
  (function step(t) { const k = Math.min(1, (t - t0) / 320); /* scale */ …; if (k < 1) requestAnimationFrame(step); else p.scale.set(1,1,1); })(t0);
  if (REDUCED()) p.scale.set(1,1,1);        // tint only
}
function markSolved(bstate) {               // persistent shape cue, top-right of the plate
  const { width: pw, height: ph } = bstate.plate.geometry.parameters;
  const dot = new THREE.Mesh(new THREE.CircleGeometry(ph * 0.14, 20), new THREE.MeshBasicMaterial({ color: 0x57c97e, fog: false }));
  dot.position.set(pw / 2 - ph * 0.18, ph / 2 - ph * 0.18, 0.004); bstate.plate.add(dot);
}
```
Also a 14-piece mini burst from the plate's screen position: project `plate.getWorldPosition()` with `camera`, push 14 small green/yellow particles into the existing `confetti` array (`w,h` 4–6 px, `vy` −4…−7). Skip under `REDUCED()`.

### Course progress in the jump bar
DOM: `<div id="progress" aria-hidden="true"></div>` as the **last child** of `#jumpbar`. Build 14 `span.seg` (one per stage) grouped by part (`margin-left:6px` at part boundaries).
CSS (insert after `#jumpbar button.jbtn.active`):
```css
#progress { display:flex; gap:3px; margin-top:8px; height:6px; }
#progress .seg { flex:1; border-radius:3px; background:rgba(255,255,255,.18); }
#progress .seg.done { background:#57c97e; } #progress .seg.now { background:#ffd9a0; }
#progress .seg.part { margin-left:6px; }
```
`completed = new Set()` — a stage is complete when `allSolved()` (quiz) or when the learner presses Next on an example. `updateProgress()` on `stagechange` and after `checkComplete` marks `.done`/`.now` and sets `.jbtitle` to `Part ${p} · Building ${i+1} of 14`. `resetCourse()` clears the set.

### Button vocabulary (`showNext`, `showStage` labels come from doc 04)
`#next`: `Next ▸`; if `STAGES[i+1].kind === 'example'` → `Next: Part ${part} ▸`; last stage → `Start over ▸`. `#continue` label is set by doc 04 to `Next ▸`. `#back` unchanged. Pressing `#continue` on an example marks it complete then `showStage(i+1)`.

### Confetti (`fireConfetti`, `drawConfetti`)
- Guard: `if (REDUCED()) return;` at the top of `fireConfetti`.
- Per-building burst: today's values (170 from top-centre) — keep.
- Finale (`currentIndex === STAGES.length − 1`): `fireConfetti('cannons')` — two bursts of 120 from `(0, innerHeight·.8)` and `(innerWidth, innerHeight·.8)` with `vx` ±(6…14) toward centre, `vy` −12…−18.

### Completion summary `#finale`
DOM: first child of `<body>`:
```html
<div id="finale" class="hidden" role="dialog" aria-labelledby="ftitle">
  <h2 id="ftitle">You read all 14 buildings</h2>
  <ol>
    <li><b>Count in order</b> — 101, 102, 103…</li>
    <li><b class="pl-floor">First digit = floor</b> — <span class="pl-floor">2</span><span class="pl-door">29</span></li>
    <li><b class="pl-building">Leading digits = building</b> — <span class="pl-building">13</span><span class="pl-floor">1</span><span class="pl-door">17</span></li>
    <li><b>Front and back</b> — the count carries on behind</li>
    <li><b>No floor digit</b> — one running count round the building</li>
  </ol>
  <p>Next time you're at a new building, look for the pattern before you ring a bell.</p>
  <div><button id="fagain">Start over ▸</button><button id="fclose" class="ghost">Keep looking around</button></div>
</div>
```
CSS: `#finale{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 32px));padding:24px 26px;border-radius:18px;background:rgba(20,24,30,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.16);color:#eef2f6;z-index:40;box-shadow:0 20px 60px rgba(0,0,0,.5)}` `#finale h2{margin:0 0 12px;color:#ffd9a0;font-size:22px}` `#finale ol{margin:0 0 14px;padding-left:22px;line-height:1.6}` `#finale p{color:#dfe6ee;margin:0 0 18px}` `#finale div{display:flex;gap:10px;flex-wrap:wrap}`. Shown 900 ms after the finale confetti (immediately under reduced motion). `#fagain` = same as Start over; `#fclose` hides it and leaves `Start over ▸` in the bottom bar.

### Flow rules (`resetCourse`, handlers)
- Start over: `resetCourse()` (existing disposal — now also disposes doc 08's halos and your dots via the existing `traverse`), `completed.clear()`, `showStage(0)`. Do not clear `localStorage`.
- Back from stage 0 stays hidden (existing); Back never resets solved state (existing `groups` cache) — keep.
- Revisiting a finished stage: `resumeQuizState` shows `Next ▸`, no confetti (existing `celebrated`), progress still `.done`.

## Ownership
**May edit:** `doorsSolved`, `allSolved`; the final line of `showStage` (dispatch only); `resumeQuizState` and `checkComplete` except their `ui.prompt.innerHTML` line (04); `showNext`; `resetCourse`; the three button `onclick` handlers (1168–1173); the confetti section (1194–1232); new functions inserted immediately after `showNext` (`popPlate`, `markSolved`, `updateProgress`, finale wiring); `#progress`, `#finale` DOM; `.jbtitle` textContent; CSS at your anchor and the base `button`/`#bottombar`/`#jumpbar` blocks.
**Must not edit:** `chooseOption`/`openQuiz`/`closeQuiz` (05 — it passes you `bstate`); `setPlateText`/`makeTextTexture` (03 — the pop and dot are mesh-level, never texture-level); prompt strings (04); `.jbtn` sizes (07) or `aria-*` (07); `@media` (06); `tick()` (02 — your pop uses its own rAF).

## Acceptance checks
- Stage 02: solve one of two blanks → plate pops for ~0.3 s, gains a green dot top-right, 14 small particles rise from it; `#doorsleft` (doc 08) and the mini-map (doc 09) update; no big confetti yet. Solve the second → full confetti, `Next ▸` appears.
- Jump bar: caption `Part 1 · Building 3 of 14`; 14 segments, first two green, third amber, gaps at part boundaries.
- Stage 03 → `Next: Part 2 ▸`; stage 05 → `Next ▸`; stage 13 → `Start over ▸`.
- Stage 13 completion: two confetti cannons from the bottom corners, then `#finale` with five lines, coloured digits, two buttons; Escape/`Keep looking around` closes it; `Start over ▸` returns to stage 0 with an empty progress bar.
- Reduced motion: no confetti, no pop (tint only), no particles; the dot and progress still appear; `#finale` appears instantly.
- Revisit stage 06 after finishing it: dots present, no confetti, `Next ▸` shown.
- `document.addEventListener('blanksolved', console.log)` logs on every solve, including the building name in stages 08/09.

## Merge notes
- **Doc 04** edits the middle of `showStage` and one line each of `resumeQuizState`/`checkComplete`; you edit the ends. Expect textual conflicts — keep both.
- **Doc 05** changes `checkComplete()` → `checkComplete(bstate)`; until it lands you receive `undefined` — the guard handles it.
- **Doc 08** removes halos on `blanksolved`; your dot at `z = +0.004` sits in front of the plate, the halo behind — no z-fight.
- **Doc 03**'s `setPlateText` resets `material.color`; your tint animation runs *after* it — start the tint from white on the next frame.
- **Doc 07** adds `aria-current` on jump buttons in its own listener; you keep toggling `.active`. `#finale` is a dialog: 07 may later trap focus in it — leave `id`s stable.
- **Doc 09** owns `.pl-*`; your finale uses them with no fallback needed (white until merged).
- **Doc 06** positions `#finale` full-screen on phones; keep `position:fixed`.

## Out of scope for this doc
Scores, streaks, timers, leaderboards, sound, per-part milestone screens (Viktor — one summary at the end is enough for a 20-minute course), analytics, saving progress across reloads.
