# The Houses course looks

Four files, one course. `houses.html` is the **classic** look (flat colours, the
original build). Each `houses-realistic-*.html` is a copy of it in which only the
visual layer is replaced — the segments listed under *What a look replaces* — so
the twelve streets, the quiz, the Street View camera and its number framing,
the map, the report wiring, the Appearance bar and the accessibility code are
byte-identical across the four files. A curriculum or UI change is made in
`houses.html` and then applied to the other three; a look change stays inside
one file.

## What a look replaces

In order of appearance in the file:

1. the `COLOR` table;
2. the renderer (the realistic looks use ACES tone mapping — plates, signs,
   arrows, chevrons, halos and the sky opt out with `toneMapped: false`), the
   lights, `SUN_OFFSET` / `aimSun`, the sky dome, fog, and any horizon dressing
   (mountains, cloud sprites);
3. the helpers: `mat` / `box` / `slab` keep their signatures, joined by the
   procedural textures (`tex*`, a `TEX` registry of *metres per tile*), the
   shared-material cache (`shared`, `texMat`), `tbox` (a box whose texture tiles
   in metres on every face), the roof builders and `mergeGroup`;
4. the ground and `roadMat`;
5. the street furniture builders: `buildRoad`, `buildCrossStreet`,
   `buildSignPole` (unchanged), the look's trees and plants (`buildTree`,
   `buildShrubs` keep their names so the shared code can call them), `buildCar`,
   lamps, hydrants, walls;
6. `buildHouse` — the plate positions may differ per look, but every house still
   returns `{ group, plates: [doorPlate, kerbPlate] }` (just the door plate when
   `styleHint.mailbox` is false, as on the courts), marks its lawn or yard
   slab with `userData.lawn` (excluded from picking) and its plates with
   `userData.keep` (never merged);
7. `buildWalks` / `buildRoadZ`;
8. `buildStreetScene` / `buildCourtScene` — the environment changes, the guide
   boards, arrows and place keys inside them do not.

`buildStageGroup` gains one line, `mergeGroup(g, o => o.userData.house !== undefined)`,
and `disposeGroup` leaves shared materials alone.

## Performance

Every colour and every texture is one shared `MeshStandardMaterial`; textures are
canvases tiled in metres through the geometry's uvs rather than cloned per mesh;
each house is merged into one mesh per material (`mergeGroup`, via
`BufferGeometryUtils`), and so is the rest of a stage (roads, walks, trees, cars,
the `decor` houses beyond the course). Measured with `sfHouses.info()` in headless
Chromium, including the shadow pass: 250–330 draw calls on the first street of
each look, about 100 once the shadow box has settled on a later street.

## A · Sunbelt (`houses-realistic-a.html`)

A Phoenix / Tucson / inland-California subdivision. Single-storey stucco ranch
houses (a fifth two-storey) in ten desert tints, low clay-tile hip roofs with a
soffit and fascia, or a pueblo-style parapet with canales on a quarter of them;
a covered entry on two stucco columns with the framed number over the door;
bronze-framed windows in stucco pop-outs with blinds; a two-car garage pushed
forward with a panelled door and a wide concrete drive; decomposed-granite
yards (a lawn patch on a third), agaves, barrel cacti and the odd saguaro, fan
palms with a dead-frond skirt and palo verdes; concrete-block walls between the
lots and across the back, a low stucco wall along some fronts; a stucco pillar
mailbox at the kerb carrying the second plate. The street is bleached asphalt
with a concrete gutter and no centre line; light-coloured sedans, SUVs and
pickups; a high hard sun, a deep-blue-to-haze sky, two ragged mountain ridges
in the haze, thin clouds.

## B · Brick (`houses-realistic-b.html`)

An older Midwest neighbourhood — a Chicago bungalow belt, a Milwaukee streetcar
suburb. Three house types on running-bond brick in four colours with limestone
sills, lintels and a water table: the **bungalow** (one storey, a steep hip roof
with a front dormer, a wide picture window, a brick stoop under a small gabled
hood, the number on the wall beside the door), the **foursquare** (two storeys,
hip roof and dormer) and the **gable-front** (two storeys, the gable end in
brick) — the last two with a full-width porch on brick piers and tapered
columns, a railing and a hip porch roof, the number on the porch beam. Every
lot has a side drive to a detached brick garage at the back and a wood fence
down the lot line. The sidewalk sits beyond a grass parkway in which mature
maples in five autumn colours stand, dropping leaves on the lawns and the road;
foundation yews, sometimes a hedge; a yard lamp post by the walk hangs the
second plate. Dark patched asphalt with wheel tracks, a fire hydrant and a
cobra-head lamp at each crossing, muted sedans and SUVs, a low crisp autumn
sun with long shadows, a pale sky with streaks of high cloud.

## C · Suburban (`houses-realistic-c.html`)

A new-build subdivision (Texas, the Carolinas, the Mountain West). Two-storey
houses (a fifth ranches) in lap siding on a stone-veneer water table, a hip
roof over the body, the two-car garage pushed forward under its own
front-facing gable in board-and-batten with a stone base, a carriage-style
door and a gable vent; a gabled entry porch on square columns over stone piers,
a craftsman door with a top light and sidelights, the framed number over it;
black sash windows with a grid in white trim. Fresh sod with mowing stripes,
a mulch bed of boxwood balls under the front window, a young staked tree, a
lamp post by the walk on half the lots, a privacy fence down the lot line; a
black mailbox on a post at the kerb with the second plate on a plaque under
the box. Fresh dark asphalt with a bright kerb-and-gutter, decorative acorn
lamp posts at the crossings and mid-block, a hydrant, white / silver / black
SUVs and pickups; a golden-hour sun low in a peach-to-blue sky with soft
clouds.

## Plate placement and sight lines

The framing code walks to the viewpoint in front of a house and looks at its
door plate, so nothing in a look may stand on that line: trees go on the far
side of the front path or on the driveway side, palms at the lot corner, and
porch beams sit above the plate (the plate is at 2.6–3.0 m; the line of sight
from a viewer 1.65 m up on the road passes the porch front at about 2.5–2.9 m).
The kerb plate (mailbox, pillar or lamp post) is always closer to the road than
the door and never behind a hedge or a parked car (`buildStreetScene` keeps cars
away from a blank house's kerb).

## Left alone on purpose

`STAGES`, `layoutStreet` / `layoutCourt`, `makeOptionsFor`, the plate
typography (`makeTextTexture`), the halos, the chevrons, `PLACE_COLORS`, the
prompts, the quiz, the camera, `frameHouse` and friends, the map, the report
configuration, the DOM and CSS.

## Known rough edges

- Trees and shrubs are low-poly icosahedra and spheres; palms are alpha-tested
  planes. Fine at street distances, plain up close.
- Cars are box models, kept away from the bays in front of blank houses.
- The `decor` houses beyond the course reuse `buildHouse` without plates; a
  stage's first build takes a little longer than the classic look's
  (procedural textures are made once per page, houses once per stage).
