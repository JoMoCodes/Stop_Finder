<!-- In-character design review, written against docs/run-report/brief.md. Marisol Reyes-Okafor: learning-experience designer, ex-courier dispatcher. What was taken from it is listed in docs/report.md. -->

# End-of-run report — spec by Marisol Reyes-Okafor

Read: the brief; `apartment-mockup.html` 1–520 (`#finale`, the `<style>` block); design doc 10; reviews 01 Rosa,
02 Marcus, 04 Tobias, 12 Kai, 13 Sam, 14 Leilani. The person I am designing for is Marcus in a lobby with a bag in
one hand, and Rosa's rookie at 9 PM. Ten seconds, one thumb, did not ask to be graded.

## 1. Principles
- The first line answers "am I okay?", the second "what do I do next?". Everything else is optional reading.
- A wrong pick is information. The screen never says wrong, failed, poor, or shows a red total; it says what to watch and where to try again.
- Every number carries a "so what" or it does not ship. No counts for their own sake.
- One headline, one meter, rows you can scan. No dashboard, no letter grade, no percentage.
- The learner is compared with themselves only: this run vs last run, this part vs that part. Never with other people, never with a clock we invented.

## 2. Information hierarchy
1. Headline phrase · sub-line `40 of 53 on the first try · 12 min` · one meter. (am I okay?)
2. Two lines: `✓` one thing you are good at, `→` one thing to try. (what next?)
3. Buttons. The primary *is* the advice (`Try Part 3 again ▸`) or the exit (`Back to the menu ▸`).
— fold —
4. "Part by part": five rows, always Parts 1–5 in course order, each a native `<details>`.
5. Inside a row: buildings, then questions, with misses named by digit place and the time each took.
6. Footer: reading vs answering time, best streak, a "stepped away" note when it matters.

Left out on purpose: final accuracy (always 53 of 53, so it is noise); hint / help / reset / jump counts and visits
and open-close counts (analytics for the owner, `track.js` has them, not feedback for the learner); device, input,
reduced-motion; the order the parts were taken (skipping around is allowed, so it is not a finding); letter grades
and percentages (see §3). Tobias's "what you learned" list survives as the five row names.

## 3. Grade model
**First-try count out of 53**, a **three-word tier per part**, and a **headline phrase**. Not a letter: adults on a
shift did not sign up for school. Not a percentage: it hides the 25 % guess floor and invites league tables. Not
stars: that is an app-store gesture. A count with a fixed denominator is honest, and "last run 31 of 53" means something.

Formulas, per current run, all from the existing `document` events (`quizopen`, `answer`, `blanksolved`,
`stagechange`, `stagecomplete`, `coursecomplete`, `coursereset`), keyed by the `bstate` object as `track.js` does:
- `firstTry(q) = wrongPicks(q) === 0`, where `wrongPicks` = number of `answer` events with `correct:false` for that
  `bstate` (0–3). Wrong-wrong-wrong-right scores the same as wrong-right: not first try. That is how the 4-option
  floor is handled — only the first pick counts, so an answer arrived at by elimination never scores.
- `FT = Σ firstTry`, `Q = 53`; per part `Q_p` = 6, 5, 16, 13, 13.
- Building-name questions: two ordinary questions inside Part 3 (`detail.type === 'building'`); a wrong pick on them
  is a **building**-place miss.
- Tier per part from `r = FT_p / Q_p`: **solid** r ≥ .80 · **nearly** .50 ≤ r < .80 · **try again** r < .50.
  Integer cut-offs so nobody rounds differently: P1 solid ≥ 5 / nearly 3–4 / again ≤ 2 · P2 ≥ 4 / 3 / ≤ 2 ·
  P3 ≥ 13 / 8–12 / ≤ 7 · P4 and P5 ≥ 11 / 7–10 / ≤ 6.
- Outcome: **PERFECT** `FT === 53` · **READY** every part solid · **NEARLY** no "again" part, ≥ 1 "nearly" ·
  **AGAIN** ≥ 1 "again" part.
- Target part `N` (for headline, Try line, button): worst tier; ties → lowest `r`; ties → most wrong picks;
  ties → lowest part number, because later parts build on it.
- Missed place per wrong pick: `type === 'building'` → building; `plex` / `seq` (Parts 1, 5) → door (a count-on
  miss); otherwise the first of building, floor, door whose text differs between `detail.chosen` and
  `detail.expected` — reuse `wrongPlace()` from `track.js`. Most-missed place (part or run): highest tally;
  ties → building > floor > door, because a wrong building costs the most walking.
- Streak: longest run of consecutive first-try questions in `blanksolved` order.
- Restarts: the report covers one run (`coursereset` to `coursereset`). Keep each finished run's `FT` in a page
  variable (nothing stored) for the eyebrow `last run 31 of 53`. No penalty, no other mention.
- Jumping / out of order: no effect on anything. Revisiting a solved building adds time to its part, nothing else.
- Retrying a part via `#fpart`: that part's questions are replaced by the retry; the earlier `FT_p` is kept for one
  line inside the row, `First go: 7 of 16.`

## 4. Time
- **Active seconds only.** The current stage's clock pauses while `document.visibilityState === 'hidden'` and after
  any 90 s gap with no `pointerdown` / `pointermove` / `keydown` / `touchstart` / `wheel`; the whole gap is dropped
  and the clock resumes on the next input. Wall-clock is kept separately for one footer line.
- Per question: first `quizopen` for that `bstate` → the correct `answer`, in active seconds. Closing and reopening
  the panel does not reset it (it is time-to-solve, not time-in-panel).
- Per building: active time while it is the current stage, all visits. Per part: sum of its stages; the example
  stage is "reading", quiz stages are "answering".
- Format: under 60 s → `9 s`; otherwise `m:ss` (`4:10`, `12:20`). Sub-line total: ≥ 90 s → nearest minute,
  `12 min`; under that, `under a minute`. `font-variant-numeric: tabular-nums` on every number.
- **"Slow" does not exist here.** No threshold, no colour on time, no comparison with anyone. Time is a plain fact
  next to a plain count so a learner can compare their own parts ("Part 5 took less than Part 4 — I got faster").
  The one derived figure, inside a part row, is `about 19 s a door` (answering time ÷ `Q_p`, rounded), because it
  makes parts of different sizes comparable. I disagree with the brief's hint to define "slow": a slow right answer is
  a person thinking, and the misses already carry the message.
- Footer, only when wall − active ≥ 120 s: `You stepped away for 4 min — not counted.`

## 5. Per-question detail
Yes, behind each part row. The `<summary>` is the row; the body is one sub-header per quiz building, then one line
per question in door order (building name last):
```
Building B · 7 · 5 doors · 1:40 · about 20 s a door
71▢5 → 7105               ✓ first try                 9 s
7▢07 → 7107               missed: floor, door        41 s
Name the building → 7     ✓ first try                 6 s
```
- Mask = `a11yMask(bstate)` with `_` → `▢` (what `#doorlist` already shows). Answer coloured with the existing
  `.pl-building / .pl-floor / .pl-door` spans from `quizPlaces(value, type)`; Part 1 and 5 answers are plain white.
- Misses: `missed: ` then each wrong pick's place in order, comma-separated, each word in its place class. The word
  is the meaning; colour is a bonus. First try: `first try` in `#7ee0a0` with a `✓` (aria-hidden).
- Retried part: first line in the body, `Second go · first go: 7 of 16.`
- Building header from `stage_name` as `track.js` builds it: Part 1 `Building 2`, Part 2 `Building B`,
  Part 3 `Building B · 7`, Parts 4–5 `Building 19` / `Building 12`.

## 6. Copy (every string; `{N}` part, `{place}` building | floor | door, `{FT}` first-try count)
- Eyebrow: `Apartment numbers · all 14 buildings`; with restarts add ` · run {k} · last run {FT_prev} of 53`.
  Phone: drop `Apartment numbers · `.
- Headline: PERFECT `Every door, first try.` · READY `You're ready for the route.` ·
  NEARLY `Nearly there — one more go at Part {N}.` · AGAIN `Worth another go at Part {N}.`
- Sub-line: `{FT} of 53 on the first try · {time}` (not "doors" — two of the 53 are building names).
- Good line, first rule that fits: FT = 53 `Every single one on the first try.` · a part with `FT_p = Q_p`, highest
  N `Every door in Part {N} on the first try.` · streak ≥ 8 `Best streak: {s} in a row on the first try.` · else
  `Strongest: Part {N} — {x} of {y} on the first try.`
- Try line: FT = 53 `Nothing to fix. Go find some doors.` · target part 2 / 3 / 4 `In Part {N}, watch the {place}
  digit — most misses were there.` · target Part 1 `In Part 1, count on from the door next to it — that's where the
  misses were.` · target Part 5 `In Part 5, one count runs round all four sides — that's where the misses were.` ·
  READY `Only {m} misses, mostly the {place} digit. Worth a glance next time.` (`m` = wrong picks, run total).
- Buttons: primary `Try Part {N} again ▸` (`#fpart`, NEARLY / AGAIN) or `Back to the menu ▸` (`#fhome`, an `<a>` to
  `https://jomocodes.github.io/Stop_Finder/`, PERFECT / READY); ghost `Start over` (`#fagain`); corner `×`
  (`#fclose`, `aria-label="Close and keep looking around"`). Never more than two buttons in the row.
- Section title `Part by part`. Row names `Part 1 · Count in order`, `Part 2 · First digit = floor`,
  `Part 3 · Leading digits = building`, `Part 4 · Front and back`, `Part 5 · No floor digit`.
  Row numbers `{x} of {y} · solid` / `· nearly` / `· try again`.
- Footer: `Reading the examples {t} · answering {t}` · `Best streak: {s} in a row.` ·
  `You stepped away for {t} — not counted.`
- Out-of-order run: no text. A restart: only the eyebrow. A perfect run: headline, Good and Try lines above.

## 7. Layout
Desktop, ~560 px wide (24 px side padding, 512 px inside):
```
┌──────────────────────────────────────────────────────────┐
│ APARTMENT NUMBERS · ALL 14 BUILDINGS · RUN 2         (×) │  eyebrow 12
│ Worth another go at Part 3.                              │  h2 22 amber
│ 40 of 53 on the first try · 12 min                       │  16
│ ████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░  │  meter 10 tall
│ ✓ Every door in Part 2 on the first try.                 │  15
│ → In Part 3, watch the floor digit — most misses         │  15
│   were there.                                            │
│ ( Try Part 3 again ▸ )  ( Start over )                   │  buttons
│ ──────────────────────────────────────────────────────── │  ~fold on a 600-px-tall window
│ PART BY PART                                             │  eyebrow 12
│ ▸ Part 1 · Count in order                                │  row line 1, 15/600
│   ████████████████████████████████   6 of 6 · solid 1:20 │  row line 2: bar · count · time
│ ▸ Part 2 · First digit = floor                           │
│   ████████████████████████████████   5 of 5 · solid 0:55 │
│ ▾ Part 3 · Leading digits = building                     │
│   ██████████████░░░░░░░░░░░░░░░░░  7 of 16 · try again 4:10 │
│   Second go · first go: 7 of 16.        (only if retried)│
│   Building B · 7 · 5 doors · 1:40 · about 20 s a door    │  13 grey
│   71▢5 → 7105            ✓ first try                9 s  │  14
│   7▢07 → 7107            missed: floor, door       41 s  │
│   …                                                      │
│ ▸ Part 4 · Front and back                                │
│   ██████████████████████████░░░░░  11 of 13 · solid 3:05 │
│ ▸ Part 5 · No floor digit                                │
│   ██████████████████████████░░░░░  11 of 13 · solid 2:50 │
│ Reading the examples 2:10 · answering 10:10              │  13 grey
│ Best streak: 9 in a row.                                 │
└──────────────────────────────────────────────────────────┘
```
Phone portrait, ~390 px (full-screen, 16 px side padding, 358 px inside):
```
┌────────────────────────────────────┐
│ ALL 14 BUILDINGS · RUN 2       (×) │
│ Worth another go at Part 3.        │  22, wraps to 2 lines if needed
│ 40 of 53 on the first try · 12 min │  16, wraps
│ ██████████████████████░░░░░░░░░░░  │
│ ✓ Every door in Part 2 on the      │
│   first try.                       │
│ → In Part 3, watch the floor       │
│   digit — most misses were there.  │
│ (       Try Part 3 again ▸       ) │  full width, 48 tall
│ (          Start over            ) │  full width, 44 tall
│ ────────────────────────────────── │  ~fold at 844 px tall: rows start above it
│ PART BY PART                       │
│ ▸ Part 1 · Count in order          │
│   ████████████  6 of 6 · solid 1:20│
│ ▸ Part 2 · First digit = floor     │
│   ████████████  5 of 5 · solid 0:55│
│ ▾ Part 3 · Leading digits = build- │
│   ing                              │
│   █████░░░░░  7 of 16 · try again  │
│                               4:10 │  time drops to its own line only if the row cannot fit
│   Building B · 7 · 5 doors · 1:40  │
│   71▢5 → 7105     ✓ first try  9 s │
│   7▢07 → 7107     missed: floor,   │
│                   door        41 s │
│   …                                │
│ ▸ Part 4 · Front and back          │
│   ██████████░  11 of 13 · solid 3:05│
│ ▸ Part 5 · No floor digit          │
│   ██████████░  11 of 13 · solid 2:50│
│ Reading the examples 2:10 ·        │
│ answering 10:10                    │
│ Best streak: 9 in a row.           │
└────────────────────────────────────┘
```
Landscape phones (`max-height: 520px and orientation: landscape`): same single column, `inset: 8px`,
radius 14, h2 19 px, buttons side by side, everything scrolls inside the dialog. Headline through buttons
(~230 px) fit a 390-px-tall screen without scrolling.

## 8. Visual spec (colours only from the verified set)
- `#finale`: `width:min(560px, calc(100% - 32px)); max-height:calc(100dvh - 32px); overflow-y:auto;
  overscroll-behavior:contain; padding:20px 24px 24px;` keep radius 18, `rgba(20,24,30,.94)`, blur 8 px,
  `1px solid rgba(255,255,255,.16)`, `0 20px 60px rgba(0,0,0,.5)`, z-index 40. ≤ 640 px: `inset:0;
  border-radius:0; max-height:none; padding:16px 16px calc(20px + env(safe-area-inset-bottom))`.
  Landscape ≤ 520 px tall: `inset:8px; border-radius:14px; padding:12px 16px 16px`.
- Type: eyebrow 12/600 uppercase `.06em` `#9fb0c0` · h2 22/700 `#ffd9a0` lh 1.25 margin 4 0 4 · sub 16/500
  `#eef2f6` · Good/Try lines 15/400 `#eef2f6` lh 1.45, glyph in an 18 px column · row name 15/600 `#eef2f6` ·
  row numbers 14/500 tabular, tier word coloured · time 14 `#9fb0c0` · building header 13/600 `#9fb0c0` ·
  question rows 14 `#eef2f6`, time 13 `#6f8298` · footer 13 `#9fb0c0` lh 1.5.
- Meter: 10 px tall, radius 5, track `rgba(255,255,255,.18)`, fill **always** `#57c97e` at `FT/53 × 100%`
  (a count of good things is green whatever the total), margin 10 0 14, `aria-hidden="true"`.
- Part bar: 6 px, radius 3 (same build as `#progress`), same track, fill `FT_p/Q_p`; colour by tier: solid
  `#57c97e`, nearly `#ffd54a`, try again `#ff9a8a`. Tier word text: `#7ee0a0` / `#ffd9a0` / `#ff9a8a`.
- Rows: `summary` min-height 44, padding 8 4, radius 10, hover `rgba(255,255,255,.06)`, `list-style:none`,
  caret `▸` / `▾` via `summary::before` in `#9fb0c0`. Line 2 grid `minmax(80px,1fr) auto 44px`, gap 10; on
  phones the time may wrap under (`flex-wrap`). Body padding 4 0 10 22; question row grid
  `minmax(0,1fr) auto 44px`, min-height 32 (not interactive). Divider `1px solid rgba(255,255,255,.14)`.
- Buttons: primary = the existing `button` style; `#fhome` is an `<a>` styled identically (`display:inline-flex`,
  no underline). Ghost = existing `.ghost`. Row flex, gap 10, margin 16 0 18; phone: stacked `width:100%`, primary
  min-height 48, ghost 44. `#fclose`: ghost circle 40 × 40 (44 on `pointer: coarse`), top 10 right 10, `×` 20 px.
- Glyphs: `✓` `#7ee0a0`, `→` `#ffd9a0`, `×`, `▸`. No icons, no images, no fonts.

## 9. Motion
- The confetti cannons stay exactly as they are and fire on every completion, retries included: finishing all
  14 buildings is worth a party whatever the count, and the report tells the truth 900 ms later (unchanged delay).
- Dialog: opacity 0→1 and scale .98→1 over 180 ms. Meter fill 0→value over 600 ms ease-out, starting 150 ms after
  open; part bars 400 ms, staggered 60 ms. Numbers never roll up — a counting number delays "am I okay?".
- `prefers-reduced-motion`: no confetti (existing), open immediately (existing), no fade, bars at final width.
  `<details>` toggles are instant everywhere.

## 10. Accessibility
- `<div id="finale" role="dialog" aria-modal="true" aria-labelledby="ftitle" aria-describedby="fsub">`. On open set
  `inert` on every other child of `<body>`, then `ftitle.focus()` (`tabindex="-1"`). A screen reader hears first:
  "Worth another go at Part 3, heading level 2, dialog. 40 of 53 on the first try, 12 minutes." Times are
  `<span aria-hidden="true">12 min</span><span class="sr-only">12 minutes</span>`; rows likewise ("1 minute 20").
- Tab order is DOM order: `×` → primary → `Start over` → Part 1 … Part 5 summaries (native buttons, Enter / Space
  toggle) — nothing inside a body is focusable. Tab / Shift+Tab loop inside the dialog. Escape = `#fclose`. On
  close remove `inert` and focus `#next` (the bottom-bar Start over), else `#back`, else the canvas.
- No live region: the focus move is the announcement. `#prompt` / `#doorsleft` must not update after the dialog opens.
- Bars `aria-hidden`; every value exists as text. Glyphs `aria-hidden`; words carry meaning. Tier is a word, misses are
  words, so colour is never the only carrier. Focus ring: the existing 3 px `#ffd54a`.

## 11. Strongest opinion, implementation note, three questions
**Opinion.** The primary button must *be* the advice: `Try Part 3 again ▸` resets only Part 3's two buildings and
brings the person back to this report when they are done. A screen that tells a tired driver what to do and then
makes them go and find it has failed at the last step.

`#fpart` → `retryPart(N)`: hide the dialog; for each `i` with `STAGES[i].part === N` dispose `groups[i]` the way
`resetCourse` does, `delete groups[i]`, `completed.delete(i)`; move that part's question records to `run.firstGo[N]`;
`finaleShown = false`; `showStage(first such i)`; dispatch `partretry { part: N }` for `track.js`. The existing flow
finishes the course again when the last of those stages completes. If this is cut, the primary becomes
`Start over ▸` and the Try line stays as advice — decide it, don't downgrade silently. Suggested home: a shared
`report.js` beside `track.js`, listening to the same events and rendering into `#finale`, so the four HTML files
keep only the shell and the two ids.

Questions for the other designer:
1. Do you show a percentage anywhere? I say no. If you do, where does the 25 % guess floor go so it isn't a lie?
2. Do you label any time as slow? I label none. If you have a benchmark, is it one we could defend to Rosa?
3. The retry button costs real code (a per-part reset). Is it worth it to you, or would you rather a "next time" line?
