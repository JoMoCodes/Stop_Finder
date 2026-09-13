# Apartment course: phone chrome review (September 2026)

A second review round of the apartment course, this time about how much of the
screen the frame takes on a phone and what should fold away once the learner is
answering. It was run as a small multi-agent exercise and then implemented.

## The owner's asks
1. A more compact phone layout (portrait and landscape) without losing ease of use.
2. Hide Home and Appearance behind one tap once the course starts.
3. Show the progress bar and part buttons only briefly when a part is finished;
   keep them in place on the worked examples ("tutorial sections").
4. Drop the course description once the learner is past the worked example.
5. Sunbelt Part 4 in portrait: the camera starts too far out and inside a
   neighbouring building.

## Who reviewed what
| File | Author (persona) | Method |
|---|---|---|
| `brief.md`, `baseline.md` | coordinating engineer | the asks, where the code lives, measured layout before any change |
| `review-ui-dara.md`, `-revision.md` | Dara Okonkwo-Lind, senior UI engineer | code and measurements, no browser |
| `review-ux-hollis.md`, `-revision.md` | Hollis Grant, senior UX designer | hands-on in the Browser pane at 375x812, 740x360 and desktop |
| `player-1-marrow.md` | Captain Marrow, pirate ghost (Haiku) | played Part 1-2 on a portrait phone, Classic look |
| `player-2-zippy.md` | Zippy, speedrunning raccoon (Haiku) | played on a landscape phone, Brick look |
| `player-3-perpetua.md` | Aunt Perpetua, retired librarian (Haiku) | played on a portrait phone, Sunbelt look |
| `review-gamedev-rin.md` | Rin Castellanos, senior game developer | played every layout, rated the pacing, critiqued the two reviews and the players, wrote the final spec |
| `design.md` | coordinating engineer | what was built, the chrome model as shipped, deviations, QA |

The two senior reviewers wrote first, the three players played next (one at a
time: the Browser pane renders only its fronted tab), the seniors revised after
reading the players, and the game developer went last with everything in hand.

## Outcome in one paragraph
Every reviewer agreed on the shape: fold the prompt to its headline and the jump
bar to a progress strip on quiz buildings only, put Home and Appearance behind one
button on phones, never hide Back / Next, frame each building type for the phone
instead of one fixed back-off, and fix a real bug the UX pass found (the options
sheet never closed itself after a tap, because touch screens keep `:hover` stuck on
the tapped option). All three players kept missing door plates; the game developer
showed that was mostly tester aim on 20-30 px targets, and the fix is framing plus
a touch snap and a bigger glow. See `design.md` for what shipped.
