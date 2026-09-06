# Game Design Review: Stop Finder Apartment Course — Viktor Sørensen

## The Core Loop

What happens here is elegant. The loop is:

```
See Example (arrows, badges guide you)
    ↓ [memorize + drag camera]
    ↓
Ready → Enter Quiz [blank doors appear]
    ↓ [raycaster hit on blank]
    ↓
Open Options Panel [a, b, c, d]
    ↓ [choose]
    ↓
Right? → Feedback (green, checkmark, close after 650ms)
          ↓ All doors solved?
          ↓ 
          ↓ Yes → 170 confetti particles + Next button
          ↓ No → await next click
          ↓
Wrong? → Feedback (shake, red, "Not quite — try again")
         [button stays disabled; others remain active]
```

This is *smart teaching loop design*. The learner sees a filled example, internalizes the pattern through free exploration, then solves a series of blanks in real time. No abstract quiz separate from the building. No "check answer" button. Every click matters. The 650ms close-quiz delay is *crucial*—it gives the right answer time to sink in before the panel vanishes.

---

## Difficulty Curve: A Five-Act Progression

The course teaches through *constraint layering*, not by adding more content.

- **Part 1**: Sequential 101–108 on a 2-story 4-plex. Yellow arrows show direction. Blanks: 1 → 2 → 3.
  - *Feels like*: Warm-up. You learn to read left-to-right and count up.
  
- **Part 2**: 3-digit units; first digit = floor. Tall building (4 stories × 3 doors). Floor badges (1, 2, 3, 4) on the left.
  - *The jump*: Same suffix repeats up the column; the *leading digit* changes. This is the "moment of insight." Yellow arrow now runs vertically.
  - *Quiz complexity*: 1 blank → 4 blanks. The learner hasn't forgotten Part 1; they layer knowledge on top.
  
- **Part 3**: 4–5 digit numbers; leading digit(s) name the *building*. Now a wide 2-story row (5 doors per floor).
  - *New spatial complexity*: Building is no longer a tall vertical tower. It's horizontal. The learner must now track: building digit + floor digit + door position.
  - *Cognitive load*: Moderate—but the quiz introduces *partial masking* (e.g., "7_07", "710_"). The red text signals: "You must fill this in."
  - *New task*: After all blanks, the learner chooses the building number from a banner above the roof.
  
- **Part 4**: Everything at once. A 4-story block numbered on *both front and back*. Each building has its own pattern.
  - *Spatial demand*: Drag to spin. Check the back. Notice the units don't double—doors directly behind front doors are in sequence.
  - *No teaching aids*: No arrows, no floor badges. The learner figures out the pattern cold.
  
- **Part 5**: No floor digit. One running count around all four faces (20 doors total). Walk Around buttons (Front/Back/Left/Right) create a *guided camera jump*.
  - *The twist*: Floor 1 holds *both* the lowest and highest numbers on the building. This breaks the learner's intuition from Parts 2–4.
  - *Spatial mastery*: The 4-way camera jump is a gift—the learner can pivot and verify each wall without freeform drag.

**Pacing verdict**: Excellent. Each part teaches one rule. Difficulty rises in *type* (new pattern), not in volume (Parts 2–5 have ~1–2 quiz stages each, not 10). The learner never feels buried.

---

## Feedback Systems: How Wrong Feels

### Right Answer
- Button turns green (`rgba(87,201,126,0.28)`) and gains a green border.
- Message appears: "✓ Correct!" in bright green.
- All options disable. Quiz auto-closes after 650ms.
- The plate on the building updates *immediately*—the plate text changes color and reads the solved number.

*This is good. The immediate visual update (plate changes) is more rewarding than a generic "next" state.*

### Wrong Answer
- Button turns red (`rgba(229,57,53,0.25)`) and gains a red border.
- The button disables, but *others stay active*.
- Message: "Not quite — try again." in orange-red (`#ff9a8a`).
- Animation: `.3s shake` (translate ±5px).

**The gap**: The shake is delightful, but there's *no scaffolding* for the wrong answer. The learner sees:
- One specific button was wrong.
- They can click another.

But they don't see *why* it was wrong, or what the correct answer teaches. In a teaching game, consider:
- Show the correct answer after a second wrong guess?
- Highlight which *part* of the number they got wrong (e.g., "That's the right building, wrong floor")?
- Offer a hint that references the pattern they just saw in the example?

Right now, wrong answers are *forgiving but silent*. That's good for emotional safety, but it leaves learning on the table.

---

## The Moment of Insight

Where does the "aha!" happen?

1. **Part 2 example**: You see "1 2 8" and "4 3 0" stacked vertically, with a big yellow arrow running up the building face. The *leading digit changes per floor*. This is vivid. Most learners get it immediately.

2. **Part 3 example**: A 5-door-per-floor row, and the first digit is always "1". You see "1101, 1103, 1105, 1107, 1109" on floor 1 and "1202, 1204, 1206, 1208, 1210" on floor 2. The pattern: `[Building][Floor][Door]`. The teaching aid (floor badges left, building banner top) *embeds* the structure visually.

3. **Part 5 example**: You're shown 601–620 wrapping around Building 6. The prompt tells you: "Floor 1 holds the *lowest* numbers AND the highest (617–620)." This inverts intuition. The example *defends* against the misconception before it lands.

**Strength**: Each example *shows* the pattern, not just describes it. The yellow arrows, floor badges, and building banners are spatial mnemonics—they teach by visual grammar, not text.

**Weakness**: By Part 4 (no arrows, no badges), some learners may miss the insight. I'd recommend adding a *very subtle* hint UI (optional, like a tiny "?" icon) that re-shows the pattern rule from the example, *only* if the learner fails 3+ times on the same blank.

---

## Reward Pacing: Confetti, but When?

The confetti fires *once per building*, at the moment all blanks are solved. Here's what the code does:

```js
fireConfetti() {
  const colors = ['#ff5252', '#ffd54a', '#57c97e', '#42a5f5', '#ab47bc', '#ff9800'];
  for (let i = 0; i < 170; i++) {
    confetti.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 240,
      y: innerHeight * 0.32,
      vx: (Math.random() - 0.5) * 10,
      vy: -7 - Math.random() * 9,
      // gravity, rotation, size, color...
    });
  }
}
```

170 particles, 6 colors, launched from top-center, falling with gravity. The animation is *tight*—about 2–3 seconds before particles exit.

**Good**:
- Large particle count (170) feels *alive*; not underwhelming.
- 6-color palette is vibrant and accessible.
- Launch height (32% down) doesn't obscure the building.
- Gravity makes it feel *physical*.

**Gap**:
- Confetti fires only once per course run (the code uses `celebrated.has(currentIndex)` to prevent repeats).
- It marks building completion, but there's no *progress reward* along the way. If you solve 1 blank out of 3, nothing happens. The learner works in silence until all 3 are done.
- **Missing**: A small per-blank reward (particle shower, a sound cue, a counter ticking up) would break monotony and encourage momentum.

---

## Visual Design & Readability

### 3D Scene
- Low-poly, flat-lit. Warm palette: red/terracotta buildings, olive green ground, light blue sky.
- No shadows (good—no visual noise, fast render).
- Door plates are white or light ivory, with large black serifs numbers.
- Blank plates are light red/pink (`#c0392b` text), making them *unmissable*.
- Windows are dark navy, small, and recessed—they don't distract.

*Assessment*: The scene is readable from any angle. The color coding is clear: blank = red, filled = white, pattern cue = yellow (arrows/badges).

### UI Panels
- **Top prompt**: Dark translucent banner, center-top. Text is light grey, keywords in amber (`#ffd9a0`). Text is large (15px), line-height 1.55.
  - *Good*: High contrast, centered, stays out of the way.
  - *Minor*: On mobile (390px width), the prompt wraps and becomes taller. It may obscure the top of the building. Test on real devices.

- **Right-side quiz panel**: Dark box, 224px wide. Four option buttons in column.
  - *Good*: Consistent layout. Green feedback button (right answer) stands out against the dark background.
  - *Good*: Sub-heading in small grey explains the task ("Pick the number that fits the pattern").
  - *Gap*: On mobile, this panel might stack below the canvas or overlap it. I see "mobile-part1-quiz.png" is 390×844—a portrait phone. The quiz panel is probably hanging off the right edge or shrunk. Need to verify layout doesn't break on phones.

- **Bottom button bar**: Back / Continue (or Ready) / Next, centered.
  - *Good*: Clear action states (Continue = primary green; Back = ghost).
  - *Good*: Button text updates ("Next Building ▸" vs. "Next: Part 2 ▸" vs. "Start Over ▸"), signaling progress.

- **Top-left jump menu**: 5 round buttons (1–5) for parts, active part is green.
  - *Good*: Fast navigation. Does not hide the building.

- **Left-side walk panel (Part 5 only)**: Four directional buttons (Front/Back/Left/Right).
  - *Good*: Spatial navigation. Learner doesn't have to learn orbit controls; buttons do it.
  - *Good*: Stays on the left; quiz panel (right) doesn't conflict.

**Mobile observation**: The mobile screenshot shows the prompt is visible, building is visible, and buttons are visible. But the quiz panel is *not visible* in that frame. Either it's off-screen or the layout changes. This is the main UX risk.

---

## Camera & Spatial Understanding

**Part 1–3**: Orbit controls (drag to rotate). Camera is pre-framed for each building:
- Part 1 (4-plex): Camera at (5, 60% height, 25). Slight angle, sees both floors.
- Part 2 (tower): Camera at (7, 50% height, 38). Further back to see all 4 floors.
- Part 3 (row): Camera at (0, 85% height, 32). Higher angle, sees the full width and both floors.

*Assessment*: The framing is pedagogically sound. You see the entire building at a glance. No forced pans or camera rides. The learner is free to drag and explore but starts in a good state.

**Part 4**: Explicit instruction: "Drag to spin around and check the back."
- The learner must actively rotate 180° to see back doors.
- This teaches *spatial reasoning*—the units don't appear magically; you navigate to find them.
- *Risk*: A learner might not drag far enough and miss the back entirely. Mitigation: The prompt is specific ("drag to spin around"), and there are enough blanks on the back to force discovery.

**Part 5**: Walk-around buttons remove camera drag complexity.
- Buttons (Front/Back/Left/Right) jump to fixed views.
- Learner doesn't learn orbit controls here—they learn cardinal directions.
- *Trade-off*: This is smart. A delivery driver reading unit numbers around a building doesn't orbit; they *walk around*. The button metaphor matches the real task.

---

## Quiz Mechanics: Raycasting & Blank Interaction

When a learner clicks a blank door plate, the code raycasts from the camera. If it hits a plate or door with `userData.bstate`, the quiz opens.

*Assessment*:
- **Precision**: Clickable areas are generous (full plate + door geometry). No fiddly precision required.
- **Affordance**: Blank plates are in red, a visual "click me" signal.
- **Feedback**: Immediate—no lag.

**One gap**: In Parts 3–5, *partial numbers* are shown in red (e.g., "71_5"). The learner must click that door to guess the full number. But there's no visual affordance saying "click this"—it looks like a damaged plate, not a puzzle hole. Consider:
- Adding a subtle cursor change (hand cursor) on hover?
- Adding a pulsing "?" overlay on partial plates?
- A tiny highlight on first quiz load to show where blanks are?

---

## The Difficulty Curve in Practice: Blanks per Stage

| Part | Stage | Type | Blanks |
|------|-------|------|--------|
| 1 | 0 | Example | 0 (arrows fill all) |
| 1 | 1–3 | Quiz | 1, 2, 3 |
| 2 | 4 | Example | 0 (all filled) |
| 2 | 5–6 | Quiz | 1, 4 |
| 3 | 7 | Example | 0 |
| 3 | 8–9 | Quiz | 5 units per floor (10 total), then choose building |
| 4 | 10 | Example | 0 |
| 4 | 11 | Quiz | 8 blanks (front + back mixed) |
| 5 | 12 | Example | 0 |
| 5 | 13 | Quiz | 9 blanks (scattered across 20 doors) |

**Pattern**: Example stages have *zero* blanks (full model). Quiz stages start easy (1 blank) and scale up. But the *scale* is modest—even Part 5 has only 9 blanks out of 20 doors.

*Assessment*: This is safe design. No learner gets overwhelmed. A 30-minute session covers all 14 stages comfortably. The pacing favors learning over challenge. This is *correct* for a training tool aimed at delivery drivers who need practical knowledge, not a hard puzzle game.

---

## Tone: Informative but Playful

- Prompts use **bold amber text** for key terms ("number layout", "yellow arrows", "fill in the missing unit numbers"). This guides reading and emphasizes the lesson.
- Feedback is warm: "✓ Correct!" (celebratory) vs. "Not quite — try again." (gentle, no shame).
- The confetti is pure joy—colorful, kinetic, celebratory. It's a *moment*, not an distraction.
- No gamey tropes: No points, no streaks, no "combo x3". The game trusts the learner's intrinsic motivation (learning the pattern is rewarding).

*Tone verdict*: Professional but not sterile. Playful but not condescending. Fits the audience (adult learners, often non-native speakers).

---

## Tuning Knobs: What Could Be Tweaked

1. **Per-blank micro-reward**: Instead of silent solving, play a small particle effect or sound cue when each blank is solved. This would add momentum and make longer stages (Part 5, 9 blanks) feel less flat.

2. **Smart hint system**: After 2–3 wrong guesses on the same blank, surface a hint (e.g., "Look at the building digit in the example" or "Check the floor badge"). This bridges the gap between "forgiving" and "teacherly."

3. **Mobile layout safeguard**: Test the quiz panel on actual phones. If it overlaps the building, reposition it below the prompt or use a full-width modal.

4. **Affordance on partial blanks**: Add a subtle visual cue (e.g., a pulsing border or a tiny "?" icon) to partial numbers, so new learners know they're clickable.

5. **Confetti variation**: On the final building (Part 5, stage 13), fire confetti *again* with a different animation (confetti cannons left/right, not just top) to mark course completion as distinct from building completion.

6. **Progress checkpoint**: After each part (e.g., after Part 2 is 100% complete), show a summary screen: "You've mastered 3-digit units! Next up: building numbers." This marks *learning milestones*, not just buildings.

7. **Camera smoothing**: Ensure orbit controls have damping/inertia. A snappy, responsive drag (even if smooth) is more fun than a stiff drag. The current `OrbitControls` likely defaults to some inertia, but verify it feels good on touch devices.

---

## The Bottom Line

This course has a **clear learning goal** (decode apartment numbers), a **tight core loop** (example → quiz → feedback → next), and **excellent visual pedagogy** (arrows, badges, color coding). The difficulty curve is smart: each part layers one new rule on top of the last, and the learner never chokes on volume.

**Strengths**:
- Pattern-focused teaching (show, then solve).
- Forgiving feedback (no penalty, just "try again").
- Spatial variety (2-story plex, tower, row, block, 4-faces).
- Confetti celebration is genuinely delightful.
- Mobile-first HTML/CSS (no framework, light on dependencies).

**Gaps**:
- No per-blank rewards; solving is silent until all blanks are done (energetic but not thrilling).
- Wrong-answer feedback is silent; no hint or learning pathway.
- Mobile layout untested in detail; potential quiz panel cutoff.
- No learning *milestone* markers (checkpoint screens, "You've earned badge X").

**For a delivery-driver training tool**: This is *excellent*. It's fast, clear, forgiving, and repeatable. A learner could do this in one sitting and confidently find apartments using the patterns they absorbed. The confetti at the end is the cherry—a little celebration that says *you got it*.

For a puzzle game enthusiast: The difficulty is gentle, and there's no "hard mode." But that's not the goal here. The goal is knowledge transfer, and this course nails it.

**Verdict**: Recommended as-is for the target audience. The tuning knobs above are enhancements, not fixes.
