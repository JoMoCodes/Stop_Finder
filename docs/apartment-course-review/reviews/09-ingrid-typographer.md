# Ingrid Vos — Typographic Review, Stop Finder Apartment Course

## Executive Observation

This course has excellent pedagogical *intention* and a cohesive visual system. The color palette is purposeful: that warm amber for keywords, the red for blanks—good. The 3D perspective is clever, and the interaction design is clear. But the typography undermines the entire teaching goal. The canvas-rendered numerals are optically crude, and the blanks are a missed opportunity.

## The Central Problem: Fallback Font Disaster

Every door plate and building sign uses this:

```javascript
font = 'bold 170px sans-serif'
```

This is, frankly, unacceptable. **`sans-serif` is not a font; it is a plea for the browser to pick something.** The rendering—weight, metrics, optical adjustment, how numerals sit on the baseline—is now out of your hands and varies between Chrome, Safari, Firefox, and by operating system. On Windows you get Segoe UI; on Mac, San Francisco; on Android, Roboto or Noto Sans.

A delivery driver using this tool on an iPhone 14 in poor light will see numerals that *look different* than a driver on a Samsung Galaxy in the same light. This is not merely inelegant; it breaks consistency and induces cognitive load.

**Recommendation:** Specify an exact font stack:
```javascript
font = 'bold 170px -apple-system, Segoe UI, Roboto, system-ui, sans-serif'
```

Even better: load a single web font (e.g., Inter or Roboto from Google Fonts, or self-host). One font, one rendering, every screen. This is 2026. There is no excuse for generic fallbacks on numerals learners are meant to read under time pressure.

---

## The Numerals Themselves Are Monomorphic

The door plates use a canvas bitmap at 512×256 pixels, rendered center-aligned. That *sounds* fine, but there is no kerning, no metric adjustment, no optical centering. Look at the screenshots:

- **Part 1**, stage 01–03: Numbers like 109, 110, 111, 112, 114. The `1` sits differently in visual weight than the `0` or `2`. A narrow `1` next to a wide `0` creates visual imbalance.
- **Part 2** (the tower): 129, 229, 329, 429. The first digit *should* read as "floor," and the narrow `2` vs. the wide `8` or `0` should be optically distinct. Right now, they compete.

**You are rendering in bold—bold numerals are *already* monolinear and rigid.** If you must use canvas, set the numerals in tabular (monospaced) figures and apply negative letter-spacing to tighten them:

```javascript
ctx.font = 'bold 170px -apple-system, Segoe UI, sans-serif';
ctx.letterSpacing = '-4px'; // or via TextMetrics if supported
```

Better yet: render at a larger canvas size (1024×512) and then scale down (anisotropy = 16), or use a proper 3D text library that can apply kerning and optical adjustment in real time.

---

## The Question Mark Is Lazy

The blanks render as a single `?` in red. The briefing mentions that learners should see *partial* patterns like `71_5` (with an underscore placeholder for the missing digit). This is pedagogically crucial—it teaches the structure, not just the answer.

In the code (line 337):
```javascript
const plate = label(g, '?', 1.7, 0.85, { fg: '#c0392b' });
```

It always renders `?`. There is no conditional to show partial numbers. The red `?` is *attention-grabbing*, yes, but it's also *information-starving*. A learner sees "?" instead of "71_5" and must guess from the four options without understanding where in the number the answer goes.

The underscore rendering itself has issues:
- Underscores in many fonts sit at the baseline and are visually ambiguous (looks like a minus, not a placeholder).
- In a bold numeric context, the underscore can nearly vanish.

**Recommendation:** If a partial is needed (e.g., "71_5"), render it with a custom placeholder glyph or use a subscript-style caret (`71▁5` or `71_5` with a thicker, offset underscore). Test this at the actual render size (512px canvas, viewing distance in 3D space) to ensure legibility.

---

## Canvas Antialiasing Artifacts at Angle

Look at Part 5 (the multi-face building). Door numbers appear on all four faces, and many are at a steep angle to the camera. The `anisotropy = 8` helps, but it is not enough:

- At 45° angles, canvas text blurs (this is a WebGL texture filtering limitation).
- On mobile, anisotropy support is uneven.
- The undersampling of the canvas texture becomes visible—numerals lose definition.

**Recommendation:** 
1. Increase anisotropy to 16 (or higher if the device supports it).
2. Double the canvas size (1024×512) and scale the geometry down, trading memory for sharpness.
3. Or: prerender all possible numerals (01–20 for Part 5) as high-DPI SVG textures and embed them as data URIs. This gives you vector-perfect rendering and full control over antialiasing.

---

## Mobile Rendering: Compressed and Pale

On the mobile screenshots (390×844), the UI is stacked vertically. The door plates and numerals scale down but remain sharp enough (canvas scaling is predictable). However:

- **The prompt banner text is now smaller and loses emphasis.** The amber keywords (`**number layout**`, `**building**`) are essential, but on a 390px viewport, they read as fine-print.
- **The quiz panel is now the dominant UI element.** Its 16px sans-serif (inherited from the body `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`) is serviceable, but the option buttons could benefit from a taller line-height (currently tight at `font-size: 16px` with no explicit `line-height`).
- **The building name banner is harder to parse.** The cream text (#ffe4c2) on a dark background is good, but the size and boldness don't scale gracefully to mobile.

**Recommendation:**
- Add `line-height: 1.5` to `.opt` buttons (and the prompt text).
- Consider a slightly larger font size for the prompt on mobile (use a media query).
- Keep the amber keywords. They work.

---

## Color + Contrast: Generally Sound

The color palette is restrained and purposeful:
- **Light blue sky** (#bfd9ec): calm, recessive.
- **Olive ground** (#86996a): earthy, not distracting.
- **Amber keywords** (#ffd9a0): warm, draws the eye. Meets WCAG AA on the dark prompt background.
- **Red for blanks** (#c0392b): urgent, but not overwhelming. Only used for the `?`.
- **Cream for signs** (#ffe4c2): readable on dark backgrounds, warm.

The door plate backgrounds are nearly white (rgba(255,255,255,0.95)), and the numeral foreground is a dark blue-grey (#16202b). This is a strong contrast—fine for clarity, though a slightly warmer dark (e.g., #1a1a1a or #2d3436) would feel less clinical.

**No major issues here.** The system is deliberate and works.

---

## Prompt Typography: Clear Instructions, But Tight

The top banner holds the learning task. The text is 15px, line-height is default (1.2 or so), and the ambient fallback font-family is `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`. This is a good stack.

The bold amber keywords (`**number layout**`, `**yellow arrows**`, `**fill in the missing unit numbers**`) are the semantic anchors. They stand out and signal what to do.

**Issue:** On a 1440px screen at 90 pixels-per-inch, 15px is readable but tight. The line-height should be 1.5 or higher to reduce cognitive load. On mobile, bump to 16px or 17px to match the quiz panel.

```css
#prompt {
  line-height: 1.5;
}
@media (max-width: 600px) {
  #prompt {
    font-size: 16px;
  }
}
```

---

## The '?' Versus '_' Versus Visual Hierarchy

The briefing hints that blanks can show partial patterns (`71_5`). The current code only renders `?`. This is a teaching regression.

If the intent is to show partial patterns, the rendering needs care:
- The underscore must be visually distinct from a digit.
- It must not be confused with a minus sign or baseline flourish.
- It should suggest "missing digit here" without overstatement.

Option A: Use a bolder, centered underscore: `71‾5` (overline or macron) or `71▁5` (lower one-eighth block).  
Option B: Use a subscript box: `71☐5` (or a small square placeholder).  
Option C: Keep underscores but add a slight baseline rise and make them thicker: `71_5` with `text-decoration: underline` or a custom glyph.

Right now, the code doesn't do any of this—it just renders `?`. **Fix this in the JavaScript logic, not the CSS.**

---

## Three Specific Observations from the Screenshots

1. **Part 1, door plate "103" and "104":** The numerals are centered, but the spacing between them (door-to-door) looks even. There is no kerning, and the `1` in `103` reads as lighter than the `3`. Optical centering would help, but it's not critical for a 2-story 4-plex.

2. **Part 2, floor badges (1, 2, 3, 4):** Single digits. Here, the narrow `1` and `2` look cramped next to the wide `0` in `130` or `230`. The bold font exacerbates this. Consider proportional leading (add negative tracking) to compress single digits.

3. **Part 5, Building 6, the "Walk around" panel:** The four direction buttons (Front, Back, Left, Right) use the `.ghost` button style with `system-ui` fallback. They are readable, but the single-word labels could be bolder or use small caps to improve scanning speed. Currently, they blend into the page.

---

## Recommendations, Ranked by Impact

### High Priority

1. **Replace generic `sans-serif` fallback with a full font stack** (system fonts or a web font). This fixes browser variance and makes numerals consistent.
2. **Render partial patterns** (`71_5`, not just `?`). This restores pedagogical integrity. Use a visually distinct underscore or placeholder glyph.
3. **Increase canvas size and anisotropy** for the door plates: 1024×512 canvas, anisotropy = 16. Sharpness at angle improves.

### Medium Priority

4. **Add `line-height: 1.5` to all text elements.** Tightness is an enemy of learning.
5. **Tabular numerals for door plates:** Use `font-variant-numeric: tabular-nums` (CSS) or render with a monospaced fallback to ensure alignment.
6. **Mobile breakpoint for prompt:** Bump font-size to 16px and line-height to 1.6 below 600px width.

### Lower Priority (But Worth Doing)

7. **Refine the underscore placeholder glyph** so it doesn't look like a minus sign or baseline artifact.
8. **Lighten the dark numeral foreground** from `#16202b` to something warmer (e.g., `#2d3436` or `#1f2937`) for reduced eye strain.
9. **Add focus states to quiz options** (`:focus-visible`) for keyboard accessibility.

---

## Final Thought

The pedagogy is sound. The 3D rendering is thoughtful. The interaction design is clear. But typography is precision work, and right now, the numerals are rendered with a shrug. A delivery driver learning to decode address patterns deserves fonts that are *sharp*, *consistent*, and *optically refined*—not a browser lottery.

Fix the font stack and the partial-pattern rendering. Everything else will feel more polished as a result.
