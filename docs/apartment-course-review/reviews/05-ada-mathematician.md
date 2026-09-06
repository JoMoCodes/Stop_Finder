# Ada Okonkwo — Mathematician, Positional Notation Specialist

## The Good: Structure Shines Where It Matters

The 3D scene itself is exemplary. Part 1's yellow arrows trace the reading order; Part 2's big yellow arrow climbing 1→2→3→4 with floor badges embodies the first-digit-means-floor idea; Part 3's "Building #" banner signals that leading digits are *structural*, not sequential. The partial numbers on blank doors (e.g., "71_5" in red) are brilliant — they show *exactly what's missing* and train the eye to read digit-by-digit. The progression across five parts, each revealing a new layer of the mixed-radix system, is pedagogically sound.

The UI is clean: dark theme, amber keywords, responsive controls. The "Walk around" buttons in Part 5 solve a real 3D navigation problem. Camera, pacing, feedback — all thoughtful.

## The Critical Problem: The Quiz Options Hide the Notation

**The notation is the teacher.** In positional systems, visual alignment *is* understanding. And here, in the right-side quiz panel, the options are rendered as plain, unlabeled, left-aligned numbers in a vertical list. Let me be specific:

- **Part 2, Building B Easy** (stage 05): options are 122, 222, 322, 422. The floor digit (first digit) varies; the suffix stays the same. But visually? They're just four numbers in a row. A learner clicks through options to find the answer — they don't *see* the pattern. Tabular figures and alignment would make it obvious: the first column changes, the second and third stay fixed.

- **Part 3, Building B** (stage 08): options are 6103, 7103, 8103, 1103. The *leading* digits (building number) vary, the floor+door stay constant. Again, no visual grouping. If I render these aligned with the building digits in one color and the floor digits in another, the learner *sees* the structure instead of guessing.

- **Part 4, Building 19** (stage 11): options are 19105, 18901, 19101, 19097. Now we have five digits with changing building, floor, and suffix — and they're still just plain text. The learner has to mentally parse each digit's role.

- **Part 5, Building 12** (stage 13): options are 1031, 1431, 1237, 1231. These are pure running counts (no floor digit), so there's less structure to reveal — but even so, tabular figures would make it clear that some digits are drifting and others are stable.

## What I'd Hope To See

1. **Monospace / tabular-figure rendering** for all quiz options (font-variant: tabular-nums).
2. **Digit-place color coding**: Each place (building, floor, door) gets a distinct color. When Part 2 shows 122 / 222 / 322, the first digit (floor) is amber, the suffix is neutral. When Part 3 shows 6103, the leading digits are one color, the floor (second digit) another, the door (suffix) another.
3. **Optional alignment or spacing** to separate digit places visually — e.g., a hairline or a small gap between building|floor|door.
4. **Consistent application** across all five parts.

This isn't decoration; it's *pedagogy*. The notation is the curriculum. When a learner looks at four options and sees at a glance which digits vary and which stay fixed, they've learned something the building alone couldn't teach. They've internalized the *structure*.

## Minor Observations

- The building labels (Building 1, Building 6, etc.) appear in white sans-serif on dark banners — readable and clear.
- Partial numbers in red (e.g., "71_5") do *some* of this work for individual doors, but the quiz options squander the opportunity to extend it.
- On mobile (mobile-part5-example.png), the quiz panel is narrower; text wrapping might occur. Tabular figures would help here too.
- No complaints about the 3D geometry, camera behavior, or pacing.

## Bottom Line

This is a well-crafted, thoughtful course with one significant oversight: **the multiple-choice options don't make the digit-place structure visible.** For a teaching tool about numbering systems, that's like teaching fractions without showing the denominator. The learner can complete the course, but they won't *see* the pattern — they'll just memorize the answer. Give the notation the visual work it deserves, and this becomes excellent.

---

*— Ada*
