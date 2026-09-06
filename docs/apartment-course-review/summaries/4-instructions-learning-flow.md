# Lens: Instructions, Onboarding & Learning Flow

Twenty reviewers agree the five-part progression (sequential → floor digit → building digit → front/back → running count) is well-paced and that the visual wayfinding cues — yellow arrows, floor badges, building banners, Part 5's Walk-around buttons — are the course's real teachers. The two things that most often get in a learner's way are not the 3D scene but the *words*: the prompt banner is consistently called too dense, idiomatic, or vague, and there's no first-run guidance telling a new learner they can drag the camera at all. A handful of specific "lost" moments recur across reviewers — the Part 3 "Building #" placeholder, Part 5's asymmetric numbering, and the missing sense of progress across 14 stages.

## What's working: pacing and visual scaffolding

Almost every reviewer independently praised the five-part difficulty ramp. Rosa ("The complexity ramps right... don't jump too hard"), Marcus, Priya (calls it "exemplary" scaffolding respecting cognitive load), Tobias, Hiro, Felix, Cyrus, Bea, Kai, Viktor, Nadia, and Luna all credit the course with introducing exactly one new rule per part and never burying the learner in volume. Bea, a 30-year building superintendent, said flatly: "I've literally trained drivers this way, and you nailed the sequence."

The arrows/badges/banners are the other near-unanimous strength. Rosa calls Part 1's yellow arrows something new drivers "need." Marcus: "those yellow arrows are GENIUS." Priya frames this as exploiting the "pictorial superiority effect" — the learner *sees* the pattern before being quizzed on it. Eleanor (74, first time with 3D anything) said the floor badges "made the pattern click." Part 5's Front/Back/Left/Right "Walk around" panel drew some of the strongest praise in the whole batch (Rosa, Priya, Cyrus, Bea — "chef's kiss," Viktor, Luna, Marcus), as a UI element that turns a hard 3D navigation problem into cardinal-direction buttons a learner already understands. The one dissent here is Tobias, arguing the buttons let a learner "teleport" between faces instead of building a real mental map, and that Part 4's freeform drag was the better pedagogy — he'd keep the buttons as an optional aid, not the primary method, or add a persistent compass/"you are here" indicator.

## The prompt banner: too much, too fast, too idiomatic (consensus)

This is the most frequently repeated complaint across the whole set. Rosa: the Part 1 paragraph is "closer to 30–40 seconds of reading" when a driver has 90 seconds to scan a building; she wants bullets and 30% trimming. Marcus, reading it on mobile, hits wrapped fragments ("pattern going. Click a door marked ?, then pick its") and wants the essence "in under 2 lines." Priya specifically flags the Part 5 prompt (~130 words, 5 sentences) and that its conceptual crux ("floor 1 holds the lowest numbers and the highest") is "buried mid-paragraph." Eleanor needed to "read it twice" in Part 3 and asked for more line-spacing or shorter sentences. Leilani documents the actual mobile wrapping breakage. Kai just wants to "skip to the building" — "text walls." Luna's most concrete proposal: "a one-line headline in amber, followed by a smaller, greyed detail" so "the learner's eye can settle before receiving the full briefing." Ingrid adds a typographic angle: 15px with default line-height is "tight," recommending `line-height: 1.5` everywhere and a mobile bump to 16–17px.

Omar (learning English) adds a distinct dimension — the density isn't only about length but about idiom and vague verbs: "memorize the pattern" ("Does it mean study it or remember it by heart?"), "keep the pattern going" ("A new speaker does not know what 'going' means here"), and the Part 5 sentence with nested em-dashes and parentheses ("This is hard to parse... not standard in teaching"). His concrete rewrites: "follow the same pattern" instead of "keep the pattern going," and "matches" instead of "fits" in "Pick the number that fits the pattern."

## Button vocabulary: Continue / Ready / Next Building

Priya and Omar both flag the same thing independently. Priya notes the button switches from "Continue ▸" (Part 1 example) to "Ready ▸" (Part 2+ examples) — intentional in the code, but "a learner skipping the prompt... might expect 'Continue' throughout, perceiving the label change as a glitch rather than a semantic shift." Omar, more bluntly: "One moment I click 'Continue', next moment I click 'Ready', then 'Next Building'. Why three words? ... A driver needs consistency." Both suggest picking one verb or making the distinction explicit in the prompt text itself. Notably, Rosa and Marcus separately praised button *placement* as excellent — this is purely a wording/vocabulary issue, not a layout one.

## Missing first-run guidance for drag-to-look

Four reviewers converge on the same gap: nothing tells a first-time learner that the camera can be dragged before they need to do it. Eleanor's account is the clearest first-hand evidence: she dragged, "the building whirled around unexpectedly... nobody told me why... If it had said, 'You can drag the mouse side-to-side to spin the building around — try it now!' I would have felt braver." She also wants a persistent `<kbd>?</kbd>` control-explainer. Priya recommends "a subtle rotating animation to the example stage during the first 2 seconds after load... plants the idea: the building can be rotated." Marcus wants "a tiny one-time hint on first load" or a finger-drag animation, and notes nothing tells a learner they can also scroll/pinch to zoom. Luna: "A subtle hand cursor or a rotating arrow on the model... could reinforce it without words." Related but distinct: Rosa and Nadia both flag that once a learner *does* drag, the camera has no guardrail — Rosa wants quiz-mode to lock or auto-snap back after idle drag; Nadia notes there's no reset-view control if a learner over-rotates.

## Where reviewers say learners actually got lost

Three reviewers independently hit the same spot: Part 3's building-naming step. Priya calls the "Building #" placeholder text "awkward... looks like a typo or missing data rather than a prompt" and separately notes the naming quiz is pedagogically sound but happens as an easy-to-miss "extra cognitive step" after all doors are filled. Omar saw the exact same placeholder and concluded "this looks like a bug, not a design choice." Luna, reading only the example stage, wondered aloud whether it's even clear to a learner that they're about to be asked to *choose* a name at all, since no options are previewed.

Hiro (a geometer) is the strongest single voice on Part 5's numbering itself being disorienting: the right wall reads in the *opposite* cyclic direction from the left wall, so "your brain doesn't see a continuous walk around the building; it sees two opposite readings of the same house." His concrete fix: a top-down schematic diagram in the prompt banner showing the loop and calling out the reversal explicitly, rather than making the learner reconstruct the rule by trial and error.

Tobias is the strongest single voice on the Part 1→quiz transition: "memorize the pattern" has no retrieval checkpoint before the first real quiz — "the transition from worked example to high-stakes quiz is abrupt." He'd add a zero-stakes practice question on the same building before Continue appears. Viktor makes an adjacent but separate point about the quiz *itself* offering no scaffolding after a wrong guess — no partial credit like "right building, wrong floor" — which he and Tobias both frame as a missed teaching moment inside the feedback loop.

## Missing sense of progress across the course

Three reviewers converge here from different angles. Kai (a young gamer) wants any visible marker of how he's doing — "no streaks, no score, no progress... I have no idea" — arguing it costs replay motivation. Leilani proposes a literal progress bar ("Part 1 [2/5 buildings complete]"). Viktor frames it as a learning-milestone need rather than a game-score need: a checkpoint screen after each part ("You've mastered 3-digit units! Next up: building numbers.") to mark what was just learned, distinct from the per-building confetti that already exists.

## Top recommendations for this lens

1. **Shorten and restructure the prompt banner** into a short bold headline plus a secondary, smaller detail line, and cut word count roughly 30%. — Rosa, Marcus, Priya, Eleanor, Leilani, Kai, Luna, Ingrid (line-height/size)
2. **Add first-run guidance for drag-to-look** — a brief on-load hint or a short auto-rotate preview before the camera is handed to the learner, plus an always-available "?" controls explainer. — Priya, Eleanor, Marcus, Luna
3. **Fix the Part 3 "Building #" placeholder and make the building-naming step explicit** (what it is, when it happens, that options exist). — Priya, Omar, Luna
4. **Reconcile the Continue / Ready / Next Building button vocabulary** — one consistent verb, or an explicit line in the prompt explaining why it changes. — Priya, Omar
5. **Simplify idiomatic phrasing** ("memorize the pattern," "keep the pattern going," "fits the pattern") for plain, literal wording, and flatten nested clauses/parentheses in the Part 5 prompt. — Omar
6. **Add a progress or milestone indicator** across the 14 stages, distinct from per-building confetti. — Kai, Leilani, Viktor
7. **Give Part 5's asymmetric numbering a schematic aid** (a small top-down loop diagram in the banner) rather than requiring trial-and-error discovery. — Hiro
8. **Add a low-stakes retrieval check before the first quiz**, and/or a hint that appears after repeated wrong answers on the same blank. — Tobias, Viktor
9. **Add camera guardrails during quiz mode** (snap-back after idle drag, or a reset-view control). — Rosa, Nadia
10. **Reconsider Part 5 Walk-around as an optional aid vs. primary method**, weighed against the near-unanimous praise it otherwise receives. — Tobias (dissenting), vs. Rosa/Priya/Cyrus/Bea/Viktor/Luna/Marcus (supporting)

## Out of scope / parked

- Sound effects / audio "ding," buzz, or chime feedback on correct/incorrect answers and confetti — requires new audio assets. (Kai; echoed as optional/low-priority by Priya and Luna)
- Reordering the curriculum so a learner names the building *before* filling in its doors in Part 3, to force real inference instead of "copying" — this is a pedagogical sequencing/curriculum change, not a wording tweak. (Tobias)
