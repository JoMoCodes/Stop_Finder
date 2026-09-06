# 01 — Lighting, shadows, materials and sky/ground

## Goal
Make the scene read as a *place* — buildings that sit on the ground, doors that sit back in the wall, a sky with air in it — while keeping every door plate exactly as legible as today. The rule: shadows and material variation on the **environment**; the **plates stay fully lit, unshadowed and unchanged in colour**. Reviewers on both sides of the lighting debate get what they asked for because the two things never trade off.

## Why
- June (colour theorist): "everything is equally lit… door recesses don't read as recesses… the sky is the colour of a stage backdrop that's been lit to death." Her prescription: `castShadow`, hemisphere down to 0.6, warm the top light to `0xfff5e6`, sky gradient, roughness variation, cooler road `0x7a8a9a`.
- Felix (diorama artist): "flat lighting makes the buildings feel like they're floating… add a contact shadow or slight edge-darkening… the ground feels like a game board."
- Rosa (driver): in Part 5 "no shadows = no depth = feels like a poster… the green door plate is nearly as dark as the black windows."
- Priya, Tobias, Nadia defend flatness *for the plates*: "a learner won't miss a blank because it's in shadow" (Priya); "teaching light, not beauty light" (Nadia). We honour this literally: plates use `MeshBasicMaterial`, which ignores lights and cannot receive shadows, so they are unaffected by every change below.
- Nadia also praised the textureless ground as "negative space". Keep the ground calm: variation must be sub-perceptual at a glance (≤ 4 % lightness).

## Design

### Renderer (line 236)
```js
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// do NOT enable tone mapping — it would shift plate colours (MeshBasicMaterial is tone-mapped too)
```

### Lights (replace lines 245–249)
```js
const hemi = new THREE.HemisphereLight(0xfff5e6, 0x7a7466, 0.6);   // warm sky, warm-grey bounce
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 1.35);
sun.position.set(18, 30, 26);          // front-right, high: shadows fall down-left, doors read as recessed
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
sun.shadow.camera.left = -34; sun.shadow.camera.right = 34;
sun.shadow.camera.top = 34;   sun.shadow.camera.bottom = -34;   // every building is centred on origin; ±34 covers the 24-wide row + stairs
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
scene.add(new THREE.AmbientLight(0xffffff, 0.18));
```
Target overall brightness of a sunlit brick wall within ±6 % of today's (compare `04-part2-example.png`); tune `sun.intensity` between 1.2 and 1.5, never the hemisphere above 0.7.

### `box()` — shadows and roughness by role (lines 252–258)
```js
const ROUGH = new Map([[COLOR.brick, .88], [COLOR.siding, .86], [COLOR.door, .95], [COLOR.roof, .72],
                       [COLOR.step, .9], [COLOR.balcony, .9], [COLOR.walkway, .95], [COLOR.canopy, .9]]);
function box(parent, w, h, d, color, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: ROUGH.get(color) ?? 0.92, ...opts }));
  m.castShadow = true; m.receiveShadow = true;
  …
}
```
Callers are untouched. Glass keeps the `{ roughness: 0.3, metalness: 0.1 }` its callers pass.

### Palette tweaks (values only, inside `COLOR`)
- `door: 0x4f8d5a → 0x5b9d66` (one step lighter so the door separates from the window — Rosa).
- `glass: 0x3a4654 → 0x46586e` (bluer, catches the sky — Felix "windows are a bit shy").
- `road: 0x8c8c8c → 0x7d8792` (cooler, recedes — June).
- `sky: 0xbfd9ec` stays as the **horizon** colour; see sky dome.
- Do **not** touch `arrow` (doc 09) or the wall/band/roof hues (seven reviewers praised them).

### Sky dome + fog (insert after the AmbientLight line)
A vertex-coloured inverted sphere; no shaders, no textures to load.
```js
const skyGeo = new THREE.SphereGeometry(900, 32, 16);
const col = [], top = new THREE.Color(0x6fa3d6), hor = new THREE.Color(0xdfe9ef), c = new THREE.Color();
const pos = skyGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const t = THREE.MathUtils.clamp(pos.getY(i) / 900, 0, 1);       // 0 at horizon, 1 overhead
  c.copy(hor).lerp(top, Math.pow(t, 0.6)); col.push(c.r, c.g, c.b);
}
skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }));
scene.add(sky);
scene.background = null;
scene.fog = new THREE.Fog(0xdfe9ef, 140, 420);   // fades the enlarged ground into the horizon; plates (<45 units) are untouched
```
Below the horizon (`t<0`) the dome is the horizon colour, so the ground edge never shows against black.

### Ground and road (lines 738–745)
- Ground plane `SPAN*4 × D*8` → `800 × 800`. Material: `MeshStandardMaterial({ color: COLOR.ground, roughness: 1, map: noiseTex })` where `noiseTex` is a 256×256 canvas filled with the ground colour ±4 % lightness per 8×8 cell, `wrapS/T = RepeatWrapping`, `repeat.set(60,60)`, `colorSpace = THREE.SRGBColorSpace`. `receiveShadow = true`.
- Road plane length `SPAN+24` → `800`, keep width 6, `receiveShadow = true`. Add two kerb strips: `box(scene, 800, 0.08, 0.35, COLOR.walkway, 0, -0.11, HALF_D + 5.4 ± 3.2)`.
- Contact shadow comes free from `sun.castShadow` + `receiveShadow` on the ground.

### What plates look like afterwards
Identical. `label()` builds `MeshBasicMaterial`, which is unlit and does not receive shadows. Check it: sample the pixel at the centre of the "1" in plate 128 (`04-part2-example.png`) before and after — RGB must match within ±3.

## Ownership
**May edit:** `renderer` construction (line 236–239 region, options and `shadowMap` only), lines 245–249 (lights), `scene.background`, new sky/fog/noise code inserted immediately after the AmbientLight line, `box()` body, values inside `const COLOR` except `arrow`, the ground/road block (738–745) and its new kerbs.
**Must not edit:** `camera` and `controls` (doc 02); `makeTextTexture`, `label`, `setPlateText`, sign/banner code (doc 03); `arrow()`, `addArrows`, `addTowerArrows`, `COLOR.arrow` (doc 09); any `build*`/`add*`/`*Access` builder; `STAGES`; anything in `<style>` or the DOM; `tick()`/resize (doc 02). No tone mapping, no `outputColorSpace` change, no env maps, no texture files.

## Acceptance checks
- Stage 00 (`00-part1-example.png` angle): visible soft shadow of the roof overhang and canopy on the front wall; a shadow on the ground to the building's left/front; sky darker at top than at horizon; no visible ground edge in any drag direction.
- Stage 04 (tower): floor bands cast a thin shadow line on the wall below them; door surfaces slightly darker at their left edge than the wall (recess reading). Plate "328" pixel colour unchanged.
- Stage 12/13 (Part 5) from the Left view: stair flights cast shadows on the wall; all 4 side plates still pure white with `#16202b` numerals; nothing on the plate is darker than before.
- Mobile 390×844: frame rate stays ≥ 45 fps on a 2021 mid-range Android in Part 5 (shadow map 2048 is the ceiling; drop to 1024 if below 30 fps).
- No shadow acne on flat walls; no peter-panning of the stair treads (adjust `normalBias` 0.01–0.04).
- Amber/white UI unaffected (screenshots of `#prompt` pixel-identical).

## Merge notes
- Doc 09 inserts `PLACE_COLORS` right after `const COLOR = {…};` — you edit *inside* the braces only, so no conflict.
- Doc 02 owns the `controls.*` lines that sit between your renderer lines and your light lines. Do not reorder that block.
- Doc 03 will call `renderer.capabilities.getMaxAnisotropy()` inside `makeTextTexture`; your renderer const must keep the name `renderer`.
- Doc 08 adds halo planes (`MeshBasicMaterial`, transparent) behind blank plates and doc 10 adds small solved-dot meshes: both are unlit, so your lighting will not affect them; do not set `castShadow` on anything you do not own.
- If fog makes doc 09's mini-map or any HTML overlay look wrong, that is impossible — fog only affects WebGL — so do not "fix" it in CSS.

## Out of scope for this doc
Staircase geometry weight (Bea/Felix — builder functions belong to nobody this round), weathering/decals, bloom or post-processing, dynamic time of day, camera changes, plate typography, ground textures loaded from files.
