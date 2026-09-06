# 02 — Camera framing, transitions, orbit limits and Reset view

## Goal
Keep Nadia's "decisive cut" feel but stop the camera from stranding learners: 350 ms eased moves between stages and Walk-around views, orbit limits so the building can never leave the frame, portrait-aware framing so phones see the whole building, a "Reset view" chip that appears only when the learner has drifted, a one-time 1.4 s intro swing that teaches "this rotates", and an `orbitBy()` helper doc 07 binds to the arrow keys.

## Why
- Nadia (cinematographer): the instant cuts "work because [they're] decisive"; but flags "no orbit damping safeguard… a learner can drag the building fully out of frame with no reset-view button", and that Part 5's initial view "should probably match the Front button's semantic".
- Rosa (driver): "lock the front face in quiz mode, or snap back… a rookie might miss a number by accident." We give the snap-back as a button, not a lock — Tobias and Luna both value free exploration.
- Eleanor (first-time user, 74): "the building *whirled* around unexpectedly… If it had said 'try it now!' I would have felt braver."
- Priya: "add a subtle rotating animation to the example stage during the first 2 seconds after load… plants the idea: the building can be rotated."
- Dev: "no viewport-aware camera positioning… on phone… the learner has to pinch-zoom manually on each stage."
- Leilani/Marcus: the building is "TINY on mobile" (Part 5 at 390×844).
- Sam: camera is pointer-only (WCAG 2.1.1) — needs a keyboard hook (doc 07 wires the keys; we provide the function).

## Design

### Orbit limits (lines 241–243, replace)
```js
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.enablePan = false;                       // panning is how buildings get lost
controls.minPolarAngle = 0.18;                    // no straight-down "map" view
controls.maxPolarAngle = Math.PI * 0.49;          // keep: never under the ground
controls.minDistance = 8; controls.maxDistance = 95;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
```

### Framing table (rewrite `frameStage`)
Keep today's positions as the canonical desktop poses; compute, don't hard-code inside branches:
```js
const POSES = {
  tower: { pos: [7, TH * .5, 38],  tgt: [0, TH * .42, 0] },
  row:   { pos: [0, RH * .85, 32], tgt: [0, RH * .5, 0] },
  block: { pos: [10, BH * .5, 42], tgt: [0, BH * .42, 0] },
  seq:   { pos: [-30, 9, 34],      tgt: [0, 4.5, 0] },      // 3/4 overview stays: three faces visible
  plex:  { pos: [5, H * .6, 25],   tgt: [0, H * .45, 0] },
};
function poseFor(st) {
  const p = POSES[st.type] || POSES.plex;
  const pos = new THREE.Vector3(...p.pos), tgt = new THREE.Vector3(...p.tgt);
  if (camera.aspect < 1) pos.sub(tgt).multiplyScalar(1.35).add(tgt);   // portrait: back off 35 %
  return { pos, tgt };
}
function applyViewportFov() {           // portrait phones widen the lens so the row (24 wide) fits
  camera.fov = camera.aspect < 1 ? Math.min(74, 50 / Math.sqrt(camera.aspect)) : 50;
  camera.updateProjectionMatrix();
}
function frameStage(st) { const { pos, tgt } = poseFor(st); flyTo(pos, tgt, firstFrame ? 0 : 350); }
```
Tune the 1.35 so that at 390×844 the Part 3 row shows all five doors plus the stair with ≥ 6 % margin each side.

### Eased moves — `flyTo(pos, tgt, ms)` (new, after `setSeqView`)
- Cubic ease-out, own `requestAnimationFrame` loop, `controls.enabled = false` during the move, `controls.update()` each frame; on finish re-enable and dispatch nothing (doc 10's `stagechange` already fires).
- If `matchMedia('(prefers-reduced-motion: reduce)').matches`, `ms = 0` (snap — Nadia's cut).
- A new call cancels an in-flight one.
- Durations: stage change 350 ms; Walk-around buttons 350 ms; Reset view 450 ms; intro swing 1400 ms.

### Walk-around (`setSeqView`)
Same four poses as today, via `flyTo(…, 350)`. Add `.active` to the pressed `.vbtn` and clear it when the learner drags (listen to `controls` `'start'`). CSS (insert after `button.ghost:hover`):
```css
#viewbar button.vbtn.active { background:#57c97e; color:#08130c; border-color:transparent; }
```

### Reset view chip
DOM, immediately after `#bottombar`'s closing `</div>`:
```html
<button id="resetview" class="ghost hidden" aria-label="Reset the camera to the default view">⟲ <span class="rv-label">Reset view</span></button>
```
CSS (same anchor as above): `#resetview{position:fixed;right:22px;bottom:80px;z-index:11;padding:9px 14px;font-size:14px}`.
Behaviour: on `controls` `'change'`, show when `camera.position.distanceTo(pose.pos) > 4 || controls.target.distanceTo(pose.tgt) > 1.5`; hide after `resetView()` completes. `resetView()` = `flyTo(poseFor(currentStage)…, 450)`.

### Intro swing (once per page load)
On the very first `frameStage` (`firstFrame === true`): place the camera at the pose rotated −18° in azimuth about the target, then `flyTo(pose, 1400)` after a 300 ms hold. Skipped under reduced motion. Doc 08 shows its drag hint at the same moment.

### Keyboard hook for doc 07
```js
function orbitBy(dAzDeg, dPolDeg) {      // rotate camera about controls.target
  const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  sph.theta += THREE.MathUtils.degToRad(dAzDeg);
  sph.phi = THREE.MathUtils.clamp(sph.phi + THREE.MathUtils.degToRad(dPolDeg), controls.minPolarAngle, controls.maxPolarAngle);
  camera.position.setFromSpherical(sph).add(controls.target); controls.update();
}
```
`resetView`, `orbitBy`, `setSeqView` are module-level function declarations (hoisted) so doc 07 can guard-call them.

### Resize (lines 1237–1242)
Call `applyViewportFov()` and, if no drag is in progress, `frameStage(currentStage)` with 0 ms so orientation changes re-frame.

## Ownership
**May edit:** `controls.*` lines 241–243; `frameStage`, `setSeqView` bodies; new functions inserted immediately after `setSeqView`'s closing brace (`poseFor`, `applyViewportFov`, `flyTo`, `resetView`, `orbitBy`, `introSwing`, the `#resetview` wiring); the `resize` listener and `tick()`; the four `data-view` buttons in `#viewbar` and their wiring (lines 928–929); CSS inserted immediately after `button.ghost:hover`; the `#resetview` element.
**Must not edit:** lights/renderer/scene (01); `showStage` (04/10) — it already calls `frameStage`; pointer handlers (08); `#viewbar` base CSS except the `.active` rule (07 owns `button.vbtn` sizing; 06 owns mobile placement); any builder; the `ui` object.

## Acceptance checks
- Stage 00 fresh load: the 4-plex swings ~18° into its resting pose over ~1.4 s, then stops; Reset chip is hidden.
- Drag 90° in any stage → `#resetview` appears within one frame; press → 450 ms glide back; chip hides.
- Press Continue/Next: 350 ms glide, no overshoot, plates readable within 0.5 s of landing.
- Part 5: Front/Back/Left/Right glide 350 ms; pressed button turns green; dragging clears the green.
- Cannot pan the building off-centre; cannot zoom closer than 8 or farther than 95; cannot look from directly above.
- 390×844 portrait: Part 3 row fully visible with all five ground-floor plates legible; Part 5 overview shows the whole building; no plate cut by the prompt.
- Landscape 844×390: framing unchanged from desktop (aspect > 1).
- With OS reduced-motion on: every move is an instant cut; intro swing skipped.
- Arrow-key call `orbitBy(-15,0)` rotates left 15° about the target (verify via console).

## Merge notes
- Doc 07 binds keys to `orbitBy`, `resetView`, `setSeqView` with `typeof` guards.
- Doc 08 listens for the intro swing implicitly (shows hint on `stagechange` index 0 first time) — no coupling needed.
- Doc 06 will add `@media` overrides for `#resetview` (mobile: `right:8px; bottom:118px`, label hidden via `.rv-label{display:none}`); keep the `.rv-label` span.
- Doc 01 owns the renderer lines directly above your `controls` lines — do not touch them.
- Doc 09's mini-map reads `controls.getAzimuthalAngle()` on `controls` `'change'`; keep firing `controls.update()` in `tick`.

## Out of scope for this doc
Camera lock during quizzes (rejected: exploration matters), cinematic orbits, auto-rotate, adding Front/Back buttons to Part 4 (curriculum-adjacent; note as a follow-up), FOV changes on desktop.
