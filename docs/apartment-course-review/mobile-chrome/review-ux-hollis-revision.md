# UX revision after the player runs

`player-3-perpetua.md` is missing from the folder; her view is the coordinator's summary, her questions stay open.

## Changes
- **Tap tolerance is P0, before chrome** — every run died on plates, not space: per-stage framing (plates ≥45 px), halo floor, snap.
- **`#lookbar` collapses from stage 0** into one 44 px ghost "⋯" (portrait bottom-left by Back/Next, landscape top-right); amber only on the Home item inside.
- **Part buttons peek on every completion** (2.5 s; 4 s on a part's last building; from `quizclose` if the sheet is open); the strip's "Part n ▾" label stays a 44 px target.
- **Landscape keeps its full `#jumpbar`**; only `short` copy and the lookbar change.
- **Prompt body**: default-on for each part's first quiz stage until its first `quizopen`, then title-only; ▾ or `?` restores it for 8 s.
- **Inactivity tip**: `bottom: 70px`, once per session, "Tap a glowing door plate".

## Kept
- **The portrait strip.** Perpetua's substance survives: part number, 14 segments and a 44 px target never leave the screen; only the five buttons fold, peeking at every completion. Hers was the best-framed stage (Sunbelt Part 1); on the tower and block those 187 px are the plate size everyone missed.
- **No confirm on part jumps**: they keep solved buildings; Back returns.

## Player questions
- Marrow 1 — Not offset: only the 12–30 px plate and door quads are targets, wall taps do nothing, inertia moves them; framing + halo hit target + snap.
- Marrow 2 — The strip's 44 px "Part n ▾" target plus the peek; no dialog.
- Marrow 3 — Title row: ▾ or `?` for 8 s; default-on on each part's first quiz building.
- Zippy 1 — Raycasting is exact, the camera is not: inertia plus a 14–20 px plate puts the same point on the wall a moment later; a plate behind the stair rail is unhittable.
- Zippy 2 — Both: per-stage fit (tower 60 → ~30 units) plus a `quizopen` dolly to any plate under 40 px, undone on close.
- Zippy 3 — Portrait is primary (one-handed, worst case); landscape gets copy and feedback-line fixes only.
- Perpetua — pending her file.

## Snap and halo
Yes to both, after framing. Snap, `pointer: coarse` only: when the raycast misses every plate, door and sign, open the nearest unsolved plate on the current building within 28 px, else nothing; ignore taps ending a drag (>20 px). Confirm visibly: hover tint `#fff1c2`, 1.06×, one halo pulse. Keep 28 px under half the plate pitch (≈60 px on the re-framed tower). Halo: floor its screen size at 44 px (from the projected plate width) and make it a hit target in `pickBlank`; fine pointers keep 1.16/1.34.

— Hollis Grant
