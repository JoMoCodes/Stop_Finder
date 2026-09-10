<!-- In-character design review, written against docs/run-report/brief.md. Teo Lindqvist: data-visualisation and interface designer. What was taken from it is listed in docs/report.md. -->

# End-of-run report — spec (Teo Lindqvist)

Replaces `#finale`. Same dialog, same two ids, one new button. Everything below is computable from the
`document` events the course already fires (`stagechange`, `quizopen`, `answer`, `quizclose`,
`blanksolved`, `stagecomplete`, `coursecomplete`, `coursereset`) plus `visibilitychange` — build the
run record the way `track.js` does, in a listener, and never touch `chooseOption` / `openQuiz`.

## 1. Principles
- **One hero number, and it is the honest one.** First-try answers out of questions. Not "correct ÷ picks"
  (a 4-option quiz makes that meaningless), not a letter, not stars, not a percentage.
- **Every number is a fact the learner can act on.** If a figure cannot change what they do next
  (device, hint count, view resets) it is analytics, and it goes to Umami via `track.js`, not on screen.
- **Comparisons make numbers mean something.** Each part against the others; each door against the
  learner's own median. Never against an invented "average learner" — we have no such data.
- **Bars are decoration for numbers, never a replacement.** Zero-based, one scale per column, the
  figure printed beside every bar, `aria-hidden` on the bar, the number in real text.
- **It must never grade the person.** No headline that says "great" or "poor". The number is the grade.
- **Nothing animates over the data.** Confetti finishes before the report is on screen.

## 2. Information hierarchy
1. **First glance (≤ 3 s):** hero `41 of 53 first try`, one sub-line telling them which part to redo.
2. **Second (≤ 10 s):** three supporting figures — time, wrong picks, best streak — and, if any
   misses, one line naming the digit place that caused most of them (in its course colour).
3. **Third (≤ 20 s):** the five-part table: first-try bar + count, time, pace. Weakest part marked.
4. **Behind one `<details>` ("Every door, by building"):** nine building rows, each with its
   questions as chips (number, time, wrong-pick count, missed place), the slowest door named, plus
   one run-facts line (reading time, away time).
5. **Left out, and why:** hints shown, `?` opens, view resets, part jumps, device, input type,
   reduced-motion flag — none of them change what the learner should do next. Open/close count per
   question — same. Wall-clock time — shown only as the "away" remainder so active time stays the
   figure. Per-part reading-vs-quiz split — one run-level reading figure is enough.

## 3. The grade model
- `N` = questions answered this run (53 on a full run; use the actual count). A question is one
  `bstate`; a closed-and-reopened door is still one question. The two roof-sign "name the building"
  steps (`answer.detail.type === 'building'`) count as ordinary questions, digit place = building.
- `FT` = questions with `wrongCount === 0` (first pick correct). `W` = Σ `wrongCount` (0–3 each).
- `r = FT / N`. **The hero is `FT of N first try`, never `r` as a percentage** — 53 is a number a person
  can picture; 77 % is not. The 4-option floor is handled by construction: a door reached on the 4th
  pick is simply "not first try" and shows `×3`; the floor never inflates anything.
- Bands (internal, used only to pick the sub-line): `r = 1` → clean; `r ≥ .85` → good;
  `r ≥ .65` → landing; else → lap. Weakest part `p` = lowest `FT_p / N_p`; tie → more wrong picks;
  still tied → the later part. When `r = 1` there is no weakest part.
- Digit-place line: count wrong picks by the most significant place where `detail.chosen` differs
  from `detail.expected` (the same order `explainWrong` uses: building → floor → door). Parts 1 and 5
  have no place digits: their misses count as door. Tie → name the more significant place.
- **Restarts:** every `coursereset` closes the current run record and starts a new one in an in-memory
  `runs[]` (nothing stored). The report is always for the run that just completed; if `runs.length > 1`
  it shows a delta against the previous run's `FT` and time. No blending across runs.
- **Jumping around / out of order:** never penalised, never in the formula. A fact chip appears if
  the parts were not first-completed in 1→5 order. Revisiting a finished building adds no questions.
- **Best streak** = longest run of consecutive first-try answers in answer order across the run.

## 4. Time
- Format `m:ss` everywhere (`0:42`, `12:34`, `1:02:05` past an hour), rounded to the nearest second,
  `font-variant-numeric: tabular-nums`. No decimals, ever.
- **Active clock:** advances only while `document.visibilityState === 'visible'` **and** fewer than
  60 s have passed since the last pointer/key/touch/wheel event (the idle guard the brief lacks; a
  phone left on a table must not become a 9-minute Part 3). Paused spans are "away".
- **Building time-to-finish** = active time while it is the stage on screen, from its first
  `stagechange` until its `stagecomplete`. Time on a building after it is complete is review, not
  solving, and is excluded. **Part time** = Σ its quiz buildings. Example stages sum to one run figure,
  "Reading the examples". **Run time** = Σ all buildings, examples included.
- **Pace** = part time ÷ `N_p`, shown as `0:15/door`. Part totals are not comparable (6 vs 16
  questions), so the part table has no time bar; pace is the like-for-like figure and the "slowest"
  mark in the table is the highest pace, not the longest total.
- **Question time** = Σ over that door's opens of (`answer` correct or `quizclose` − `quizopen`),
  active clock only. Walking round the building with the quiz closed is building time, not question
  time. **Slow** = `t ≥ max(20 s, 2 × median of all question times this run)`.
- **Away line** (`wall − active ≥ 30 s`): `Away 4:10 — not counted` as a header chip. Wall clock =
  `coursecomplete` − first `stagechange` of the run. Never shown otherwise.

## 5. Per-question detail
Inside `<details id="fdetails">`, nine building blocks in stage order, grouped under a part label:
```
PART 3 · LEADING DIGITS = BUILDING
Building 7      5 doors + name · 4 first try · 1:31 · slowest 7107 0:22
[7101] [7103] [7105] [7107 ×1] [7109] [Bldg 7]
 0:09   0:11   0:08   0:22      0:14   0:07
```
- The building line is real text and carries every number. Chips are a `role="list"` of
  `role="listitem"` spans; each chip has `aria-label` with the full sentence
  (`7107, 1 wrong pick on the door digits, 22 seconds, slowest in this building`) and `aria-hidden`
  visuals inside.
- Chip = the **correct** value with digit places coloured exactly as the quiz does
  (`.pl-building #f28c6a`, `.pl-floor #7cc4ff`, `.pl-door #eef2f6`); the time below in 11 px muted.
- Missed door: 1 px `#ff9a8a` border, a `×1`/`×2`/`×3` badge (11 px 700 `#ff9a8a`, top-right), and the
  missed place's digits get `text-decoration: underline dotted 2px; text-underline-offset: 3px` in
  their place colour. Two places missed on one door → both underlined. Colour never alone: badge +
  underline + label text.
- Slowest chip per building: its time in 700 `#ffd9a0` (weight and colour) and the building line
  names it. Any chip over the slow threshold adds `slow` to its `aria-label`.
- Building-name step chip reads `Bldg 7` in `.pl-building`.
- Run-facts line at the top of the details: `Reading the examples 2:05 · Answering 10:29`
  (+ ` · Away 4:10` when present). Text only, no bar: the split is not a decision anyone makes.

## 6. Copy (every string)
- `#ftitle` (h2, constant, is the dialog name): `All 14 buildings read`. I disagree with a headline
  that varies by outcome — that is a letter grade in disguise. The number carries the outcome; the
  sub-line carries the advice.
- Hero: `{FT}` + ` of {N} first try`. Delta line when a previous run exists: `▲ 3 vs your last run
  (38)` / `▼ 2 vs your last run (43)` / `Same as your last run (41)`, followed by ` · {m:ss} vs {m:ss}`.
- Sub-line `#fsub` by band — clean: `Every door on the first pick. Nothing to redo.`; good: `A few
  doors took a second look. Part {p} is the one to run again.`; landing: `The patterns are landing.
  Run Part {p} again before your next shift.`; lap: `You got through it. Run Part {p} again — that is
  where the misses were.`
- Stat labels (12 px uppercase): `TIME`, `WRONG PICKS`, `BEST STREAK`; values `12:34`, `12`, `17 in a
  row`. Perfect run: `WRONG PICKS 0`, `BEST STREAK all 53`.
- Digit-place line (only if `W > 0`): `Most misses were on the {building|floor|door} digit
  ({k} of {W}).` — the place word in its `.pl-*` colour.
- Header chips (facts, not buttons): `Run {n} this session` (n ≥ 2), `Parts done out of order`,
  `Away {m:ss} — not counted`.
- Part table headers: `PART`, `FIRST TRY`, `TIME`, `PACE`. Part names: `1 Count in order`,
  `2 First digit = floor`, `3 Leading digits = building`, `4 Front and back`, `5 No floor digit`.
  Cells: `6 of 6`, `4:05`, `0:15/door`. Weakest part row gets a `redo` tag; highest pace gets `slowest`
  (12 px `#9fb0c0`, text, after the value). A perfect part gets no tag.
- Details summary: `▸ Every door, by building` (open: `▾`). Building lines: `Building {label}` ·
  `{n} doors` (`+ name` when a roof-sign step exists) · `{FT} first try` · `{m:ss}` · `slowest {unit}
  {m:ss}`. Parts 1 use `Building 2/3/4`, Part 2 `Building B/C`, Part 3 `Building 7/13`, Part 4
  `Building 19`, Part 5 `Building 12`.
- Buttons: `#fredo` `Redo Part {p} ▸` (primary, absent on a clean run); `#fagain` `Run it all again`
  (ghost; **primary** and `Run it again ▸` on a clean run); `#fclose` `Look around` (ghost).
- Edge — a run of fewer than 53 questions (should not happen; guard anyway): hero uses the real `N`.

## 7. Layout
Desktop, dialog `width: min(600px, calc(100% - 32px))`, `max-height: calc(100vh - 32px)`, inner scroll:
```
┌────────────────────────────────────────────────────────────┐
│ All 14 buildings read              [Run 2] [Out of order]  │ h2 22 amber · chips 12
│ 41 of 53 first try                                         │ 44 px + 16 px, one baseline
│ ▲ 3 vs your last run (38) · 12:34 vs 14:10                 │ 14 px
│ A few doors took a second look. Part 2 is the one to run   │ 15 px #dfe6ee
│ again.                                                     │
│ TIME          WRONG PICKS       BEST STREAK                │ 12 px upper #9fb0c0
│ 12:34         12                17 in a row                │ 22 px tabular
│ Most misses were on the floor digit (7 of 12).             │ 14 px
│────────────────────────────────────────────────────────────│ 1 px rgba(255,255,255,.14)
│ PART                    FIRST TRY          TIME   PACE     │ 12 px upper
│ 1 Count in order        ██████████ 6 of 6  1:12   0:12     │ rows 44 px, 15 px text
│ 2 First digit = floor   ████████░░ 4 of 5  1:40   0:20 redo│
│ 3 Leading digits = bldg ██████░░░░ 10 of 16 4:05  0:15     │
│ 4 Front and back        ████████░░ 11 of 13 2:52  0:13     │
│ 5 No floor digit        ████████░░ 10 of 13 2:45  0:13     │
│ ▸ Every door, by building                                  │ 44 px summary row
│────────────────────────────────────────────────────────────│
│ [Redo Part 2 ▸]  [Run it all again]  [Look around]         │ wraps, gap 10
└────────────────────────────────────────────────────────────┘
```
Phone portrait ≤ 640 px: `inset: 0`, no radius, `padding: 16px 16px 0`, body scrolls, footer sticky:
```
┌──────────────────────────────┐
│ All 14 buildings read        │ 22
│ [Run 2] [Out of order]       │ chips wrap under the title
│ 41 of 53 first try           │ 40 + 15
│ ▲ 3 vs your last run (38)    │
│ A few doors took a second    │ 15
│ look. Part 2 is the one to   │
│ run again.                   │
│ TIME    WRONG PICKS  STREAK  │ 3 equal columns
│ 12:34   12           17      │ 20 px
│ Most misses: floor digit (7) │
│──────────────────────────────│
│ 1 Count in order      6 of 6 │ line 1: name · count
│ ██████████████   1:12 · 0:12/door  line 2: bar 8 px + time
│ 2 First digit = floor 4 of 5 │
│ ███████████░░░   1:40 · 0:20/door · redo
│ … 3, 4, 5 …                  │
│ ▸ Every door, by building    │
│ (chips 4 per row, 80 px)     │
│──────────────────────────────│ sticky, background rgba(20,24,30,.96)
│ [      Redo Part 2 ▸       ] │ full width
│ [Run it all again][Look around] two ghosts, 50/50
└──────────────────────────────┘ padding-bottom: env(safe-area-inset-bottom)
```
Landscape phones (`max-height: 520px and orientation: landscape`): `inset: 8px`, radius 14,
`display: grid; grid-template-columns: 220px 1fr; gap: 16px`. Left column: title, hero, sub-line,
stats stacked, buttons (wrapping). Right column: part table + details, `overflow-y: auto`. The
`BEST STREAK` label shortens to `STREAK` at ≤ 400 px only; nothing else changes.

## 8. Visual spec
- **Type scale (px / weight / line-height):** hero 44/700/1 (40 on phones); h2 22/700/1.2 `#ffd9a0`;
  stat value 22/600/1 (20 on phones); body 15/400/1.45 `#dfe6ee`; table 15/500; delta and place
  line 14/400 `#9fb0c0` (numbers `#eef2f6`); labels 12/600 uppercase `.06em` `#9fb0c0`; chip time and
  tags 11–12/400 `#9fb0c0`. All numerals `font-variant-numeric: tabular-nums`. Font stays `system-ui`.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24. Section gap 16, rule + 12 either side, table row height
  44 (also the tap target for the `<summary>`), chip 80 × 44 with 8 px gaps, dialog padding 24/26
  desktop and 16 phone.
- **Panel:** unchanged — `rgba(20,24,30,.94)`, blur 8, border `rgba(255,255,255,.16)`, radius 18,
  shadow `0 20px 60px rgba(0,0,0,.5)`, `z-index: 40`.
- **First-try bar (plain CSS):** `.bar{height:8px;border-radius:4px;background:rgba(255,255,255,.18);
  overflow:hidden}` `.bar i{display:block;height:100%;width:calc(var(--v)*100%);background:#57c97e;
  border-radius:inherit}` with `--v = FT_p / N_p`. Zero-based, full track = that part's questions,
  the same 120 px track width in every row on desktop, full width on phone. `aria-hidden="true"`.
  No gradients, no rounded fill caps hiding a zero, no ticks.
- **Colours used, all from the existing set:** amber `#ffd9a0` (h2, slowest time); green `#57c97e`
  (bar fill, primary button); success `#7ee0a0` (▲ delta); error `#ff9a8a` (▼ delta, `×n`, missed
  border); `#f28c6a` / `#7cc4ff` / `#eef2f6` (digit places, never for anything else); text
  `#eef2f6` / `#dfe6ee` / `#9fb0c0`; track and rules `rgba(255,255,255,.14–.18)`. Nothing new.
- **Chips (header facts):** 12 px, `rgba(255,255,255,.10)` fill, 1 px `rgba(255,255,255,.20)`
  border, radius 999, padding 3 px 8 px — the ghost-button recipe without being a button.
- **Iconography:** none. `▲ ▼ ▸ ▾ ×` are text glyphs, never colour-only.
- **Table semantics:** `div[role=table] > div[role=row] > div[role=columnheader|cell]` so the phone
  grid restyle cannot strip the semantics a `<table>` would lose under `display: grid`.

## 9. Motion
- Dialog: opacity 0→1 and `translateY(8px)`→0 over 200 ms ease-out. Bars: `--v` set to 0 on first
  paint, then to the value on the next frame, `transition: width .4s ease-out`, `transition-delay`
  40 ms × row index. That is the whole list. Nothing counts up, nothing pulses.
- `prefers-reduced-motion`: the existing global rule already collapses transitions to 0.01 ms; set
  `--v` directly so bars paint at their final width. Dialog appears instantly, as today.
- **Confetti:** the two cannons stay (Rosa and Kai are right that the moment needs something) but
  they are finished before the report is up: keep the 900 ms delay and set `confetti.length = 0`
  in the same tick that removes `.hidden` from `#finale`. No confetti behind or over the report.

## 10. Accessibility
- `<div id="finale" role="dialog" aria-modal="true" aria-labelledby="ftitle" aria-describedby="fsum">`
  where `#fsum` wraps the hero line, delta and sub-line. On open, focus `#ftitle` (`tabindex="-1"`).
  A screen reader hears: `All 14 buildings read, dialog. 41 of 53 first try. ▲ 3 vs your last run.
  A few doors took a second look. Part 2 is the one to run again.` — the same first glance.
- Focus order: title → `<summary>` → `#fredo` → `#fagain` → `#fclose`, Tab wraps inside the dialog.
  Escape = `#fclose`. On close, focus returns to `#next` (which shows `Start over ▸`).
- While the dialog is open the course keymap (1–4, arrows, F/B/L/R, Home) is suppressed; door
  raycasting ignores pointer events under the dialog (it already has a backdrop; make it
  `pointer-events: auto` full-screen behind the panel).
- No live region inside the report: focus movement announces it once. Do not push the report into
  `#prompt`'s `aria-live`.
- Every bar `aria-hidden`; every figure in text or `aria-label`; column headers real
  `role="columnheader"`; details use native `<details>/<summary>` for free keyboard support.
- Tap targets ≥ 44 px on `pointer: coarse` (summary row, buttons). Contrast: every colour above is
  in the verified table at the top of the `<style>` block (≥ AA on `#14181e`).
- The `<details>` is closed by default; the state is not persisted.

## 11. Strongest opinion, and three questions for the other designer
**Opinion:** The first-try count is the only honest score a 4-option quiz can produce, so it is the
hero and there is no letter, star, gauge or percentage anywhere on this screen. Time is a number a
driver acts on, not a shape to admire, so it stays `m:ss` in a tabular column, and nothing animates
over it.

1. `Redo Part {p}` needs a partial reset the course does not have (clear that part's quiz groups and
   `completed` entries, keep the rest). Is that in scope, and should a redone part *replace* its row
   in the next report or sit beside the first attempt?
2. I show a missed door as a chip with the wrong place underlined; a words-first designer might
   want `floor digit was wrong` spelled out per door. Is the underline plus badge enough for our
   drivers, or do you want the sentence?
3. Should the 53 chips live on the report at all, or in the scene — tap a chip, the dialog closes,
   the camera flies to that door with its `×2` mark on the plate? That would be more course-like
   than a table; I stopped at the table because it is one tap away and reads on a 390 px phone.
