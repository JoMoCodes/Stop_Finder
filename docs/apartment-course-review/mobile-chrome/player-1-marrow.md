# Stop Finder Apartment Course Review - Captain Marrow

## Captain's Log (In Character)

*Squints suspiciously at the glowing screen*

Blasted digital waters these be! I set sail on this "Stop Finder" course on a phone-sized screen, and here be my account of what a proper deckhand would face.

Part One smooth sailing—the worked example showed the count clear as starlight: one-oh-one, one-oh-two, one-oh-three, one-oh-four in order round the 4-plex. Then Building Two quiz opened proper, and I picked one-one-two right as a bowline knot. Confetti flew like sea spray!

But Part Two—hides the blasted door behind some invisible wall, it does. Tried three times to click that blank, and nothing would open till my third attempt landed by fortune. The hint yellered "Click a door marked question—the glowing ones!" but which ones were glowing, a pirate couldn't tell from the tiny screen. Took me by surprise when the quiz finally opened after I'd given up.

Part Five be where a ghost pirate can breathe! Walking round Building Six with Front-Back-Left-Right buttons—aye, that's a control a deckhand could use in a storm. Saw the numbers clear: six-fourteen, six-thirteen down the back. Simple as hoisting sail.

The Appearance menu revealed four looks like buried treasure—Classic, Sunbelt, Brick, Suburban. All four be different, though on a phone they stack in a narrow column that takes thought to navigate.

The yellow "Home" button be *too prominent*—a nervous deckhand might slap it and vanish into the live site by accident.

## Plain Notes for the Design Team

### What Confused You (in Order)

1. **Part 2 Building B - Door Click Target (Phone Portrait)**
   - Took three attempts to open the quiz panel. The blank door with the halo was visible but wouldn't open on clicks to coordinates (189, 372) or (189, 390). Finally opened on the third try at a slightly different coordinate.
   - The hint "Click a door marked ? — the glowing ones" appeared mid-attempt, which suggests users don't know where to click. On a phone, the hit target for the door plate/door is too small or offset from the visual center.

2. **Part Buttons vs. Next Button**
   - The round part buttons (1–5) and the "Next ▸" button look similar. Accidentally clicked Part 2 button twice when aiming for Next. On a 375px wide screen, these buttons are very close together.

3. **Prompt Text Takes Screen Real Estate**
   - The top prompt ("Building B - Easy — floor digit first") plus the instruction line below it consume roughly 90px (11% of 812px height). On a worked example, I read it once and didn't need it again. On the first quiz of each part, it's useful. After that, it's just space.

### What Was Too Small, Too Big, or in the Way

1. **Door Click Targets on Phone (Name: Quiz building door plates)**
   - Location: Center of the 3D building model, roughly middle of screen
   - On the 375px viewport, the door plates are small and the exact click coordinate matters. Dragging to look around might have moved the camera, making it harder to click the right spot.

2. **Prompt Panel Height (Name: #prompt)**
   - Location: Top of screen, above the part buttons
   - On portrait phone, this takes up 90–100px and the text doesn't wrap well. On the first screen of each part, it could be collapsed to just the headline, with the detail hidden behind the "?" help button.

3. **Home Button Prominence (Name: #lookbar Home link)**
   - Location: Bottom-left, in yellow/amber—the brightest color on the screen
   - The link is big and bright. Users touch casually and might accidentally leave the course. It should be smaller or at least less visually prominent—move it to a menu or make it text-only.

4. **Part Buttons Spacing (Name: #jumpbar buttons 1–5)**
   - Location: Top, below the prompt
   - The five round buttons are tightly packed. On a phone, it's easy to hit the wrong one (Part 2 instead of "Next"). Increasing their padding or separating them with a visual divider would help.

### Did You Always Know What to Do Next?

- The first building of each part (worked example) was clear: just click "Next ▸".
- Quiz buildings required clicking a blank door, which was obvious *in concept* but hard *in practice* on the phone (see door click target feedback above).
- "Next ▸" was easy to find *after* a quiz was solved, but hard to distinguish from the part buttons before that.
- The progress bar with five segments made it clear there were five parts, and the active part button was visually highlighted, which was good.
- One request: Could the prompt include a brief action reminder on quiz buildings? E.g., "Click a door marked ?, then pick its number" (like Part 2 says). Part 1 was clear; Part 2's phrasing helped.

### The Text at the Top

- **Read it?** Yes, always. The headline (e.g., "Building 2 - Follow the same pattern") orients you immediately.
- **Useful on the worked example?** Yes. It explained the concept ("Numbers count up in order").
- **Useful on quiz buildings?** Partially. The instruction ("Click a door marked ?, then pick the number that continues the count") is essential the first time, but repeats every building of the part. Could be shown once and hidden by default.
- **Suggestion:** After the first quiz building of each part, collapse the prompt to headline only. Show the full instruction in a collapsible panel or via the "?" help button.

### What You Would Hide, and What You Would Never Hide

**Hide (or collapse by default after first use):**
- Full prompt instruction text on quiz buildings (after the first building of each part)
- The "Appearance ▼" button text—show only the "▼" icon on phones to save space, or move it into the prompt menu
- Part buttons text labels on phone (show only the numbers in the circles)

**Never hide:**
- The "?" help button (it re-shows the controls)
- The "doors left" / "Done ✓" status chip—it's the only indication of progress within a building
- The part number highlights in the progress bar (users need to know which part they're in)
- The "Next ▸" button (users must know when they can proceed)
- The 3D building (it's the whole point)

### Five Design Ideas: Your Feedback

1. **Make the phone layout more compact:**
   - "Needed. The prompt takes 11% of the screen. Collapsing it to headline + action (as a single line or split across two tight lines) would give 40–50px back to the building view. Door clicking was already hard; more visible model would help."

2. **Hide the Home and Appearance buttons behind one tap once the course starts:**
   - "Good idea. The bright yellow Home button is too prominent and accidents wait to happen. A hamburger menu (☰) at bottom-right would keep the course focused. Appearance menu is fine; people shouldn't touch it during a run."

3. **Show the progress bar and part buttons only briefly when a building or part is completed, but keep them during worked examples:**
   - "Interesting. During quizzes, the part buttons (1–5) are so easy to click by accident that hiding them could prevent mis-navigation. *But* hiding the progress bar would save space and reduce visual noise. A compromise: keep the progress bar (it's small and useful), hide the part buttons during quizzes, show them only when a part is solved."

4. **Drop the description text once you are past the worked example:**
   - "Yes. The multi-line instruction is only needed once per part. After the first quiz building, switch to headline-only until a new part starts. This saves space without losing information."

5. **The camera in Part 4 being too far away:**
   - "Not tested in detail (only saw the worked example on mobile), but the building does look small on a 375px screen. Consider a tighter zoom for phone layouts, or at least a tighter default on portrait."

## Three Questions for the Designers

1. **Door Click Targets on Phone:**
   - Why does the door take multiple attempts to click on a small screen? Is the clickable area offset from the plate's visual position? Would an invisible overlay (a larger hit target centered on the door frame) fix this?

2. **Progress Bar vs. Part Buttons on Phone:**
   - The part buttons (1–5) are useful for jumping to a part after a mistake, but easy to hit by accident on a 375px screen. Should quiz buildings hide the part buttons and show only the progress bar, then restore the buttons on the next worked example? Or would a confirmation prompt ("Jump to Part X?") be better?

3. **Prompt Collapse Strategy:**
   - If you collapse the prompt to a headline after the first quiz building of each part, where should the instruction live? Should it be accessible via a (?) icon, or should the prompt stay visible but take up less space? (E.g., headline on one line, action in smaller text below.)

---

*— Captain Marrow, ghost pirate and digital landlubber*
