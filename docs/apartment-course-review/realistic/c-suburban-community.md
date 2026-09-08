# Direction C — contemporary suburban apartment community

File: `apartment-realistic-c.html` (a copy of `apartment-mockup.html` with only the
visual layer reworked; curriculum, quiz, prompts, accessibility and DOM untouched).

## Inspiration

Building type: the 2000s–2020s US suburban "garden-style" community — two- to
four-storey walk-ups with exterior stairs and open walkways, fibre-cement lap
siding in two body colours with board-and-batten in the gables, white trim,
architectural-shingle gable roofs, white aluminium/vinyl railings, foundation
planting beds, a kerbed asphalt drive with head-in parking, black lampposts and a
fenced dumpster corral at the end of the lot.

Sources looked at (search results; the sandbox proxy blocked fetching the pages
themselves, so only the search summaries and my own knowledge of the type were
used — no single building was copied):

- https://allurausa.com/blog/board-and-batten-fiber-cement-siding — board-and-batten as a gable/dormer/entry accent over lap siding
- https://www.jameshardie.com/blog/explore-exterior-design/mixing-siding-styles-best-combinations-for-a-beautiful-exterior/ — body / accent / trim pairings, where each siding style goes
- https://www.thebuildingcodeforum.com/forum/threads/exterior-stair-at-garden-style-apartments.33718/ — exterior stairs inset between units in one-sided breezeways
- https://www.apartmentguide.com/blog/what-is-a-breezeway/ — the open, roofed breezeway and what sits around it
- https://ez-rails.com/2024/11/19/advantages-of-balcony-railings-for-apartment-complexes/ and https://vinyl-concepts.com/products/vinyl-railings/ — white vinyl/aluminium railing systems on every walkway and landing
- https://github.com/mrdoob/three.js/blob/dev/examples/jsm/environments/RoomEnvironment.js — the procedural environment map used for reflections

## The direction in five bullets

- **Two-tone fibre-cement envelope.** Lower half greige lap siding, upper half
  slate-blue lap, cream board-and-batten gable ends and entry dormer, white
  floor bands / corner boards / skirt / fascia / jambs / sills, and downspouts at
  the corners. Every wall texture is a canvas: each lap board carries a shadow
  under the lip of the one above.
- **Real roofs and real access.** Gabled charcoal-shingle roofs with gutters and
  a ridge cap; the 4-plex gets a gabled entry dormer over its landing. Every
  walkway, landing and stair has a white railing (instanced balusters, end
  posts), steel columns to the ground, concrete treads on black stringers.
- **Doors and windows that read as such.** Six-panel painted doors (canvas
  texture with a lever and kick plate) in white jambs with a wall sconce beside
  each plate; windows are a white frame + sill + mullioned glass that reflects a
  `RoomEnvironment` map.
- **A landscaped site.** Mulch foundation beds with edging, shrubs under the
  windows, concrete stoops at the doors, corner shade trees (small ornamentals
  and rear trees on the deep Part 5 block so nothing sits in a sightline), a
  cluster mailbox on a pad, condensers behind, paths out to the drive.
- **The rest of the community.** Kerbed asphalt drive with faint cracks and an
  old sealant line, a row of striped head-in bays with wheel stops and seven
  parked cars, black lampposts, a bike rack, a fenced dumpster corral, a mulched
  parking island, street trees, and seven simplified neighbour buildings in the
  distance. Golden-hour sun at ~24° for long shadows, ACES tone mapping with a
  warm hazy horizon and fog.

## What changed (all inside the visual layer)

- `COLOR` palette; `box()` now pulls a shared, cached `MeshStandardMaterial`
  per role from `ROLE`/`getMat()` and scales each box's UVs to world units so a
  texture tiles at the same physical size everywhere (`scaleBoxUV`).
- Procedural textures (`TEXTURES`): lap siding, board-and-batten, shingles,
  asphalt, concrete, grass, mulch, door, glass, mailbox.
- Renderer: ACES tone mapping + `RoomEnvironment` PMREM. `label()`, `arrow()`,
  `addPlaceKey()` and the sky use `toneMapped: false`, so plate, banner, badge,
  key and arrow colours are unchanged. Sun / hemisphere / fog / sky re-tuned.
- New builders: `doorUnit` / `doorUnitSide`, `windowUnit` / `windowUnitSide`,
  `gableRoof`, `entryGable`, `railBetween`, `stairFlight`, `landingSlab`,
  `buildBody`, `siteBase`, `shrubs`, `trees`, `neighbour`.
- Reworked: `addWindows`, `addFacadeCommon`, `buildFacade`, `buildShell`,
  `buildTowerShell`, `buildTowerAccess`, `buildTowerFacade`, `buildSlabShell`,
  `buildRowFacade`, `buildBlockFacade`, `buildBlockAccess`, `buildSeqAccess`,
  `buildSeqStructure`, `buildSeqFacade`, ground / road block.
- The Part 1 stair now runs straight out from the landing beside door 102
  (perpendicular to the wall) instead of diagonally across the façade, because a
  handrail on the old diagonal crossed plate 102. Plates, plate positions and
  camera poses are unchanged.
- The drive moved from z≈10 to z=18.5 so the deep Part 5 block no longer sits on
  the road; lawn and entry paths fill the setback.

## Deliberately left alone

`STAGES`, `getUnit`/unit math, `SQ_LAYOUT`, `PLACE_COLORS`, `splitPlaces`, all
quiz / prompt / finale / accessibility / keyboard code, the DOM and CSS,
`POSES` / `frameStage`, `label()` / `makeTextTexture()` plates and their
positions, `addTopBanner`, `addPlaceKey`, the badges and the yellow arrows, the
shadow-map size. The roof overhang on the row and block buildings is kept
shallow (0.6) so the roof never clips the digit key that sits on the roofline.

## Performance

Draw calls per part in the preview (1280×800): ~250 / 250 / 315 / 300 / 445.
Balusters, posts, treads, shrubs, trees, bay lines, wheel stops, wheels and
lamppost parts are instanced; materials and textures are shared per role.

## Known rough edges

- Part 5 is the heaviest stage (~445 calls: 20 doors and windows on four faces).
- The Part 4 side sign and Part 2/4 stair towers stay where they were; the stair
  railings partly overlap the side sign from the default pose, as before.
- Cars are boxy (body + cabin + roof); good enough at the distance they sit.
