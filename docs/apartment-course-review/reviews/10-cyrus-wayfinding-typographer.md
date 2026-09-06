# Cyrus Adebayo: Wayfinding & Environmental Graphics Review

I've signed buildings in airports and housing estates for twenty years. I think about sight lines, moment-of-recognition, and whether a number reads from ten metres or thirty. Here's what I see in this course.

## What Works Exceptionally Well

**Hierarchy is clean.** The progression from Part 1 (simple sequential, one small building) to Part 5 (twenty doors, running count, no floor digit) teaches the learner to read *three tiers* at once: building number, floor/position, unit. The visual weight matches the conceptual weight. Building names sit bold and dark at the top (like a canton or street-level fascia in real estates); floor indicators sit medium-scale on the left; unit plates sit smallest at the doors. That's textbook hierarchy, and it's intuitive.

**Contrast is excellent.** The white door plates (00-part1-example.png, 07-part3-example.png) pop against red and tan walls—I'd accept that on a real job. The dark banner for building numbers (rgba(20,24,30,0.92) with #ffe4c2 cream text) has the contrast ratio I'd specify in a signage brief. Red blanks (#c0392b) are a smart affordance: learners know instantly *this door needs filling*. No guesswork.

**Consistency in placement** is tight. Every unit plate sits at the same height relative to its door (position.y = base + 2.5 in the code). In real navigation, this is *gold*: once you see the pattern once, you know where to look next. Eyes search in the same spot, not wandering the facade.

**The floor-badge system in Part 2** (the yellow "1", "2", "3", "4" badges on the left) is how we actually do it at multi-story housing. A single, prominent marker per level, then doors follow a column below. The learner sees *one* number tells you the floor, and that's a real insight. The 3-digit system (first digit = floor) mirrors actual apartment numbering in Brazil and parts of Europe. You're teaching a real pattern.

**Typography is readable at distance.** The sans-serif, bold weight, and generous size (the code uses `bold 170px` for plates, `bold 320px` for building numbers) makes text legible at the default camera angle. No serifs cluttering the scene, no fussy font choices. That's disciplined.

## The Elephant in the Room: Oblique Viewing Angles

Here's where real-world delivery drivers would bump into friction.

**Part 5 is the turning point.** You have a 3D building with doors around all four faces. The learner presses "Front," "Back," "Left," "Right" and the camera snaps to each wall. When I look at the **left view** (12-part5-example-view-left.png), the door plates on the *receding* side are readable but compromised. The canvas text starts to pixelate under perspective; the angle is steep enough that small text gets hard. In real wayfinding, a delivery driver walking around this building would face exactly this problem.

**This is where most teaching sites stop.** They show you frontal views and call it done. But real navigation is *oblique*. You're not standing three metres directly in front of a door; you're walking past it at an angle, twenty metres away.

**A few professional approaches:**

1. **Skew the canvas texture** to pre-correct for the viewing angle. If a sign is mounted at 45°, render the text slanted so it reads straight when viewed at that angle. Three.js doesn't do this automatically; you'd need custom texture UV mapping or a pre-skewed canvas.

2. **Increase the resolution** for side-facing plates. Right now, `makeTextTexture` uses `w=512, h=256` by default. Plates facing oblique angles could use `w=1024, h=512` and anisotropic filtering (`tex.anisotropy = 8` is already set, which is good, but higher resolution helps).

3. **Scale up side-facing unit numbers** relative to front-facing ones. In real housing, the gable end (the side you see walking down the street) often has bigger numbers than the recessed facade.

4. **Place a duplicate sign on each corner**, angled outward. Real building signage does this: the same unit number on two perpendicular faces.

5. **Use high-contrast, reflective-looking materials.** A cream text on very dark grey reads better obliquely than a subtle grey-on-white.

**My advice:** Right now, Part 5 *implicitly teaches* that sides are harder to read—which is honest and real. But the course could *explicitly* address it. A quiz question could ask, "You're walking past on the left side; which unit are you at?" and show the oblique view. Or, implement one of the skew/resolution techniques above to make side views equally legible, teaching a lesson about *how real signage solves the angle problem*.

## UI & Interaction

**The prompt banner** (top center, dark, translucent) is spot-on. Bold amber keywords stand out: "yellow arrows," "building number," "fill in the missing unit numbers." That's good instructional design layered on wayfinding design. The contrast is high; the text hierarchy (bold for key terms) guides the eye.

**The quiz panel** (right side, dark semi-transparent) is clean and right-aligned so it doesn't occlude the building on mobile. The options `a) b) c) d)` are clearly labeled. The shake animation on wrong answers (implied by the brief, though not visible in static screenshots) is tactile feedback that wayfinding doesn't usually have—in real life, you'd just stand there confused. Here, the shake says *try again*. Smart.

**The "Jump to part" buttons** (top left) are circular, numbered 1-5, with a green highlight on the current part. Compact, scannable. Good.

**The "Walk around" panel** (Part 5 left side) is essential for a 3D multi-sided building. Front/Back/Left/Right buttons let the learner snap to each cardinal direction without scrolling or guessing. In a real estate or campus wayfinding app, this would be a compass or a carousel. Here, it's buttons, which is fine for a teaching context.

**Bottom buttons** ("Back" / "Continue" / "Next") are well-placed. The green "Continue" and "Next" buttons signal the primary action. Good color and placement.

**Mobile layout** (mobile-part1-quiz.png) scales the building down and keeps the UI elements accessible. The stacked layout on a narrow viewport is reasonable, though I'd note: the building gets very compressed. On a real mobile wayfinding app, you'd want to let the user pinch-zoom and rotate freely, which the orbit controls already support. No critique here.

## Details & Craft

- **The color palette** (reds, tans, creams, olive greens for the ground) is warm and readable. No garish neons or muddy greys. The road strip is a neutral grey. Professional.
  
- **The yellow arrows in Part 1** (00-part1-example.png) are high-contrast and show the reading order clearly. That's teaching-by-showing-the-path, which is effective. Real housing complexes sometimes use painted floor numbers or colored door frames for the same reason.

- **The door colors alternate** (red, tan) between floors and sides. That's visual rhythm and helps distinguish units. On real multi-unit buildings, door colors often do this too (tradition + practical navigation aid).

- **Blank plates in red** stand out. The `?` symbol is universal. Learners immediately know what to interact with.

- **The anisotropic filtering** (`tex.anisotropy = 8`) in the texture code is a small but smart touch—it improves text clarity when surfaces are tilted away from the camera. That shows care for rendering quality.

## Readability Across Stages

- **Part 1 (2-story 4-plex, 4 units):** Text is large relative to the building. Very readable. Learner can memorize instantly. Good onboarding.
  
- **Part 2 (4-story walk-up, 12 units):** Text is smaller but grouped clearly by floor. The floor badges anchor the hierarchy. Readable.
  
- **Part 3 (2-story row, 10 units):** Text is small here; plates are closer together. Still legible at default zoom, but the learner might need to zoom in on a quiz. The "Building 1" banner helps contextualize. Good.
  
- **Part 4 & 5 (block/walk-up, 20+ units):** Here, text density is high. Part 5's oblique views are where readability dips. Frontally: fine. Obliquely: degraded (as I noted above).

## Pedagogical Fit

From a *learning* perspective (not just visual), this course is tight. Each stage builds:
1. Sequential logic (Part 1).
2. Floor digit convention (Part 2).
3. Building prefix (Part 3).
4. All of the above on two faces (Part 4).
5. No-floor logic, single running count, all four faces (Part 5).

The *visual design* supports this progression. Simple buildings get simple plates. Complex buildings get more structure (banners, floor badges). That's cognitively sound.

## Summary

**You've built a wayfinding course that *feels* like real signage.** The hierarchy, contrast, and consistency are professional. The progression teaches real patterns that delivery drivers and residents actually encounter. The 3D model gives learners a spatial understanding that a 2D diagram can't.

**The weakness is oblique viewing.** Part 5's side views reveal that text degrades when not read head-on. In a real building, this would be solved by larger side plates, angled mounts, or duplicate signage. The course could either embrace this as a teaching moment (showing learners the real challenge) or implement perspective correction. Right now, it's somewhat glossed over.

**If I were designing a hospital or transit wayfinding, I'd show this course to my team.** The hierarchy, color discipline, and consistency are models. The oblique-viewing problem is something to *solve*, not something to hide—and solving it would make an already strong course exceptional.

Well done.
