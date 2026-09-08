# Direction A — Sunbelt garden-style complex

File: `apartment-realistic-a.html` (a visual-only rework of `apartment-mockup.html`).

## Inspiration

Building type: the 1980s–2010s **garden-style walk-up** found across Texas, Arizona and Florida —
two- to four-storey wood-frame buildings with a brick veneer ground floor and stucco above, hipped
asphalt-shingle roofs with deep eaves and painted fascia, open breezeway stairs and walkways with black
metal guardrails, nose-in surface parking right in front of the doors, a cluster mailbox on the sidewalk,
crepe myrtles in mulch islands, and a dumpster pen in the corner of the lot.

Sources looked at (search-result pages; page fetches were blocked from the sandbox, so details come from
the listing snippets plus general knowledge of the type):

- https://www.houzz.com/photos/stucco-apartment-exterior-ideas-phbr2-bp~t_736~a_32-222--1410-15773
- https://www.houzz.com/photos/apartment-exterior-with-a-shingle-roof-ideas-phbr2-bp~t_736~a_1410-15773--1411-15776
- https://www.thebuildingcodeforum.com/forum/threads/exterior-stair-at-garden-style-apartments.33718/
- https://www.nctcog.org/envir/regional-building-codes/amendments/apartment-breezeway-stairs
- https://prolineplm.com/parking-stall-dimensions-and-layout-considerations-for-multi-family-properties/
- https://www.apartments.com/garden-terrace-apartments-phoenix-az/pbcsx0s/

## Direction in five bullets

- **Materials with grain.** Every surface is a procedural canvas texture scaled to real-world size:
  brick courses (0.25 x 0.07 m), stucco grain, three-tab shingle rows, sidewalk flags with joints,
  asphalt speckle, mottled lawn, mulch. Walls are thin per-face slabs so each face gets a correct repeat.
- **Real roofs and edges.** Hipped 4:12 shingle roofs with 0.85 m eaves, soffit, fascia and ridge cap;
  a concrete plinth at grade; trim bands at floor lines; downspouts on the corners.
- **Breezeway hardware.** Every walkway and stair landing has a black metal guardrail (top + bottom rail,
  posts, instanced balusters); stairs are concrete treads on black stringers with handrails; walkways sit
  on steel columns placed between doors so nothing crosses a plate.
- **Doors and windows that read as such.** Six-panel painted doors in a white trim frame with a sconce,
  kick plate, brass hardware and a mat; windows get a frame, sill, mullion cross and a curtain/blind glass
  texture.
- **A place, not a plane.** Sidewalk and kerb, a bay-striped lot with parked cars, a lawn verge with a
  cluster mailbox, lampposts and shrub beds, a public street, crepe myrtles (some in bloom), an AC pad and
  iron fence behind, a dumpster pen, and four neighbouring buildings of the same family in the distance.
  Late-afternoon sun (warm, low, front-right), hazy blue-cream sky with soft cloud sprites, warm fog, ACES
  tone mapping.

## What changed

- `COLOR`, lighting, sky, fog, `box()` and the new `tbox()` / `mbox()` / `texMat()` material helpers.
- New kit: `hipRoofGeo`/`roofHip`, `railRun`, `column`, `walkway`, `flight`, `landingSlab`, `windowAt`,
  `doorAt`, `buildWalls`, `sidewalks`. All `build*Shell`/`build*Facade`/`*Access` builders now use it; door
  positions, plate positions, `bstate` wiring and `raycastList` contents are unchanged (the door is still
  the clickable box mesh).
- Site: `buildSite()` builds `envFront` / `envBack` / `envSide` groups. On `stagechange` the front and back
  halves slide by the current building's half-depth so the kerb is always the same distance from the façade.
- Performance: repeated props use `InstancedMesh` (balusters, fence pickets, shrubs, tree trunks and
  crowns, car wheels, bay lines); `mergeStatic()` merges all plain-material pieces per group into one mesh
  per material. Measured 106–188 draw calls per frame including the shadow pass (was ~255–575 before
  merging). Shadow map size unchanged (2048); bounds widened to +-38 so the lot gets shadows.
- Renderer now uses ACES tone mapping; `label()`, `arrow()`, `addPlaceKey()` and the sky set
  `toneMapped:false` so plate/sign/arrow colours are unchanged.
- One line added to `buildStageGroup` (`mergeStatic(g)`), plus an extra `three/addons/utils/
  BufferGeometryUtils.js` import through the existing import map.

## Deliberately left alone

- `STAGES`, `getUnit`/unit maths, `SQ_LAYOUT`, `PLACE_COLORS`, `splitPlaces`, quiz/prompt/finale/
  accessibility/keyboard code, the DOM and CSS, `POSES`, `SEQ_VIEWS`, `makeTextTexture`/plate typography.
- The Part 1 stair moved from the centre of the façade to run along the wall beyond the right-hand window
  (a rail on the old centred stair would have crossed the 102 plate); the yellow arrows are untouched.

## Known rough edges

- Part 5 front pose: the floor-2 walkway edge still clips the top few centimetres of the 607/608 plates
  from the default (-30, 9, 34) camera, exactly as in the current build; the orbit and Front views are clean.
- Cars are simple box models; they are kept away from the bays in front of doors so they never occlude a
  plate but they are not close-up material.
- Tree crowns are low-poly icosahedra tinted per instance; fine at the distances used.
