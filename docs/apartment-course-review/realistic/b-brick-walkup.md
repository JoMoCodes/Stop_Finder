# Variant B — Midwest brick walk-up

File: `apartment-realistic-b.html` (a copy of `apartment-mockup.html` with only the visual layer reworked).

## Inspiration

Chicago-style two-/three-flats and courtyard walk-ups of the 1910s–1940s: red-brown common brick in running
bond, limestone water tables, sills and lintels, a flat roof behind a brick parapet with stone coping, rear
porches replaced over time by painted steel stairs and walkways, window air-conditioners, downspouts at the
corners, a postage-stamp front yard, gangways and chain-link at the lot line, parkway trees and cars at the kerb.

Pages looked at (search summaries; most sites are blocked from the sandbox for full fetch):

- https://www.architecture.org/online-resources/buildings-of-chicago/two-and-three-flats
- https://blockclubchicago.org/2019/02/18/wait-are-two-flats-only-a-chicago-thing-why-we-remain-obsessed-with-the-uniquely-chicago-home-after-a-century/
- https://moss-design.com/courtyard-apartment/
- http://www.edgewaterhistory.org/ehs/local/courtyard-buildings
- https://www.aaa1masonry.com/lexicon/parapet-wall/
- https://www.imperialbricks.co.uk/guidance/types-of-brick-bonds-and-patterns/

## Direction

- **Brick that reads as brick**: a procedural running-bond canvas (10 x 30 bricks per 2 m tile, per-brick hue/
  lightness variation, the odd clinker and pale brick, raked-joint shadow), tiled per face at true scale.
- **Stone trim everywhere the eye expects it**: water table at the base, belt courses at each floor line, sills and
  lintels on every window, a lintel over each door surround, coping on the parapet.
- **Real access**: concrete walkway slabs on steel columns with painted-steel guard rails (posts, top/bottom rails,
  balusters), switchback stairs with stringers, pan treads, risers and handrails, landings railed on the open sides.
- **A street, not a green plane**: grass mottle, an asphalt road with a dashed centre line and wheel tracks, concrete
  kerbs and sidewalks with control joints, storm drains, a hydrant, parkway trees in tree pits, eight parked cars,
  two street lights, chain-link along the lot lines, mailboxes by the kerb, a dumpster and rooftop bulkhead/vents.
- **Soft overcast light**: cooler hemisphere bounce, a gentler warm sun, a pale grey-blue sky dome with a hazy
  horizon and nearer fog so the neighbouring blocks (fifteen of them, all 100+ m out) fade into the distance.

## What changed (code)

- `COLOR`, lights, sky dome, fog; `ground`/`road` replaced by textured planes + a shared environment batch.
- New helpers after `box()`: `buildTextures()` (brick, concrete, asphalt, grass, limestone, roof membrane,
  chain-link, neighbour façade, 3 window-glass variants, six-panel door), `tbox()` (per-face texture repeat),
  a `Batch` geometry merger (`three/addons/utils/BufferGeometryUtils.js`) so railings/stairs/trim/trees/cars are
  one mesh per material, `railing()`, `stairRun()`, `landingSlab()`, `windowUnit()`, `doorUnit()`,
  `brickShell()`, `chainLink()`.
- Rewritten builders: `addWindows`, `addFacadeCommon`, `buildFacade`, `buildShell`, `buildTowerShell`,
  `buildTowerAccess`, `buildTowerFacade`, `buildSlabShell`, `buildRowFacade`, `buildBlockFacade`,
  `buildBlockAccess`, `buildSeqAccess`, `buildSeqStructure`, `buildSeqFacade`. Doors are now `doorUnit()` meshes
  (textured box, still the clickable mesh carrying `userData.bstate`); plates keep the same `label()` calls,
  sizes and positions. Windows were also added to the previously blank back walls of Parts 2-3.
- Parapet walls sit flush with the wall face so the roof-line signs (place key, banner posts) stay proud of them.

## Left alone on purpose

- `STAGES`, `getUnit`/unit math, `SQ_LAYOUT`, `PLACE_COLORS`, `splitPlaces`, quiz/prompt/finale/accessibility/
  keyboard code, the DOM and CSS, `POSES`, plate typography and `makeTextTexture`, arrows, badges, keys, banners.
- No tone mapping (plate colours unchanged), shadow map size unchanged, no post-processing.
- The Part 1 stair still crosses in front of door 102 (as in the original); it is drawn rail-less with light
  galvanised stringers so the 102 plate and the yellow arrows stay clear.
- Trees, cars and lights are placed outside every default pose's view cone (front, Part 4 back, Part 5 four
  sides); the Part 5 default 3/4 pose keeps a parkway tree as a framing element at the far left.
