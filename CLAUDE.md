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
| `index.html`            | Landing page; one card per course (the menu).           |
| `apartment-mockup.html` | 3D apartment-number course (Three.js). See map below.   |

### Adding a course
1. Create a new `*.html` at the root (copy an existing one as a starting point).
2. Add a card `<a class="card" href="...">` to `index.html`.
3. Keep it dependency-free — CDN import map only, no build step.
4. If the file grows complex, give its folder/area its own `CLAUDE.md` rather
   than expanding this one.

## Map of `apartment-mockup.html` (~2800 lines, one file)
Structure top-to-bottom:
- **`<style>`**: base rules per panel, then `.sr-only` / focus / reduced-motion
  rules, then **all width/orientation media queries at the end** (phone
  portrait ≤640px turns `#quiz` into a bottom sheet; landscape phones;
  `pointer: coarse` tap targets; tablets). Keep new media queries there.
- **DOM**: `#finale` (end-of-course summary), `#app` (canvas mount), sr-only
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
- **Flow + reward:** `checkComplete` / `showNext` / `resetCourse`, `popPlate`,
  `markSolved`, progress bar, `fireConfetti` (per building, cannons at the
  end), `#finale`.
- **Accessibility block:** keyboard map (Tab / Enter / 1-4 / arrows / Home /
  F,B,L,R / Escape), live regions, per-stage scene description and door list.
- **Events on `document`** connect the regions without shared function bodies:
  `stagechange`, `blanksolved`, `quizopen`, `quizclose`. Prefer listening to
  these over editing `showStage` or the quiz functions.

The five parts teach progressively: **(1)** sequential numbering on a 2-story
4-plex → **(2)** 3-digit units where the first digit = floor → **(3)** 4–5 digit
units where leading digit(s) = building → **(4)** everything combined, numbered
around both the front and back faces → **(5)** a single running count around
all four faces of one building — no floor digit at all.

Design rationale for the current look and behaviour lives in
`docs/apartment-course-review/` (reviews → summaries → design docs → QA).

## Previewing
It's a static site, but the import map uses ES modules, so open it over HTTP
rather than `file://` (e.g. `python3 -m http.server` from the repo root, then
visit `index.html`). Opening directly from disk can break module loading.

## Workflow
- Develop on a feature branch; don't commit straight to `main` (it's live).
