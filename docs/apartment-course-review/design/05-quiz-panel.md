# 05 — Quiz panel: option formatting, feedback that explains, timing, close control

## Goal
Make the four options *teach*: tabular numerals with each digit place in its own colour so the learner sees which digits move and which stay. Make wrong answers say **why** in ≤ 12 words. Keep the fast auto-close for confident learners but never take the panel away from someone still reading it, and give everyone a close button. Desktop position stays on the right; mobile placement is doc 06's.

## Why
- Ada (mathematician): options are "plain, unlabeled, left-aligned numbers… like teaching fractions without showing the denominator"; asks for `tabular-nums` and "per-digit-place color coding."
- Viktor (game designer): "wrong answers are forgiving but silent… they don't see *why*"; suggests "That's the right building, wrong floor."
- Dev: the 650 ms auto-close is "user-hostile… a learner who reads slowly… loses it mid-glance"; wants a close button or ESC. Viktor and Priya defend 650 ms as momentum — so: keep it fast, add the escape hatch.
- Priya / Marcus / Kai: the shake is "subtle", "0.3 seconds? I barely notice it"; Sam: any shake must respect `prefers-reduced-motion` (07 adds the guard).
- Omar: "Pick the number that fits the pattern" → "matches".
- Kai: "hover effects… make them light up or grow slightly."
- Ingrid: `line-height: 1.5` on `.opt`.

## Design

### DOM (children of `#quiz`; doc 07 adds attributes to the `#quiz` tag itself)
```html
<div id="quiz" class="hidden">
  <button id="qclose" class="ghost" aria-label="Close">×</button>
  <div class="qhead" id="qhead">Which unit is this?<small>Pick the number that matches the pattern</small></div>
  <div id="qkey" class="hidden"><span class="pl pl-building">building</span><span class="pl pl-floor">floor</span><span class="pl pl-door">door</span></div>
  <div id="qopts"></div>
  <div id="qmsg"></div>
</div>
```

### Option markup and CSS
```js
function optionHTML(idx, val, type) {
  const segs = typeof splitPlaces === 'function' ? splitPlaces(String(val), type) : [{ text: String(val), place: 'door' }];
  return `<span class="ltr">${'abcd'[idx]}</span><span class="num">${segs.map(s => `<span class="pl pl-${s.place}">${s.text}</span>`).join('')}</span>`;
}
```
For the building-name question pass `type = 'building'` → one segment, place `building`.
```css
#quiz { width: 248px; }                                   /* was 224: room for 5 coloured digits */
button.opt { display:flex; align-items:center; gap:10px; min-height:48px; padding:10px 14px; line-height:1.5;
  transition: background .12s, transform .12s, border-color .12s; }
button.opt:hover:not(:disabled) { background:rgba(255,255,255,0.16); transform:translateX(3px); border-color:rgba(255,217,160,0.6); }
button.opt .ltr { width:22px; color:#9fb0c0; font-weight:500; }
button.opt .num { font-size:21px; font-weight:700; font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; letter-spacing:.02em; }
.pl + .pl { margin-left:.14em; }                          /* hairline gap between places — Ada */
.pl-building{ color:var(--c-building,#f28c6a); } .pl-floor{ color:var(--c-floor,#7cc4ff); } .pl-door{ color:var(--c-door,#eef2f6); }
#qkey { display:flex; gap:10px; justify-content:center; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#9fb0c0; margin:-6px 0 10px; }
#qclose { position:absolute; top:6px; right:6px; width:36px; height:36px; padding:0; border-radius:50%; font-size:20px; line-height:1; }
#quiz { position:fixed; … (keep) ; padding:18px 16px 16px; }
button.opt.wrong { background:rgba(229,57,53,0.32); border-color:rgba(229,57,53,0.75); animation:shake .42s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
#qmsg { font-size:14px; min-height:20px; margin-top:12px; }
#qmsg.ok { color:#7ee0a0; } #qmsg.bad { color:#ff9a8a; }
```
Show `#qkey` only for stage types `tower`, `row`, `block`, `seq` (not `plex`, not the building question — for that show `#qkey` with just the building chip).

### Feedback text — `explainWrong(chosen, correct, type)`
Compare place by place using `splitPlaces` (fallback: generic line). Return ≤ 12 words:
| Case | Message |
|---|---|
| plex | `Count on from the door next to it.` |
| tower, floor wrong, door right | `Right column, wrong floor — the first digit is the floor.` |
| tower, floor right, door wrong | `Right floor — count along the doors again.` |
| row/block, building wrong | `Right floor and door — check the leading digits: the building.` |
| row/block, floor wrong | `Right building, wrong floor.` |
| row/block, door wrong | `Right building and floor — count the doors again.` |
| seq | `No floor digit here — count on from the nearest known door.` |
| building question | `Look at the digits every unit shares.` |
After the **second** wrong pick on the same blank, append the stage's one-line rule (`RULE_BY_PART`, e.g. Part 2 `First digit = floor.`). Never reveal the answer.

### Correct feedback and timing
- `#qmsg.ok` = `✓ Correct — ${val}` (the number repeated so it can be re-read).
- Auto-close after **1100 ms**, but cancelled if, at that moment, `ui.quiz.matches(':hover')` or `ui.quiz.contains(document.activeElement)`; then the panel stays until `#qclose`, another door, or the stage changes.
- Right after `setPlateText(...)`, call `checkComplete(bstate)` (pass the bstate — doc 10 reads it).
- Dispatch `quizopen` at the end of `openQuiz` and `quizclose` at the end of `closeQuiz` (see overview event contract).

### Position
Desktop: unchanged (right 22 px, vertically centred). Width 248. Nothing else — mobile is doc 06.

## Ownership
**May edit:** `#quiz` DOM children (add `#qclose`, `#qkey`; edit `#qhead` text); `<style>` lines 72–97 (`#quiz … #qmsg.bad`, `@keyframes shake`) plus new rules inserted after `#qmsg.bad`; `openQuiz`, `chooseOption`, `closeQuiz` bodies; new helpers (`optionHTML`, `explainWrong`, `RULE_BY_PART`, auto-close timer) inserted immediately before `function openQuiz`.
**Must not edit:** the `#quiz` tag's attributes (07); `makeOptions`/`makeTowerOptions`/`makeBigOptions` (distractor logic is out of scope); `checkComplete` and beyond (10) other than passing `bstate`; `@media` rules (06); `splitPlaces`/`--c-*` (09 — consume with fallbacks); keyboard handling (07 — it will focus your first `.opt` and call `closeQuiz()` on Escape).

## Acceptance checks
- Stage 05 quizopen: options `122 / 222 / 322 / 422` show the first digit blue, last two white, digits vertically aligned column by column; `#qkey` shows `floor · door`.
- Stage 08: `6103 / 7103 / 8103 / 7109` — first digit coral, second blue, last two white; wrong pick `6103` → `Right floor and door — check the leading digits: the building.`; second wrong pick adds `Leading digits = building.`
- Stage 08 building question: `7 / 1 / 71 / 17` all coral; wrong → `Look at the digits every unit shares.`
- Stage 13: `1237` vs correct `1231` → `No floor digit here — count on from the nearest known door.`
- Correct answer with pointer parked on the panel: panel stays open; move away → still open (no re-arm); click × → closes; plate shows the number.
- Correct answer with pointer off the panel: closes after ≈1.1 s.
- Shake is ≈0.42 s with visible ±6 px travel; with OS reduced motion the option just turns red (07's rule).
- `#qhead small` reads "Pick the number that matches the pattern"; subtitle wraps to ≤ 2 lines at 248 px.
- Hover an option: background lightens and it slides 3 px right; disabled options do not react.

## Merge notes
- **Doc 07** adds `role="dialog" aria-labelledby="qhead"` to the `#quiz` tag and `aria-live` to `#qmsg` — same lines, attribute-only; keep the ids exactly.
- **Doc 06** repositions `#quiz` as a bottom sheet under `@media (max-width:640px)` and switches `#qopts` to a 2-column grid; your base `#qopts{display:flex;flex-direction:column}` must remain so the override is clean.
- **Doc 10** owns `checkComplete`; you only change the call to `checkComplete(bstate)`. If 10 lands first, its `checkComplete(bstate)` will simply receive `undefined` until you merge — it must tolerate that.
- **Doc 09** owns `splitPlaces` and `--c-*`; if you merge first the fallbacks render plain white digits.
- **Doc 08** may highlight the plate while the quiz is open; no shared code.

## Out of scope for this doc
Distractor generation (Tobias), revealing answers, scoring/streaks (10), sounds, mobile layout (06), keyboard/focus (07), the prompt banner strings (04).
