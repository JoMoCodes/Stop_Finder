# Mobile-First UX Review: Stop Finder Apartment Course
**Leilani Cruz, Mobile-First Product Manager**

## Executive Summary
The apartment course is a beautiful 3D teaching experience on desktop, but it's not ready for mobile learners. The layout assumes a wide 1440px screen; on a 390px phone, critical UI panels overflow or disappear, instructions get buried, and the 3D scene gets crushed vertically. A delivery driver on a bus with 40 seconds to learn needs one tap to start, clear next steps in 3 seconds, and a thumb-friendly quiz flow — this page delivers none of that.

---

## What Works

**3D Building Design & Clarity**
The low-poly models are easy to read: distinct colors (red/tan facades, green doors), clear unit numbers on white plates, visual patterns (yellow arrows, floor badges) that teach the numbering logic. On desktop (Part 1, Part 2, Part 3), the 3D perspective and camera framing let learners rotate and examine patterns without confusion. The progression from simple (2-story 4-plex) to complex (20-door corner building) is smart.

**Prompt Banner Hierarchy**
Amber keywords (`<b>` tags) pop against the dark translucent background; instructions are concise; the "click Continue" call-to-action is obvious. On desktop, this reads in under 3 seconds. The banner stays at the top, always visible, which is good for focus.

**Bottom Button Bar & Call-to-Action**
The green pill button for "Ready" / "Continue" is high-contrast and large enough to hit on desktop (13px padding, 16px font weight 600). On Part 4 and Part 5 (desktop), the button placement at center-bottom invites action. The progression from "Back" to "Continue" to "Ready" to "Next" is logical.

**Part Jump Navigation (Desktop)**
The small circle buttons (1–5) at top-left, color-coded and labeled, let power users skip ahead. The active state (green highlight) is clear, and the label "Jump to part" orients new users.

---

## Critical Issues

### P0: Mobile Layout Breaks on Phone
**Problem:** The fixed panel positions and widths are not responsive. On mobile (390px), the layout assumes desktop space that doesn't exist.

**Evidence:**
- **Prompt banner** (`#prompt`): `width: min(760px, calc(100% - 32px))` — on 390px, this becomes 358px, which is the full width minus margins. The banner text wraps heavily. In `mobile-part1-quiz.png`, the prompt is dense and hard to scan: "This is a common pattern going. ... then pick its" (line breaks mid-phrase). Learners must scroll or strain to read.
- **Quiz panel** (`#quiz`): `position: fixed; right: 22px; width: 224px` — on 390px, a 224px panel starting 22px from the right edge would overflow and clip. It's not visible in `mobile-part1-quiz.png`, implying it's hidden via media query or JavaScript, but the source doesn't show responsive hiding in the CSS provided. If it's hidden, how does the learner tap an answer on mobile?
- **Part jump buttons** (`#jumpbar`): The circular button group (5 × 34px buttons = ~170px wide, plus padding) takes up ~40% of the mobile viewport width, and it's in the visual center-top. On a 390px phone, this is a thumb-smashing risk because there's also the prompt banner above it.

**Impact:** On mobile, the learner cannot easily read instructions, cannot see or interact with quiz options, and must hunt for navigation. The first screen violates the "3-second clarity" rule.

### P0: Mobile Quiz Interaction Missing or Hidden
**Problem:** No visible quiz panel on `mobile-part1-quiz.png`. If the quiz is a core interaction (click a door, pick from 4 options), mobile learners cannot access it.

**Evidence:**
- On desktop (e.g., `01-part1-quiz-quizopen.png`), the right-side panel is prominent: "Which unit is this?" with options a) b) c) d) in amber text, green/red feedback.
- On mobile, there's no panel visible. The 3D scene is squeezed, the prompt banner takes vertical space, and the quiz is nowhere.
- If the quiz is hidden and replaced with a different interaction (e.g., on-screen buttons), it's not shown in the briefing. If it's clipped off-screen, the course is broken.

**Impact:** Mobile learners cannot complete the course. This is a showstopper.

### P1: Vertical Space Squeeze on Mobile
**Problem:** The 390×844 viewport must fit prompt banner, part buttons, 3D scene, and bottom buttons. The 3D scene ends up as a thin vertical strip.

**Evidence:**
- Desktop Part 1 (1440×900): The building occupies ~70% of the viewport vertically and is centered, well-framed.
- Mobile Part 1 (390×844): The prompt banner (~70px), part buttons (~50px), and bottom bar (~50px) consume ~170px, leaving ~674px for the scene. But the scene is also horizontally confined to 390px. The aspect ratio is portrait-tall, making the building hard to see in detail. In `mobile-part1-quiz.png`, the building is compressed; unit numbers are smaller and harder to read.

**Impact:** Readability of unit numbers and door plates drops on mobile. A learner on a bus with poor lighting will squint.

### P1: Prompt Text Wrapping and Scannability
**Problem:** Prompt instructions wrap at narrow widths, breaking at phrase boundaries and making instructions hard to scan quickly.

**Evidence:**
- Desktop Part 1 (line breaks at natural phrase boundaries): "This is a common **number layout** you can find at most **apartment buildings**. The units count up in order — the **yellow arrows** show the direction the pattern flows. ..."
- Mobile Part 1 (from `mobile-part1-quiz.png`): "This is a common pattern going. [new line] ... then pick its [new line] [partially cut off, hard to read full text]"
- The wrapping is worse on Part 5 (mobile): The instructions mention "Front / Back / Left / Right buttons" and "single running count" — on a 358px width, this becomes a wall of text.

**Impact:** Learners cannot quickly understand the goal. They must re-read or scroll to make sense of instructions, violating the "40-second bus rider" assumption.

### P1: Part Jump Button Accessibility (Mobile)
**Problem:** The top-left circle buttons (1–5) are small (34×34) and positioned at the edge, making them hard to hit on mobile in one hand without repositioning the phone.

**Evidence:**
- In `mobile-part1-quiz.png` and `mobile-part5-example.png`, the buttons are visible but small relative to the 390px width. The buttons are arranged horizontally in a row, so tapping button 5 requires reaching across or extending the thumb far.
- On a 390px phone held one-handed (thumb reach ~200px from the left edge), reaching the right-side buttons (#4, #5) is awkward.

**Impact:** Power users (or learners skipping ahead) will struggle to jump between parts. Some may tap the wrong button or give up.

### P1: Right-Side Quiz Panel Not Thumb-Friendly (Desktop Mobile View)
**Problem:** On desktop, the quiz panel is on the right at `right: 22px; top: 50%; transform: translateY(-50%)`. Even on a desktop touchscreen (tablet), this requires cross-body reach.

**Evidence:**
- In `01-part1-quiz-quizopen.png`, the quiz panel is 224px wide, positioned on the far right edge. A right-handed user holding a tablet in portrait must reach across the screen to tap options. Left-handed users cannot easily use it.

**Impact:** On tablets or mobile devices, users will struggle to tap quiz options without setting the device down or using both hands. The 3D scene blocks the left half of the screen, so left-side placement is not an option on mobile, but center-screen or bottom-panel might work better.

### P2: Visual Density & Information Hierarchy on Mobile
**Problem:** Mobile users see too much at once, and no single element stands out as "do this next."

**Evidence:**
- In `mobile-part1-quiz.png`, the prompt banner, part buttons, 3D scene, and bottom button are all fighting for attention. The prompt is dense. The building is small. The button is at the bottom.
- In `mobile-part5-example.png`, add the left-side "Walk around" buttons (Front, Back, Left, Right) to that soup. The buttons are stacked vertically on the left, taking space from the 3D scene.

**Impact:** Cognitive overload. A learner on a bus with 40 seconds scans the screen and doesn't know whether to read the prompt, rotate the building, tap the buttons, or hit the green button.

### P2: Bottom-Bar Button Size (Mobile)
**Problem:** On mobile 390px, the buttons in `#bottombar` (Back / Continue / Ready / Next) have fixed padding and font size. On a narrow screen, they can wrap or become cramped.

**Evidence:**
- In `mobile-part1-quiz.png`, the bottom shows a single "Back" button (because it's the first interaction, no Continue yet).
- In `mobile-part5-example.png`, it shows "Back" and "Ready" buttons side-by-side. On 390px, with gap 10px, two 13px-padding buttons might fit, but they're tight. If a third button (e.g., "Next") appears after completion, they might stack awkwardly.

**Impact:** On small screens, buttons can overflow, stack unpredictably, or become hard to tap without precision.

---

## Readability & Visual Design

**Good:**
- The amber keywords on dark backgrounds have excellent contrast (WCAG AAA).
- The 3D buildings are colorful and distinct (red, tan, green) — no color-blindness accessibility risk visible.
- The green pill button (#57c97e) is a strong CTA and distinct from ghost buttons.

**Concerns:**
- The prompt banner, quiz panel, and buttons all use `rgba(20,24,30,0.90)` background with a 1px light border. This is consistent but dense. On mobile at 390px, the panels overlap the 3D scene more noticeably, adding visual noise.
- The quiz options (buttons.opt) are small (10px padding, 16px font) in a narrow panel (224px). On mobile, if the panel is visible, options are cramped.

---

## Camera & 3D Interaction

**Good:**
- Orbit controls (drag to rotate, scroll/pinch to zoom) are intuitive.
- No auto-framing after a drag means learners can spin around manually, which is good for learning the spatial layout.

**Concerns on Mobile:**
- On a 390px phone with touch, dragging the 3D scene requires precision to avoid accidentally scrolling the page (though this might not be an issue if overflow: hidden on body).
- Pinch-to-zoom is a two-handed gesture, which conflicts with one-handed bus riding.

---

## Pacing & Course Flow

**Good:**
- Part 1 (stages 00–03) introduces sequential numbering gently with 1, 2, then 3 blanks. The progression is smart.
- The "Building B - Easy" label on Part 2 gives learners permission to try.
- Part 5's "Walk around" buttons (Front / Back / Left / Right) solve the problem of showing multiple building faces without requiring complex drag-and-frame logic.

**Concerns on Mobile:**
- The prompt instructions are verbose (5–8 sentences). On mobile, they wrap and become hard to scan. Consider splitting into 1–2 sentences + a "Learn more" expandable, or moving detailed instructions to a separate page.
- The Part 5 left-side panel (Walk around) is invisible on mobile in `mobile-part5-example.png`. If learners cannot tap Front / Back / Left / Right, they cannot explore all faces of the building. This breaks Part 5 on mobile.

---

## Specific Recommendations

### Immediate (P0) Fixes
1. **Add responsive media query for quiz panel on mobile.**
   - Hide `#quiz` on screens < 600px wide.
   - Move quiz to a modal overlay, center-screen, with full-width options. Add a "Check Answer" button and green/red feedback.
   - This unblocks mobile interaction.

2. **Make the prompt banner responsive.**
   - On mobile < 600px, reduce font size to 13px and padding to 12px 16px.
   - Rewrite prompts to 2–3 short sentences; use line breaks intentionally at phrase boundaries (e.g., "Learn to decode [newline] unit numbers. [newline] Click a blank door.").
   - Ensure the banner doesn't exceed 100px height on mobile.

3. **Ensure the 3D scene is accessible on mobile.**
   - Verify that pressing Back / Continue / Ready buttons works on mobile (they should be visible and tappable at the bottom).
   - Test that the building renders at full width and is readable at 390px.

### High Priority (P1) Fixes
4. **Make the part jump buttons responsive.**
   - On mobile < 600px, stack the 5 circle buttons vertically on the left, or move them to a horizontal scroll-able row below the prompt banner, or hide them and replace with a dropdown (e.g., "Go to Part").
   - Ensure each button is at least 40×40px for mobile tap targets (currently 34×34).

5. **Adapt the left-side Walk Around panel for mobile (Part 5).**
   - On desktop, keep the left-side panel (130px wide, 4 vertical buttons).
   - On mobile, move the buttons to a horizontal row below the prompt or to the bottom bar (Front | Back | Left | Right in a row). Or hide them and replace with a swipe gesture to cycle through views.
   - Ensure learners can see all 4 faces of Building 6 on mobile.

6. **Optimize the bottom button bar for mobile.**
   - On mobile, ensure buttons stack vertically if needed (Back on top, Continue below, or Back | Continue on one row + Next on the next if space is tight).
   - Add gap and responsive padding.
   - Test with two and three buttons to ensure they remain tappable (40×40px minimum).

### Medium Priority (P1) Improvements
7. **Simplify prompt text for mobile.**
   - Current Part 1 desktop: ~100 words. On mobile, it becomes dense and unwieldy.
   - Recommendation: Use a 2-sentence headline ("Learn apartment numbering") + a 2-sentence task ("Click the blank doors. Pick the right number."). Move advanced hints to the prompt for repeat learners or to a "Tips" expandable.
   - Use amber keywords sparingly: only on the primary action (e.g., "click Continue").

8. **Improve quiz panel UX on mobile.**
   - If the quiz moves to a center modal, add "Cancel" button to close it and go back to exploring the building.
   - Make option text larger on mobile (16px → 18px) to reduce eye strain.
   - Add haptic feedback (vibration) when the learner taps an option (wrong: 3 short pulses; right: 1 long pulse).

9. **Test readability of unit numbers on mobile.**
   - Ensure door plates (unit numbers) are readable at 390px. They may need to be scaled up or use a bolder font weight.
   - Current plate numbers appear to be rendered as 3D textures; verify they're not too small to read on a small screen.

### Nice-to-Have (P2) Enhancements
10. **Add a mobile-friendly tour or intro.**
   - On the first visit (detect via localStorage), show a 2-screen tour: (1) "Drag to rotate. Click a blank door." (2) "Pick the right number. Try Part 1." This primes the learner in 5 seconds.

11. **Optimize for landscape mode.**
   - Many learners might rotate their phone to landscape (844×390 rotated to 390×844 → 844×390 landscape). Add a media query for landscape and reposition panels to fit the wider, shorter viewport.
   - For example, on landscape, show Part buttons at top-left (horizontal row), quiz panel at right, scene in the middle. This is how desktop works already; extend it to landscape mobile.

12. **Add a progress indicator.**
   - On mobile, learners don't see the full list of stages (14 total). Add a simple progress bar (Part 1 [2/5 buildings complete]) at the bottom of the prompt to show how far they've come.

---

## Summary Table: Issues by Priority

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| P0 | Quiz panel doesn't exist on mobile | Cannot complete course | Move to center modal overlay on <600px |
| P0 | Prompt banner text wraps and overflows vertically | Cannot read instructions quickly | Responsive text: reduce size, shorten to 2–3 sentences |
| P0 | 3D scene compressed on mobile | Hard to read unit numbers | Verify readability; scale plates if needed |
| P1 | Part jump buttons (1–5) too small and right-side hard to reach | Power users cannot skip ahead easily | Make 40×40px min; move to dropdown or horizontal row on mobile |
| P1 | Walk Around buttons (Part 5) invisible on mobile | Cannot explore all 4 building faces | Move to horizontal row or swipe gesture |
| P1 | Bottom button bar might overflow with multiple buttons | Cannot tap all actions on mobile | Responsive stacking; ensure ≥40×40px buttons |
| P2 | Prompt text too dense and verbose for mobile | Cognitive overload; learners don't understand goal in 3 seconds | Simplify to 2 sentences; use tips/expandable for details |
| P2 | Right-side quiz panel not thumb-friendly on tablets | Difficult to tap options one-handed | Center modal or bottom panel on tablet view |

---

## Closing
The course is a strong desktop experience. The pedagogy is sound, the 3D models are clear, and the desktop layout works. But the mobile view is broken: instructions overflow, quiz is invisible, panels fight for space, and buttons are too small. A delivery driver on a bus cannot complete this course on their phone today.

The good news: these are layout and responsive-design fixes, not curriculum rewrites. Fix the P0 issues (quiz, prompt, scene) and run a mobile usability test, and Stop Finder will be truly ready for learners on the move.
