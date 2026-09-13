# Stop Finder

A small, **static** teaching site about address- and apartment-numbering
patterns. Interactive "courses" let a learner decode a unit/house number into
its parts (building · floor · door). Served as-is by **GitHub Pages** — there is
no build step, no framework, and no package manager.

## Constraints (don't break these)
- **No build / no bundler / no npm.** Plain HTML + CSS + ES-module JS only.
- **Dependencies come from a CDN import map**, not `node_modules`. The 3D course
  loads Three.js this way (`three` + `three/addons/`). Keep that pattern.
- **Keep `.nojekyll`** — it tells GitHub Pages to serve files untouched.
- `main` deploys straight to Pages, so anything merged there goes live.

## Files / courses
Each course is a **self-contained `*.html` file** at the repo root, registered as
a card in `index.html`. The detail of how a course works lives in its own file.

| File                    | What it is                                              |
|-------------------------|---------------------------------------------------------|
| `index.html`            | Landing page (the menu). One **Apartments** card fans out the three realistic looks on hover / focus / tap; the classic look is reached from a course's `#lookbar` Appearance menu. |
| `apartment-mockup.html` | 3D apartment-number course, **classic look** (Three.js). See map below. |
| `apartment-realistic-a.html` | Same course, **Sunbelt garden-style** look (brick/stucco, breezeway railings, parking, warm low sun). |
| `apartment-realistic-b.html` | Same course, **Midwest brick walk-up** look (procedural brick, stone trim, steel stairs, a street with cars and neighbours). |
| `apartment-realistic-c.html` | Same course, **contemporary suburban** look (lap siding, white railings, landscaping, golden hour, environment reflections). |
| `houses.html`           | **Houses** course: house-numbering patterns taught in a **Street View** style scene (Three.js). The learner stands at eye height on the road, drags to look round and walks between viewpoints. One look only. See map below and `docs/houses-course/README.md`. |
| `track.js`              | Course run tracking, shared by every page: listens to the course's `document` events and sends anonymous events to Umami. Setup and the event list: `docs/tracking.md`. |
| `report.js`             | The end-of-run report, shared by every course page: listens to the same `document` events, keeps the run record (per question / building / part, on an active clock), and renders the report into the `#finale` dialog when the course completes. The apartment curriculum is its default; another course describes itself through the exported `configure()` (titles, digit places, copy, `stageName` / `maskFor` / `splitPlaces`) — `houses.html` does this. What it shows, the grade model and the copy: `docs/report.md`; the design reviews it came from: `docs/run-report/`. |

### The three realistic looks
Each `apartment-realistic-*.html` is a copy of `apartment-mockup.html` with **only the
visual layer** reworked (colours, materials, procedural canvas textures, lighting,
sky, ground/road, the `build*Shell` / `build*Facade` / `*Access` builders, plus
environment props). The `STAGES` array, unit math, quiz, prompts, finale shell, DOM,
CSS and accessibility code are identical across all four files, so a curriculum
change has to be applied to all four (the report's contents live in the shared
`report.js`, so a report change is made once). Each course page carries a `#lookbar`
site bar on every layout: a prominent amber **Home** button (the only Home
control; it links to the live site `https://jomocodes.github.io/Stop_Finder/`)
plus a compact **Appearance** button whose four looks drop out on hover / tap /
Enter. Desktop: bottom right, menu opens upward. Portrait phones: a stacked
two-row list at the bottom left, menu opens upward. Landscape phones: top
right, menu opens downward. A small inline script after the nav handles
open / close.
Design notes and inspiration sources: `docs/apartment-course-review/realistic/`.

### Adding a course
1. Create a new `*.html` at the root (copy an existing one as a starting point).
2. Add a card `<a class="card" href="...">` to `index.html` (or a new option
   inside the Apartments card if it is another look of that course).
3. Keep it dependency-free — CDN import map only, no build step.
4. If the file grows complex, give its folder/area its own `CLAUDE.md` rather
   than expanding this one.

## Map of `apartment-mockup.html` (~2800 lines, one file)
Structure top-to-bottom:
- **`<style>`**: base rules per panel, then `.sr-only` / focus / reduced-motion
  rules, then **all width/orientation media queries at the end** (phone
  portrait ≤640px turns `#quiz` into a bottom sheet; landscape phones;
  `pointer: coarse` tap targets; tablets). Keep new media queries there.
- **DOM**: `#finale` (the end-of-run report dialog: an empty `#report` that
  `report.js` fills, plus the `#fagain` / `#fclose` buttons the course wires),
  `#app` (canvas mount), sr-only
  `#scene-desc` / `#doorlist`, `#prompt` (top banner), `#quiz` (options panel
  with `#qclose` / `#qkey`), `#viewbar` (Part 5 Front/Back/Left/Right),
  `#minimap` (Part 5 top-down map), `#jumpbar` (parts 1-5 + `#progress`),
  `#doorsleft` / `#draghint` / `#helpbtn`, `#bottombar` (Back / Next),
  `#resetview`.
- **Import map + module** start: Three.js via CDN, then `OrbitControls`.
- **`CONFIG` / `COLOR` / geometry constants** (`*W/*D/*FLOORS/*FH`, `*DOORX`,
  `SQ_LAYOUT`), then `PLACE_COLORS` + `splitPlaces()` (building / floor / door
  digit colours, shared by the quiz, prompt and digit keys).
- **Scene setup:** renderer with shadow map, sky dome, fog, sun + hemisphere
  lights, textured ground and road.
- **Generic builders:** `box` (casts/receives shadows), plate typography
  constants, `makeTextTexture` (fit-to-width numerals, dashed frames for
  blanks), `label`, `setPlateText`, `arrow`.
- **Per-part builders:** `build*Shell` / `build*Facade` / `*Access`, signs and
  banners (`addTopBanner`, `addBlockSideSigns`), wayfinding guides
  (`addArrows`, `addTowerArrows`, `addPlaceKey`, `addRowGuides`,
  `addBlockGuides`), where `*` is the part (tower, row, block, seq).
- **Course stages:** the `STAGES` array + `buildStageGroup(i)`; `getUnit(...)`
  decides each door's number/blank. **`STAGES` and the unit math are the
  curriculum; change them deliberately.**
- **UI + state:** `ui`, mini-map drawing, jump-bar wiring, `ResizeObserver`
  publishing `--prompt-h`, the `PROMPTS` table + `setPrompt` (headline + body
  + phone-short variant), `POSES` + `frameStage` / `flyTo` / `setSeqView` /
  `resetView` / `orbitBy` (eased camera).
- **Quiz logic:** `openQuiz` / `chooseOption` (per-digit-place explanations
  on a wrong pick) / `closeQuiz`; door plates are clickable via raycasting,
  with hover tint, pulsing halos and `pickBlank()` for precision.
- **Flow + reward:** `checkComplete` / `showNext` / `resetCourse` /
  `retryPart` (rebuilds one part for the report's "Try Part N again"),
  `popPlate`, `markSolved`, progress bar, `fireConfetti` (per building,
  cannons at the end), `fireFinale` (dispatches `coursecomplete`, then shows
  `#finale`; the report inside it is rendered by `report.js`).
- **Accessibility block:** keyboard map (Tab / Enter / 1-4 / arrows / Home /
  F,B,L,R / Escape), live regions, per-stage scene description and door list.
- **Events on `document`** connect the regions without shared function bodies:
  `stagechange`, `blanksolved`, `quizopen`, `quizclose`, `answer`,
  `stagecomplete`, `coursecomplete`, `coursereset`, `partreset` (after
  `retryPart`), and inbound `retrypart` (the report asking for a part reset).
  Prefer listening to these over editing `showStage` or the quiz functions
  (`track.js` and `report.js` do).

The five parts teach progressively: **(1)** sequential numbering on a 2-story
4-plex → **(2)** 3-digit units where the first digit = floor → **(3)** 4–5 digit
units where leading digit(s) = building → **(4)** everything combined, numbered
around both the front and back faces → **(5)** a single running count around
all four faces of one building — no floor digit at all.

The Houses course's five parts: **(1)** odd numbers on one side, even on the
other → **(2)** numbers rise away from the start of the street → **(3)** each
cross street starts a new hundred (leading digits = block) → **(4)** gaps are
normal: numbers measure distance, not houses → **(5)** round a court the two
sides meet at the far end (plus one court that counts round in a single run).

Design rationale for the current look and behaviour lives in
`docs/apartment-course-review/` (reviews → summaries → design docs → QA).

## Map of `houses.html` (~2700 lines, one file)
Same skeleton as the apartment course (same panel ids, same `document` events, so
`track.js` and `report.js` need no page-specific code), with these differences:
- **Camera** is first-person: `look` (yaw / pitch / fov) with drag-to-look, inertia,
  wheel / pinch zoom; `walkTo(node)` steps between **viewpoints** (`layout.nodes`,
  each with `links` to its neighbours and a default `heading`). Walking: the
  chevrons on the road (`placeChevrons`), the `#viewbar` walk bar (turn · walk ·
  turn), the `#minimap` dots, double-click / click on the road, arrow keys / WASD.
  `resetView` faces down the street again (Home key, `#resetview` chip).
- **Layouts**: `layoutStreet(st)` (cross street · block · cross street …, lots as
  wide as their number step) and `layoutCourt(st)` (main street, entrance, bulb).
  `buildHouse` draws one house in a local frame (front wall at the origin, local +z
  toward the road) with the number on a plate over the door **and** on the mailbox
  (`bstate.plates`); a blank house's whole body is clickable.
- **`STAGES`** (15 streets, 3 per part) and `makeOptionsFor` are the curriculum:
  each wrong option breaks exactly one rule (other side · wrong hundred · wrong spot),
  and on the gap streets the wrong spot is outside the visible neighbours. The
  quiz's `answer` event carries the broken rule as `place` (`block` / `side` / `lot`).
- Console handle for checking without a mouse: `sfHouses.go(i)`, `.walk(n)`,
  `.face(deg)`, `.open(k)`, `.solve()`.
- Design notes and the numbering patterns taught: `docs/houses-course/README.md`.

## Previewing
It's a static site, but the import map uses ES modules, so open it over HTTP
rather than `file://` (e.g. `python3 -m http.server` from the repo root, then
visit `index.html`). Opening directly from disk can break module loading.

## Workflow
- Commit each iteration straight to `main` (it deploys live to Pages) unless the
  owner says otherwise for a given change.
