# 04 — Prompt banner: hierarchy, plain language, length, one button verb

## Goal
Turn each prompt into a **one-line amber headline** plus a **≤ 30-word body**, cut total words by ~40 %, remove idioms, define "partial number" with an example, and make the primary button say the same thing everywhere: **Next ▸**. The banner should be read in under 8 seconds on desktop and fit above the building on a 390-px phone.

## Why
- Rosa: "I have 90 seconds to scan a building. This text is closer to 30–40 seconds of reading… trim by 30 %."
- Marcus (mobile): quotes the broken wrap "pattern going. Click a door marked ?, then pick its"; wants "the ESSENCE in under 2 lines."
- Priya: Part 5 is "~130 words across 5 sentences"; the crux "floor 1 holds the lowest numbers and the highest" is "buried mid-paragraph"; "Continue → Ready" reads "as a glitch rather than a semantic shift."
- Omar (ESL): "keep the pattern going" is idiom → "follow the same pattern"; "memorize" is vague; "fits" → "matches"; "'partial number' is not defined… one example would help"; "Why three words? A driver needs consistency."
- Luna: "a one-line headline in amber, followed by a smaller, greyed detail."
- Eleanor: "I had to read it twice… more line-spacing, or shorter sentences."
- Ingrid: `line-height: 1.5`, and 16–17 px on mobile.
- Kai: "text walls… I just want to skip to the building."

## Design

### Structure
`#prompt` keeps its tag (doc 07 adds `aria-live` to it). Content is written by one helper:
```js
function setPrompt({ title, body, short }) {
  const useShort = short && matchMedia('(max-width: 640px)').matches;
  ui.prompt.innerHTML = `<div class="ptitle">${title}</div><div class="pbody">${useShort ? short : body}</div>`;
}
```
CSS (replace the `#prompt` block, lines 15–24):
```css
#prompt { position:fixed; top:16px; left:50%; transform:translateX(-50%);
  width:min(680px, calc(100% - 32px)); background:rgba(20,24,30,0.9); backdrop-filter:blur(6px);
  color:#eef2f6; border:1px solid rgba(255,255,255,0.14); border-radius:14px; padding:14px 20px 15px;
  box-shadow:0 10px 34px rgba(0,0,0,0.4); z-index:10; text-align:left; }
#prompt .ptitle { color:#ffd9a0; font-weight:700; font-size:17px; line-height:1.3; margin-bottom:4px; }
#prompt .pbody  { color:#dfe6ee; font-size:15px; line-height:1.5; }
#prompt .pbody b { color:#ffd9a0; font-weight:600; }
#prompt .pbody i { font-style:normal; color:#eef2f6; text-decoration:underline dotted; }  /* "and" in Part 5 */
```
Left-aligned (Luna: the eye "settles" at a fixed left edge). Width 760 → 680 so lines stay ≤ 75 characters.

### Digit-place colouring in the body
Use doc 09's classes with fallbacks — write the spans, do not define the colours:
`<span class="pl pl-building">1</span><span class="pl pl-floor">1</span><span class="pl pl-door">09</span>`.

### The prompt table (replaces `EXAMPLE*_PROMPT`, lines 938–969)
`title` ≤ 40 characters, `body` ≤ 30 words, `short` ≤ 16 words. `${n}` = building label/number.

| Stage | title | body | short |
|---|---|---|---|
| P1 example | `Part 1 · Numbers count up in order` | `Ground floor 101, 102 — upstairs 103, 104 — then it continues round the back (105–108). The <b>yellow arrows</b> show the reading order. <b>Drag</b> to look around.` | `101, 102 downstairs; 103, 104 upstairs. Follow the <b>yellow arrows</b>. Drag to look.` |
| P1 quiz | `Building ${n} · Follow the same pattern` | `Click a door marked <b>?</b>, then pick the number that continues the count.` | same |
| P2 example | `Part 2 · The first digit is the floor` | `Floor 1 is <b>1</b>__, floor 2 is <b>2</b>__, and so on. Straight up a column only the first digit changes.` | `Floor 1 = 1__, floor 2 = 2__. Up a column, only the first digit changes.` |
| P2 quiz | `Building ${n} · ${difficulty} — first digit = floor` | `Click a door marked <b>?</b>. Read its floor first, then its column.` | same |
| P3 example | `Part 3 · Leading digits name the building` | `Every unit here starts with <b>1</b>, so this is Building 1. Then the floor, then the door: 1·1·09.` (with `.pl-*` spans) | `Building · floor · door: 1·1·09. Every unit starts with 1 — Building 1.` |
| P3 quiz | `Building ${n} · Fill the doors, then name the building` | `Click a door with a <b>partial number</b> (like 71▢5 — one digit missing) and pick the full number. When every door is done, the roof sign asks for the building number.` | `Click a <b>partial number</b> (like 71▢5), pick the full one. Then name the building.` |
| P4 example | `Part 4 · Numbers wrap front and back` | `Each front door has a door directly <b>behind</b> it, and the count carries on there. Study the front, then <b>drag</b> to spin round and check the back.` | `The count continues on the doors <b>behind</b>. Drag to spin and check the back.` |
| P4 quiz | `Building ${n} · Front and back` | `Drag to spin the building. Click a door with a <b>partial number</b> and pick the full unit.` | same |
| P5 example | `Part 5 · No floor digit — one running count` | `Building 6 counts 601 → 620 around the outside, floor by floor. Floor 1 holds the lowest (601) <i>and</i> the highest (617–620). Use <b>Front / Back / Left / Right</b> to walk round.` | `601 → 620 runs round the building. Floor 1 has 601 <i>and</i> 617–620. Walk round with the buttons.` |
| P5 quiz | `Building ${n} · One running count` | `Walk round with the buttons. Click a door with a <b>partial number</b> and pick the full unit.` | same |
| name building | `All doors filled ✓` | `Now click the <b>roof sign</b> and choose the building number.` | same |

Every example body ends with an implicit action; the button says it explicitly. No prompt says "click Continue/Ready".

### Button vocabulary (agreed with doc 10)
- `#continue` (example stages): always `Next ▸`.
- `#next` (finished quiz): `Next ▸`; `Next: Part ${p} ▸` when the following stage is an example; `Start over ▸` on stage 13. (Doc 10 writes those in `showNext`.)
- `#back`: `◀ Back`.
Delete the `p > 1 ? 'Ready ▸' : 'Continue ▸'` line.

### Where the strings are applied
`showStage` lines 1036–1063 become one call: `setPrompt(promptFor(currentStage))` plus the two `classList` lines that show/hide `#back`/`#continue` (keep those). `promptFor(st)` builds the row from the table using `st.kind`, `st.part`, `st.label ?? st.building ?? st.number`, `st.difficulty`. The two other `ui.prompt.innerHTML = …` lines (in `resumeQuizState` and `checkComplete`) become `setPrompt(PROMPTS.nameBuilding)`.

## Ownership
**May edit:** the `#prompt` CSS block (15–24) and its new child rules; lines 938–969 (replace with `PROMPTS`, `promptFor`, `setPrompt`); inside `showStage` only lines 1036–1063; the single `ui.prompt.innerHTML` line inside `resumeQuizState` and the single one inside `checkComplete`.
**Must not edit:** the `<div id="prompt"></div>` tag (07 adds attributes); any other line of `showStage`, `resumeQuizState`, `checkComplete` (10); `showNext` (10 — it uses your vocabulary); `#qhead` text or `#qmsg` strings (05); `@media` rules (06 — but your `short` variant already handles phones); `.pl-*` colour definitions (09); `STAGES` fields.

## Acceptance checks
- Stage 00 desktop: two-line body max at 1440×900; headline in amber 17 px; button reads `Next ▸`.
- Stage 04/07/10/12: same button `Next ▸`; no "Ready" anywhere in the DOM.
- Stage 12 (Part 5): body ≤ 30 words; the "lowest *and* highest" sentence is the second sentence, not the fourth.
- Stage 08: the phrase "partial number" is followed by the example "71▢5 — one digit missing".
- 390×844: the `short` variant is used; banner height ≤ 34 % of viewport on stage 12; no word split mid-phrase across lines like today's "pattern going."; body 15 px, line-height 1.5.
- After the last door in stage 08 is solved: headline `All doors filled ✓`, body mentions the roof sign.
- Grep the file: no "memorize", "keep the pattern going", "fits the pattern".

## Merge notes
- **Doc 10** also edits `showStage` (appends a dispatch line after `resumeQuizState()`), `checkComplete` and `resumeQuizState` (adds lines). You edit different lines in the same functions; expect textual conflicts that resolve by keeping both changes.
- **Doc 07** adds `aria-live="polite"` on `#prompt`; because you replace innerHTML per stage, the whole headline+body is announced once — acceptable. Do not add `role`s yourself.
- **Doc 06** may set `#prompt` `left/right/top/max-height/font-size` inside `@media`. Your base rules must stay `position:fixed` with a `transform` so the override is a clean shadowing.
- **Doc 09** defines `.pl-building/.pl-floor/.pl-door`; before merge those spans just render white — fine.
- **Doc 05** owns `Pick the number that matches the pattern` (quiz subhead) — do not duplicate it here.

## Out of scope for this doc
Collapsible/"read more" banners (mobile is handled by the `short` variant), a first-run tutorial (08), scene descriptions for screen readers (07), tooltips, translations, changing what the stages teach.
