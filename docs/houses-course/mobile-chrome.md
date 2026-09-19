# Houses: the phone chrome

What shows when, on a phone, while the learner is answering. Implemented on
2026-09-18 in all four `houses-*.html` files (their CSS, DOM and course
JavaScript stay byte-identical, so the change is the same four times).

It is the apartment course's model, ported: the worked example that opens each
part keeps every panel in place (the tutorial), and the quiz streets fold the
frame so the street owns the screen. The reviews that produced that model —
and the reasoning behind each piece of it — are in
`docs/apartment-course-review/mobile-chrome/`; only the differences are
written down here.

## The chrome model as shipped

V = visible · fold = folded to a compact form (tap opens it) · H = hidden ·
SR = visually hidden, still read by screen readers.

| Element | Worked example (tutorial) | Quiz street, idle | Options open | Street finished |
|---|---|---|---|---|
| `#prompt` headline | V | V | V | "Elm St ✓" |
| `#prompt` body | V | first quiz street of the part: V until a house is opened; later streets: fold (▾, tap the headline) | SR | H (no body) |
| `#jumpbar` part buttons | V | fold: strip "Part 1 · 2 of 12" + progress + caret; tap the strip to show them for 6 s | H | shown for 3 s after a part is finished, the next part's button pulses once |
| `#progress` | V | V (in the strip) | H | V |
| `#doorsleft` chip | H | V, on the strip's row | SR | "Done ✓" |
| `#minimap` street map | behind the map button in the walk bar | same | H | same |
| `#lookbar` Home + Appearance | one `⋯` button on every phone layout (the menu holds amber Home + the four looks) | same | under the sheet | same |
| `#viewbar` walk bar | V (map · turn · walk · turn) | V | under the sheet (portrait) | V |
| `#bottombar` Back / Next | V | V | under the sheet (portrait) | V, "Next: Part N ▸" |
| `#helpbtn` `?` | V (bottom right portrait; hidden in landscape, as before) | V | H | V |
| `#resetview`, `#draghint` | as before | as before | H | as before |

Desktop and tablets keep every element exactly as they were. The two changes
that do reach them are the completion headline ("Elm St ✓") and the street
map's box, which is now only as tall as the street needs (below).

## Values

- Breakpoints: unchanged — `(max-width: 640px)` and
  `(max-height: 520px) and (orientation: landscape)`; the JavaScript uses the
  same pair (`isPhoneLayout()`).
- Strip: 33 px tall with a 44 px hit area (`::after`), portrait
  `top: var(--prompt-h) + 8px`, `left: 8px`, `right: calc(var(--chip-w) + 16px)`
  — `--chip-w` is the `#doorsleft` chip's rendered width, published by a
  `ResizeObserver` while the chip is visible, so "6 houses left ▸" sits beside
  the strip rather than over it (the strip takes the full width while
  expanded). Landscape: bottom left, 236 px wide, 284 px expanded.
- Peek: 3000 ms, only when the finished street is the last of its part; it
  starts on `quizclose` if the options are still open, so it is actually seen.
  Manual expand: 6000 ms, held while focus is inside the bar.
- The chip is a `<button>` here (it walks to the nearest unsolved house), so the
  `(pointer: coarse) button { min-height: 44px }` rule has to be undone
  explicitly for it to sit 32 px tall on the strip's row; it keeps a 44 px tap
  area through its own `::after`.
- Bottom row (portrait): `⋯` 44 px at left 8 / bottom 12, Back / Next centred,
  `?` 44 px at right 8 / bottom 12. Above it: the walk bar at bottom 68 (right),
  the Reset chip at bottom 122 (right).
- Landscape: `⋯` top right, strip bottom left, walk bar at left 284, options as
  a column on the right — all as before.
- The prompt uses its `short` body on **both** phone layouts (it was portrait
  only) and re-renders when the layout changes, so a rotation swaps the copy.

## The street map

Parked at 128 px wide on a phone, the map's viewpoint dots came out 4 px
across — nothing a finger can hit, which is what prompted this pass. It is now
behind a button, and bigger when it is out:

- A **map button** (a folded-map glyph) is the first control in the walk bar,
  on phone layouts only. It carries `aria-expanded` and toggles `body.map-open`.
  The map closes on a tap outside it, on Escape, when a dot is tapped (you
  walked, it has done its job), on a stage change and when a house's options
  open.
- **Open, portrait**: left 8 / right 8, bottom 122, so it fills the width above
  the walk bar — 359 × 172 px at 375 px wide. Its dots are 13.7 px across and
  sit in transparent tap discs 25.7 px wide, so a tap lands on the nearest
  viewpoint instead of between two. Landscape: above the walk bar at left 284,
  `min(46vw, 380px)`.
- The box **hugs the street**. `mmFit` used to fit the layout into a fixed
  220 × 110 viewBox; a three-block street (216 × 52 m) therefore sat in a band
  of empty box with half the height wasted. It now fits the width and takes
  only the height that needs (viewBox 220 × 64 … 220 × 140), which is why the
  map reads bigger at every size, desktop included.
- The marks are drawn larger while the map is open on a phone (`mmBig()`):
  dots 4.2 instead of 3.2, house squares ×1.3, the "you are here" wedge ×1.3.
- Tap targets are half the viewpoint spacing (capped at 14 units). On a
  16-viewpoint street that is about 11 px each way, which is the geometric
  limit: viewpoints are 14 m apart and a phone is 359 px wide. The map is the
  *secondary* way to walk — the road chevrons, the walk bar, tapping a house
  and the "N houses left" chip are all bigger targets — so this was the right
  trade rather than dropping the map from phones.

## Deviations from the apartment course

- **The strip goes away while the options are open** (the apartment keeps it).
  Houses frames the plate into the free part of the screen with `safeRect()`,
  which measures the prompt, the options panel and the walk bar but not the
  strip; hiding the strip keeps that measurement honest and gives the house
  the whole top of the screen. The chip is folded to screen-reader text in the
  same state, as in the apartment.
- **No `?` button in landscape.** Houses already hid it there, and the pass was
  about removing chrome, not adding it.
- **The folded prompt drops its ▾ caret while the options are open**: the body
  is folded away for screen readers in that state, so a tap on the headline
  could do nothing.
- The apartment's touch extras that belong to its own interaction (the sheet
  auto-close on touch, the nearest-plate tap snap, the plate tint) are not part
  of this pass; the Houses course frames the house instead, which is its own
  answer to the same problem.

## QA (Browser pane, all four looks unless stated)

- **Portrait 375 × 812**: the worked example keeps the prompt, the full jump bar
  and the four part buttons; the first quiz street of a part keeps its body; a
  later quiz street opens folded to its headline, and tapping the headline
  unfolds it; the strip reads "Part 1 · 2 of 12" with the chip beside it, both
  32–33 px on one row; tapping the strip opens the part buttons and hides the
  chip; opening a house leaves only the headline, the house and the sheet;
  finishing Birch St shows "Birch St ✓", "Done ✓", "Next: Part 2 ▸" and peeks
  the part buttons for 3 s with "2" pulsing (measured 1201 ms → 4201 ms after
  the last answer).
- **The map**: the button opens it across the width above the walk bar;
  tapping a dot walks there (viewpoint 7 confirmed) and closes it; Escape and a
  tap outside close it; the button's `aria-expanded` follows.
- **Landscape 740 × 360**: prompt and chip top left, `⋯` top right, strip bottom
  left, walk bar centre, Back bottom right, map opens above the walk bar.
- **Desktop 1280 × 800 and 1515 × 1270**: unchanged — full jump bar, full Home +
  Appearance pill, map bottom left (centre right and up to 440 px wide on big
  desktops), no map button, no strip, no `⋯`.
- No console errors on any layout in Classic, Sunbelt, Brick or Suburban.
