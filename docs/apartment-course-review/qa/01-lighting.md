# QA — 01 Lighting, materials, sky/ground

**Verdict: PASS WITH MINORS**

Source checked: `/home/user/Stop_Finder/apartment-mockup.html` (lines ~486-532 lights/sky/fog,
536-545 `box()`, 398-405 `COLOR`, 1196-1224 ground/road). All values match the design doc
verbatim (hemi 0xfff5e6/0x7a7466/0.6, sun 0xfff1dc/1.45, shadow map 2048, bias -0.0005,
normalBias 0.02, frustum ±34, ground 800×800 + ≤4% noise cells, road 800×6, palette:
door 0x5b9d66, glass 0x46586e, road 0x7d8792, arrow untouched at 0xffd54a). No tone mapping
line present. `PLACE_COLORS` (doc 09) sits inside the `COLOR` braces exactly as the merge
note predicted — no conflict.

## Passed checks
- **Sky gradient**: measured column scan (x=1250, stage 00) shows merged sky going from
  (175,200,226) at y=0 to (221,231,238) near the horizon (y=400) — a real gradient; baseline
  was flat (191,217,236) throughout. Confirmed on 3 stages (00, 04, 12-left).
- **Fog hides the ground edge**: cropped the horizon band (y400-470) on
  `12-part5-example-view-left.png`. Baseline shows a hard cliff-edge cut between grass and flat
  sky. Merged fades grass smoothly into haze with no visible edge. Matches the acceptance check
  verbatim.
- **Roof-overhang shadow (stage 00)**: wall column at x=420 goes from baseline's flat
  (127,52,39) to merged (77,27,18) for y=305-335 (near the roof), recovering to ~(123,49,36)
  (≈3% darker, roughness-only) by y=345 — a real, soft-edged shadow band near the roofline.
- **Door recess reading**: tan wall at door-width bands drops from (144,126,105) baseline to
  (88,76,61) merged (~39% darker) vs. ~3.5% elsewhere — doors read as recessed; plate itself
  unaffected (see below).
- **Stair shadows (Part 5, Left view)**: pixel scan behind the stair flight shows alternating
  shadowed-wall (77,27,18) / lit-tread bands in a stepped pattern consistent with cast shadow
  from the treads — not present in baseline (which has no shadow map).
- **Plates unshadowed and legible**: mode-color analysis (not single-pixel picks, which are
  anti-aliasing-sensitive) over the plate row in `12-part5-example-view-left.png` gives white
  bg (247,247,246)→(248,248,247) and numeral (24,31,39)→(24,31,39) — effectively identical.
  Plate backgrounds in stage 00 are likewise ~248 white in both. The arrow's yellow
  (255,213,74) is bit-for-bit identical baseline vs merged, ruling out any renderer-level
  (tone-mapping) color shift.
- **No shadow acne** observed on flat wall crops; no obvious peter-panning at the stair treads.
- **Live reload**: served the merged file with vendored Three.js, no `pageerror`/console errors
  (only the expected favicon 404).

## Findings
1. **MAJOR** — Stage 04 (tower) floor-band shadow is much wider than "thin": at x=470 each
   floor is ~39% darker ((127,52,39)→(77,27,18) / (144,126,105)→(88,76,61)) over roughly the
   *top half* of its own height (e.g. floor 3 dark from y=348-390 of an 84px-tall band), not a
   thin line under the band. Doesn't touch any plate (plates confirmed unaffected) so it
   doesn't break legibility, but it reads as a heavy wash rather than the specified "thin
   shadow line." Suggested minimal fix (within doc 01's ownership): raise the sun further
   (increase `sun.position.y`, reduce `x`/`z`) to steepen the light's angle against the wall
   plane and shorten the throw of the floor-band ledge's shadow, then re-check the ±6%
   sunlit-wall brightness target still holds.
2. **MINOR** — Stage 04 sunlit-wall brightness ratio measured at (123,49,36)/(127,52,39) =
   96.9%/94.2%/92.3% per channel — the blue channel is ~7.7% darker than baseline, a hair
   outside the doc's own "±6%" target. Cosmetic; `sun.intensity` (currently 1.45) could be
   nudged toward 1.5.
3. **MINOR (unverifiable here)** — Mobile 45fps check: this sandbox only has software
   rendering (swiftshader), which measured ~10fps regardless of scene — not representative of
   a real 2021 Android GPU. Needs checking on real hardware or a GPU-accelerated CI runner;
   nothing in the code (2048 shadow map, single shadow-casting light) looks obviously
   over-budget.

## Outside my doc
- `#prompt` banner background shifted from (44,52,60) baseline to ~(35,42,49) merged (~20%
  darker), a plain CSS/DOM box unrelated to WebGL. Confirmed this isn't caused by doc 01 (no
  tone mapping, HTML overlay isn't lit by scene lights) — flagging for whichever doc owns
  `<style>`/`#prompt` since it fails a literal "UI pixel-identical" check.
