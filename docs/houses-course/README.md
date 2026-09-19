# Houses — house-numbering patterns in a Street View scene

`houses.html` is the second course on the site. It teaches how house numbers are
handed out along a street, in a first-person 3D scene modelled on Google Street
View: you stand at eye height on the road at one of a chain of **viewpoints**,
drag to look round, zoom with the wheel or a pinch, and walk by clicking the
arrows on the road, tapping a dot on the street map, or with the arrow keys.
Each stage is one street; blank houses show `?` or a partial number and open the
quiz. Everything else — the prompt banner, the quiz panel, the jump bar, the
progress bar, the end-of-run report and the tracking — is the apartment course's
machinery, reused unchanged through the same panel ids and `document` events.

## The patterns (what a driver needs to know)

Most streets in North America and much of the world follow these rules, in
this order of usefulness when you are looking for a stop:

| # | Pattern | Why it matters on the road |
|---|---------|----------------------------|
| 1 | **Odd on one side, even on the other.** Houses facing each other are one apart (105 faces 106). | Read one number and you know which side of the street to scan. Which side is odd varies by town, so check a neighbour rather than remembering a rule. |
| 2 | **Numbers rise or fall depending on your direction.** Away from the start of the street — the baseline (a main road, the river, the town centre) — they rise on both sides at once; back toward it they fall. | Two numbers tell you which way to drive; a lower number means turn round. |
| 3 | **Round a court** (cul-de-sac) the numbers rise going in, odd one side and even the other, right round the bulb until the two sides meet at the far end. Corner houses face the main street and take its numbers. Some courts, closes and older lanes instead count round in **one run** (1, 2, 3 … up one side, back down the other): two neighbours one apart give it away. | Loops are where drivers lose the thread: walk the bulb once and the pattern reappears. |
| 4 | **Each block is a hundred.** Crossing a street bumps the number to the next hundred: 100 block, 200 block … 1200 block. The leading digits are the *block* (how many streets from the start), the last two digits count along it; street-sign blades often carry the block number. | 1245 is in the 1200 block, twelve blocks from the baseline. You can count cross streets instead of reading every house. |

The step between neighbours is not always two: the second street of Parts 1–3
counts by four (201, 205, 209 …), so the learner reads the step off two
neighbours instead of assuming it.

Patterns the course does not teach (yet): gaps in the numbers (numbers handed
out by frontage, so a wide lot eats several: 1402, 1410, 1416 — the old Part 4,
dropped in September 2026), quadrant prefixes (N / S / E / W of the baseline),
distance-based rural numbering (thousands per mile), letter and half suffixes
for infill (12A, 12½), and streets that reset numbering at each municipality
line.

## The four parts (12 streets, 45 questions)

| Part | Streets | Type | What changes |
|------|---------|------|--------------|
| 1 · Odd or Even? | Maple St (example) · Elm St · Birch St | `street` | one block, 5 houses a side; Elm St is 8 a side counting by four (`step: 4`, six blanks); Birch swaps the sides so the learner has to check a neighbour |
| 2 · Numbers rise or fall depending on your direction | Oak St (example, arrows and a "numbers rise / numbers fall" board pair from Main St) · Pine St · Cedar St | `street` | 6–9 houses a side; Pine St counts by four; the quiz streets start the camera at the far end or mid-block, facing back, with blanks at the ends of the street |
| 3 · Round the court | Willow Ct (example) · Hazel Ct (sides swapped, counting by four) · Fern Ct (one run, 1–14) | `court` / `loop` | a main street with corner houses, an entrance with four lots a side, a bulb with three houses a side; no mailboxes (`mailbox: false`), so the number is read off the house |
| 4 · Each block is a hundred | Ash St (example, 100 / 200 / 300) · Hickory St (1100 / 1200) · Poplar St (2300–2500) | `block` | cross streets with blade signs carrying the block; partial numbers like `12▢3`, `__01`; the quiz key shows **block · lot** |

### The quiz
Every question offers four numbers. The three wrong ones each break exactly one
rule the part teaches, so a wrong pick says something:

- the **other side** (parity flipped: 1103 → 1104),
- the **wrong hundred** (1103 → 1003 / 1203) on the block and court streets,
- the **wrong spot** along the block (1103 → 1123). On a street that counts by
  four the nearest wrong spot is two away (209 → 207 / 211): the right side,
  but not on the step.

The broken rule is passed to `track.js` and `report.js` as the `place` of the
miss (`block` / `side` / `lot`), which is what "most misses were the side" in
the report and the `place` property of the `answer` event mean here. Wrong
picks get a one-line reason ("1104 is even — that's the other side of the
street"), and after a second miss the part's rule is appended.

## The scene

- **Metres.** Road 7 m wide, kerbs, 2 m sidewalks, 5 m front yards, house
  fronts 10.5 m from the road centre, regular lots 14 m, cross streets 8 m.
  The camera stands 1.65 m up. Every house carries its number over the door
  **and** on the mailbox at the kerb, so it can be read from the road — except
  on the courts, which have no mailboxes.
- **Houses** are procedural (seeded by street and number, so a street rebuilds
  identically): one or two storeys, side or front gable, garage and driveway
  on wider lots, porch roof, windows, shrubs and a tree; twelve siding colours.
  On the court the bulb houses face its centre.
- **Viewpoints** sit on the road centre line: one per cross street and one
  every ~14 m along a block; on the court, five along the main street, five up
  the entrance and six round the bulb. Each viewpoint knows its `links` and a
  default `heading` (down the street toward rising numbers; round the bulb the
  way the left side counts). A click on the road takes the viewpoint nearest
  that spot, out to 8.5 m — further than half the gap between two of them, so
  there is nowhere on the road a tap does nothing — and the step takes longer
  the further it goes, so a tap at the end of the street reads as a walk rather
  than a jump.
- **Guides on example streets**: ODD SIDE / EVEN SIDE boards (Part 1), yellow
  arrows, a "numbers start here" board at Main St and a NUMBERS RISE / NUMBERS
  FALL pair mid-block (Part 2), arrows into and round the bulb (Part 3), the
  coloured block · lot key and "+100" boards over each crossing (Part 4).
- **Street map** (bottom left; centre right on big desktops): the road, cross streets and block numbers,
  every house (amber = blank, green = solved), the viewpoints as dots you can
  tap, and a "you are here" wedge that follows the camera. The court is drawn
  with its entrance running left to right so the map stays landscape. Its box
  is only as tall as the street needs (a three-block street is a wide, shallow
  picture), so nothing is wasted on empty band. On big
  desktops (1280 x 900 and up) it sits at the centre right, above a house's options while
  they are open, and grows with the window, up to 440 px wide. **On a phone it
  is behind the map button in the walk bar** and opens across the width, where
  its dots are big enough to hit — see `mobile-chrome.md`.

## Controls

| Input | Does |
|-------|------|
| drag | look round, with a glide after a flick. One thumb-swipe comes about — see *Turning* below |
| wheel · pinch | zoom (22°–80° field of view). A trackpad's two-finger sweep sideways turns instead |
| click anywhere on the road · an arrow on it · a dot on the map · double-click the road | walk to the nearest viewpoint there (eased step, longer for a longer walk, instant under reduced motion) |
| walk bar | turn left 45° · walk to the viewpoint ahead · turn right 45°. **Hold** a turn arrow and it keeps turning, 105° a second. With nothing ahead — square-on to a house, which is where reading a number leaves you — the walk button turns you back to the road instead (at the end of a street that is the turn round it always was), and the next press walks |
| ← → / A D · ↑ ↓ / W S · PgUp PgDn · Home | turn 26° · walk ahead / back · tilt · face down the street again |
| click a house marked `?` | open its options; 1–4 / a–d pick, Esc closes. The camera walks to the viewpoint in front of the house and faces its number (see *Reading a number* below) |
| click any other house | walk up to it and face its number, so a neighbour can be read from a phone |
| the "N houses left" chip | walk to the nearest house still to fill in and face it |
| the map button in the walk bar (phones only) | show / hide the street map; Escape, a tap outside or a tap on a dot closes it again |
| Home + Appearance (bottom right; one `⋯` button on a phone) | back to the menu, or switch between the four looks of the course: Classic, Sunbelt, Brick, Suburban |

The Reset view chip appears when the view is zoomed, tilted well up or down,
or facing backwards. The first-run hint, the "click a glowing house" tip, the
`?` help button, the "N houses left" chip and the halos behind unsolved plates
work as in the apartment course.

## Turning

The course used to let the world follow the finger exactly — a drag across the
canvas turned one field of view. That is the honest rate, and it read as stuck,
because this camera's *horizontal* field is narrow: 38° on a portrait phone,
77° on a desktop. Coming about took 1975 px of swiping on a phone and 2230 px on
a desktop — five screen-widths and two. (The apartment course, orbiting a
building, turns 360° per canvas height; nothing here needs to be that quick, but
the gap was the complaint.)

`dragRates(pointerType)` now cuts the rate from the **horizontal** field across
the canvas **width** and multiplies it: `TURN_GAIN_TOUCH` 3.4 for a thumb,
`TURN_GAIN_MOUSE` 2.6 for a mouse, which can be dragged further and wants the
finer hand. Tilt keeps `TILT_GAIN` 1.3 of the vertical field across the height —
its whole range is 84°, so it is an axis you place rather than throw. Because
the rate is still cut from the field of view, a zoomed-in view slows down in
step and a plate can still be framed by hand.

| | before | now |
|---|---|---|
| phone portrait (375 px) | 0.091°/px · 180° in 1975 px | 0.348°/px · 180° in 517 px |
| desktop (1024 px) | 0.081°/px · 180° in 2230 px | 0.197°/px · 180° in 916 px |
| one 250 px thumb-swipe | 23° | 87°, or **172°** with its glide |

The glide is the other half of it. The speed handed to it is read off the last
90 ms of the drag (`trackFlick` / `releaseFlick`) rather than off the final
pointer event, so a swipe that eases off still carries and a finger that came to
rest stops dead; it is capped (`FLICK_MAX_YAW`, about 975° a second) so the
hardest flick spins you most of the way round and no further, and the loop
decays it by the clock (`GLIDE_DECAY`), so the tail is the same length on a
60 Hz screen and a 120 Hz one. Under reduced motion there is no glide at all.

Two more ways round, for anyone who would rather not swipe: **holding** a walk-bar
turn arrow keeps turning at 105° a second after a 240 ms press (a tap still
turns its 45°), and a trackpad's two-finger sweep sideways turns while a
vertical one still zooms.

## Reading a number

On a phone the plates are a few pixels wide from down the street, and the
options sheet covers the bottom of the screen, so the course brings the number
to the learner rather than the other way round:

- When a house's options open (a tap, or the house list for screen readers),
  the camera **walks to the viewpoint that sees the plate best** (the nearest
  one that looks at it roughly face-on) and **turns to put the plate at the
  centre of the free part of the screen** — below the prompt, above the sheet
  on a portrait phone, beside the panel on desktop and landscape. The step and
  the turn run together (instant under reduced motion). On phone layouts the
  field of view also tightens until the plate is about 80 CSS px wide, and
  opens out again when the options close, still facing the house, unless the
  learner has looked elsewhere in the meantime. Nothing moves when the plate is
  already readable and in view.
- A tap on **any other house** does the same walk-up, which is how a neighbour
  is read on a phone (the tap picks the nearest house under the finger, so a
  house in front never opens one behind it).
- The **"N houses left" chip** is a button: it walks to the nearest unsolved
  house that is not already readable on screen.
- While the sheet is open on a phone the prompt shrinks to its title and the
  progress strip, chip, map, hint, help and reset chip step aside, so the house
  has the top two-thirds of the screen. On touch screens the copy says *tap*
  rather than *click*. The rest of the phone frame — which panels fold on a quiz
  street and which stay put on a worked example — is in `mobile-chrome.md`.

These walk-ups are reported to `track.js` as `walk` events with `via` =
`frame` (options opened), `look` (a numbered house tapped) or `find` (the chip).

## Looks

The course has four looks, chosen from the Appearance menu in the site bar or
from the Houses card on the landing page. `houses.html` is the classic
flat-colour build; `houses-realistic-a/b/c.html` are copies of it with only the
visual layer replaced (colours, lighting, sky, materials and procedural
textures, street furniture, `buildHouse`, the two scene builders). Everything
above — layouts, streets, quiz, camera, map, report, accessibility — is
identical in all four. What each look is, and how it is built: `looks.md`.

## Accessibility

Same approach as the apartment course: the canvas is a focusable image with a
description of the street (each side's numbers in walking order, blanks
called out); a screen-reader list of buttons reaches every blank house ("House
showing 12▢3, third house on the left in the 1200 block — open its options");
a polite live region says where you are standing and facing after each step;
the quiz keeps focus, and everything moves instantly under reduced motion.

## Checking it

Open the page over HTTP (`python3 -m http.server`) and use the console handle:

```js
sfHouses.go(7)        // show stage 7 (Hazel Ct)
sfHouses.walk(5)      // step to viewpoint 5
sfHouses.face(0)      // face north (degrees of yaw; -90 is up the street)
sfHouses.open(0)      // open the first unsolved house's options
sfHouses.solve()      // answer every open house on the street
sfReport.demo('nearly')   // the report with made-up data
```

`?debug` on the URL logs every tracking event.
