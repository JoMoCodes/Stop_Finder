# 06 — Responsive and mobile layout

## Goal
Make the course usable one-handed on a 390×844 phone and sane in landscape: quiz as a **bottom sheet** with 2×2 large options, the prompt scaled and capped in height, the jump bar and walk-around buttons reflowed out of the corners into thumb reach, every tap target ≥ 44 px on coarse pointers, and every new element from the other nine docs given a phone position. This doc is **CSS media queries only** (plus a 4-line `ResizeObserver`), so it layers over everyone else's base rules.

## Why
Thirteen reviewers — the largest consensus in the set. Leilani (mobile PM): "P0/showstopper… `#quiz` is `position: fixed; right: 22px; width: 224px`… If it's hidden, how does the learner tap an answer?" Dev: "58 % of viewport width… Unusable." Priya: "the target… is infinitely far if it's off-screen." Sam: move `#quiz` to `bottom:0; left:0; right:0; max-height:50vh` under a media query; jump buttons 34×34 fail 44×44. Leilani: buttons "#4/#5… outside comfortable thumb reach". Marcus: banner "takes up 1/4 of the screen… text WRAPS"; walk-around column "claustrophobic". Felix: "a fullscreen building with a bottom sheet quiz (portrait)". Kai: "the quiz panel should slide in from the side or bottom". Omar tested on a phone: "text disappears under the screen edge". Ingrid: 16–17 px on mobile. The `mobile-part1-quiz.png` shot shows the jump bar physically overlapping the prompt.

## Design

### Viewport meta (line 5)
`<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`

### Prompt height variable (JS, insert immediately after the jump-button `onclick` loop, line 936)
```js
new ResizeObserver(([e]) => document.documentElement.style.setProperty('--prompt-h', Math.ceil(e.contentRect.height + 30) + 'px'))
  .observe(document.getElementById('prompt'));
```
Everything that must sit *below* the prompt on a phone uses `top: calc(var(--prompt-h, 140px) + 16px)`.

### Breakpoint 1 — phones, portrait: `@media (max-width: 640px)`
Bottom stack from the screen edge up (z-order low → high): bottombar → walk-around row / help / reset → mini-map → quiz sheet.
```css
#prompt { top:8px; left:8px; right:8px; width:auto; transform:none; padding:10px 12px 11px;
  max-height:34vh; overflow-y:auto; overscroll-behavior:contain; }
#prompt .ptitle { font-size:16px; } #prompt .pbody { font-size:15px; }

#jumpbar { top:calc(var(--prompt-h,140px) + 16px); left:8px; padding:6px; }
#jumpbar .jbtitle { display:none; } #jumpbar .jbtns { gap:8px; }
#jumpbar button.jbtn { width:40px; height:40px; }
#progress { margin-top:6px; }                            /* doc 10's bar, if present */

#doorsleft { top:calc(var(--prompt-h,140px) + 16px); right:8px; left:auto; }    /* doc 08 chip */

#bottombar { bottom:12px; gap:8px; width:calc(100% - 16px); justify-content:center; }
#bottombar button { padding:12px 18px; font-size:15px; min-height:46px; }

#viewbar { top:auto; bottom:70px; left:8px; transform:none; flex-direction:row; width:auto; gap:6px; padding:8px; }
#viewbar .vbtitle { display:none; }
#viewbar button.vbtn { min-width:60px; min-height:44px; padding:10px 6px; font-size:14px; }

#helpbtn   { right:8px; bottom:70px;  left:auto; }        /* doc 08 */
#resetview { right:8px; bottom:118px; left:auto; padding:0; width:40px; height:40px; }   /* doc 02 */
#resetview .rv-label { display:none; }
#minimap   { right:8px; bottom:166px; left:auto; top:auto; width:88px; }                 /* doc 09 */
#draghint  { left:8px; right:8px; width:auto; bottom:130px; }                             /* doc 08 */

#quiz { top:auto; bottom:0; left:0; right:0; width:auto; transform:none; z-index:30;
  border-radius:16px 16px 0 0; border-bottom:none; max-height:60vh; overflow-y:auto;
  padding:14px 16px calc(14px + env(safe-area-inset-bottom)); }
#qopts { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
button.opt { min-height:56px; justify-content:center; }
button.opt .ltr { display:none; }                          /* letters add nothing on a 2×2 grid */
button.opt .num { font-size:24px; }
#qclose { width:44px; height:44px; top:4px; right:4px; }
#finale { inset:0; border-radius:0; }                      /* doc 10 */
```
Rationale: the top ~34 vh is text; the bottom 200 px is controls; the building owns the middle ~50 vh. The quiz sheet covers the controls while open — it has its own × (doc 05) and the plate is visible above the sheet because doc 02's portrait framing keeps the building in the upper 60 % of the screen.

### Breakpoint 2 — landscape phones: `@media (max-height: 520px) and (orientation: landscape)`
```css
#prompt { top:8px; left:8px; right:auto; transform:none; width:min(52vw, 460px); max-height:44vh; overflow-y:auto; padding:8px 12px; }
#prompt .ptitle { font-size:14px; } #prompt .pbody { font-size:13px; }
#jumpbar { top:auto; bottom:8px; left:8px; padding:6px; } #jumpbar .jbtitle { display:none; }
#bottombar { bottom:8px; left:auto; right:8px; transform:none; }
#bottombar button { padding:9px 16px; font-size:14px; }
#viewbar { left:8px; top:50%; flex-direction:column; width:110px; padding:8px; gap:6px; }
#quiz { top:8px; bottom:8px; right:8px; left:auto; width:236px; max-height:none; transform:none; border-radius:14px; overflow-y:auto; }
#qopts { display:flex; flex-direction:column; }
#minimap { right:252px; bottom:8px; top:auto; width:88px; }
#doorsleft { top:8px; right:8px; }
#helpbtn, #resetview { display:none; }                     /* no room; camera re-frames on rotate (doc 02) */
```

### Coarse pointers anywhere: `@media (pointer: coarse)`
```css
button { min-height:44px; }
#jumpbar button.jbtn { width:44px; height:44px; }
button.opt { min-height:52px; }
```

### Tablets 641–1024 px
Nothing special beyond `#quiz { right:12px; width:248px; }` — the desktop layout holds. Verify iPad portrait (768×1024): aspect < 1 triggers doc 02's portrait framing; the right-hand quiz still fits.

## Ownership
**May edit:** the `<meta name="viewport">` tag; the `ResizeObserver` block at its anchor; **all** `@media (max-width…)`, `(orientation…)`, `(pointer: coarse)` blocks, appended after the `@keyframes shake` line at the end of `<style>`. Within those blocks you may position and size **any** id listed above, including other docs' new elements.
**Must not edit:** any rule outside a media query (base `#quiz` is 05, `#prompt` is 04, `#jumpbar/#bottombar` are 10, `.jbtn/.vbtn` sizes are 07, `#minimap` is 09, `#doorsleft/#draghint/#helpbtn` are 08, `#resetview` is 02); `prefers-reduced-motion` (07); prompt wording (04 supplies a `short` variant automatically at ≤ 640 px); camera framing (02); any JS beyond the observer; DOM structure.

## Acceptance checks (Chrome device toolbar, 390×844 unless stated)
- Stage 01 quizopen: quiz sheet spans the full width from the bottom, ≤ 60 vh tall, 2×2 options ≥ 56 px tall, numerals 24 px; the "?" plate is visible above the sheet; × is 44×44.
- Stage 00: prompt ≤ 34 vh; jump bar sits directly under it at the left (not overlapping); `Next ▸` reachable by thumb at the bottom.
- Stage 12: walk-around row (Front Back Left Right) at the bottom-left above the bottombar, each ≥ 60×44; mini-map at the right above the reset/help chips; nothing overlaps; the whole building visible.
- Stage 09 (row): all five doors visible (doc 02's framing) with the prompt not covering the roof sign.
- Rotate to 844×390: prompt top-left ≤ 52 vw; quiz becomes a right column; bottombar bottom-right; no element overlaps another; no vertical page scroll.
- iPad 768×1024: desktop layout, quiz on the right, nothing clipped.
- 320×568 (iPhone SE 1st gen): still no overlap; quiz options ≥ 48 px tall.
- Nothing in the page ever causes `body` to scroll horizontally.

## Merge notes
- You reference ids that may not exist yet (`#doorsleft`, `#minimap`, `#resetview`, `#progress`, `#finale`, `#qkey`, `.rv-label`). Harmless before merge; **do not** rename them — use exactly the ids in the overview table.
- **Doc 05** owns `#quiz` base rules; your override depends on its `#qopts{display:flex}` and `#quiz{position:fixed;transform:…}` staying as base — confirm at merge.
- **Doc 07** sets base `.jbtn` 40×40 and `.vbtn` min-height 44; your phone rules restate them (no conflict, same values).
- **Doc 04**'s `short` prompt variant fires at the same 640 px breakpoint — keep the number identical.
- **Doc 02** hides nothing; you hide `#resetview/#helpbtn` in landscape only.
- Only you append at the end of `<style>`; doc 07 inserts near the top.

## Out of scope for this doc
Native/haptics, a "best on desktop" disclaimer (Eleanor — rejected: we fix it), touch gestures beyond OrbitControls, a hamburger menu, PWA/manifest, font loading, changing copy.
