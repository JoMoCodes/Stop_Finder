# UX Review: Stop Finder Apartment Number Course
**Dr. Priya Natarajan, PhD HCI**

## Overview

This is a polished, methodical course that demonstrates strong pedagogical scaffolding and elegant visual design. The low-poly 3D buildings are readable, the progressive complexity (5 parts, 14 stages) respects cognitive load, and the interaction model—click to quiz, drag to explore, arrow and badge annotations to guide attention—aligns with established HCI principles. The course succeeds most where it takes time to teach the pattern before demanding recall; it struggles in a few areas where mobile affordances break down and learner intent clarity wavers under time pressure or complexity.

## Strengths

### 1. **Progressive Disclosure & Cognitive Load Management** (Severity: ✓ Excellent)
The scaffolding is exemplary. Part 1 introduces sequential 2-digit units on a simple 4-plex with yellow arrows and an example stage that shows all numbers before the quiz stage empties half the doors. This follows the **spacing effect** and **example fading** principles from learning science. Part 2 isolates the floor-digit rule in isolation; Part 3 adds the building digit; Part 4 combines both with front/back complexity; Part 5 removes the floor digit entirely. Each leap is one cognitive chunk. A learner cannot proceed without understanding—the course enforces mastery before advancing. This is pedagogically sound.

**Test**: Measure learner confidence and error rate across parts; compare against a version with all 5 patterns introduced simultaneously. I hypothesize error rate will increase non-linearly with the compressed version.

### 2. **Effective Use of Gestalt & Color Coding** (Severity: ✓ Excellent)
- **Proximity & grouping**: The dark translucent UI panels (prompt, quiz, navigation) sit *outside* the 3D scene, creating a clear visual separation. The brain segments "world" from "controls" instantly (Gestalt grouping principle).
- **Emphasis via color**: Amber text (`#ffd9a0`) highlights verbs and keywords in the prompt ("**click** a door," "**memorize** the pattern," "**fill in** the missing unit numbers"). This is Gestalt emphasis; the eye lands on the action first.
- **Feedback color coding**: Correct answers glow green (`rgba(87,201,126,...)`), wrong answers flash red (`rgba(229,57,53,...)`). This is unambiguous and respects **conventional color semantics**—learners need no training to understand the feedback.

### 3. **Directional Arrows & Floor Badges Guide Visual Parsing** (Severity: ✓ Excellent)
In Parts 1 and 2, yellow arrows (`#ffd54a`) show the reading order, and floor badges (the numbered circles on the left edge of the Part 2 building) make the floor-digit rule salient without explanation. The learner *sees* the pattern before the quiz demands it. This exploits the **pictorial superiority effect**—visual cues are remembered better than words alone.

### 4. **Immediate Interactive Feedback with Micro-Animation** (Severity: Good)
Wrong answers trigger a 300ms shake animation (`transform: translateX(±5px)`). This is brief but noticeable. The quiz panel also shows a text message ("Not quite — try again.") with color coding. Together, these provide **immediate feedback** in line with Fitts's Law and operant conditioning: learner clicks, system responds, learner adjusts. The 650ms auto-close on correct answers (before revealing the next blank) strikes a balance between celebration and momentum.

**Caveat**: The shake is *subtle*. For learners under time pressure or those with attention deficits, a 300ms animation may not register strongly enough. Consider testing with varied animation durations (400ms, 500ms).

### 5. **High Visual Readability of 3D Geometry** (Severity: ✓ Excellent)
The low-poly style avoids visual noise. Doors and windows are clearly distinct (green doors, dark windows). Door plates with numbers sit *on top* of the geometry, not embedded, so text is always readable from any camera angle. The flat lighting (no shadows, no specular highlights) means every number plate has equal contrast regardless of its position. This is smart—a learner won't miss a blank because it's in shadow. For a teaching tool, readability > realism.

### 6. **Part 5's "Walk Around" Navigation is Novel** (Severity: ✓ Good)
The Part 5 left-side button panel (Front / Back / Left / Right) elegantly solves the problem of navigating a 3D structure with 20 doors around four faces. Instead of forcing the learner to manually drag the camera (which risks getting lost or dizzy), the buttons jump the camera to canonical views. This is a **direct manipulation** affordance tailored to the task—naming it "Walk around" leverages the learner's real-world metaphor.

---

## Issues & Recommendations

### 1. **Mobile Layout Breaks Quiz Panel Visibility** (Severity: High)
On the `mobile-part1-quiz.png` screenshot (390×844 viewport), the right-side quiz panel is off-screen. The learner sees the building, the back button, and the prompt, but **cannot see the options without scrolling or repositioning the panel**. This violates **Fitts's Law**—the target (an option button) is infinitely far if it's off-screen.

**Recommendation**: On mobile (< 600px width), move the quiz panel below the 3D canvas or make it a modal overlay centered on screen. Test with learners on actual phones; a viewport-width quiz panel may work if the options text is truncated or font-size reduced.

**Test hypothesis**: Mobile learners will exhibit longer task time and higher error rate in the quiz step compared to desktop learners, not because they understand the pattern differently, but because they cannot see the options quickly.

### 2. **No Clear Visual Affordance for Clickability** (Severity: Medium)
The door plates and building-name banner are clickable (via raycasting), but the 3D scene shows **no cursor change, no glow, no outline** to signal interactivity. The prompt says "Click a door marked **?**," which tells the learner *what* to click, but the scene itself doesn't visually communicate *that it's clickable*. 

In the source, the raycasting logic is present (lines 1175–1192), but there's no onhover meshes highlights or cursor change. This is a missed affordance.

**Recommendation**: 
- Add a subtle glow or outline to blank door plates on hover (e.g., a faint yellow rim).
- Change cursor to `pointer` over interactive objects (CSS: `cursor: pointer`).
- Alternatively, add a visual "hint" banner after a few seconds of inactivity: "Tip: Click a door with a **?** to open options."

**Test**: Track time-to-first-click and compare learners with hover feedback vs. without. I hypothesize hover feedback will reduce meandering and hesitation.

### 3. **Prompt Text is Dense; Keyword Formatting Helps, But Could Be Bolder** (Severity: Medium)
The Part 5 prompt spans ~130 words across 5 sentences. While the amber keywords (`<b>`) highlight key actions, the paragraph structure forces the eye to scan linearly. The phrase "floor 1 holds the **lowest** numbers *and* the **highest** (617–620)" is the conceptual crux, but it's buried mid-paragraph.

**Observation**: In the `13-part5-quiz-quizopen.png` screenshot, the prompt is visible but small (1440×900 resolution). On a 1024×768 display (older tablets, laptops), the banner might be truncated or the text unreadable.

**Recommendation**:
- Break the Part 5 prompt into 2–3 shorter sentences, each with one action verb.
- Use a bulleted list for the "Walk around" instruction: "• Use **Front / Back / Left / Right** buttons to navigate. • Or drag and pinch to zoom. • Then click a door with a **partial number**."
- Test readability: measure prompt comprehension time before and after simplification. Hypothesis: Shorter, chunked prompts reduce time-to-first-action.

### 4. **"Continue" → "Ready" Label Change is Confusing Without Context** (Severity: Medium)
The button label changes from "Continue ▸" in Part 1 (example stage) to "Ready ▸" in Part 2+ example stages. The source code shows this is intentional (line 1040: `ui.continueBtn.textContent = p > 1 ? 'Ready ▸' : 'Continue ▸';`), and the prompt contextualizes it ("when you have it, click Ready"). However, a learner skipping the prompt or re-reading at high speed might expect "Continue" throughout, perceiving the label change as a glitch rather than a semantic shift.

**Recommendation**: Use a consistent label or add a tooltip. Either:
- Keep "Continue ▸" everywhere and change the prompt to "When you are ready, click Continue."
- Keep "Ready ▸" everywhere (for Parts 2+, the example is a readiness checkpoint, not a continuation).
- Add a data attribute `title="Review the pattern, then click"` to the button so a hover tooltip clarifies intent.

**Low priority test**: A/B test button label consistency. Hypothesis: Consistent labels reduce cognitive friction and time-to-click.

### 5. **Part 3 "Building #" Placeholder is Awkward** (Severity: Low-Medium)
In the `08-part3-quiz-quizopen.png` screenshot, the banner shows "Building #" in a light font color. This is a placeholder communicating "you'll name this," but the typography (gray `#` on gray background) makes it look like a typo or missing data rather than a prompt.

**Recommendation**: Use a more explicit placeholder like "Building ___?" or "Building [?]" (with brackets to suggest a blank). The underscore or bracket visual makes the "fill in" intent clearer than a bare `#`.

### 6. **Shake Animation May Be Insufficient for Low-Attention Users** (Severity: Low)
The 300ms shake on wrong answers (`.3s` duration in the `@keyframes shake`) is crisp but brief. For learners with ADHD or in high-distraction environments (loud classrooms, noisy delivery trucks), the animation may not register. The quiz panel also doesn't change size or background color—only a subtle translation.

**Recommendation** (optional, test-driven):
- Extend shake duration to 400–500ms.
- Add a brief background color *flash* (0.1s) in addition to the shake (e.g., a 20% red overlay on the quiz panel for 100ms).
- Consider a soft "buzz" sound on wrong answers (with mute option for accessibility).

**Caveat**: Avoid over-design. The current animation is restrained and professional—suitable for adult learners. Only add if user research with the target audience (delivery drivers) shows insufficient feedback clarity.

---

## Minor Observations

### 7. **No Visible Scroll or Drag Affordance for 3D Scene**
The prompt says "**Drag to look around and memorize the pattern**," but the 3D canvas has no visual cue (e.g., a cursor icon, crosshairs, or subtle movement animation) to suggest dragging is possible. On first visit, learners may not experiment.

**Recommendation** (low priority): Add a subtle rotating animation to the example stage (Parts 1, 2, 3, 4, 5) during the first 2 seconds after load. Let the camera orbit slightly, then freeze. This plants the idea: "the building can be rotated." Learners see a preview before attempting.

### 8. **Jump-to-Part Buttons ("1" "2" "3" "4" "5") Could Have Better Visual Hierarchy**
The circular buttons are small (34×34 px) and sit in a tight column (`gap: 6px`). On small screens or for users with poor fine motor control, tapping the right button is difficult (Fitts's Law: small targets = longer reach time). The active button does highlight (green background), which is good.

**Recommendation**: On mobile, increase button size to 40–48 px and add more gap. Ensure minimum 48×48 px touch target per WCAG standards.

### 9. **Building Name Selection in Part 3 Requires an Extra Step**
In Part 3 quiz stages, learners must:
1. Fill in all door numbers (4–8 options).
2. Click "Check" or proceed and see "Now choose the building number."
3. Click the building-name banner.
4. Choose from options.

This is pedagogically sound (fill the *doors* before naming the *building*), but it's an extra cognitive step. The quiz state management is complex. A learner might forget they need to name the building or assume they're done after filling doors.

**Recommendation**: Add a prompt update after all doors are filled: "Nice — every unit is filled in. Now **choose the building number**." (This is already in the code at line 1134, which is good.) Ensure the banner is clearly clickable and visually distinct after doors are solved. Consider a subtle glow or text ("Click here to name the building").

### 10. **Part 4 "Drag to Spin Around" Instruction is Clear but Camera Control is Manual**
The prompt says "**drag to spin around and check the back**." The learner must manually rotate the camera to see the back doors. This is good for engagement (hands-on exploration), but it's easy to get the building into an oblique angle where both front and back are partially visible but unreadable. 

**Observation**: Unlike Part 5's explicit "Walk around" buttons, Part 4 relies on freeform camera control. Some learners will nail it; others will orbit too fast, rotate into the wrong plane, or zoom too close.

**Recommendation** (optional): Consider adding a "Show Back" button for Part 4, similar to Part 5's view buttons. This keeps the freeform drag available but provides a safety net. Alternatively, add a prompt update after 3 seconds of no pointer movement: "Tip: Drag left/right to rotate the building and see the back."

---

## Accessibility & Compliance (Brief)

- **Color contrast**: The amber keywords on dark background (`#ffd9a0` on `rgba(20,24,30,0.86)`) have high contrast and are readable.
- **Mobile tap targets**: Jump buttons and quiz options meet 48×48 px minimum on desktop but may fall short on very small screens (320px phones). Test.
- **Keyboard navigation**: No evidence of keyboard support. Learners must click/tap. Recommend adding `arrow keys` for option selection and `Enter` to confirm.
- **Screen reader**: The 3D canvas is not accessible to screen readers (a known limitation of WebGL). This is a course about visual spatial reasoning, so a text-only alternative is complex. Consider a disclaimer or text summary of each part's pattern rule.

---

## Summary & Recommendation for Iteration

**Strengths**: Excellent pedagogical scaffolding, high readability of 3D geometry, effective use of color and typography, clever progressive complexity.

**Primary focus**: Fix mobile layout (quiz panel visibility) and add hover affordances (glow on clickable doors). These two changes will reduce friction significantly.

**Secondary focus**: Simplify dense prompts (especially Part 5), make the building-name step in Part 3 more salient, and consider optional visual or audio feedback enhancements for low-attention users.

**Suggested testing approach**:
1. **Usability test with 5–8 learners** (mix of literacy/tech levels; include mobile users).
2. **Measure**: Time-to-first-click (affordance clarity), error rate by part (cognitive load), time-to-stage-completion (friction).
3. **Compare**: Before and after adding hover glow + mobile quiz panel fix. Hypothesis: both metrics improve 10–20%.

The course is already strong. These tweaks will make it exceptional.

---

**Dr. Priya Natarajan**  
PhD Human-Computer Interaction  
Senior UX Researcher
