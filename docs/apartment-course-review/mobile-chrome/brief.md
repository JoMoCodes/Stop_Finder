# Review brief: the Stop Finder apartment course on phones

## What the product is
Stop Finder is a small static teaching site (plain HTML/CSS/ES-module JS, no build step, GitHub Pages) at
`C:\Users\Jonat\OneDrive\Documents\GitHub\Stop_Finder`. The **apartment course** teaches delivery drivers and
visitors how apartment numbers are structured (building · floor · door) by letting the learner fill in blank
number plates on 3D buildings (Three.js). Read `CLAUDE.md` in the repo root first (sections "Files / courses",
"The three realistic looks" and "Map of apartment-mockup.html").

Four files carry the same course with different 3D art: `apartment-mockup.html` (Classic),
`apartment-realistic-a.html` (Sunbelt), `-b` (Brick), `-c` (Suburban). Their CSS, DOM and course/UI JavaScript
are byte-identical (verified), so any UI change is made in all four. `report.js` renders the end-of-run report
and `track.js` sends anonymous analytics; neither needs changing for a UI change.

Where the UI lives in `apartment-mockup.html` (line numbers approximate):
- `<style>` lines 7-388: base panel rules, then ALL width/orientation media queries at the end
  (`(pointer: coarse)` line 278, tablets 287, phone portrait `(max-width: 640px)` 295, `(max-width: 360px)` 346,
  phone landscape `(max-height: 520px) and (orientation: landscape)` 352).
- DOM lines 389-502: `#finale`, `#app` (canvas), `#prompt`, `#quiz`, `#viewbar`, `#minimap`, `#jumpbar` (part buttons 1-5 +
  `#progress`), `#doorsleft`, `#draghint`, `#helpbtn`, `#lookbar` (Home + Appearance, with its own 15-line inline script),
  `#bottombar` (`#back`, `#continue`, `#next`), `#resetview`.
- `STAGES` (line 1357): 14 buildings in 5 parts; each part opens with a `kind: 'example'` worked example (the
  "tutorial"), the rest are `kind: 'quiz'`.
- `PROMPTS` / `promptFor` / `setPrompt` (1667-1742): headline + body (+ a `short` body used at 640px wide or less).
- Camera: `POSES`, `PORTRAIT_BACKOFF = 1.55`, `poseFor`, `applyViewportFov`, `flyTo`, `frameStage` (1756-1885).
- `showStage` (1925), quiz (`openQuiz` / `chooseOption` / `closeQuiz`, 2072-2135), `checkComplete` / `showNext`
  (2136-2172), progress bar `updateProgress` (2227), finale, `resetCourse`, button handlers (2306-2340).
- Discoverability block (halos, `#doorsleft` chip, drag hint, `?` button) about 2380-2560; accessibility block after it.
- Events on `document`: `stagechange`, `blanksolved`, `quizopen`, `quizclose`, `answer`, `stagecomplete`,
  `coursecomplete`, `coursereset`, `partreset`. New UI behaviour should listen to these rather than edit the core functions.

Earlier design history (worth skimming, not re-litigating): `docs/apartment-course-review/design/06-responsive-mobile-layout.md`
(the current phone layout and its rationale), `04-prompt-banner-content.md`, `08-discoverability-affordance.md`,
`10-reward-progress-flow.md`. The Houses course (`houses.html`) already collapses its prompt to the title and hides the jump bar,
chip and hint on phones while a quiz is open (`body.quiz-open`, see its CSS about line 345 and JS about line 1927), a precedent to consider.

## The owner's asks (verbatim)
1. "i want the Ui for the apartment complex course to feel more compact for mobile viewing landscape or portrait mode but not so much that they lose ease of use"
2. "Would some of the ui be better served as hidden once the course starts? so the user has to click something for the home, and appearance button to appear?"
3. "When a part of the course is completed the course progress bar and buttons show for a brief moment before going out of sight? when they're in the tutorial sections they should stay in place"
4. "i don't think the user needs the course description once they leave the tutorial sections"
5. "on sunbelt course 4 mobile portrait view the camera position at the start is too zoomed out causing a non course building to obstruct the view of the course building"

Reading notes on the asks (from the coordinating engineer, not the owner):
- "tutorial sections" = the worked-example building that opens each part (`kind: 'example'`, where the only action is `Next ▸`).
- Ask 3 is ambiguous: "the course progress bar and buttons" most likely means the `#jumpbar` (the five part buttons with the
  progress bar under them); it could also include the `◀ Back` / `Next ▸` bottom bar. Say which reading you recommend and why.
- Ask 5 is confirmed and diagnosed: in portrait the camera for the Part 4 block stage is pulled back 1.55x along its view ray to
  about (15.5, 8.6, 65) and that point is *inside* a decorative neighbour building of the Sunbelt look (placed at x=24, z about 63,
  22 wide, 10 deep, 3 floors), so the screen shows a stucco wall with a window. Also, in portrait every stage uses the same
  1.55x back-off tuned for the widest building (the Part 3 row), so the smaller buildings look small: the Part 1 4-plex is
  about 110 px tall on an 812 px screen and the Part 4 block about 125 px, with plates too small to read without zooming.
  Camera code is shared by all four looks; the neighbour placement is Sunbelt-only.

## Measurements and how to play
- `BASELINE.md` (same folder): measured positions/sizes of every panel at 375x812 portrait, 812x375 landscape and desktop, with notes.
- `PLAYBOOK.md` (same folder): how to load the pages in the Browser pane and play the course.

## Rules for every reviewer
- Do **not** edit, create or delete anything inside the repo, and do not run git. Your deliverable is a written review.
- Write the review as Markdown to the output path you were given (create the file with the Write tool), and also return it
  as your final message. Be concrete: name elements by id, give pixel values, breakpoints and behaviours, not vibes.
- Keep the curriculum (STAGES, the numbers, the wrong-answer logic) out of scope; the UI, layout, motion, copy placement and
  camera framing are in scope.
