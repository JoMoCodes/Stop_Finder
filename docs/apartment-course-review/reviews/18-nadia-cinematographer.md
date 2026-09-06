# A Cinematographer's Review: Stop Finder Apartment Course

*Nadia Petrova, Cinematographer*

---

## The Shot: A 50mm Perspective

You've chosen a 50-degree field of view—the classic "normal lens" that doesn't distort reality. That's a smart, pedagogical choice. No fish-eye tricks, no telescopic flattening. The buildings sit in frame the way a learner's eye would actually see them standing on a street. This is precision filming: you're not showing off the camera, you're serving the subject.

The framing itself is immaculate. The building occupies the center third of the canvas with breathing room above (for the prompt banner) and below (for the ground and UI). The horizon line runs steady across the olive green. The sky doesn't move. There's no cosmetic camera ease or slow pan—just intelligent, confident cuts between viewpoints.

---

## Light: Flat Intention, Not Accident

Here's where I got interested. You've lit this scene with *three* distinct layers—hemisphere, directional sun, ambient—and you've tuned them to near-perfect flatness. No hard shadows. No drama. That's deliberate.

In normal architectural photography, we'd add shadows for dimension and realism. You didn't. Why? Because a shadow falling across a door number *lies*. It hides information. Every unit number—the core content—must read at full contrast against the material color. The sky is washed-out periwinkle blue. The ground is diffuse. The directional sun (warm white, 0xfff4e0, intensity 1.05) illuminates the facades without creating occlusion.

This is teaching light, not beauty light. It reminds me of documentary—the kind where clarity matters more than aesthetics. Respected choice.

---

## The Camera Choreography: Jump Cuts as Technique

**frameStage()** is where the visual strategy emerges. For each building type, the camera holds a specific position and gaze:

- **Plex (Parts 1):** Eye-level at 60% height, looking *up* at the facade. This frames the 2-story structure with headroom, giving small buildings authority.
- **Tower (Part 2):** Side angle, camera at 50% height. The 4-story climb is now readable as a vertical stack of floor digits.
- **Row (Part 3):** Higher vantage (85% of building height), looking down. The wide horizontal array of doors spreads across the frame—you see the breadth, not the depth.
- **Block (Part 4):** Three-quarter angle, mid-height. Ready for the learner to drag and orbit, but opened with the front face in camera.
- **Seq (Part 5):** Low setup. The walk-up dollhouse is shot wide and flat, positioned so the wraparound count reads edge-to-edge. The camera sits intentionally low to prevent the "walkway lips" (those stair treads on the flanks) from clipping through the door plates.

Each camera placement is *motivated*. It's not arbitrary. It's saying: *This is how you should think about this building.*

And there are no transitions. No easing. No 2-second orbital swirl. The cuts are **instant**. Part 5's **setSeqView()** — Front / Back / Left / Right buttons — snaps the camera to four cardinal 90-degree angles. This is news-editor cutting, not cinematic motion. It works because it's *decisive*. There's no ambiguity about what you're looking at. The learner lands on a new face of the building, reads the numbers, understands the pattern. No fog. No transition drift.

---

## The UI Ecosystem: Transparent Hierarchy

The prompt banner (top center) and the quiz panel (right side) are both translucent. Backdrop blur. Subtle drop shadow. This is modern UI cinema—the interface is *present* but *not opaque*. You see the building through the panels. The green "Continue" / "Ready" buttons are the only saturated color in the frame (aside from the door-number labels, which are white on contrasting ground).

The "Jump to Part" buttons (top left) and the "Walk Around" navigation for Part 5 (left side) are tucked into the edges. They frame the canvas without intruding on the 3D space. The bottom button bar (Back / Continue / Next) sits low, centered, anchoring the flow.

This is *visual hierarchy through position and saturation*, not through size or noise. A learner never wonders where to look next. The prompt tells you what to do. The building shows you what to understand. The quiz confirms if you got it right.

---

## Texture and Readability: The Door Plates

Every unit number is rendered as a canvas texture—white background, dark text, positioned flat on the facade. No gloss, no depth, no metallic reflection. They read like photocopied labels on real apartment doors. The contrast is maximum. The font is bold and large enough that a learner can read 101, 102, 103 at a glance and follow the sequence.

When a door has a blank ("?") or a partial ("71_5"), the plate inverts into a green background. This is *color as narrative*. Green says: *This is where you interact. This is a question.* No learner misses it.

---

## Pacing and Cognitive Load

Each part introduces one concept:
1. **Part 1:** Sequential numbering around a 2-story building. Camera sits low-ish, allowing the learner to drag and orbit freely.
2. **Part 2:** The first digit = floor. Camera jumps to a side angle to *show* the floors stacked vertically. A yellow arrow with floor badges reinforces the reading order.
3. **Part 3:** Building number prefixes the unit. The camera pulls back to show width (5 doors per floor, 2 floors). A banner above the roof displays the building number.
4. **Part 4:** Front *and* back. Camera jumps to a three-quarter, but the learner is explicitly told to "drag to spin around." The visual says: *Ownership is yours now. Go find the back.*
5. **Part 5:** No floor digit. Single running count around all four faces. The "Walk Around" buttons become a new grammar—they say: *You must see all sides to solve this.*

The progression is *visible*. The camera adjusts to match cognitive complexity. No learner has to guess what's being taught.

---

## What Works

- The **flat lighting** is honest and readable. It respects the content.
- The **50-degree FOV** avoids distortion; the buildings look real, not abstract.
- The **instant camera cuts** between views are confident and clear. No motion sickness.
- The **colored door plates** (white for solved, green for blank/partial) create instant semantic clarity.
- The **prompt banner's amber keywords** in bold draw the eye to what matters in the instruction.
- The **navigation buttons** (Jump to Part, Walk Around, Back/Ready/Next) are positioned *off-frame* but always within arm's reach. No hunt.
- The **quiz panel** on the right is large enough to read on mobile (I saw the mobile screenshots—the text stays crisp even at 390px viewport width).
- The **arrow overlays** in Parts 1 and 2 are thick, bright yellow, and unambiguous. They teach reading order without words.

---

## What Deserves Attention

1. **No orbit damping on example views:** Controls have `enableDamping: true`, but the example stages don't auto-frame. If a learner wild-drags the camera in Part 1, they can easily rotate into a view where the entire building is behind them, or clipped by the near plane. The "memorize the pattern" instruction assumes the building stays in view. Consider adding a soft look-at constraint or a reset-view button if the camera drifts too far.

2. **The Part 5 "Front" default:** The initial view of Building 6 (Part 5 example) shows a three-quarter angle—not front. When the learner clicks "Front," the camera snaps to (0, 9, 38). This is correct, but the *initial* framing should probably match the "Front" button's semantic to avoid confusion. Or the button should say "Reset" on first view.

3. **Mobile quiz panel overflow:** On the mobile screenshots (390px), the quiz panel's four options fit vertically, but barely. If a wrong answer triggers the shake animation and the panel reflows, the learner might miss the feedback. The animation is snappy, but the panel's height (in `#quiz`) is fixed at 224px. A touch-friendly rethink might increase readability on phone.

4. **Sky color against prompt banner:** The sky is a pale blue (0xe8f1ff). The prompt banner's background is a dark translucent gray. On some displays, the contrast between the sky *showing through the blur* and the banner's opaque text might strain. The blur effect is nice, but consider a slightly stronger banner background (maybe rgba(20, 24, 30, 0.92) instead of 0.86) to ensure text legibility in bright sunlight or on old screens.

5. **No visual confirmation of "solved" state in multi-blank stages:** In Part 4 and Part 5 quizzes, where there are 7+ blanks, the learner sees the quiz panel pop up for each door and closes it after answering. But there's no persistent visual *mark* on the door itself after solving (like a checkmark or green glow) to show progress at a glance. The plate updates with the number, but the learner can't step back and count: "I've solved 12 out of 20." Consider a subtle highlight or glow on solved plates so learners feel the momentum of completion.

---

## The Largest Point

The entire visual system—camera, light, color, typography, UI placement—works as a *single instrument*. This is not a 3D scene that *also happens* to teach. It is *teaching through form*. Every decision serves cognition, not decoration.

The camera is low-key and purposeful. It moves only when the concept changes. The light is flat and honest. The UI is transparent and hierarchical. The color is semantic (white = solved, green = blank, amber = emphasis). The text is large and readable across devices.

This is the work of someone who understands that visual communication *is* pedagogy. Not every 3D educational app knows that.

---

## A Note on the Ground Plane

I noticed the ground is a simple flat geometry with a grey road strip down the center and olive-green grass on either side. No texture, no bump map, no subtle noise. It's almost deliberately minimal. This works beautifully because it recedes visually—the learner's eye stays on the building. If you added grass noise or asphalt texture, the eye would compete. This is *negative space as design*. Respect.

---

**Summary:** This is skilled visual design in service of learning. The camera is confident, the light is clear, the UI is intuitive, and the pacing is deliberate. The only friction points are around edge cases (wild camera movement, mobile panel height, and visual completion feedback for multi-blank stages). But the core vision—to teach apartment-numbering patterns through precise, honest 3D visualization—is executed with craft and restraint.

I'd watch this film. I'd also learn from it.
