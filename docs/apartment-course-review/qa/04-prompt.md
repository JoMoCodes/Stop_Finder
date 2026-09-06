# QA — Doc 04: Prompt banner content

**Verdict: PASS WITH MINORS**

Verified on `/home/user/Stop_Finder/apartment-mockup.html` via a Playwright probe
(`window.__showStage` driven through all 14 stages, `nameBuilding`, and the
after-last-door state) plus clean single-purpose screenshots at 1440×900 and
390×844.

## Passed checks
- All 14 stages + `nameBuilding` + "all doors filled" render via `setPrompt`/`promptFor`
  exactly as the `PROMPTS` table specifies (headline + body structure intact).
- Button vocabulary correct at **every** runtime moment across all 14 stages:
  `#continue` is always `Next ▸`, `#next` correctly cycles `Next ▸` /
  `Next: Part N ▸` / `Start over ▸` (on the last stage, once every stage is
  complete) / `Finish Part N ▸` (on the last stage while a stage is still
  incomplete), `#back` is always `◀ Back`. Grep of the whole file finds zero
  occurrences of "Ready" anywhere.
- Stage 0, 1440×900: body wraps to exactly 2 lines; `.ptitle` is amber
  `rgb(255,217,160)` (#ffd9a0) at 17px.
- Stage 08: "partial number" is followed by "71▢5 — one digit missing" (both
  full and `short` variants).
- After the last door in stage 08/09 is solved: headline becomes
  `All doors filled ✓`, body reads "Now click the roof sign…" — matches spec.
- 390×844: `short` variant correctly swaps in for p3example/p3quiz/p1example/
  p2example/p4example/p5example (confirmed via rendered `innerHTML`, e.g. p3quiz
  mobile body reads "Click a partial number (like 71▢5), pick the full one…").
  Banner height on stage 12 measured 16–26% of viewport, under the 34% cap.
  Body stays 15px / line-height 22.5px (1.5 ratio) at both sizes.
- `.pl-building/.pl-floor/.pl-door` spans in the Part 3 example render coloured
  (`#f28c6a` / `#7cc4ff` / `#eef2f6` via `getComputedStyle`), confirming doc 09's
  variables are live and doc 04 only wrote the spans, not the colours.
- Grep confirms no "memorize", "keep the pattern going", "fits the pattern".
- Doc 05's quiz subhead ("Pick the number that matches the pattern") is not
  duplicated in `PROMPTS`. Doc 07's `aria-live="polite" aria-atomic="true"` on
  `#prompt` is untouched by doc 04 and doesn't break `setPrompt`. Doc 06's
  `@media` blocks only touch `#prompt` in the two width/orientation queries,
  base rule stays `position:fixed`+`transform` — clean shadowing, no conflict.

## Findings

1. **MAJOR** — `p3quiz.title` exceeds the doc's own "≤ 40 characters" budget and
   breaks the "one-line amber headline" goal. Template `Building ${n} · Fill the
   doors, then name the building` renders as 51 characters with the real labels
   ('B'/'C'), and visibly **wraps to two lines** on a 390px phone (see
   `qa/clean-mobile-p3quiz.png`). Fix: shorten `PROMPTS.p3quiz.title` (~line 1571)
   e.g. to `` `Building ${n} · Fill the doors` `` — the "then name the building"
   instruction is already carried in the body sentence, so dropping it from the
   title costs nothing.
2. **MINOR** — `p2quiz.title` for the `Medium`-difficulty stage is 41 characters
   ("Building C · Medium — first digit = floor"), 1 over budget (~line 1560).
3. **MINOR** — `p3quiz.body` is 31 words, 1 over the "≤ 30 words" cap regardless
   of how `/` is counted (~line 1572–1573). (`p5example.body` is exactly 30 words
   once bare `/` separators are excluded — not a violation, just worth noting it's
   at the wire.)
4. **MINOR** — The static `<button id="continue">` at line 367 still reads
   `Continue ▸` in the raw HTML source, i.e. before `showStage` ever runs (verified
   by fetching the page's raw markup). At runtime it's overwritten to `Next ▸`
   within the same synchronous `showStage(0)` call that ends the module script,
   and the button stays `class="hidden"` until then, so no visible flash occurs
   in normal operation — but it is a genuine leftover of the pre-04 vocabulary in
   the markup itself. Fix: change line 367's text to `Next ▸` so the DOM never
   contains stale copy, even transiently or if a script error interrupts startup.

## Outside my doc
None observed — all findings are inside `PROMPTS` content or the `#continue`
button label, both doc 04's territory.
