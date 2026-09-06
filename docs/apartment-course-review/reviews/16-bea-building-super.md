# Beatrice "Bea" Holloway — Building Superintendent

Thirty years managing apartment complexes from south Boston to the suburbs, I've stood on a hundred stoops watching delivery drivers spin in circles looking for Unit 7B. Someone finally built a teaching tool for this, and frankly, it's solid. Let me tell you what you got right, what you got weird, and where a driver trained here might look stupid on my property.

## What Works (The Good Stuff)

**The progression makes sense.** You start with a simple 2-story 4-plex (Part 1) where the numbers just count 101, 102, 103, 104. Yellow arrows show the reading order. That's exactly how a new driver learns — dead simple, no surprises. Then you layer in the floor-digit rule (Part 2), then building codes (Part 3), then wrap-around numbering (Parts 4 and 5). I've literally trained drivers this way, and you nailed the sequence.

**The buildings look like real buildings I've managed.** Part 1 is a duplex/fourplex — seen ten thousand of them. Part 2 is a mid-rise walkup with exterior stairs on the side, exactly like the converted Victorians we manage. Part 3 is a long row building — that's the type that confuses drivers most. You're showing real-world typology, not fantasy. The door plates are appropriately simple: small blue-black windows (representing apartment windows), green doors (they're always green for some reason), white number plates. That's accurate enough.

**The "Walk around" panel in Part 5 is *chef's kiss*.** You absolutely nailed that. In real life, I tell drivers "walk around the building, numbers go both directions." Here you give them Front / Back / Left / Right buttons that jump the camera. That's not just pedagogically smart — it's practically honest. A driver HAS to understand that Buildings don't just have a front. I'm not exaggerating when I say this feature alone solves a category of confusion I see constantly.

**The quiz feedback is non-intrusive.** Panel on the right, doesn't cover the building, green/red feedback on wrong answers with a shake animation. The shake tells you "nope" without words. Good UX.

**The instructional text is clear and uses bold for keywords** ("floor numbers," "building number," "click Continue"). The amber highlights pop off the dark translucent prompt banner. I can read this while standing in a doorway yelling at someone.

## What's Weird (The "Huh?" Moments)

**The staircase is a afterthought.** Look at Part 2 and Part 4 — those beige, flat steps on the side of the building. In a real walkup, those stairs are CHUNKY. They take up actual footprint. They're where parcels get abandoned, where delivery people huddle out of rain, where they trip and curse. Here the stairs look like they were painted on. For a NEW driver, the stairs are a landmark I'd say: "Your building is the one with the red brick and the big wooden stairs on the right side of the entrance." This model doesn't give drivers that visual anchor. The stairs should visually demand respect. Minor point, but real.

**Part 3's "Building #" banner floats.** In reality, the building NAME/NUMBER is painted on the facade, or it's on a freestanding sign. Here it's a gray box hovering above the roof like a UFO. That's a teaching-tool compromise I get it, but it's a bit disconnected from how buildings actually announce themselves. Real buildings yell their name at you.

**The geometry is too tidy.** Every door aligns perfectly. Every unit number is centered and pristine on the plate. The building colors are even and unblemished. This is actually PERFECT for teaching patterns — no visual noise, no distractions. But it means a driver trained here might look at a *real* building with chipped paint, a missing digit on Unit 206, faded numbers on the back, dented door frames, and think "wait, is this the right building?" The model trains them on abstract pattern recognition, not real-world resilience. Maybe that's fine, but I'd warn a new driver: "Real buildings look like someone lives in them. Messier. Keep looking for the pattern."

**Text size on Part 5's side/back views is cramped.** Looking at the back and left views, some unit numbers get jammed together or sit real close to the building geometry. On a phone screen (390x844), I'd worry some numbers are hard to read. The front view numbers are larger and more legible. Worth testing this on actual mobile devices during a quiz — if a driver can't read "617," they can't answer the question, and they'll get frustrated.

**Mobile layout needs verification.** In the mobile screenshot, I see the building, the prompt banner, and a Back button, but no quiz panel. It's probably below (scrollable), but I'd test that a learner can actually see all the options when they click a blank door on a phone. Nothing kills a training tool faster than "I can't see the answers."

## What'll Trip Up a New Driver (The Reality Check)

**This model assumes numbered doors are visible and legible.** Real life: some building codes don't use physical numbers on every door (just on the mailbox cluster). Some buildings use a mix — 201 on the door, but no 202 because that unit was combined with 201 ten years ago. Numbers fade. Plates fall off. This course trains drivers on the *logic* (which is excellent), but not on the *exception-hunting* they'll actually do: "Is this number missing, or am I just not seeing it?"

**Part 4 (front and back) is the most realistic but also the hardest.** You correctly tell the driver to "drag to spin around." But here's the thing: a driver on my property with a package will drag a *physical building* by walking. The orbit camera is a good metaphor, but it's abstracted. Real drivers will stand in the middle of a courtyard, spin 360, and look for their number. That's actually close to what you're simulating, so good — but a driver might not realize they can just *walk* around a real building, whereas on a web page, they need a button. That's not a flaw in your design; it's just worth knowing.

**Numbers don't tell you HOW to enter.** Part 5 shows units 601–620 running around the building. But which door opens into the lobby? Are there multiple stairwells? Where's the mailbox cluster? A driver trained here will know "unit 617 is on the side," but not "unit 617 enters through the back door on the south side, the front door is for 601–615." That's beyond the scope of this course (thankfully), but it's worth knowing: your course teaches *location within the plane of the building*, not *interior logistics*. Correct boundary.

## Overall (The Verdict)

This is a genuinely useful teaching tool. It's clean, progressive, interactive, and honest about real building types. The yellow arrows, the Walk Around buttons, the clear numbering scheme — all of it works. The 3D scenes are simple enough that they don't distract from the pattern, but detailed enough that they look like actual buildings. That's a hard line to walk, and you nailed it.

**The biggest miss:** Stairs and other visual landmarks feel underemphasized. Real drivers use them to triangulate ("the brown staircase on the left, go up to the red door"). Your course teaches pattern logic, which is correct, but a driver might be surprised by how much the visual landscape *matters* on an actual property. That said — that's not this course's job. This is about numbers. You did that job well.

Would I hand this to a new driver at orientation? Absolutely. Would I follow it up with a real walk-around of our actual buildings and point out the mess, the exceptions, the real stairs? Also absolutely. The two together would make someone dangerous in the best way.

Not bad for a static site with no framework. Not bad at all.
