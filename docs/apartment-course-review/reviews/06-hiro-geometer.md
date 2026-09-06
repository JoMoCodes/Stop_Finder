# Hiro Tanaka — Geometer's Review

The course teaches real numbering patterns well. Parts 1–3 establish clear rules; Parts 4–5 show the exceptions. But Part 5's *cyclic order is intricate and non-symmetric*, which makes it harder to see at a glance.

## Part 1: Arrows are decisive

The yellow arrows in the example (00-part1-example.png) clearly mark the reading direction on the front face. They say: "this is where your eyes go." The learner sees 101 → 102 → arrow to 103, then the pattern repeats upstairs. This works. The 3D angle is friendly — roughly 45°, not too steep, not too flat.

## Part 4: The 3D challenge

The Part 4 example (10-part4-example.png) shows a 4-story block with doors on the front and back. The building sits in view, and the instruction says *"drag to spin around and check the back."* This is where geometry matters: the camera starts at position (10, BH × 0.5, 42), looking down at the building from above-right. From there, the front face is readable; the back is hidden behind the building's depth. The learner must rotate to see it. Good.

But here is the first hint of a spatial knot: the back doors are directly *behind* the front doors, not offset. When you spin the view 180° to see the back, the left and right directions flip. Door 10407 (front) is on the left; door 10408 (back) is on the right. This is geometrically correct but cognitively jarring. The instruction calls it out: *"numbers wrap around the front and the back."* That helps.

## Part 5: Asymmetry hiding in plain sight

Part 5 shows a 3-story building with 20 units (601–620) arranged around all four faces. The `SQ_LAYOUT` array reveals the actual order:

- **Floor 1, left wall** (doors face outward left): 1, 2, 3, 4 — numbered *front to back*.
- **Floor 1, back wall**: 5, 6
- **Floor 1, front wall**: 7, 8
- **Floor 1, right wall** (doors face outward right): 17, 18, 19, 20 — numbered *back to front*.

The right wall reverses direction. The reading order is not a simple *clockwise* or *counterclockwise* loop around the perimeter. Instead, it has bilateral asymmetry: the left side goes one way, the right side goes the opposite way.

### Why this breaks intuition

When you're viewing from the left side (via the "Walk around" button), the doors read 601, 602, 603, 604 left to right. When you're viewing from the right side, the doors read 620, 619, 618, 617 *also* left to right — but that's the *opposite* cyclic direction around the building. The two views tell different stories about what "increasing" means.

### How the camera makes it worse

The `setSeqView()` function places the camera at equal distances:

```
front:  (0, 9, 38)
back:   (0, 9, -38)
left:   (-40, 9, 0)
right:  (40, 9, 0)
```

All four views put you at a clean 90° sight lines — orthogonal to each face. This is *visually clear* (no foreshortening), but it hides the asymmetry. When you jump between left and right, your brain doesn't see a continuous walk around the building; it sees two *opposite* readings of the same house. The dollhouse example (12-part5-example-view-back/left/right.png) shows this well: the right view (620, 619, 618, 617) is a mirror image of the left view, not a continuation.

### The consequence

A learner who walks through all four faces sees units counting up as 601→604 (left), then jumping to 605→608 (bottom), then 609→612 (back), then 613→616 (top), then finally 617→620 (right). That's not a *single* unified walk; it's a zigzag. The "Walk around" buttons make it easy to navigate, but they don't teach you the *coherence* of the numbering. There is no single rule — only a memo: *"left goes one way, right goes the other."*

## Part 5 in 3D isometric view

The initial framing (12-part5-example.png) shows the building at an angle: camera at (-30, 9, 34). From here you see three faces at once — left, front, and a bit of the right. The right-wall doors (617–620) are foreshortened and hard to read. The left-wall doors (601–604) are clearer. This angle *does* suggest the asymmetry, but only if you're looking closely. The quiz has a blank door on each face; the learner must click it to see the question. They won't "see the shape" of the 20-unit sequence until they've clicked several doors and filled in the numbers.

## Part 2 and 3: A respite

Parts 2 and 3 have simpler geometries. Part 2 is a tall walk-up with a single front face; the floor digit is obvious (a big arrow with floor badges). Part 3 is a wide row with five doors per floor; the building number is named via a banner. Both have clear, single-face geometries. Part 2's camera angle (0, TH × 0.42, 0) is centered; Part 3's is centered but slightly higher (0, RH × 0.85, 0). Both work.

## What works

- **Parts 1–3 establish confidence.** The examples use arrows and badges to guide the eye. The quiz layout (prompt top, quiz panel right) is consistent and readable.
- **Yellow unit plates are high contrast** against brick and siding. Even on mobile (mobile-part1-quiz.png), the font is legible at distance.
- **The "Walk around" buttons in Part 5 are a clear affordance.** Their labels and layout (left sidebar, vertical stack) are intuitive.
- **Camera positions are orthogonal to each building type.** No weird foreshortening or clipping; the learner sees what they're looking at.

## What is hard

- **Part 5's cyclic order has no single intuitive rule.** It's not "clockwise" or "counterclockwise"; it's a specific pattern that requires memorization.
- **The right wall reverses direction.** This is realistic but breaks the left-right symmetry a learner might expect.
- **The initial isometric angle hides some doors.** The right wall, in particular, is hard to see from the default camera position (-30, 9, 34).
- **The quiz doesn't teach the full shape.** Clicking individual doors and guessing their numbers is a reasonable exercise, but it doesn't give a learner a visual *model* of why 601 is on the left-front and 620 is on the right-front.

## A small suggestion

Part 5 could benefit from a visual aid — perhaps a top-down schematic diagram on the prompt banner, showing the 20-unit layout as a numbered loop around a rectangle. This would make the asymmetry explicit: *"Left wall: 1, 2, 3, 4 (front to back). Right wall: 20, 19, 18, 17 (front to back)."* Right now, the learner has to infer this rule by clicking doors and seeing the numbers fill in. A diagram would make the rule visible up front.

Alternatively, an animation showing a camera walk around the perimeter (or a "trace the path" mode) could teach the sequence without requiring the learner to mentally reconstruct it.

## In closing

The course is well-made. The geometry is correct, the camera work is clear, and the progression (simple → complex) is sound. Part 5 is the hardest because real buildings often have asymmetric, non-obvious numbering. This course doesn't shy away from that reality. But it also means a learner needs more time, more clicks, and more mental effort to see the pattern. That's fair — it's a hard pattern. But it could be *visible* sooner with a simple diagram.
