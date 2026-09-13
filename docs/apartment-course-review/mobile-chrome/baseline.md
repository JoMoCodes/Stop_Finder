# Baseline measurements of the apartment course UI (before any change)

Measured in the Browser pane with device emulation. Pixel values are CSS px, `x,y` = top-left corner, `w×h` = size.

## Phone portrait, 375×812 (touch, `pointer: coarse`)
Stage 0 (Part 1 worked example):
| element | x,y | w×h | notes |
|---|---|---|---|
| #prompt | 8,8 | 359×93 | title 16px, body 15px (the `short` wording). The prompt + jump bar together take the top 187px = 23% of the height. |
| #jumpbar | 8,117 | 266×70 | five 44px round buttons + the 14-segment progress bar |
| #doorsleft chip | 271,191 | 96×39 | quiz stages only ("1 door left") |
| #helpbtn "?" | 323,241 | 44×44 | |
| #lookbar (Home + Appearance) | 8,636 | 125×106 | a stacked two-row list at the bottom left, 106px tall |
| #bottombar (Back / Next) | 8,754 | 359×46 | one centred pill |
| building | — | — | the 4-plex sits roughly in y 345…455, i.e. the middle 14% of the screen; plates ≈ 30×12px; large empty lawn between the building (y≈455) and the lookbar (y=636) |

Quiz open on stage 1 (bottom sheet): #quiz spans the full width from the bottom, 2×2 option grid, options 56px tall, numerals 24px, × close 44×44. (Measured earlier: max-height 60vh.)

Notes:
- The prompt's wording variant (`short` on ≤640px) is chosen when a stage starts, not on resize/rotation.
- The screen-reader door list cannot be clicked by ref from the Browser pane (it is 1px, clipped); use the keyboard route instead: click the sky in the 3D view, press Tab (focus lands on the first unsolved door's hidden button), Enter.

## Phone landscape, 812×375 (custom size → NO touch emulation in the pane; `pointer: coarse` is false, `hover: hover` true)
Stage 0:
| element | x,y | w×h | notes |
|---|---|---|---|
| #prompt | 8,8 | 422×99 | title 14px, body 13px, but the LONG body wording (the `short` variant only applies ≤640px wide) — 99px = 26% of the height |
| #lookbar | 600,8 | 204×42 | top right: Home + "Appearance ▼" in one pill |
| #jumpbar | 8,299 | 246×68 | bottom left |
| #bottombar | 726,330 | 78×37 | bottom right, 37px tall (no coarse-pointer minimum at this width without touch emulation) |
| #helpbtn | — | — | display:none in landscape |
| building | — | — | fills the middle nicely; plates readable |

For a touch-emulated landscape phone use `resize_window` width 740 × height 360 (the pane only emulates touch below 768px wide).

## Phone portrait, quiz sheet open (375x812, Part 1 building 2)
| element | x,y | w×h | notes |
|---|---|---|---|
| #quiz (bottom sheet) | 0,572 | 375×240 | 30% of the height; heading "Which unit is this?" + subline, 2×2 options |
| button.opt | — | 166×58 | numerals 24px |
| #qclose × | 326,577 | 44×44 | |
| #qmsg | 17,778 | 341×20 | feedback line |
The prompt, jump bar, "1 door left" chip and "?" button all stay on screen while the sheet is open; the building's ground-floor plates (y≈415) remain visible above the sheet. The Home/Appearance list and the bottom bar are covered by the sheet.

## Phone portrait, Part 4 worked example (Classic look)
The 4-storey block spans roughly y 330…455 (about 125px = 15% of the screen height); its five-digit plates are about 20×8px and cannot be read without zooming. Same framing rule as every stage (1.55× back-off), so this is the "too zoomed out" problem in all looks, not only Sunbelt.

## Phone portrait, Part 4 worked example (Sunbelt look) — the reported bug
The camera lands inside a neighbouring decorative building: the screen shows a beige stucco wall with one window filling the middle of the screen, the course building is invisible. Confirmed at 375×812.

## Desktop, 1280×720
| element | x,y | w×h |
|---|---|---|
| #prompt | 300,16 | 680×80 (centred) |
| #jumpbar | 16,16 | 258×100 (with the "Part 1 · Building 1 of 14" caption) |
| #bottombar | 584,643 | 113×49 (Next, centred) |
| #lookbar | 957,650 | 249×42 (Home + "Appearance Classic ▼", bottom right) |
| #helpbtn | 1218,652 | 40×40 |
