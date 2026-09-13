# Perpetua's Testing Report: Stop Finder Apartment Course (Sunbelt Look, Portrait Phone)

(The player agent returned this text but did not manage to save it; saved verbatim by the coordinator.)

## Perpetua's journal (in character)

I approached this teaching website with the care one gives to any reference document. The Sunbelt appearance is pleasant enough—warm brick and stucco, sensible landscaping—and the interface began with promise. Part 1's worked example was abundantly clear: the prompt box explained the pattern, the arrows on the building pointed the way, and all the unit numbers were legible without strain. The part buttons, progress bar, and chips (showing door count and completion status) were all clearly labelled, which I appreciated; I am too old for mysterious icons.

However. When I reached Building 2 of Part 1 (the first quiz), the course would not respond to my clicks on the door marked with a question mark. I tried three times at different coordinates without success—the quiz panel simply would not open. The helpful hint told me to look for "glowing ones," and I could see the glow, but the interface refused my input. This was most irregularly frustrating.

Part 4 presented a different problem: the camera was positioned so far away that I saw only a blank beige wall with two large windows. No doors. No unit numbers. No course content whatsoever. The prompt promised "numbers on the doors behind," but I was looking at a facade as featureless as a car park. This part of the course is, in plain terms, unusable.

On the positive side, the Appearance menu was well-organized—four options, each with a clear label and description. The Help button delivered practical instructions. The prompts at the top were always readable and the layout did not waste space.

## List of irregularities (plain notes for the design team)

### Interaction problems
- **Part 1, Building 2, upper-right door**: Door click detection failed on three attempts. The hint text appeared ("Click a door marked ? — the glowing ones"), the glow was visible on the target door, but clicks at coordinates ~(240–260, 373–395) did not open the quiz panel. This is a raycasting or touch target detection bug on phone portrait.

### Visual/framing problems
- **Part 4, worked example**: The camera is positioned so far away that the building appears only as a blank facade (one large beige wall) with two featureless rectangular windows. No apartment doors are visible; no unit numbers are readable. The entire quiz building is off-screen or too distant to use. The prompt says "check the back," but the player cannot see the front. This is the critical camera-distance problem.

### Text and labelling
- **Top prompt box (Part 1 worked example)**: Clearly labelled and readable; text stayed correct during play. When I moved from worked example to quiz, the prompt title and body updated correctly to "Building 2 · Follow the same pattern" and "Click a door marked ?, then pick the number that continues the count."
- **UI labels**: Home button (amber, labelled "Home"), Appearance button (labelled "Appearance" with dropdown arrow), Help button (grey "?"), part buttons (1–5, clearly numbered), progress bar (14 segments), chip showing door count ("1 door left"). All present and legible.
- **Appearance menu (portrait phone, bottom-left layout)**: Four options, each with a name and descriptive subtitle (e.g., "Sunbelt · garden-style walk-up"). Good labelling; current selection highlighted in green.
- **Help hint**: "Drag to look around · Scroll / pinch to zoom · Click a door marked ? to answer" — clear, concise, readable in a dark rounded box.

### Layout and discoverability
- The quiz panel did not appear when I clicked the door in Building 2, so I could not verify its presentation on portrait phones. I did not reach any completed buildings to check whether the prompt text remained appropriate or became stale.
- The "1 door left" chip and progress bar were always visible and correctly updated the building count.
- The Back and Next buttons were always accessible and labelled.
- No controls were too small or obscured on the 375×812 portrait view.

### Known problem noted
- **Part 4 camera distance**: On portrait phone, the camera pulls back too far, rendering the building unreadable. This is the "known trouble spot" mentioned; confirmed.

## Evaluation of five design ideas

1. **Make the phone layout more compact**: Not needed. The current layout uses space efficiently without feeling crowded. Part 1's worked example fit cleanly on screen (prompt box, part buttons, progress bar, large readable 3D view, controls at bottom). No wasted space.

2. **Hide Home and Appearance buttons behind one tap once the course starts**: Neutral. They are compact enough on portrait; collapsing them would save ~1cm of height but the current layout does not feel cramped. Hiding them behind a menu might save beginners from accidental clicks of the Home link (which leaves the course).

3. **Show progress bar and part buttons only briefly when a building completes, but keep them during worked examples**: Keep them always visible. The buttons are the only way to navigate to different parts; hiding them would confuse a player who wants to retry a part or jump ahead. The progress bar is motivating and small.

4. **Drop the description text once past the worked example**: Neutral. The prompt text updated correctly from worked example to quiz ("Follow the same pattern" became instructive once the quiz began). The text is concise and never wasted vertical space. Dropping it would not hurt, but keeping it is no burden.

5. **The camera in Part 4 being too far away**: Fix this urgently. The building is completely illegible at the current distance. The facade is a blank wall on portrait phones; no doors, no numbers, no course content is visible. This part fails to teach.

## Ratings (with one sentence each)

- **Fun**: 2. The Sunbelt look is appealing and the progression of concepts (simple 2-digit, then 3-digit with floor meaning, then multi-digit with building leading) is logical, but interaction bugs and the Part 4 framing catastrophe broke the experience.

- **Ease**: 2. The interface is clearly labelled and the prompts are written well, but the door-click detection bug on Part 1 Building 2 forced a frustrating dead-end, and Part 4's unusable framing makes one third of the course inaccessible.

- **Legibility**: 4. The text, buttons, part numbers, and progress bar are all readable on a 375×812 screen without eyestrain. The Sunbelt building itself is clear and well-rendered. The only legibility failure is Part 4, where the entire building is too distant to read.

## Three questions for the designers

1. **Part 1 Building 2 door detection**: Is the raycasting for door plates calibrated correctly on the upper-right door? The plate is visibly glowing per the hint, but clicks do not register. Have you tested this specific door on mobile/touch platforms, or is this a desktop-only issue?

2. **Part 4 camera distance**: The prompt says "check the back of the building," but the camera is so far away that the front is invisible. Is the camera distance intentional (designed for desktop widescreen, where more of the scene fits)? If so, how should a player on a phone portrait see anything at all?

3. **Interaction recovery**: When a door click fails (or the course becomes unplayable, as in Part 4), does the player know they can skip to the next building with the Back/Next buttons, or do they think they are stuck? Should the hint box suggest this explicitly?
