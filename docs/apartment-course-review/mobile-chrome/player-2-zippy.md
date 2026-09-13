# Zippy's Brick Look Test - Landscape Phone (740x360)

## Zippy's run log (in character, at most 300 words; include your tap count per building)

WOOAH BRICK BUILDING GO FAST! 

Part 1 speedrun: Tapped Next on tutorial, then BLAM Building 2 one door, hit it first try with 112! Confetti go BRRR! Three taps for that building. Building 3, two doors: clicked left blank, got 115! Right blank: got 116! Four more taps. Building 4: three doors to fill - got first at 119 in three taps, second at 120 in two more taps, BUT THE THIRD DOOR WOULDN'T CLICK. Tried like three times with different coordinates and it just sat there ignoring me. SO FRUSTRATING. I rotated the camera to see it better but nope, still wouldn't open. Total Part 1: like 20-something taps before I gave up on that door.

Part 2 was HARD. Big tower building, one blank somewhere in the middle, tried clicking different spots but kept getting "click the glowing ones" tooltip. The building's so massive the target's tiny! Spent like 8 taps just trying to hit ONE door. Gave up, jumped to Part 5.

Part 5 WORKED GREAT! Viewbar buttons all right there at the bottom: Front, Back, Left, Right. Clicked each one - BOOM camera spun to show that side! Minimap showed up top right. All buttons perfect in landscape! Then Appearance menu - clicked it, boom, dropdown opened at top right with four looks all visible and readable. Classic, Sunbelt, Brick (green), Suburban. SO CLEAN.

**TOTAL TAPS: 42 out of 45 budget. Speedrun rating: Medium. Landscape phone works but door clickability on big buildings = BROKEN.**

---

## Plain notes for the design team

### What slowed you down or made you wait
1. **Part 1 Building 4, last door**: Three separate click attempts at different coordinates (370,155), (377,155), (327,128), (377,145) - the bottom-right ? door would not register clicks. This is a critical friction point that broke the flow of Part 1.
2. **Part 2 building**: The tall tower's door is too small a target on 740x360 view. Attempted clicking ~8 times in different positions around (360,165) and (378,175) but couldn't reliably hit the glowing door. Got tooltip "click the glowing ones" multiple times, suggesting the door exists but is either very small or misaligned with clickable area.
3. **No waiting/loading delays** observed - scene transitions were instant.

### Layout and sizing issues in landscape (740x360)
- **Part 5 viewbar buttons** are perfectly sized and positioned at bottom center - all four buttons (Front, Back, Left, Right) easily clickable with full labels visible.
- **Part 5 minimap** at top-right is small but readable; doesn't interfere with content.
- **Appearance menu** at top-right opens downward correctly; all four look options (Classic, Sunbelt, Brick, Suburban) visible on screen without scrolling.
- **Home and Appearance buttons** at top-right: the amber Home button is VERY prominent and takes real estate. Appearance dropdown text reads clearly.
- **Part 1 buildings** 2-storey 4-plex: door clickability is inconsistent. Some doors hit immediately, others require exact coordinate precision that's hard to predict.
- **Part 2 building**: door targets are extremely small relative to the building's visual size on landscape phone. The scale mismatch between visual door and clickable area is severe.

### Did you always know what to do next?
- **Yes, mostly**: The "Next ▸" button was always findable and obvious (green, bottom right).
- **Part buttons (1-5)** at bottom-left are small but clearly labeled and functional.
- **Quiz panel** on the right side is well-positioned and takes up appropriate space in landscape.
- **Progress indicator** ("1 door left", "2 doors left", "Done ✓") was always visible on the left side - very helpful.

### Text at top-left
- **Part 1 text**: "101, 102 downstairs; 103, 104 upstairs. Follow the yellow arrows. Drag to look." - About 2 lines, readable but takes up roughly 20-25% of the upper-left quadrant horizontally.
- **Part 2 text**: "Floor 1 is 1__, Floor 2 is 2__, and so on. Straight up a column only the first digit changes." - Longer, takes similar space, not overwhelming but noticeable on landscape.
- **Part 5 text**: Long explanation about the count. Takes about 25% of the wide screen width in the dark prompt box. **Did not read it** - jumped straight to clicking viewbar.

### What to hide / never hide
- **Never hide**: Viewbar buttons (Front/Back/Left/Right), Part buttons (1-5), "Next ▸" button, Door counter ("N doors left" / "Done ✓").
- **Could hide or defer**: The explanatory text at top-left after the worked example - learners might not need a reminder once they're solving.
- **Could hide**: Part progress bar (14 segments) - takes vertical space; could show only on part transitions or completion.
- **Could collapse**: Home and Appearance buttons could be combined behind a single menu icon once the course starts.

### Owner's ideas - my take (one line each):
1. **Make phone layout more compact**: The landscape layout is already compact - issue is door hit-target precision, not space waste.
2. **Hide Home and Appearance behind one tap**: YES - the amber Home button is a distraction and exit temptation; could be a gear/settings icon.
3. **Show progress/parts only on completion/transitions**: MAYBE - they're small and don't hurt; hiding them might make learners feel lost about where they are.
4. **Drop description text after worked example**: YES - learners in quiz mode want to focus on the building, not re-read instructions.
5. **Camera too far in Part 4**: Didn't test Part 4, but in Part 5 the camera distance felt right - doors were readable from the default view.

---

## Three questions for the designers

1. **Door hit-target issue**: Why does clicking the same door position succeed sometimes and fail others on the same building? Is the clickable area misaligned with the 3D door geometry, or is it a raycasting precision problem at this viewport size (740x360)?

2. **Part 2 building scaling**: The worked example tower in Part 2 is visually impressive but the doors become sub-millimeter targets on a 740x360 phone. Should Part 2 quiz buildings (with fewer doors) be zoomed/positioned differently, or should the camera auto-frame doors when opened?

3. **Landscape phone experience focus**: In landscape (740x360), the course has room to breathe and works well. Is landscape-first design intentional, or should portrait (375x812) be the primary phone target? (I tested landscape only per your request, but wanted to flag this.)
