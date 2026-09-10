# The end-of-run report

When the last of the 14 buildings is done, the course now shows a **report of
the run** instead of the old "five patterns you learned" summary. It answers, in
order: *am I okay?*, *what do I do next?*, and then *how did each part go?*

All of it lives in one shared module, `report.js`, imported by every
`apartment-*.html`. The course page keeps only the dialog shell (`#finale`, its
CSS, and the two buttons the course wires at load) plus a small `retryPart()`
so the report's primary button can rebuild one part.

Nothing is stored or sent. The report is built from what happened in this tab
and is thrown away on "Start over".

## What the learner sees

```
APARTMENT NUMBERS · ALL 14 BUILDINGS · RUN 2                        (×)
Nearly there — one more go at Part 2.                 ← headline (h2)
42  of 52 on the first try                            ← the hero number
▲ 3 vs your last run (39 of 52) · 12:34 vs 14:10      ← only after a restart
██████████████████████████████░░░░░░░░                ← green meter, FT / 52
TIME 12:34     MISSES 15     BEST STREAK 13 in a row
✓ Every door in Part 1 on the first try.              ← one thing you are good at
→ In Part 2, watch the floor digit — most misses were there.   ← one thing to try
[ Try Part 2 again ▸ ]  [ Start over ]
────────────────────────────────────────────────────
PART BY PART
▸ Part 1 · Count in order        ████████░░  4 of 6 · nearly   1:48
▸ Part 2 · First digit = floor   ██████░░░░  3 of 5 · nearly   1:37
▾ Part 3 · Leading digits = building  ████████░ 13 of 15 · solid  3:16
    Reading the example 0:49 · answering 2:27 · about 10 s a door
    Building 7 · 4 doors + name · 1:11
    710▢ → 7103      missed: floor         14 s
    71▢5 → 7105      ✓ first try            9 s
    …
▸ Part 4 · Front and back        ████████░  11 of 13 · solid   3:18
▸ Part 5 · No floor digit        ████████░  11 of 13 · solid   3:19
Reading the examples 4:05 · answering 9:14 · looking around 1:10
You stepped away for 4:10 — not counted.              ← only when it happened
```

Each part row is a native `<details>`: tap it for that part's buildings and
every question, with the mask the door showed, the answer in the course's
digit-place colours (building · floor · door), which place each miss was on
(the missed digits are also dotted-underlined), and the seconds it took.

The `×` closes the report and leaves the learner in the scene; a **Report**
button appears in the bottom bar to bring it back. **Start over** is the old
full restart. The primary button is the advice:

- **Try Part N again ▸** when a part is *nearly* or *try again* (see below).
  The course rebuilds only that part's buildings and jumps to its example; the
  run continues and the report returns when the part is finished, with a
  `Second go · first go: 7 of 15` line inside that part's row.
- **Back to the menu ▸** when every part is solid, or the run was perfect.

## The grade

There is no letter, percentage or star rating. Every question offers four
options and a wrong pick greys one out, so "correct ÷ picks" is always flattering;
the honest measure is **how many questions were right on the first pick**.

| Term | Definition |
|---|---|
| question | one blank door, or one "name the building" roof sign (52 in a full run: 6 · 5 · 15 · 13 · 13 per part). Closing and reopening a door is still one question. |
| first try | the first pick on that question was correct |
| miss | any wrong pick (a question can have 0–3) |
| tier (per part) | first-try share ≥ 80 % → **solid**; ≥ 50 % → **nearly**; below → **try again** |
| outcome | **perfect** (every question first try) · **ready** (every part solid) · **nearly** (no part needs a retry, at least one is *nearly*) · **again** (some part is *try again*) |
| target part | the worst tier, then the lowest first-try share, then the most misses, then the earlier part (later parts build on it). The headline, the → line and the primary button all name it. |
| best streak | longest run of consecutive first-try answers, in the order they were solved |
| most-missed place | which digit place (building / floor / door) the wrong picks were on, from the same comparison the quiz uses for its "right floor, wrong door" hint. Ties go to the costlier place: building over floor over door. Parts 1 and 5 have no floor digit, so their misses count as *door*. |

Headlines: `Every door, first try.` · `You’re ready for the route.` ·
`Nearly there — one more go at Part N.` · `Worth another go at Part N.`

The ✓ line is the first rule that fits: every question first try → a part with
every question first try (the latest such part) → the part with the highest
first-try share. The → line names the target part and its most-missed digit
place (Part 1 and Part 5 get a plain-language reminder of their pattern
instead); on a *ready* run it says how few misses there were.

Restarts never blend: a new run starts at "Start over", and the report for the
run that just finished shows a `▲ / ▼ / Same as your last run` line against the
previous completed run in this tab. Doing the parts out of order is not
penalised or mentioned.

## Time

Everything is measured on an **active clock**: it pauses while the tab is
hidden and after 90 s without any pointer, key, touch or wheel input, and
resumes on the next input. The paused time is reported once, as
`You stepped away for m:ss — not counted`, when it adds up to a minute or more.

| Figure | What it is |
|---|---|
| TIME | active time from the run's first building to the finale |
| per building | active time while it was the building on screen, until it was completed (revisits after that are not solving) |
| per part | its example plus its quiz buildings; the row's body splits this into *reading the example* and *answering*, and shows *about N s a door* (answering ÷ questions) so parts of different sizes compare |
| per question | from the first time its options opened until the correct pick, counted only while its building was on screen (walking round the building to count doors is part of solving) |
| footer | reading the examples · answering · *looking around* (the remainder, shown when it is 30 s or more) |

Formats: `m:ss` (or `h:mm:ss`), and `9 s` for question times under a minute.
Screen readers get the spoken form ("4 minutes 10 seconds"). No time is ever
labelled slow, and there is no comparison with other learners.

## How it hooks into the course

`report.js` listens to the events the course already dispatches on `document`
(`stagechange`, `quizopen`, `quizclose`, `answer`, `blanksolved`,
`stagecomplete`, `coursecomplete`, `coursereset`) and two new ones:

- `retrypart` (`{ part }`) is dispatched **by the report** when the learner
  presses *Try Part N again*. The course listens and calls `retryPart(p)`.
- `partreset` (`{ part, stages }`) is dispatched **by the course** after it has
  rebuilt that part. The report archives the first go; `track.js` records a
  `part_retry` event and lets the part's stages report `stage_complete` again.

The course fires `coursecomplete` before it reveals the dialog, so the report
is already rendered when `#finale` appears (900 ms after the confetti cannons,
immediately under reduced motion). While the dialog is open every other
top-level element is `inert`, focus moves to the headline, Tab loops inside,
and Escape closes; on close, focus goes to the bottom bar.

The dialog shell (`#finale` position, size, phone full-screen, landscape
inset) is styled in each course page next to its other panels; the report's
contents are styled by a stylesheet `report.js` injects, including their own
phone and landscape rules.

## Checking it works

- In the console, `sfReport.summary()` returns the current run's numbers
  (questions, buildings, parts, totals) at any point, not only at the end.
- `sfReport.demo('nearly')` — or `'perfect'`, `'ready'`, `'again'` — renders
  the report with made-up data and opens the dialog, for layout and copy
  checks without playing the course. `'again'` also fakes a previous run and
  some away time.
- `sfReport.grade()` returns the tiers, outcome and target part.

## Where the design came from

Two in-character design reviews were written against `docs/run-report/brief.md`
and then reconciled:

- `docs/run-report/marisol.md` — a learning-experience designer, ex-courier
  dispatcher. Taken from it: the outcome headline, the ✓ / → lines and their
  rule ladders, the solid / nearly / try again tiers, the *Try Part N again*
  primary button that resets one part, the corner `×`, per-part `<details>`
  rows with question lines in words, no "slow" label anywhere, the 90 s idle
  guard, the stepped-away footer, `inert` siblings and focusing the heading.
- `docs/run-report/teo.md` — a data-visualisation and interface designer.
  Taken from it: the big first-try count as the one hero number, the
  TIME / MISSES / BEST STREAK stat row, the `▲ 3 vs your last run` delta,
  `m:ss` with tabular figures, zero-based green bars with the number beside
  them, the answer digits in the course's place colours with the missed place
  underlined, phone-first layout with a full-width primary button, and the
  rule that nothing counts up or animates over the numbers.

Where they disagreed: Teo wanted a constant headline with the number carrying
the outcome; the phrase headline won because "am I okay?" should be answered
before a number is read. Teo's "slowest" tag and pace-based comparisons were
dropped in favour of plain times. Teo's question time counted only while the
options panel was open; the report uses first-open-to-correct, which is what
the owner asked for and what a learner would call "how long that door took".
Both asked for the per-part retry, so it was built.
