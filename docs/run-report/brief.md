<!-- The brief both design reviews below were written against. One correction: the course has 52 questions, not 53 (Building 13 in Part 3 has 9 blank doors plus its name). report.js counts the real questions. -->

# Design brief — the end-of-run report for the Stop Finder apartment course

## What this is
Stop Finder (repo: /home/user/Stop_Finder) is a small static teaching site. Its one live
course is a 3D "apartment number" course (`apartment-mockup.html` and three visual
variants `apartment-realistic-{a,b,c}.html`; all four share identical DOM/CSS/JS
except the 3D visual layer). Learners are delivery drivers, gig couriers and anyone
who needs to read an apartment number and know which building, floor and door it
means. A full run takes roughly 8–20 minutes.

The course has **5 parts and 14 "buildings" (stages)**. Each part opens with a worked
example (no questions), then 1–3 quiz buildings where the learner clicks blank doors
and picks the right unit number from 4 options:

| Part | Lesson | Quiz buildings | Questions |
|---|---|---|---|
| 1 | Numbers count up in order (101, 102, 103…) | 3 | 6 |
| 2 | First digit = floor (229 = floor 2, door 29) | 2 | 5 |
| 3 | Leading digits = building (13117 = building 13, floor 1, door 17). Two of the buildings end with "name the building" from the roof sign | 2 | 16 (14 doors + 2 building names) |
| 4 | Numbers wrap front and back (front door 19101, the door behind it 19102…) | 1 | 13 |
| 5 | No floor digit: one running count round all four faces (1231 → 1250) | 1 | 13 |

53 questions in total. Each question shows 4 options; a wrong pick greys that option
out and shows a one-line explanation of *which digit place* was wrong (building /
floor / door), so a question can be missed at most 3 times before the last option is
the answer. That means raw "correct ÷ picks" always looks decent; **first-try rate**
is the honest measure of understanding. A second wrong pick on the same question
also appends the part's rule ("Doors count on in order.").

Learners can jump between parts (jump bar), go Back, revisit finished buildings, and
the course only "completes" once all 14 stages are done — whichever stage finishes
last.

## What exists today (the thing being replaced)
On completion: two confetti cannons, then ~900 ms later a centred dialog `#finale`
(520 px wide on desktop, **full-screen on phones ≤ 640 px**) that lists the five
patterns learned, one sentence of encouragement, and two buttons: **Start over ▸**
(primary green, id `fagain`) and **Keep looking around** (ghost, id `fclose`; closes
the dialog and leaves the learner in the 3D scene with a "Start over" button in the
bottom bar). Escape also closes it.

The owner wants this replaced with a **report of the run**: how long each task took,
how well they did, and anything else useful. The two button ids must survive (labels
can change; a third action is allowed). Confetti can stay, go, or change — say which.

## Data we can compute for the report (all per run, in the browser, nothing stored)
Per **question** (53 of them): part, building, the mask shown on the door (e.g. `71▢5`
or `?`), the correct value, when it was first opened, when it was answered correctly,
elapsed seconds first-open → correct, number of wrong picks (0–3), which digit place
each wrong pick got wrong (building / floor / door), how many times it was opened and
closed before being answered.

Per **building** (14; 9 of them quizzes): time actively on it (only while it is the
stage on screen, tab visible), number of visits, questions, first-try count, wrong
picks, whether the roof-sign "name the building" step was needed and how it went.

Per **part** (5): sum of the above; time on the example vs time on the quiz
buildings; accuracy; slowest question; the digit place that caused most misses.

Per **run**: total active time (tab visible) and wall-clock time; time spent reading
examples vs answering; longest streak of first-try answers; number of hints shown
(the drag hint, the "click a glowing door" tip), ? help opens, view resets, part jumps;
whether the learner went through in order; number of restarts this session; device
(phone/tablet/desktop) and input (touch/pointer); reduced-motion preference.

Wrong picks are *what* gets counted — the course never times out or forces a wrong
answer, and a closed-then-reopened question is still one question.

## The existing visual system (the report must look like it belongs)
- Dark UI over a bright 3D scene. Panels: `background: rgba(20,24,30,.9–.94)`,
  `backdrop-filter: blur(6–8px)`, `border: 1px solid rgba(255,255,255,.14–.16)`,
  `border-radius: 14–18px`, `box-shadow: 0 10px 30px rgba(0,0,0,.45)`.
- Font: `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`. Body text `#eef2f6`,
  secondary `#9fb0c0`, muted `#6f8298`. Headings in **amber `#ffd9a0`**, 22 px bold.
- Primary button: pill, green `#57c97e` on `#08130c` text, 16 px 600. Ghost button:
  `rgba(255,255,255,.10)` fill, 1 px `rgba(255,255,255,.20)` border, white text.
- Semantic colours already in use: success `#7ee0a0`, error `#ff9a8a`, highlight
  yellow `#ffd54a` (used for the progress "now" segment and halos), progress "done"
  green `#57c97e`, idle grey `rgba(255,255,255,.18)`.
- **Digit-place colours** the whole course teaches with, and the report should reuse
  when it talks about digits: building `#f28c6a` (coral), floor `#7cc4ff` (sky blue),
  door `#eef2f6` (white). Chips of these appear above every quiz as a key.
- The jump bar shows a 14-segment progress bar (3 px gaps, 6 px tall, gaps at part
  boundaries) and a caption "Part 2 · Building 5 of 14".
- Numbers in the quiz use `font-variant-numeric: tabular-nums`.
- Focus ring: 3 px `#ffd54a` outline with a dark halo. `prefers-reduced-motion`
  turns every animation off. Colour is never the only carrier of meaning (WCAG 1.4.1).
- Phone portrait ≤ 640 px: dialog is full-screen (`inset: 0`, no radius). Landscape
  phones are ≤ 520 px tall. Tap targets ≥ 44 px on coarse pointers.
- Contrast on the panel background `#14181e` has been verified for every colour
  above (all ≥ AA). Don't introduce a colour that fails 4.5:1 on it for text.

## Hard constraints
- Plain HTML + CSS + ES-module JS. **No libraries** (no chart libs, no fonts to load).
  Inline SVG and CSS-drawn bars are fine.
- The report lives inside the existing fixed dialog: desktop up to ~560–640 px wide,
  scrollable inside if taller than the viewport; phones full-screen scrollable.
- Must be a real dialog: `role="dialog"`, labelled by its heading, focus moves into
  it, Escape closes, screen readers get every number as text (bars are decoration).
- Must read in under ~20 seconds for the "just tell me how I did" learner, and offer
  detail for the curious one.
- Same report on all four visual looks (it is UI chrome, not part of the 3D look).

## What we need from you
Write a spec another engineer can implement without asking questions, as Markdown at
the path given in your instructions, ≤ 250 lines. Cover, in this order:

1. **Principles** (3–5 bullets: what this screen is for, what it must never do).
2. **Information hierarchy**: what the learner sees first, second, third; what is
   behind a "details" affordance; what is left out entirely (and why).
3. **The grade model**: the exact formula, thresholds and labels/wording. Say how it
   handles the 4-option floor, the building-name questions, restarts and jumping
   around. Say whether it is a letter, a percentage, stars, a phrase, or something
   else, and why.
4. **Time**: how per-part and per-question time is shown (units, rounding, what
   "slow" means, whether to compare against anything), and what to do with
   hidden-tab / idle time.
5. **Per-question detail**: whether it appears, and exactly how (list, grid, table,
   per-building rows…), including how a missed digit place is shown.
6. **Copy**: every string on the screen — headline variants by outcome, section
   titles, labels, button labels, empty/edge-case text (e.g. a perfect run, a run
   with a restart, a run done out of order).
7. **Layout**: ASCII sketches for desktop (~560 px) and phone portrait (~390 px),
   plus a note on landscape phones.
8. **Visual spec**: sizes, spacing, type scale, colours (from the system above),
   bar/meter/chart construction, iconography if any.
9. **Motion**: what animates (and the reduced-motion fallback), and whether the
   confetti cannons stay.
10. **Accessibility**: focus order, what a screen reader hears first, live-region
    use, keyboard.
11. **Your strongest opinion** in two sentences, and **three open questions for the
    other designer** working on this brief in parallel (they have a different
    background; a synthesis will follow).

Ground your choices in the actual files: read the `<style>` block and the `#finale`
markup in `/home/user/Stop_Finder/apartment-mockup.html` (lines 1–520), the
existing reward design doc
`/home/user/Stop_Finder/docs/apartment-course-review/design/10-reward-progress-flow.md`,
and, for the audience, the learner reviews in
`/home/user/Stop_Finder/docs/apartment-course-review/reviews/` (01 Rosa, 02 Marcus,
04 Tobias, 12 Kai, 13 Sam, 14 Leilani are the most relevant). Do not edit any repo
file; write only your spec.
