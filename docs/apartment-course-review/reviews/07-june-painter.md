# June Park, Painter and Colour Theorist

This course sits in a kind of chromatic limbo — warm, harmonious, almost restful, but profoundly *flat*. And I mean that both as praise and as the central problem.

## What Works (the warmth)

The palette itself is genuinely lovely. That terracotta siding (0xb0493a) — a true brick red, neither hot nor orange — sits against the muted sage-olive ground (0x86996a) with real tonal kinship. The warm cream band at each roofline (0xe7dcc4), the taupe brick (0xc7b29a), the soft grey walkway (0xbdb8ad): these are colours that *know* each other. There's no jarring, no acidic greens or harsh contrasts. A delivery driver looking at this sees a cohesive place, not a rainbow. The golden-yellow arrows (0xffd54a) are restrained enough not to scream — they *whisper* the reading order.

The UI is impeccable: dark translucent panels with that same golden amber for keywords. High contrast, readable at a glance. The green button (0x57c97e) is clean and approachable, not aggressive.

## The Problem: It's All Painted on Paper

But here's the thing. This is a teaching tool, and it's asking learners to *navigate* a 3D building in space. The 3D part doesn't feel 3D. It feels like a carefully flattened diorama.

The lighting is the culprit. Three lights are technically doing their job:
- HemisphereLight (white sky, grey-brown bottom, cranked to 0.9) spreads even illumination everywhere.
- DirectionalLight sun (warm 0xfff4e0, positioned high-right-back) throws light without creating *shadow depth*.
- AmbientLight at 0.25 fills the rest.

The result: **everything is equally lit**. The red brick catches the same light as the ground. The door recesses don't read as *recesses* — they're the same mid-tone as the facade behind them. When I look at Part 1, the green door plate is nearly as dark as the black windows; there's no shadow cavity to tell me the door *sits back* in the building.

The sky itself (0xbfd9ec — a washed-out periwinkle) has no atmosphere. It's not light blue like a real sky; it's the colour of a stage backdrop that's been lit to death. No depth. No sense of air or distance. The flat grey road strip further reinforces the cut-out-and-pasted feeling.

The roughness is set to 0.92 on all materials — *very* matte, almost chalky. This kills specularity, which kills the sense that light is *bouncing* off something real. Add in the `controls.maxPolarAngle = Math.PI * 0.49`, which prevents you from looking up much, and the camera angles feel locked and stage-managed.

## What I'd Change

1. **Sky gradient.** Replace that flat pale blue with a real sky: deeper blue overhead, warming toward a cream-beige at the horizon. Use a gradient texture or a simple vertex shader. Instantly adds 100 miles of depth.

2. **Directional shadow.** The sun is positioned but casting no shadows. Add `sun.castShadow = true`, give meshes `castShadow` and `receiveShadow`, and set `renderer.shadowMap.enabled = true`. Suddenly the door recesses read as *recessed*. The ground beneath the building stops looking painted.

3. **Tone the HemisphereLight down to 0.6.** Right now it's filling 90% of the light budget, erasing all subtlety. Shadows need to *matter*.

4. **Warm the top light slightly** (shift the white sky light toward a pale cream: 0xfff5e6 or 0xfffae8). Cool the ground-reflected light. This gives the scene *directionality* — you'll feel the sun position.

5. **Ground colour.** That olive is good, but vary it. Add some subtle detail: a second plane for asphalt texture, a slight darkening where shadows fall. Right now it's a paint chip.

6. **The road strip.** Make it slightly cooler (shift from 0x8c8c8c toward 0x7a8a9a) to sit optically back from the walkway. Cooler colours recede; warmer advance.

7. **Roughness variation.** The brick could be 0.88 (slightly more micro-shine to suggest weathered gloss), doors and windows 0.95 (dead matte). This micro-variation makes the geometry *read* faster.

## User Experience: the Good Parts

The flow is clear. Each stage explains itself in that amber-highlighted banner. The colour coding (green plates fill in, red plates mark blanks) works. The quiz panel is appropriately *secondary* — it doesn't overwhelm the 3D scene. Mobile version holds up well, too (the phone screen still shows good hierarchy and readability).

Part 5's "Walk around" buttons are a smart move. Makes a complex scene (20 doors around a cube) feel navigable. The arrow system in Parts 1 and 2 is intuitive pedagogically.

## The Bone-Deep Issue

This course prioritises **clarity over presence**. Flatter = simpler to parse. Evenly lit = no ambiguity about what you're seeing. That's a defensible choice for a pedagogical tool. But you've built something in 3D; the cost of staying flat is that it *feels* flat. A real building casts shadows. Its brick catches sun. The sky has depth.

If you added shadows and a gradient sky, you'd still have perfect pedagogical clarity — the unit numbers would read just as well — but the *space* would breathe. Learners would feel like they're standing in front of a building, not studying a model under a fluorescent studio light.

Right now it works. But it could *move* people.
