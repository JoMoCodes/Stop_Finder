# Lens: UI layout, responsive/mobile behaviour, and accessibility

**Executive summary:** Twenty reviewers converge hard on one point: the fixed-panel desktop layout (prompt banner, jump bar, quiz panel, walk-around panel, bottom bar) does not survive the trip to a 390px phone — the quiz panel in particular goes missing, clipped, or crushed against the building in most reviewers' reading of the mobile screenshots, which several call a functional blocker rather than a polish issue. Layered on top of that is a completely separate, single strong voice (Sam, the accessibility specialist) documenting that the course is keyboard-inaccessible, screen-reader-inaccessible, motion-unsafe, and relies on color alone to mark blank doors — none of which any other reviewer tested for, but none of which is contradicted either. Everyone agrees the *desktop* layout itself is calm and well-hierarchized (panels tucked to the edges, canvas owns the center); the problems are almost entirely at narrow widths and at the keyboard/screen-reader boundary.

## Consensus: the mobile quiz panel is broken or absent

This is the single most-repeated finding in the whole review set. **Leilani** (mobile PM) calls it P0/"showstopper": `#quiz` is `position: fixed; right: 22px; width: 224px`, which on a 390px viewport should overflow, yet it isn't visible at all in `mobile-part1-quiz.png` — "If it's hidden, how does the learner tap an answer on mobile?" **Priya** (UX researcher) frames it as a Fitts's Law violation: "the target... is infinitely far if it's off-screen." **Dev** (frontend engineer) traces it to the literal CSS (`right: 22px; width: 224px` = 58% of a 390px viewport) and says it "obscures parts of the building... Unusable." **Rosa** (delivery driver), **Marcus** (gig driver), **Kai** (young gamer), **Bea** (building super), **Felix** (diorama artist), **Nadia** (cinematographer) and **Luna** (poet) all separately flag the same thing from their own screenshots — variously "the right-side quiz panel would stack down on a 390px screen and block half the building" (Rosa), "no visible quiz panel... I can't see or interact with the quiz" (Leilani, Kai: "quiz panel taking up half the screen... might block the building completely"), or simply that they *can't tell* from the screenshot whether it's there at all (Bea, Nadia, Luna) — which several reviewers treat as itself the problem: an interaction this core shouldn't be ambiguous. **Sam** independently flags the same area under WCAG 1.3.2 (Meaningful Sequence) and supplies a concrete fix: reposition `#quiz` to `bottom:0; left:0; right:0; max-height:50vh` under a `@media (max-width:600px)` query.

## Consensus: prompt banner text overflows/wraps badly on small screens

**Leilani** measures it precisely: `width: min(760px, calc(100% - 32px))` becomes 358px at 390px, and quotes the mangled mobile wrapping directly from the screenshot ("This is a common pattern going. ... then pick its"). **Marcus** independently quotes the same broken line and says the banner "takes up 1/4 of the screen on mobile and the text WRAPS," recommending it be cut ~30% and made collapsible. **Omar** (plain-language reviewer) tested on an actual phone and reports text "disappears under the screen edge... I cannot read the full instruction." **Kai**, **Eleanor**, and **Luna** all separately worry the banner is too dense/tall for a phone (Eleanor: "the prompt text at the top was cut off and running together... I wouldn't want to take a real course on a phone"). **Ingrid** (typographer) adds that the amber keywords "read as fine-print" at mobile sizes and recommends bumping the mobile prompt to 16-17px with `line-height:1.5+`.

## Consensus: small/hard-to-reach tap targets and cramped side panels

**Sam** flags the "Jump to part" circular buttons and Part 5's walk-around buttons against WCAG 2.5.5 (44×44 target size) — the jump buttons are 34×34px, the walk-around buttons ~40-50px tall, both borderline. **Priya** independently measures the same jump buttons (34×34px, 6px gap) as too small for "small screens or users with poor fine motor control," recommending 40-48px with more gap and citing the 48×48 WCAG guideline. **Leilani** adds the thumb-reach angle: on a one-handed 390px phone, buttons #4/#5 in the jump bar sit outside comfortable thumb reach, and separately argues the right-edge quiz panel forces "cross-body reach" even on a tablet. **Marcus** describes the walk-around column on mobile as feeling "claustrophobic" once combined with the cramped viewport.

## Single strong voice: Sam's accessibility audit (keyboard, screen reader, motion, color-only cues)

No other reviewer tested keyboard/screen-reader/motion-sensitivity paths, but Sam's findings are specific and uncontradicted:
- **Color-only cue (WCAG 1.4.1):** blank doors are marked only by red vs. white plate color, with no shape/icon/pattern difference — invisible to red/green color-blind users.
- **Keyboard (WCAG 2.1.1):** camera drag, door selection (raycasting), quiz option selection, and Part 5's walk-around buttons are all pointer-only; the `<button>` elements exist in HTML but nothing is reachable by Tab, and there's no keyboard alternative to dragging the 3D camera.
- **No visible focus indicator (WCAG 2.4.7):** buttons define `:hover` but no `:focus-visible` style at all.
- **Reduced motion (WCAG 2.3.3):** the wrong-answer shake keyframe and the ~170-particle confetti burst have no `prefers-reduced-motion` guard.
- **Canvas has no text alternative (WCAG 1.1.1):** the whole learning experience lives in `<canvas>` with no `aria-describedby` scene description; **Priya** independently flags this same gap in her own brief accessibility section ("The 3D canvas is not accessible to screen readers... Consider a disclaimer or text summary of each part's pattern rule"), making it the one Sam finding with a second voice behind it.
- **Quiz has no dialog semantics or live region (WCAG 1.3.1/4.1.3):** no `role="dialog"`, no focus move into the panel on open, no `aria-live` on the correct/incorrect message.
- **Jump buttons have no accessible names beyond "1"–"5" (WCAG 1.3.1).**

Sam's own severity ranking puts pointer-only interaction, color-only blanks, and unguarded motion as "Critical/must-fix," with dialog semantics and focus-visible as "High," and contrast/labels as "Medium/Low."

## Adjacent single-voice findings worth carrying

- **Dev** flags the 650ms auto-close of the quiz on a correct answer as "user-hostile for accessibility (screen readers, users who pause to read)" — nobody else frames this as an a11y issue, though Priya separately calls the same timing "a balance between celebration and momentum" (i.e., saw it as a pacing choice, not a barrier).
- **Kai** notes the "Building N" name banner over the roof can obscure the roof "especially on smaller viewports."
- **Nadia** separately worries the fixed 224px quiz panel height could clip the shake/feedback animation if it reflows on a small screen.
- **Eleanor** suggests an explicit "best on tablet or computer" disclaimer if mobile isn't going to be fixed soon — a stopgap, not a fix.
- On contrast specifically, reviewers split: **Sam** flags amber-on-dark, red-#c0392b-on-white, and green-#7ee0a0-on-dark as needing verification against 4.5:1, while **Cyrus**, **Marcus**, **Leilani**, and **Nadia** all independently praise the same amber/dark and white-plate contrast as excellent — worth an actual contrast-checker pass rather than taking either side at face value.

## Top recommendations for this lens

1. **Give `#prompt`, `#quiz`, `#jumpbar`, and `#viewbar` real mobile breakpoints** (e.g. `@media (max-width:600px)`) — move the quiz to a bottom sheet/modal instead of a fixed right-side 224px column, reflow the jump bar and walk-around buttons out of the thumb-crushing edges. (Leilani, Priya, Dev, Sam, Rosa, Marcus, Kai, Bea, Felix — the single largest consensus in the whole review set.)
2. **Shorten and reflow the prompt banner text for narrow widths**, at minimum increasing width/line-height and font-size, ideally cutting word count on mobile. (Leilani, Marcus, Omar, Kai, Eleanor, Luna, Ingrid)
3. **Add `prefers-reduced-motion` handling** to the wrong-answer shake and the confetti burst. (Sam)
4. **Make every interactive element keyboard-operable**: Tab order onto doors/quiz options/camera controls, Enter/Space to activate, a visible `:focus-visible` style, and a focus trap + `role="dialog"` + `aria-live` on the quiz panel. (Sam)
5. **Stop using red color alone to mark blank door plates** — add a shape, icon, or text cue alongside it. (Sam)
6. **Increase touch targets** on the jump-to-part circles (34×34 → ≥40-48px) and the walk-around buttons, with more spacing between them. (Sam, Priya, Leilani)
7. **Add an `aria-describedby`/text-alternative summary of each stage's 3D scene** for screen-reader users, since the whole experience otherwise lives in an unlabeled `<canvas>`. (Sam, Priya)
8. **Give the jump-to-part buttons accessible names** ("Jump to Part 1 — sequential numbering") rather than bare numerals. (Sam)
9. **Verify contrast values with an actual checker** for amber-on-dark, red-on-white blanks, and green success text rather than relying on conflicting visual impressions. (Sam raising doubt; Cyrus/Marcus/Leilani/Nadia praising the same colors)
10. **Reconsider the 650ms quiz auto-close** as a possible cognitive/accessibility friction point, not just a pacing choice. (Dev; contrast with Priya's more neutral read)

## Out of scope / parked

- Curriculum/geometry critique of Part 5's non-unified "zigzag" numbering rule (Hiro) — a curriculum question, not layout.
- Suggested top-down schematic diagram for Part 5 (Hiro) — new content, not a layout fix.
- Contact shadows / ground-contact darkening for the 3D models (Felix, June) — rendering/art direction, not layout.
- Custom web-font loading and canvas-texture kerning/tabular-numeral rendering for door plates (Ingrid, Ada) — typography/rendering, belongs to a different lens.
- Haptic feedback / sound effects on right/wrong answers (Kai, Priya) — needs audio assets, explicitly out of scope per briefing.
- Consistency of button wording ("Continue" vs. "Ready" vs. "Next Building") (Omar) — a copy/IA question, not layout.
- Adaptive camera zoom/framing per viewport (Dev) — camera/rendering logic, not panel layout.
