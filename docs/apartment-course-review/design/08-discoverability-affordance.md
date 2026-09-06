# 08 — Discoverability and affordance in the 3D scene

## Goal
A learner should never wonder *what* to click or *how* to look around. Blank plates get a pulsing yellow halo and a pointer cursor with a warm hover tint; a small **"3 doors left"** chip shows what remains on this building; a one-time drag hint appears on first load (and after 10 s of inactivity on a quiz), and a permanent **?** button brings it back. Click precision is tightened without shrinking tap targets.

## Why
- Dev (HIGH): door plates "never get a `cursor: pointer`… users might not realize doors are interactive… Worse on mobile where there's no hover." Also: the raycaster hits the door mesh, so "a click near — but not on — a number opens the quiz."
- Priya: "no cursor change, no glow, no outline to signal interactivity"; proposes "a faint yellow rim-glow on blank plates" and a fallback "Tip: Click a door with a **?**" after inactivity.
- Viktor: partial plates "look like a damaged plate, not a puzzle hole"; wants "a pulsing '?' overlay or a one-time highlight on quiz load."
- Nadia: in Part 4/5 "the learner can't step back and count: 'I've solved 12 out of 20.'"
- Eleanor: "Please add a moment of guidance before I have to drag the camera… a `?` button that explains all the controls."
- Marcus: "nowhere does it say 'scroll to zoom' or that you can pinch-zoom… a tiny one-time hint on first load."
- Luna: "a subtle hand cursor or a rotating arrow on the model."

## Design

### Halo on unsolved blanks
On `stagechange` (and once at startup for stage 0), for every `bstate` in `groups[index].userData.blankStates` without `bstate.halo`:
```js
const { width: pw, height: ph } = bstate.plate.geometry.parameters;
const halo = new THREE.Mesh(new THREE.PlaneGeometry(pw * 1.16, ph * 1.34),
  new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: .55, depthWrite: false, fog: false }));
halo.position.z = -0.006;                   // between wall and plate
halo.renderOrder = -1; bstate.plate.add(halo); bstate.halo = halo;
```
Pulse in your own `requestAnimationFrame` loop: `opacity = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2π * 0.9))` (0.9 Hz). Under `prefers-reduced-motion`: constant 0.6. Hovered blank: 0.9 steady. On `blanksolved`: remove and dispose the halo. The building banner (`buildingState.plate`) gets the same halo when it becomes the pending question (banner is 9.6 × 2.0 → factor 1.06 × 1.2).

### Cursor and hover tint (`pointermove` on `renderer.domElement`, throttled to one raycast per frame)
Hit test `blanks` (the existing `raycastList`). If the nearest hit has an unsolved `bstate`: `cursor = 'pointer'`, `bstate.plate.material.color.set('#fff1c2')`, `bstate.plate.scale.set(1.06, 1.06, 1)`; otherwise `cursor = 'grab'` (and `'grabbing'` while dragging — listen to `controls` `'start'/'end'`). Restore `color '#ffffff'`, `scale 1` on leave. Touch devices never fire hover; the halo carries the signal.

### Click precision (edit the `pointerup` handler, lines 1178–1192)
Keep doors *and* plates as targets (a 1.25 × 2.05 door is the tap target Leilani wants on a phone) but resolve ambiguity by **nearest plate**: among intersections, prefer any hit whose object is a plate or halo; accept a door hit only when no plate/halo was hit and the hit point is within 1.6 units of that door's plate (`bstate.plate.getWorldPosition`). This stops a click on the wall between Part 5's stacked doors from opening the wrong one. Add `pointercancel` → `downPos = null`.

### "N doors left" chip
DOM (immediately before `<div id="bottombar">`, first of your three):
```html
<div id="doorsleft" class="hidden" aria-live="polite"></div>
```
CSS (insert after the `#bottombar {…}` block):
```css
#doorsleft { position:fixed; top:16px; right:16px; z-index:11; padding:9px 14px; border-radius:999px;
  background:rgba(20,24,30,.9); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,.14);
  color:#eef2f6; font-size:14px; font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,.45); }
#doorsleft b { color:#ffd54a; }
#doorsleft.done { color:#7ee0a0; }
```
Text: `<b>3</b> doors left` / `<b>1</b> door left` / `Name the building` (when doors done, building pending) / `Done ✓` (class `done`). Hidden on example stages. Update on `stagechange` and `blanksolved` by counting `blankStates.filter(s => !s.solved)` and `buildingState?.solved`.

### First-run drag hint and help button
DOM (after `#doorsleft`):
```html
<div id="draghint" class="hidden" role="status">
  <svg viewBox="0 0 64 40" aria-hidden="true"><!-- inline: hand outline + curved arrows either side, stroke #ffd54a --></svg>
  <div><b>Drag</b> to look around · <b>Scroll / pinch</b> to zoom · Click a door marked <b>?</b> to answer</div>
</div>
<button id="helpbtn" class="ghost" aria-label="How to use the controls">?</button>
```
CSS: `#draghint{position:fixed;left:50%;bottom:104px;transform:translateX(-50%);width:min(440px,calc(100% - 32px));display:flex;gap:14px;align-items:center;padding:12px 16px;border-radius:14px;background:rgba(20,24,30,.92);border:1px solid rgba(255,213,74,.45);color:#eef2f6;font-size:14px;z-index:12;box-shadow:0 10px 30px rgba(0,0,0,.45);opacity:0;transition:opacity .3s}` `#draghint.show{opacity:1}` `#draghint b{color:#ffd9a0}` `#draghint svg{width:64px;flex:none}` `#helpbtn{position:fixed;right:22px;bottom:28px;width:40px;height:40px;padding:0;border-radius:50%;font-size:18px;z-index:11}`.
Behaviour: on the first `stagechange` of the session, if `localStorage.getItem('sf.hintSeen') !== '1'` (wrapped in try/catch), show for 7 s or until a pointer drag > 20 px, then set the flag. On a quiz stage with zero solved and no `openQuiz` for 10 s, show the variant `Click a door marked <b>?</b> — the glowing ones` for 5 s (once per stage). `#helpbtn` toggles the full hint for 6 s.

## Ownership
**May edit:** the `pointerdown`/`pointerup` handlers (lines 1175–1192) and add `pointermove`/`pointercancel`; your JS block inserted immediately after the `pointerup` listener, before the `/* … confetti … */` comment (halo, hover, chip, hint, help, your rAF loop); the three new DOM elements at their anchor; CSS at your anchor (`#doorsleft`, `#draghint`, `#helpbtn`).
**Must not edit:** `label`/`setPlateText` (03 — it resets `material.color` on solve, which matches your hover reset); `openQuiz` (05 — you call it); `checkComplete` (10 — you listen to `blanksolved`); `tick()` (02 — run your own loop); `showStage` (subscribe to `stagechange`); `#jumpbar`/`#progress` (10 — course-level progress is theirs; yours is per-building); `@media` (06 positions your chip/hint/help on phones); `arrow()`/badges (09).

## Acceptance checks
- Stage 01: the "?" plate has a soft yellow glow pulsing ~1/s behind it; chip top-right reads **1 door left**; hover the plate → pointer cursor, plate warms and grows 6 %; elsewhere the cursor is a grab hand.
- Stage 06: four halos; solve one → its halo vanishes within one frame, chip says **3 doors left**; finishing → **Done ✓** in green.
- Stage 08: after the last door, the roof sign gets a halo and the chip says **Name the building**.
- Stage 13: clicking the wall 0.3 units below plate `12▢▢` opens *that* door; clicking the wall midway between two stacked doors opens nothing.
- Fresh profile load: drag hint fades in with stage 0, disappears on the first drag; reload → not shown; `?` brings it back for 6 s.
- Stage 01 with no interaction for 10 s: the "glowing ones" tip appears once.
- Reduced motion: halo is steady at 0.6 opacity, hint still fades (0.3 s is under the CSS blanket — acceptable).
- Example stages: no halos, no chip.

## Merge notes
- **Doc 10** dispatches `blanksolved` from `checkComplete(bstate)` (also for the building step) — your halo removal and chip depend on it. Doc 10 also adds a small green dot to solved plates; keep your halo at `z = -0.006` so it never covers the dot.
- **Doc 03**'s `setPlateText` sets `material.color = #ffffff`; your hover tint must not persist — also reset in your own `blanksolved` handler.
- **Doc 02** owns `controls`; you only *listen* to its `'start'/'end'` events.
- **Doc 06** repositions `#doorsleft` (below the prompt, right), `#draghint`, `#helpbtn` on phones — keep those ids.
- **Doc 07** adds nothing to your elements; your chip's `aria-live` is deliberate and coordinated.
- Only you insert before the confetti comment; doc 07 inserts before the loop comment.

## Out of scope for this doc
Outline/post-processing glow shaders, camera lock or snap-back (02), scores/streaks (10), sound, tooltips on quiz options (05), the "you are here" compass (09's mini-map).
