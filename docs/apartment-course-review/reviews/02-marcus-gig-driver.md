# Marcus Bell — Gig Driver (Food Delivery)

Alright, so I'm pulling up on my phone in the dark while I'm standing in someone's lobby, one hand holding a bag, one hand on my cracked screen. This is the vibe.

## DESKTOP? Pretty solid, not gonna lie.

The Part 1 example (00-part1-example.png) — **those yellow arrows are GENIUS**. I'm reading the flow in like half a second. Building goes 101, 102, 103, 104, arrows show left-right-left-right pattern, I GET IT. The text up top uses **amber bold keywords** and I only need to catch "number layout · count up · yellow arrows · memorize · fill in missing." That's glanceable. The building itself is clean low-poly, colors pop (red, tan, green doors), no confusion.

Parts 2–4 scale up the complexity and the visual design SCALES WITH IT:
- Part 2 (04-part2-example.png): BIG fat yellow vertical arrow with floor numbers 1, 2, 3, 4 labeling the side. Again, I can read this in ONE LOOK. The 3-digit pattern is RIGHT THERE.
- Part 3: "Building 1" label hovering over the roof is chef's kiss — I know what I'm looking at instantly.
- Part 4: The building is more 3D (you gotta drag to see the back), but the instruction says "drag to spin around" in the prompt, and the unit numbers are still readable.

The quiz panel on the right (01-part1-quiz-quizopen.png) — PERFECT SIZE for my thumb. The options a) b) c) d) are BIG, the question "Which unit is this?" is clear, and the green/red feedback (text says it shakes on wrong answers, though I can't see animation in stills) means I KNOW if I'm right or wrong FAST.

**Buttons are where they should be:** Back (gray) on the bottom left, primary action (green pill, "Continue" or "Ready" or "Next") in the middle-right. I can tap the green button even while walking. The "Jump to part" nav buttons (1 2 3 4 5) at the top left are QUICK to reach if I want to restart or skip.

## MOBILE? Here's the problem.

Mobile-part1-quiz.png and mobile-part5-example.png are 390×844. The viewport is TIGHT.

**The instruction banner takes up 1/4 of the screen on mobile and the text WRAPS.** I'm reading "pattern going. Click a door marked ?, then pick its" — that's chopped across four lines. I can't glance-read that in half a second. On mobile, that dense instructional text needs to be SNAPPIER or in a collapsible section, because right now I'm scrolling my eyes VERTICALLY just to parse the prompt, and I don't have time for that when I'm standing in an apartment stairwell.

The building itself? TINY on mobile. Part 5's 20 doors around all four faces are rendered so small I can barely see the unit numbers. The 3D scene got squished. I need the numbers READABLE from phone-distance in dim lighting. Right now, on mobile Part 5, the door plates are kinda hard to read.

The "Walk around" buttons (Front / Back / Left / Right) on mobile Part 5 — they're stacked vertically on the left in a narrow column. GOOD accessibility, but combined with the cramped viewport, it feels claustrophobic. On Part 5 mobile, I'm juggling buttons, buildings, and a tiny tap target all at once.

**The quiz options on mobile are smaller too.** Not deal-breaking, but the desktop version is more comfortable to tap.

## What I'd change (just the UX gripes):

1. **Mobile: Compress the instruction banner** — Keep the bold keywords and meaning, but cut the word count by like 30%. Give me the ESSENCE in under 2 lines if possible. "3-digit units: first digit = floor. Fill in the blanks." Done.
2. **Mobile: Bigger door plates.** The numbers on the unit doors (especially Part 5) are too small to read in a dark stairwell on a 390px viewport. Consider scaling up the 3D scene or repositioning the camera closer on mobile.
3. **Mobile: Maybe hide the "Jump to part" buttons under a menu?** They're useful but they do take up space. Or make them smaller/icon-only.
4. **Camera / drag-to-rotate hint:** The prompt says "drag to spin around" (Part 4 & 5), but nowhere does it say "scroll to zoom" or that you can pinch-zoom on mobile. A tiny one-time hint on first load would help. Or a little animation showing a finger dragging.
5. **Quiz shake animation:** I trust it's there (the briefing says it is), but on mobile it might be too fast or subtle to feel like good feedback when I tap. A RED background flash or a bigger shake might read better on a tiny screen.

## The good stuff stands out:

- **Visual hierarchy is CLEAN.** Building, then doors, then numbers. No clutter. The 3D low-poly style doesn't try to be photorealistic, which means every number and arrow reads clearly.
- **Color coding is SMART.** Red buildings, tan buildings, green doors, yellow arrows. My eyes know where to look without explanation.
- **The progression through 5 parts is pedagogically SOLID.** You start with a 2-story 4-plex (simple), end with a building you have to walk around (complex). The UI adapts (Part 5 adds the "Walk around" panel). That's good teaching.
- **The primary action button is ALWAYS green and BIG.** On both desktop and mobile, I can find the "Ready" or "Continue" button in the dark with one eye closed.

## Bottom line:

**Desktop version is great — you can teach someone to find an apartment in like 5 minutes and they'll REMEMBER the pattern. Mobile version works but it's cramped — the instruction text and the 3D buildings need more breathing room, especially in a dark, high-stress delivery environment.**

If I were on a desktop learning this for the first time, I'd be INTO IT. Fast, clear, fun even (confetti at the end is a nice touch). On mobile? I'd get it done, but I'd squint a little, and I'd miss some of the smaller details if the lighting was bad. For a gig driver using this while actually on a delivery, the mobile UX needs to be even FASTER and BOLDER.

**Seconds saved:** Desktop = ~1–2 seconds per building once you learn the pattern. Mobile = ~2–3 seconds because I'm working harder to read. You've got a 1-second delta to close on mobile.

Stay safe out there.
