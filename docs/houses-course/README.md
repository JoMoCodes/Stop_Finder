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
| 2 | **Numbers rise away from the start of the street** — the baseline (a main road, the river, the town centre) — on both sides at once. | Two numbers tell you which way to drive; a lower number means turn round. |
| 3 | **Each block is a hundred.** Crossing a street bumps the number to the next hundred: 100 block, 200 block … 1200 block. The leading digits are the *block* (how many streets from the start), the last two digits count along it; street-sign blades often carry the block number. | 1245 is in the 1200 block, twelve blocks from the baseline. You can count cross streets instead of reading every house. |
| 4 | **Gaps are normal.** Numbers are assigned by *frontage* (distance along the street, so many feet per number), not one per house: 1402, 1410, 1416. A wide lot eats several numbers. | A missing number is not a missing house, and the exact gap tells you nothing. Bracket the stop between its neighbours; side, direction and block still hold. |
| 5 | **Round a court** (cul-de-sac) the numbers rise going in, odd one side and even the other, right round the bulb until the two sides meet at the far end. Corner houses face the main street and take its numbers. Some courts, closes and older lanes instead count round in **one run** (1, 2, 3 … up one side, back down the other): two neighbours one apart give it away. | Loops are where drivers lose the thread: walk the bulb once and the pattern reappears. |

Patterns the course does not teach (yet): quadrant prefixes (N / S / E / W of
the baseline), distance-based rural numbering (thousands per mile), letter and
half suffixes for infill (12A, 12½), and streets that reset numbering at each
municipality line.

## The five parts (15 streets, 50 questions)

| Part | Streets | Type | What changes |
|------|---------|------|--------------|
| 1 · Odd side, even side | Maple St (example) · Elm St · Birch St | `street` | one block, 5 houses a side; Birch swaps the sides so the learner has to check a neighbour |
| 2 · Rising away from the start | Oak St (example, arrows from Main St) · Pine St · Cedar St | `street` | 6–7 houses a side; the quiz streets start the camera at the far end or mid-block, facing back, with blanks at the ends of the street |
| 3 · Each block is a hundred | Ash St (example, 100 / 200 / 300) · Hickory St (1100 / 1200) · Poplar St (2300–2500) | `block` | cross streets with blade signs carrying the block; partial numbers like `12▢3`, `__01`; the quiz key shows **block · lot** |
| 4 · Gaps are normal | Sycamore Dr (example) · Juniper Dr · Laurel Dr | `block` + `gaps` | explicit number lists per side; lot widths follow the number steps so a bigger jump is visibly a wider lot |
| 5 · Round the court | Willow Ct (example) · Hazel Ct (sides swapped) · Fern Ct (one run, 1–10) | `court` / `loop` | a main street with corner houses, an entrance with two lots a side, a bulb with three houses a side |

### The quiz
Every question offers four numbers. The three wrong ones each break exactly one
rule the part teaches, so a wrong pick says something:

- the **other side** (parity flipped: 1103 → 1104),
- the **wrong hundred** (1103 → 1003 / 1203) on the block and court streets,
- the **wrong spot** along the block (1103 → 1123). On the gap streets any
  same-parity number *between* the visible neighbours would fit the pattern, so
  the wrong spot always lies outside them (below the lower neighbour or above
  the upper one).

The broken rule is passed to `track.js` and `report.js` as the `place` of the
miss (`block` / `side` / `lot`), which is what "most misses were the side" in
the report and the `place` property of the `answer` event mean here. Wrong
picks get a one-line reason ("1104 is even — that's the other side of the
street"), and after a second miss the part's rule is appended.

## The scene

- **Metres.** Road 7 m wide, kerbs, 2 m sidewalks, 5 m front yards, house
  fronts 10.5 m from the road centre, regular lots 14 m, cross streets 8 m.
  The camera stands 1.65 m up. Every house carries its number over the door
  **and** on the mailbox at the kerb, so it can be read from the road.
- **Houses** are procedural (seeded by street and number, so a street rebuilds
  identically): one or two storeys, side or front gable, garage and driveway
  on wider lots, porch roof, windows, shrubs and a tree; twelve siding colours.
  On the court the bulb houses face its centre.
- **Viewpoints** sit on the road centre line: one per cross street and one
  every ~14 m along a block; on the court, five along the main street, three up
  the entrance and six round the bulb. Each viewpoint knows its `links` and a
  default `heading` (down the street toward rising numbers; round the bulb the
  way the left side counts).
- **Guides on example streets**: ODD SIDE / EVEN SIDE boards (Part 1), yellow
  arrows and a "numbers start here" board at Main St (Part 2), the coloured
  block · lot key and "+100" boards over each crossing (Part 3), "gaps are
  normal" boards (Part 4), arrows into and round the bulb (Part 5).
- **Street map** (bottom left): the road, cross streets and block numbers,
  every house (amber = blank, green = solved), the viewpoints as dots you can
  tap, and a "you are here" wedge that follows the camera. The court is drawn
  with its entrance running left to right so the map stays landscape.

## Controls

| Input | Does |
|-------|------|
| drag | look round (the scene follows the pointer, as in Street View), with a short glide after a flick |
| wheel · pinch | zoom (22°–80° field of view) |
| click an arrow on the road · a dot on the map · double-click the road | walk to that viewpoint (eased step, instant under reduced motion) |
| walk bar | turn left 45° · walk to the viewpoint ahead (or turn round at a dead end) · turn right 45° |
| ← → / A D · ↑ ↓ / W S · PgUp PgDn · Home | turn 20° · walk ahead / back · tilt · face down the street again |
| click a house marked `?` | open its options; 1–4 / a–d pick, Esc closes |

The Reset view chip appears when the view is zoomed, tilted well up or down,
or facing backwards. The first-run hint, the "click a glowing house" tip, the
`?` help button, the "N houses left" chip and the halos behind unsolved plates
work as in the apartment course.

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
sfHouses.go(7)        // show stage 7 (Hickory St)
sfHouses.walk(5)      // step to viewpoint 5
sfHouses.face(0)      // face north (degrees of yaw; -90 is up the street)
sfHouses.open(0)      // open the first unsolved house's options
sfHouses.solve()      // answer every open house on the street
sfReport.demo('nearly')   // the report with made-up data
```

`?debug` on the URL logs every tracking event.
