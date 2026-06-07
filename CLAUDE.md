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

## Map of `apartment-mockup.html` (~1000 lines, one file)
Structure top-to-bottom:
- **`<style>`** then DOM: `#prompt` (top banner), `#quiz` (right panel),
  `#bottombar` (Back / Continue / Next buttons), `#app` (canvas mount).
- **Import map + module** start (~line 92): Three.js via CDN, then `OrbitControls`.
- **`CONFIG` / geometry constants** (`*W/*D/*FLOORS/*FH`, `*DOORX`): per-part
  building dimensions and door positions.
- **Generic builders:** `box`, `label`, `makeTextTexture`, `setPlateText`,
  `arrow` — reused by every building.
- **Per-part builders:** `build*Shell` / `build*Facade` / `*Access` / `*Arrows`,
  where `*` is the part (tower, row, block).
- **Course stages:** the `stages` array + `buildStageGroup(i)` assemble each
  building; `getUnit(...)` decides each door's number/blank.
- **Quiz logic:** `makeOptions` / `makeTowerOptions` / `makeBigOptions`,
  `openQuiz`, `chooseOption`, `closeQuiz`, `checkComplete` (door plates are
  clickable via raycasting).
- **Flow:** `showStage` / `showNext` / `resetCourse` / `frameStage` drive the
  Back/Continue/Next buttons; `fireConfetti` on completion.

The four parts teach progressively: **(1)** sequential numbering on a 2-story
4-plex → **(2)** 3-digit units where the first digit = floor → **(3)** 4–5 digit
units where leading digit(s) = building → **(4)** everything combined, numbered
around both the front and back faces.

## Previewing
It's a static site, but the import map uses ES modules, so open it over HTTP
rather than `file://` (e.g. `python3 -m http.server` from the repo root, then
visit `index.html`). Opening directly from disk can break module loading.

## Workflow
- Develop on a feature branch; don't commit straight to `main` (it's live).
