# Sam Whitfield, WCAG 2.2 Accessibility Specialist

I've reviewed the Stop Finder apartment course with care for the visual, interactive, and sensory experience. This is a thoughtfully designed teaching tool, but it has significant accessibility barriers that lock out learners using keyboards, screen readers, or who need to avoid certain animations. Below is my detailed findings.

---

## Critical Issues (Must Fix)

### 1. Red "?" plates are the only visual cue for blank doors — *WCAG 2.1 1.4.1: Use of Color*

**Finding:** On every quiz screen (01-part1-quiz.png, 02-part1-quiz-quizopen.png, 05-part2-quiz-quizopen.png, etc.), blank door plates are distinguished ONLY by their red color. There is no shape change, no icon, no pattern, no texture difference — just red vs. white. For users with red/green color blindness (7% of men, 0.4% of women), these blanks are invisible.

**WCAG Criterion:** 1.4.1 Use of Color (Level A) requires that color is not the only means of conveying information.

**Suggested Fix:** Add a secondary visual cue to the "?" plate. Options:
- Render a dotted border around blank plates (visual + shape distinction).
- Overlay a small icon (e.g., a dashed box or crosshatch pattern) on the "?" text.
- Use both color AND a text label like "BLANK" in smaller text below the "?".

**Impact:** High. This is a core learner task; color-blind users cannot identify which doors to click.

---

### 2. Entire course is pointer-only — *WCAG 2.1 2.1.1: Keyboard*

**Finding:** I traced the interaction flow:
- Camera rotation: drag-based only (pointerdown/up event listeners, no keyboard alternative).
- Door selection: click only (raycasting on pointerup; no keyboard focus/Enter key).
- Quiz options: click to select (no Tab navigation to options, no Space/Enter to submit).
- Part 5 "Walk around": camera nav buttons require click (no arrow keys or WASD alternative).

The HTML is semantic (`<button>` elements exist), but the application layer bypasses keyboard entirely. Keyboard and screen reader users cannot navigate or interact with the course.

**WCAG Criterion:** 2.1.1 Keyboard (Level A) requires all functionality available by keyboard.

**Suggested Fix:**
- Add keyboard event listeners: **Tab** to cycle through visible interactive elements (doors, quiz buttons, camera buttons); **Arrow keys** (or WASD) to rotate/pan camera; **Enter/Space** to open quiz or select option.
- Use `tabindex="0"` on door plates and ensure they have visible focus indicators.
- Implement a focus trap inside the quiz panel (when open, Tab cycles only within the options).
- In Part 5, bind arrow keys to camera view changes (e.g., Up = Front, Down = Back, Left = Left, Right = Right).

**Impact:** Critical. This excludes keyboard users and screen reader users entirely.

---

### 3. Shake animation on wrong answers has no `prefers-reduced-motion` check — *WCAG 2.1 2.3.3: Animation from Interactions*

**Finding:** Line 97 defines an animation: `@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }` applied to `button.opt.wrong`. There is **no** `@media (prefers-reduced-motion: reduce)` to disable this animation for users with vestibular disorders, migraines, or epilepsy.

**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA recommended; 2.3.2 Level AA requires no more than 3 flashes per second—not applicable here, but spirit is clear).

**Suggested Fix:** Add at the end of the `<style>` block:
```css
@media (prefers-reduced-motion: reduce) {
  @keyframes shake { 0%,100%{transform:translateX(0)} }
  button.opt.wrong { animation: none !important; }
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

Alternatively, remove the shake entirely and rely on color + text feedback ("Not quite — try again.").

**Impact:** High. Users with vestibular or motion sensitivity cannot use the course safely.

---

### 4. Confetti animation fires on completion with no control — *WCAG 2.1 2.3.3: Animation from Interactions*

**Finding:** When a stage is complete, `fireConfetti()` (line 1205) launches 170 particles with rotation (`vr`) and velocity (`vy`) across the screen. This is fun, but users with vestibular disorders, ADHD, or anxiety may find it disorienting or triggering. There is no checkbox to disable it and no check for `prefers-reduced-motion`.

**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA).

**Suggested Fix:**
- Wrap confetti firing: `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { fireConfetti(); }`
- Optionally, add a toggleable setting ("Disable confetti") in localStorage and query it before firing.
- Fallback: Remove confetti entirely and use a static celebratory message or color flash instead.

**Impact:** Medium-high. Not everyone is affected, but it significantly impacts those with motion sensitivities.

---

## Major Issues

### 5. Canvas 3D scene has no text alternative — *WCAG 2.1 1.1.1: Non-text Content*

**Finding:** The entire interactive experience lives in `<canvas>` (line 238–239). No `<img alt="">`, no text description, no fallback. A screen reader encounters the canvas but cannot describe the buildings, doors, or numbers. The learner has no way to understand the visual layout.

**WCAG Criterion:** 1.1.1 Non-text Content (Level A) requires text alternative for any non-text content.

**Suggested Fix:**
- Add a visible and hidden text description. Example (inserted after the canvas or in a `<details>` element):
  ```html
  <p id="scene-description" class="sr-only">
    You are viewing a 3D apartment building. The building has numbered doors, some showing a red question mark. 
    Click a question mark to open a quiz, then select the correct unit number from the options panel on the right.
  </p>
  ```
- Bind the canvas `aria-describedby="scene-description"`.
- For Part 1: "This is a 2-story 4-plex with 4 units per floor, numbered sequentially 101–108. Yellow arrows show the reading order: bottom-left to top-right, then to the back."
- For Part 5: "This is a 3-story building with 20 units around the perimeter. You can navigate using the Front/Back/Left/Right buttons or by dragging the camera."

**Impact:** Critical for screen reader users. They get no meaningful access to the course content.

---

### 6. Quiz panel is not marked as a dialog; no focus trap or live region — *WCAG 2.1 1.3.1: Info and Relationships; 4.1.3: Status Messages*

**Finding:** 
- The quiz `<div id="quiz">` opens when a blank door is clicked, but it has no `role="dialog"` or `role="alertdialog"`. Screen readers don't announce it as a modal.
- When the quiz opens, focus is not moved to the first option button. Keyboard users won't know to Tab into the options.
- When feedback appears (line 1113, 1120: "✓ Correct!" or "Not quite — try again."), it's added to `#qmsg` with no `aria-live="polite"`. Screen readers won't announce it.

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A); 4.1.3 Status Messages (Level AAA recommended).

**Suggested Fix:**
```html
<div id="quiz" class="hidden" role="dialog" aria-modal="true" aria-labelledby="qhead">
  <div class="qhead" id="qhead">Which unit is this?<small>Pick the number that fits the pattern</small></div>
  <div id="qopts"></div>
  <div id="qmsg" aria-live="polite" aria-atomic="true"></div>
</div>
```

In JavaScript, when quiz opens:
```javascript
function openQuiz(bstate) {
  // ... existing code ...
  ui.quiz.classList.remove('hidden');
  // Move focus to first option after buttons are added
  setTimeout(() => { ui.qopts.querySelector('button')?.focus(); }, 0);
}
```

**Impact:** High for screen reader and keyboard users. They won't receive feedback or know when the quiz has opened.

---

### 7. No visible focus indicator for keyboard navigation — *WCAG 2.1 2.4.7: Focus Visible*

**Finding:** The buttons have `:hover` styles (e.g., `button:hover { transform: translateY(-2px); background: #6fe096; }`), but I see no `:focus` or `:focus-visible` styles in the CSS. If a user tabs to a button, the focus state might be invisible or unclear, especially on dark backgrounds.

**WCAG Criterion:** 2.4.7 Focus Visible (Level AA) requires a visible focus indicator.

**Suggested Fix:** Add to the `<style>` block:
```css
button:focus-visible {
  outline: 3px solid #ffd54a;
  outline-offset: 2px;
}
```

Or use a more obvious style:
```css
button:focus-visible {
  box-shadow: 0 0 0 3px #ffd54a;
}
```

Apply the same to any interactive element (quiz options, door plates with `tabindex="0"`).

**Impact:** Medium. Keyboard users won't see where they are in the interface.

---

## Moderate Issues

### 8. Amber text color contrast needs verification — *WCAG 2.1 1.4.3: Contrast (Minimum)*

**Finding:** 
- The prompt banner (line 24) uses `#ffd9a0` (amber) on dark background `rgba(20,24,30,0.86)`.
- Quiz option letters use the same amber (line 90).
- Part 2 floor badges use `#ffd54a` on dark.

I cannot calculate exact contrast from screenshots, but amber-on-dark is borderline. If the background transparency is low, it might fail 4.5:1 (normal text) or even 3:1 (large text).

**WCAG Criterion:** 1.4.3 Contrast (Minimum): Level AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).

**Suggested Fix:** Use a WebAIM contrast checker with exact colors. If it fails, brighten amber to `#ffe4c2` (used elsewhere on the page) or reduce transparency of the background. Test specifically on the prompt banner and quiz option labels.

**Impact:** Medium. Small text in amber may be hard to read for users with low vision.

---

### 9. "Jump to part" buttons lack descriptive labels — *WCAG 2.1 1.3.1: Info and Relationships; 1.1.1: Non-text Content*

**Finding:** The top-left round buttons are numbered 1–5 (lines 125–129) with no descriptive text. A screen reader user hears "button 1, button 2…" but not "Jump to Part 1" or what each part teaches.

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A); 1.1.1 (implicitly—the buttons' purpose is not clear).

**Suggested Fix:** Add `aria-label` to each button:
```html
<button class="ghost jbtn" data-part="1" aria-label="Jump to Part 1 — sequential numbering">1</button>
<button class="ghost jbtn" data-part="2" aria-label="Jump to Part 2 — first digit is floor">2</button>
<button class="ghost jbtn" data-part="3" aria-label="Jump to Part 3 — building number">3</button>
<button class="ghost jbtn" data-part="4" aria-label="Jump to Part 4 — front and back">4</button>
<button class="ghost jbtn" data-part="5" aria-label="Jump to Part 5 — no floor digit">5</button>
```

**Impact:** Low-medium. Screen reader users won't know what each part covers without exploring.

---

### 10. Part 5 "Walk around" buttons may lack adequate touch target size — *WCAG 2.1 2.5.5: Target Size (Enhanced)*

**Finding:** On mobile (390×844), the "Walk around" panel sits on the left side with four buttons stacked vertically (lines 115–118). Each button has `padding: 10px 14px; font-size: 15px;` which is roughly 40–50px tall—borderline for 44px minimum touch target on mobile. On a small screen or for users with motor impairment, these buttons may be too cramped.

**WCAG Criterion:** 2.5.5 Target Size (Enhanced, Level AAA) recommends 44×44 CSS pixels minimum; Level AA (2.5.8) allows 24×24 with spacing.

**Suggested Fix:** On mobile, increase button size and spacing:
```css
@media (max-width: 600px) {
  #viewbar button.vbtn {
    padding: 12px 16px;
    min-height: 48px;
    font-size: 16px;
  }
  #viewbar {
    gap: 12px;
  }
}
```

**Impact:** Low-medium. Affects mobile and motor-impaired users; less critical since Part 5 is optional navigation.

---

### 11. Red "?" plate might not meet color contrast against white background — *WCAG 2.1 1.4.3: Contrast (Minimum)*

**Finding:** Blank door plates show red text (#c0392b) on white background (the plate is white). Red-on-white at `#c0392b` might fail 4.5:1 contrast depending on exact rendering. Looking at the screenshots (02-part1-quiz-quizopen.png), the red "?" is visible but not distinctly high-contrast.

**WCAG Criterion:** 1.4.3 Contrast (Minimum): Level AA requires 4.5:1.

**Suggested Fix:** Use a darker red or a different color entirely. Test with WebAIM. Alternatively, use a burgundy (`#8b0000`) or a distinct non-red color like dark purple (`#663399`) to avoid color-blindness issues while maintaining contrast.

**Impact:** Low-medium. Combined with the "color-only cue" issue above, this amplifies the problem.

---

## Minor Issues & Observations

### 12. Green success feedback may have low contrast — *WCAG 2.1 1.4.3: Contrast (Minimum)*

**Finding:** When correct, the text "#qmsg.ok" uses `color: #7ee0a0;` on dark background (line 95). Bright green on dark can fail contrast thresholds, especially for users with color blindness who see green/red similarly.

**Suggested Fix:** Test #7ee0a0 for 4.5:1 contrast. If it fails, use a darker green (`#4a9d6f`) or add a checkmark symbol (✓) to reinforce the success state beyond color.

**Impact:** Low. Only affects users who cannot see green clearly.

---

### 13. Mobile layout: quiz panel placement unclear — *WCAG 2.1 1.3.2: Meaningful Sequence*

**Finding:** On mobile (mobile-part1-quiz.png), the quiz panel overlaps the building. It's not clear if the panel is sticky, scrollable, or takes up space. The prompt banner also remains at the top. This may confuse the layout hierarchy for screen reader users.

**Suggested Fix:** On mobile, ensure the quiz panel is positioned in a clear, separate area (e.g., bottom half of screen, with the 3D scene above). Use CSS media queries:
```css
@media (max-width: 600px) {
  #quiz {
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    width: auto;
    transform: none;
    border-radius: 14px 14px 0 0;
    max-height: 50vh;
    overflow-y: auto;
  }
}
```

**Impact:** Low. Primarily a layout clarity issue.

---

### 14. Confetti particles use `pointer-events: none`, but confetti canvas is fixed — *WCAG 2.1 2.5.1: Pointer Cancel*

**Finding:** Line 1198 correctly sets `pointer-events: none` on the confetti canvas so clicks pass through. However, the confetti still animates and may distract users, especially those with ADHD or vestibular sensitivities.

**Suggested Fix:** Covered under issue #4. Respect `prefers-reduced-motion`.

**Impact:** Low (already partially mitigated by pointer-events).

---

### 15. No language attribute nuance — *WCAG 2.1 3.1.1: Language of Page*

**Finding:** Line 2 has `<html lang="en">`, which is correct. However, if prompts ever use special symbols (e.g., emojis in confetti colors, or slang), ensure screen readers announce them sensibly. Current prompts are clear English, so this is not urgent.

**Suggested Fix:** Periodically audit prompt text for clarity and ensure no reliance on visual metaphors alone.

**Impact:** Minimal. Current text is clear.

---

## Summary Table

| Issue | WCAG | Level | Severity | Fix Effort |
|-------|------|-------|----------|-----------|
| Red "?" as sole cue | 1.4.1 | A | Critical | Low |
| Pointer-only interaction | 2.1.1 | A | Critical | High |
| Shake animation + motion | 2.3.3 | AAA | Critical | Low |
| Confetti animation uncontrolled | 2.3.3 | AAA | High | Low |
| Canvas no alt text | 1.1.1 | A | Critical | Medium |
| Quiz panel no dialog role/focus | 1.3.1, 4.1.3 | A, AAA | High | Medium |
| No visible focus indicator | 2.4.7 | AA | Medium | Low |
| Amber contrast (verify) | 1.4.3 | AA | Medium | Low |
| Jump buttons lack labels | 1.3.1 | A | Low | Low |
| Part 5 touch targets | 2.5.5 | AAA | Low | Low |
| Red plate contrast | 1.4.3 | AA | Low | Low |
| Green feedback contrast | 1.4.3 | AA | Low | Low |

---

## Recommendation

**This course has tremendous pedagogical value**, but it is currently **not accessible to keyboard, screen reader, or motion-sensitive users**. The three critical issues—pointer-only input, red-only blank identification, and uncontrolled motion—must be addressed.

**Phased approach:**
1. **Phase 1 (Urgent):** Add keyboard support (Tab, Arrow, Enter); mark quiz as dialog with focus trap; respect `prefers-reduced-motion` for shake and confetti.
2. **Phase 2 (Important):** Add visual cue to blank plates (secondary to red); add aria-labels and live regions to quiz; add visible focus indicators.
3. **Phase 3 (Nice to have):** Verify color contrasts; optimize mobile touch targets; add scene description for screen readers.

The architectural foundation (semantic HTML, canvas raycasting) is solid. With these fixes, Stop Finder will serve learners of all abilities.

---

**Sam Whitfield**  
*Accessibility Specialist (WCAG 2.2, ARIA, inclusive design)*  
*Stop Finder Course Review*  
*6 September 2026*
