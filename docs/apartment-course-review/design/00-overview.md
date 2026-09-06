# 00 — Overview: ten parallel design docs for `apartment-mockup.html`

Ten implementation teams edit **one 1250-line file** in parallel. These docs partition
the file so the ten diffs merge cleanly. Read this page, then your own doc. If your
doc says "do not touch X", that is not advice — another team is editing X right now.

## The ten docs (one-line goals)

| # | Doc | Goal |
|---|-----|------|
| 01 | Lighting, shadows, materials, sky/ground | Depth and atmosphere on the *environment*; door plates stay fully lit and unshadowed. |
| 02 | Camera framing, transitions, orbit limits, Reset view | 350 ms eased cuts, portrait-aware framing, orbit guardrails, a "Reset view" chip, `orbitBy()` for keyboard. |
| 03 | Door plates, signs, banners | Real font stack, fit-to-width numerals, sharper textures, a non-colour blank style, banner anchored to the roof, kill "Building #". |
| 04 | Prompt banner content | Headline + body structure, ~40 % fewer words, plain language, one button verb ("Next"). |
| 05 | Quiz panel | Tabular numerals coloured by digit place, wrong answers explain *why*, close button, longer/adaptive auto-close. |
| 06 | Responsive & mobile layout | Bottom-sheet quiz, reflowed jump bar / walk-around, prompt scaling, landscape, coarse-pointer targets. |
| 07 | Accessibility | Keyboard for doors/options/camera, focus styles, ARIA/live regions, reduced motion, verified contrast. |
| 08 | Discoverability in the 3D scene | Pointer cursor + hover tint, pulsing halo on unsolved blanks, "N doors left" chip, first-run drag hint, "?" help. |
| 09 | Wayfinding cues for the pattern | One colour per digit place across the course, better arrows/badges, digit key on Parts 3–4, Part 5 top-down mini-map with "you are here". |
| 10 | Reward, progress and flow | Plate pop + solved dot per answer, 14-segment progress bar, completion summary, reduced-motion-safe confetti, Start over. |

## Ownership map of the file

Line numbers refer to the current `main`. Anchors are named by unique existing text so
they survive other teams' edits.

### `<style>` block

| Region (current lines) | Owner | Others |
|---|---|---|
| `:root`, `*`, `html,body`, `#app`, `canvas`, `.hidden` (8–13) | nobody edits | 07 **inserts** its new rules immediately after the `.hidden` line |
| `/* top prompt */ #prompt …` (15–24) | **04** | 06 may override in `@media` only |
| `/* buttons */ button … button.ghost:hover` (26–38) | **10** (base button look) | 02 **inserts** `#resetview`, `.vbtn.active` immediately after `button.ghost:hover` |
| `#bottombar` (40–44) | **10** | 08 **inserts** `#doorsleft`, `#draghint`, `#helpbtn` immediately after the `#bottombar {…}` block |
| `#viewbar …` (46–55) | 07 owns the `button.vbtn` size line (55); the rest is **02** | 09 **inserts** `:root{--c-*}`, `#minimap`, `.pl-*` immediately after line 55 |
| `#jumpbar …` (57–70) | 07 owns `button.jbtn` sizes (66–69); the rest is **10** | 10 **inserts** `#progress`, `#finale` after `.jbtn.active` |
| `#quiz … #qmsg.bad`, `@keyframes shake` (72–97) | **05** | 06 overrides `#quiz` position in `@media` only; 07 overrides shake in reduced-motion only |
| end of `<style>` | **06** appends every `@media (max-width…)`, `(orientation…)`, `(pointer: coarse)` block | nobody else writes width/orientation media queries |

### DOM (`<body>`)

| Element | Owner | Insertion rule |
|---|---|---|
| `<meta name="viewport">` | **06** | edit in place |
| `#finale` (new) | **10** | first child of `<body>`, before `#app` |
| `#app` | nobody | — |
| `#scene-desc`, `#doorlist` (new, sr-only) | **07** | immediately after `<div id="app"></div>` |
| `#prompt` | **04** owns its innerHTML (set from JS); **07** may add attributes to the tag | 04 must not change the HTML tag; 07 must not change content |
| `#quiz` and children | **05** owns children (`#qclose`, `#qkey` new; `#qhead`, `#qopts`, `#qmsg`) | **07** adds attributes only (`role`, `aria-*`) to `#quiz` and `#qmsg` |
| `#viewbar` | **02** owns the four `data-view` buttons | 07 adds `role`/`aria-label` to the container |
| `#minimap` (new) | **09** | immediately after `#viewbar`'s closing `</div>` |
| `#jumpbar` | **10** owns `.jbtitle` text and adds `#progress` as last child | 07 adds `aria-label` on each `.jbtn` and the container |
| `#doorsleft`, `#draghint`, `#helpbtn` (new) | **08** | immediately before `<div id="bottombar">`, in that order |
| `#bottombar` and its three buttons | **10** (labels come from doc 04's table) | 07 adds `role="group"` |
| `#resetview` (new) | **02** | immediately after `#bottombar`'s closing `</div>` |

### `<script type="module">`

| Region (current lines) | Owner | Notes |
|---|---|---|
| `CONFIG`, geometry constants, `SQ_LAYOUT` (159–227) | **nobody** (curriculum) | `COLOR` **values** belong to 01, except `COLOR.arrow` (09) |
| after `const COLOR = {…};` | **09** inserts `PLACE_COLORS`, `splitPlaces()` | |
| scene, camera, renderer, lights (230–249) | **01** (renderer options, lights, background, fog, sky dome, ground noise) | 02 owns the `controls.*` lines 241–243 only |
| `box()` (252–258) | **01** | callers untouched |
| before `function makeTextTexture` | **03** inserts font/texture constants | |
| `makeTextTexture`, `label`, `setPlateText` (259–277) | **03** | |
| `arrow()` (280–294) | **09** | |
| `addWindows`, `addFacadeCommon`, `buildFacade`, `buildShell`, all `build*`/`*Access` | **nobody** — *except*: the sign `label(...)` calls inside `buildShell`, `buildTowerShell`, `buildSeqStructure` (03); `addArrows`, `addTowerArrows` (09) | 09 inserts new guide functions immediately after `addTowerArrows` |
| `addTopBanner`, `BANNER_OPTS`, `addBlockSideSigns` | **03** | |
| `STAGES`, `makeOptions`, `makeTowerOptions`, `makeBigOptions`, `shuffle`, `blockUnit` | **nobody** | curriculum + distractors are out of scope |
| `buildStageGroup` | **09** may add `if (st.kind==='example') addRowGuides(g)` / `addBlockGuides(g)` calls; **03** owns the `'Building #'` literal | 09 and 03 edit adjacent lines in the `row` branch — see merge notes |
| `ui = {…}` (917–927) | **nobody adds properties**. Each doc looks up its own new elements with `document.getElementById` in its own block | |
| viewbar wiring (928–929) | 02 | 09 inserts its mini-map block immediately after line 929 |
| jump wiring (931–936) | 10 | 06 inserts its `ResizeObserver` block immediately after line 936 |
| `EXAMPLE*_PROMPT` (938–969) | **04** (replaced by a `PROMPTS` table + `setPrompt`) | |
| `frameStage`, `setSeqView` (980–1008) | **02** | 02 inserts `flyTo`, `resetView`, `orbitBy`, `introSwing` after `setSeqView` |
| `doorsSolved`, `allSolved` | **10** | |
| `showStage` (1022–1071) | body split: **04** owns lines 1036–1063 (prompt + button labels); **10** owns the final line (adds the `stagechange` dispatch) | nobody else edits it — subscribe to `stagechange` |
| `resumeQuizState` | **10**, except its `ui.prompt.innerHTML` line (04) | |
| `openQuiz`, `chooseOption`, `closeQuiz` (1087–1128) | **05** | 05 inserts helpers before `openQuiz`; 05 changes `checkComplete()` → `checkComplete(bstate)` and dispatches `quizopen`/`quizclose` |
| `checkComplete`, `showNext`, `resetCourse`, button handlers (1130–1173) | **10**, except the `ui.prompt.innerHTML` line inside `checkComplete` (04) | 10 inserts `popPlate`, `markSolved`, `updateProgress`, finale code after `showNext` |
| pointer handlers (1175–1192) | **08** | 08 inserts hover/halo/hint block after them, before the confetti comment |
| confetti (1194–1232) | **10** | |
| before `/* … loop + resize` comment | **07** inserts its whole a11y block | |
| `resize` handler + `tick()` (1237–1248) | **02** | 08, 09, 10 run their own `requestAnimationFrame` loops or listen to `controls` `'change'` — do not edit `tick` |
| `showStage(0);` | nobody | all listeners must be registered *before* this line — they are, if you use your anchor |

## Event contract (how docs talk without sharing functions)

All events are `CustomEvent`s dispatched on `document`.

| Event | Dispatched by | `detail` | Listened by |
|---|---|---|---|
| `stagechange` | 10, last line of `showStage` | `{ index, stage }` | 07 (scene description, door list), 08 (halos, doors-left, hint), 09 (mini-map show/hide), 10 (progress) |
| `blanksolved` | 10, inside `checkComplete(bstate)` | `{ bstate, index }` — also fired when the building-name step is solved | 07 (door list), 08 (remove halo, doors-left), 09 (mini-map fill) |
| `quizopen` | 05, end of `openQuiz` | `{ bstate }` | 07 (move focus) |
| `quizclose` | 05, end of `closeQuiz` | `{}` | 07 (restore focus) |

## Shared conventions

- **Guard every cross-doc call**: `if (typeof splitPlaces === 'function') …`. Function declarations are hoisted in the module, so the guard is safe regardless of merge order.
- **CSS variables with fallbacks**: `var(--c-floor, #7cc4ff)`. Doc 09 defines them; everyone else consumes with a fallback.
- **Reduced motion**: every doc that animates (02, 05, 08, 10) checks `matchMedia('(prefers-reduced-motion: reduce)').matches` itself. Doc 07 only adds the CSS blanket and *verifies*.
- **No new `ui.*` properties.** No renaming of existing ids (`continue`, `next`, `back`, `quiz`, …).
- **Button vocabulary (docs 04 + 10 must agree)**: `#continue` is always `Next ▸`; `#next` is `Next ▸`, or `Next: Part N ▸` when the next stage is an example, or — on the last stage — `Start over ▸` once every stage is complete, else `Finish Part N ▸` (jumping to the first incomplete stage); `#back` is `◀ Back`. Prompts say "press **Next**".
- **Digit-place colours (docs 03/04/05/09/10 must agree)**: building `#f28c6a`, floor `#7cc4ff`, door `#eef2f6`, reading-order/path `#ffd54a`. Plates in 3D stay monochrome (dark on white); colours appear in the quiz options, the prompt, the digit keys and the badges.
- **Constraints are absolute**: one file, no build, no npm, Three.js from the existing import map only, `.nojekyll` stays, works over `python3 -m http.server`.

## Expected merge friction (ranked)

1. **06 ↔ 05** — both write `#quiz` CSS (05 base rules, 06 media overrides). Clean if 06 stays inside `@media`.
2. **04 ↔ 10** — both edit `showStage`, `checkComplete`, `resumeQuizState` on different lines. Git will probably conflict; resolution is mechanical (keep both).
3. **09 ↔ 03** — adjacent edits in `buildStageGroup`'s `row` branch.
4. **07 ↔ 05** — same `#quiz` tag: 07 adds attributes, 05 adds children.
5. **02 ↔ 07** — 07 calls `orbitBy`/`resetView`; guard with `typeof`.
