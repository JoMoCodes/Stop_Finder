# Dev Sharma — Front-End Engineer, Interaction Quality

## Overview
The apartment course is visually clean and pedagogically sound, but the interaction layer has five fixable friction points that hurt discoverability and mobile usability. The 3D rendering is solid; the problems are UI/UX at the seams.

---

## Issues

### 1. **Clickable doors don't signal they're clickable** (HIGH PRIORITY)
**Problem:** Door plates (blank "?" plates) are clickable but the cursor never changes to `pointer`. On desktop, users might not realize doors are interactive until they accidentally hover and trigger the quiz. Worse on mobile where there's no hover.

**Evidence:** Screenshots show no visual cursor feedback. The raycaster targets the plates and doors (lines 1188–1190), but there's no `renderer.domElement.style.cursor = 'pointer'` on hover. The CSS file has no cursor rules for interactive elements.

**Fix:** Add a tiny pointer-move listener that raycasts every frame and sets `cursor: pointer` when over a blank plate, `cursor: default` otherwise. ~S effort. This is table stakes for discoverability.

---

### 2. **Hit-box too large; clicking near a plate opens the quiz**
**Problem:** The raycaster targets both the plate AND the door mesh (line 1343: `raycastList.push(plate, door);`). The door is 1.25 × 2.05 units; the plate is 1.7 × 0.85. Users clicking on the door frame (but not the number) will open the quiz. On a dense building (Part 5: 20 doors), this causes accidental opens.

**Evidence:** Part 5 mobile (mobile-part5-example.png) shows doors packed tightly. The door mesh is a full 2.05 tall; the number sits at `base + 2.55`. A click 0.5 units below the number will still hit the door and trigger the quiz.

**Fix:** Only raycast the plates, not the doors. Remove `door` from `raycastList.push()` calls (lines 343, 732, etc.). Alternatively, keep doors but add a distance check: only open quiz if the intersection point's Y is within ±0.5 of the plate's Y. ~S–M effort.

---

### 3. **Quiz auto-closes after 650ms, no user control**
**Problem:** Line 1115 closes the quiz after 650ms when correct. This is user-hostile for accessibility (screen readers, users who pause to read) and anyone on high latency. A learner who reads slowly, or who wants to glance back at their answer, loses it mid-glance.

**Evidence:** The timeout is hard-coded. No option to dismiss manually or re-open. Learner psychology: "I want to see if I got it right" → sees "✓ Correct!" for 0.65s → panel gone. Frustrating.

**Fix:** Let the learner close the quiz manually. Keep the auto-close as a safety fallback, but add a `close` button or allow ESC key to dismiss. Or increase timeout to 2s. ~M effort.

---

### 4. **Mobile: quiz panel overlaps the building**
**Problem:** The quiz panel is fixed `right: 22px; width: 224px` (lines 74–75). On a 390px phone, that's 58% of viewport width. It obscures parts of the building, especially the rightmost doors (Part 1, Part 2, Part 5). Learner has to mentally infer what's behind the panel or close the quiz to see.

**Evidence:** mobile-part1-quiz.png shows the quiz panel eating a chunk of the 3D view. The right side of the building (especially Part 2's rightmost door, if present) would be hidden. Unusable.

**Fix:** On `viewport-width < 600px`, move the quiz to the bottom as a horizontal card or modal overlay (fixed above the canvas, centered). Or shrink the panel to 160px and let the building peek through. ~M effort.

---

### 5. **Canvas texture text rendering softness at scale**
**Problem:** `makeTextTexture` uses 512×256 canvas for most plates and 1024×256 for larger labels (lines 259–266). When rendered on a plane in 3D space, especially 5-digit numbers on Part 5, the text can look slightly blurry or aliased. The `anisotropy: 8` helps but isn't a magic bullet.

**Evidence:** Part 5 quiz (13-part5-quiz.png) shows numbers like "19313" at modest size. If you zoom in on the 3D plate, the rendering is soft. Compare to the crisp yellow arrows nearby (which are 3D geometry, not texture).

**Fix:** Increase canvas resolution to 1024×512 for normal plates, 2048×512 for large ones. Or use `textRendering: 'geometricPrecision'` in the canvas context. Or switch to a bitmap font atlas. ~M–L effort (L if you go the atlas route, S if you just up the resolution).

---

### 6. **Mobile: no viewport-aware camera positioning**
**Problem:** Camera framing is set once per stage (e.g., line 994: `camera.position.set(5, H * 0.6, 25)`). On phone vs. desktop, the same building may look vastly different — taller buildings fill the screen on mobile, smaller buildings on desktop. No adaptive zoom.

**Evidence:** mobile-part5-example.png shows the building slightly cramped vertically. The learner has to pinch-zoom manually on each stage.

**Fix:** After `frameStage()`, compute the bounding box of the current stage, then adjust camera distance so the building fills (e.g., 70% of viewport height). Use `camera.updateProjectionMatrix()` or adjust `camera.fov`. ~M effort.

---

### 7. **No loading state or error message**
**Problem:** If Three.js fails to load or WebGL isn't available, the canvas stays blank. No message. Learner stares at a blue sky forever.

**Evidence:** No try-catch around the import or renderer setup. If the CDN is down or the browser doesn't support WebGL, there's no UX.

**Fix:** Wrap the module import in a try-catch. Add a fallback `<div id="fallback" style="display:none;">...</div>` and show it if WebGL or Three.js fails. ~S effort.

---

## What Works

- **Color and typography:** Dark panels, amber keywords, clear sans-serif. Reads well.
- **Shake animation on wrong answers (line 91):** Good tactile feedback. The 5px amplitude is subtle but noticeable.
- **6px drag-vs-click threshold (line 1182):** Correct. Allows tiny tremors but catches real drags.
- **Confetti particle count (170, line 1207):** Celebratory but not obnoxious. Well-tuned.
- **Orbit controls responsive feel:** Damping is on, maxPolarAngle prevents weird angles. Feels natural.

---

## Priority Queue

1. **Cursor pointer on blank plates** (S) — table stakes, high ROI
2. **Remove doors from raycast target** (S) — stops accidental opens
3. **Quiz panel mobile layout** (M) — unusable below ~600px
4. **Manual close for quiz** (M) — accessibility win
5. **Canvas resolution bump** (S) — one-line change for crisper text
6. **Camera adaptive zoom** (M) — nicer on small screens
7. **Error fallback** (S) — edge case but free win

---

## Recommendation
The course teaches well and looks good. The friction is all interaction-layer. Knock out #1, #2, and #3, and this becomes a solid learning tool. Do #4 and #5 if you have time. The rest are nice-to-haves.
