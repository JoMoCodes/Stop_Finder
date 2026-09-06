# QA — Doc 09: Wayfinding cues (merged page)

**Verdict: PASS WITH MINORS** (two MAJOR readability defects confirmed and fixed empirically; one MAJOR cross-doc color inconsistency; everything else passes cleanly)

## Passed checks
- `splitPlaces` matches spec exactly for all four test strings (verified by reading the merged code, lines 413–421 — byte-identical to the doc's spec block): `13117/row`→`13|1|17`, `1231/seq`→`12|31`, `222/tower`→`2|22`, `112/plex`→`112`.
- Part 2 (`addTowerArrows`): floor badges render blue (`#7cc4ff`) on dark, size 1.15; arrow sits flush against the badges (`arrowX = x-1.4`) with no gap. Matches stage 04 screenshot exactly.
- Part 3 example (stage 07): digit key **1 1 09** in coral/blue/white with captions, positioned right of "Building 1", on the roofline, no overlap; two blue floor badges (1/2) on the left end. PASS.
- Part 4 example (stage 10): digit key **10 1 01**, correctly clear of the "Building 10" banner. PASS.
- Colour consistency: Part 3's prompt (`1·1·09`), the quiz `#qkey`/quiz options (stage 08 quizopen screenshot), and the finale's `<li>` items (source lines 297–298) all render the identical coral `#f28c6a` / blue `#7cc4ff` / white `#eef2f6` — computed styles confirmed via Playwright (`rgb(242,140,106)`, `rgb(124,196,255)`, `rgb(238,242,246)`).
- Part 5 mini-map: rectangle + 12 numbered ticks (601–608, 617–620) + ↑→→↓ arrows + "9–16 upstairs, back & front" note, exactly per spec. Verified via raw SVG dumps that the highlighted wall and "you are here" wedge track `controls.getAzimuthalAngle()` correctly through all four Walk-around buttons (front/back/left/right each highlight the matching edge, wedge on the matching side) **and** through a live drag (azimuth 2.69 rad → correctly resolves to "back" highlighted, wedge upper-right). Stage 13 quiz: ground-floor blanks show `?`, solved and non-blank doors show numbers; clicking the correct option for door 1231 flipped its tick from `?` to `1231` live. Shows/hides correctly on `stagechange`. No console/page errors across all 14 stages (verify.sh), only the expected favicon 404.

## Findings

1. **MAJOR — Part 1 last two arrows read as a stray line in the default view.** Acceptance check says "dragging right shows they point at 105" — confirmed true (`qa/shots-09/00-dragged-right.png`) — but the *default* view (`00-part1-example.png`, matches overseer's screenshot) shows the arrowhead-turn point floating past the building's visible silhouette in open sky, with a disconnected second stub, because `xe = W/2 + 1.2` (line 768) puts the turn 0.5 world-units *beyond* the roof's outer corner (roof half-width is `W/2+0.7`). Fix verified empirically: change `const xe = W / 2 + 1.2;` → `const xe = W / 2 + 0.7;` (anchors the bend exactly at the visible roof corner). Re-screenshotted (`00-default-fixed.png`): single clean arrowhead at the corner, no floating ball/stub.

2. **MAJOR — Part 4's front↔back loop arrows (`addBlockGuides`) read as stray marks, not arrows.** Overseer's observation confirmed and diagnosed: these arrows run almost exactly along the default camera's viewing axis (depth/z), so they foreshorten to a tiny diagonal tick (left, `part4-leftstub-crop.png`) and a "balloon on a stick" blob (right, `part4-rightstub-crop.png`) — no visible direction. This is not merge damage; it's inherent to tracing a full front-to-back run from a near-head-on camera. Verified fix by iteration: shorten each to a short (~2-unit) corner hook, angled outward from the building rather than spanning the full depth:
   ```js
   arrow(g, new THREE.Vector3(xl, y, BHALF_D - 0.6), new THREE.Vector3(xl - 1.3, y, BHALF_D + 1.6), COLOR.arrow, 0.14);
   arrow(g, new THREE.Vector3(xr, y, BHALF_D - 0.6), new THREE.Vector3(xr + 1.3, y, BHALF_D + 1.6), COLOR.arrow, 0.14);
   ```
   (lines 909–910). Result (`part4-arrowfix-test.png`): both read as clear directional arrows. Trade-off to flag: this is now a "there's more this way" hook, not a literal full-depth trace (which was never visible anyway) — the true front vs. back direction is still discovered by dragging, matching the prompt's own copy ("Study the front, then drag to spin round").

3. **MAJOR (acceptance-check fail, doc04's file) — Part 2's prompt digits aren't colour-coded.** Stage 04's prompt body wraps its floor digits in plain `<b>1</b>__` / `<b>2</b>__` (not `pl-floor` spans), so the generic `#prompt .pbody b{color:#ffd9a0}` rule paints them amber, not the shared blue — breaking "prompt examples (doc 04) use the same three colours" for the one part where this doc explicitly says "blue = floor... is learned here." Part 3's prompt does this correctly via `pl-building/floor/door` spans. Fix (in `PROMPTS.p2example.body`, owned by doc04 — flagging since it's my acceptance check): use the existing `plSpan('floor', '1')` helper (already defined at line 1540) instead of `<b>`.

## Outside my doc
- None beyond #3 above (that one straddles both docs' scope since it's explicitly one of my acceptance checks but lives in doc04's owned prompt table).
