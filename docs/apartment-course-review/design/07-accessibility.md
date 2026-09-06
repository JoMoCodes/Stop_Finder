# 07 — Accessibility: keyboard, focus, ARIA/live regions, reduced motion, non-colour cues

## Goal
A learner who cannot use a pointer, cannot see colour, cannot tolerate motion, or uses a screen reader can complete every stage. Concretely: Tab reaches every door and option, arrow keys turn the camera, Escape closes the quiz, focus is always visible, the quiz announces itself and its verdict, the canvas has a per-stage text description, all animation honours `prefers-reduced-motion`, and every colour pair is verified against WCAG AA with the numbers written down.

## Why
Sam (WCAG specialist) is the single detailed voice and nothing contradicts him: "the course is currently **not accessible to keyboard, screen reader, or motion-sensitive users**." His critical items: pointer-only interaction (2.1.1), red-only blank cue (1.4.1), unguarded shake and 170-particle confetti (2.3.3), canvas with no text alternative (1.1.1), quiz with no dialog semantics or live region (1.3.1/4.1.3), no `:focus-visible` (2.4.7), jump buttons named "1"–"5" (1.3.1), 34-px targets (2.5.5). Priya independently: "no evidence of keyboard support… recommend arrow keys for option selection and Enter to confirm", and asks for "a text summary of each part's pattern rule." Dev: the auto-close is "user-hostile for accessibility (screen readers, users who pause to read)". Sam vs Ingrid disagree on whether the amber/red/green pass contrast — we settle it by computing.

## Design

### Verified contrast (WCAG relative luminance, panel bg `#14181e`)
| Pair | Ratio | Verdict |
|---|---|---|
| amber `#ffd9a0` on panel | 13.3 : 1 | AA/AAA pass |
| grey `#9fb0c0` (12 px labels) on panel | 8.0 : 1 | pass |
| success `#7ee0a0` on panel | 11.1 : 1 | pass |
| error `#ff9a8a` on panel | 8.7 : 1 | pass |
| blank red `#c0392b` on white plate | 5.4 : 1 | AA pass |
| `#08130c` on primary green `#57c97e` | 9.1 : 1 | pass |
| doc 09 coral `#f28c6a` / blue `#7cc4ff` on panel | 7.6 / 9.8 : 1 | pass |
No colour changes needed. Ingrid was right; Sam's caution is answered with numbers. Record this table in a comment above your CSS block.

### CSS (insert immediately after the `.hidden { … }` line)
```css
.sr-only { position:absolute; width:1px; height:1px; margin:-1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
button:focus-visible, canvas:focus-visible, [tabindex]:focus-visible { outline:3px solid #ffd54a; outline-offset:2px; box-shadow:0 0 0 6px rgba(20,24,30,.9); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
  button.opt.wrong { animation:none !important; }
}
```
Target sizes (edit in place): line 55 `#viewbar button.vbtn { … min-height:44px; }`; lines 66–69 `#jumpbar button.jbtn { width:40px; height:40px; … }` and `.jbtns { gap:8px }`. Ask doc 05 for `button.opt { min-height:48px }` (it is in their spec).

### ARIA on existing elements (attributes only)
- `#prompt`: `aria-live="polite" aria-atomic="true"`.
- `#quiz`: `role="dialog" aria-labelledby="qhead"` (not modal — the scene stays usable).
- `#qmsg`: `aria-live="assertive" aria-atomic="true"`.
- `#jumpbar`: `role="navigation" aria-label="Jump to part"`; buttons: `aria-label="Part 1: numbers count up in order"`, `"Part 2: first digit is the floor"`, `"Part 3: leading digits name the building"`, `"Part 4: numbers wrap front and back"`, `"Part 5: one running count, no floor digit"`; the active one gets `aria-current="true"` (set in your `stagechange` listener, since 10 toggles `.active`).
- `#viewbar`: `role="group" aria-label="Walk around the building"`.
- `#bottombar`: `role="group" aria-label="Course navigation"`.

### New DOM (immediately after `<div id="app"></div>`)
```html
<p id="scene-desc" class="sr-only"></p>
<div id="doorlist" class="sr-only" role="group" aria-label="Doors to fill in"></div>
```
In JS: `renderer.domElement.tabIndex = 0; renderer.domElement.setAttribute('role','img'); renderer.domElement.setAttribute('aria-label','3D view of the building. Use arrow keys to look around.'); renderer.domElement.setAttribute('aria-describedby','scene-desc');`

### Scene descriptions (`SCENE_DESC`, set on `stagechange`)
One sentence per stage type + one per stage, e.g. Part 2 quiz: "Four-storey building B with three doors per floor, unit numbers 121 to 423; the first digit is the floor. One door is blank." Build from `STAGES[i]` fields (`type`, `label/number/building`, blank count from `groups[i].userData.blankStates`).

### Door list — keyboard access to blanks
On `stagechange` and `blanksolved`, rebuild `#doorlist` with one `<button>` per **unsolved** `bstate` (and one for `buildingState` when pending): text `"Door showing 71▢5, floor 1, third from the left — open its options"`; derive floor/position from `bstate.plate.position` (y → floor via `Math.round((y-2.55)/3.2)+1`; x rank among same-floor plates; face from `plate.rotation.y`). `click` → `openQuiz(bstate)`. `#doorlist` is `sr-only`, but its buttons are real, so Tab reaches them in DOM order after `#prompt`.

### Keyboard map (one `keydown` listener on `document`, inserted in your block)
| Key | Context | Action |
|---|---|---|
| Escape | quiz open | `closeQuiz()` |
| ↑ / ↓ | quiz open | move focus among `#qopts button:not(:disabled)` (roving) |
| 1–4 or a–d | quiz open | click that option |
| ← / → | focus on canvas or body, quiz closed | `orbitBy(∓15, 0)` |
| ↑ / ↓ | focus on canvas or body, quiz closed | `orbitBy(0, ∓10)` |
| Home | anywhere | `resetView()` |
| F / B / L / R | Part 5 | `setSeqView('front'|'back'|'left'|'right')` |
All calls guarded: `typeof orbitBy === 'function' && orbitBy(…)`. Never intercept keys when focus is in a `<button>` other than the canvas-adjacent ones (let native Enter/Space work).

### Focus management
`quizopen` → remember `document.activeElement`, then focus the first `.opt` (`setTimeout 0`). `quizclose` → restore focus to the remembered element if still in the DOM, else the canvas. Doc 05 already keeps the panel open while it contains focus, so a screen-reader user is never cut off by the auto-close.

### Reduced motion — who does what
CSS blanket above covers the shake and CSS transitions. JS animations must self-check: doc 02 `flyTo` (snap), doc 08 halo pulse (static), doc 10 `fireConfetti` (skip) and `popPlate` (tint only). You **verify** each with the OS setting on; you do not edit their functions.

### Non-colour blank cue
Doc 03 renders dashed frames and hollow boxes on blanks. You verify with a greyscale filter (`html{filter:grayscale(1)}` in DevTools): blanks must be identifiable in stages 01, 05, 08, 11, 13.

## Ownership
**May edit:** attributes on `#prompt`, `#quiz`, `#qmsg`, `#jumpbar` + its buttons, `#viewbar`, `#bottombar`; the two new sr-only elements; CSS at your anchor; lines 55 and 66–69 (target sizes); your JS block inserted immediately before the `/* … loop + resize … */` comment (scene descriptions, door list, key map, focus management, canvas attributes).
**Must not edit:** any function body outside your block (`openQuiz`/`closeQuiz` are 05; `frameStage`/`orbitBy` are 02; `fireConfetti`/`checkComplete` are 10; `showStage` is 04/10); element *content* (prompt text 04, `.jbtitle` 10, quiz children 05); `@media (max-width…)` (06); plate rendering (03); colours (all pass).

## Acceptance checks
- Tab from page load: order is prompt (skipped — not focusable) → jump buttons (announce "Part 1: numbers count up in order, current") → canvas ("3D view of the building…") → door buttons → bottombar. Every focused control shows a 3 px amber ring.
- Stage 01, keyboard only: Tab to "Door showing ?, floor 2, second from the left", Enter → quiz opens, focus on option a; ↓ ↓ Enter → answer registers; `#qmsg` announced (NVDA/VoiceOver); Escape closes; focus returns to the door list (now empty) / canvas.
- Canvas focused: ← rotates 15°; Home resets; in Part 5, `L` shows the left face.
- OS reduced motion on: no shake, no confetti, no camera glide, halos static, plate pop is a colour tint only.
- Greyscale: every blank plate identifiable by its dashed frame/boxes in stages 01–13.
- `#scene-desc` text changes on every stage; the building question stage announces "All doors filled — choose the building number" via `#prompt`.
- Lighthouse a11y ≥ 95; axe: zero critical issues.

## Merge notes
- **Doc 05** edits `#quiz` children; you edit its tag attributes — same line block, attribute-only. Doc 05 also dispatches `quizopen/quizclose` — you depend on them; before merge your focus code simply never fires.
- **Doc 10** toggles `.active` on jump buttons and dispatches `stagechange` — you add `aria-current` in your listener, not in 10's code.
- **Doc 02** provides `orbitBy/resetView/setSeqView`; **doc 08** owns pointer handlers — your `keydown` listener is separate.
- **Doc 06** re-states `.jbtn` 40×40 in media queries; identical values, no conflict.
- Only you insert before the loop comment; doc 08 inserts before the confetti comment two sections earlier.

## Out of scope for this doc
A non-visual alternative course, audio cues, high-contrast theme, language switching, changing the distractors, re-ordering stages.
