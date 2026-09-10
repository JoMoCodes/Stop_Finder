# Course run tracking

The course pages report what a learner does to [Umami](https://umami.is), a
cookieless analytics service. Nothing personal is collected: no accounts, no
cookies, no names or emails. Each run of the course gets a random 8-character
id so answers can be grouped per run, and that id is forgotten on reload.

All of the code lives in one shared module, `track.js`, imported by every
`apartment-*.html` and by `index.html` (pageviews only there).

## Setup (one time)

1. In Umami: **Settings → Websites → Add website**. Domain is your GitHub
   Pages host (for example `jomocodes.github.io`).
2. Open the new website's **Edit** page and copy the **Website ID**.
3. Paste it into `track.js`:

   ```js
   export const UMAMI = {
     src: 'https://cloud.umami.is/script.js',
     websiteId: 'paste-it-here',
   };
   ```
4. Commit and push. Umami starts receiving pageviews and the events below.

If you self-host Umami, change `src` to your instance's `script.js`.

## Checking it works

- Open any course page with `?debug` on the URL and watch the browser console:
  every event is logged as `[track] <name> {…}`.
- `sfTrack.events()` in the console prints the last 200 events (kept in
  localStorage, independent of Umami). `sfTrack.clear()` empties it.
- Nothing is sent from `localhost` unless the URL also has `?track=1`, so
  local previews don't show up in the dashboard.
- Opt out of sending in a browser with `localStorage.setItem('sf.optout','1')`.
- In Umami, events appear under **Events**; click one to filter and to see its
  properties. Ad blockers stop some visitors' data from arriving, which is
  normal.

## What is tracked

Every event carries: `look` (which page: `apartment-mockup`,
`apartment-realistic-a` …), `device` (phone / tablet / desktop by width),
`input` (touch / pointer), `motion` (reduced / full), `run` (random id) and
`t` (seconds since the run started). Stage events also carry `stage` (index
in `STAGES`), `part` (1–5), `kind` (example / quiz), `type` (plex / tower /
row / block / seq) and `stage_name`.

| Event | When | Extra properties |
|---|---|---|
| `course_start` | course page loaded | `viewport` |
| `stage_view` | a stage is shown | `from`, `from_seconds` (previous stage and time spent there) |
| `quiz_open` | learner clicks a blank door or the roof sign | `quiz` (door / building), `expected` |
| `answer` | every option pick, right or wrong | `quiz`, `result` (right / wrong), `picked`, `expected`, `attempt`, `seconds` since the quiz opened, and on a wrong pick `place` (building / floor / door: which digit was wrong) |
| `blank_solved` | a blank is answered correctly | `quiz`, `value`, `attempts`, `seconds` |
| `stage_complete` | a stage's blanks are all solved (examples complete on Next) | `seconds` on the stage, `wrong` picks on it |
| `course_complete` | the last stage finished the course | `seconds`, `wrong`, `restarts` |
| `course_restart` | Play again / Start over | `seconds`, `wrong`, `stages_done`; a new run id follows |
| `jump` | a jump-bar click to a different part | `from_part`, `to_part`, `from` |
| `help_open` | the ? button | stage props |
| `view_reset` | the Reset view chip | stage props |
| `view_switch` | Part 5 Front / Back / Left / Right | `view` |
| `hint_shown` | the first-run drag hint or the "click a glowing door" tip | `hint` (controls / tip) |
| `leave` | the tab is hidden (best effort; once per stage per run) | `seconds`, `stages_done` |

## Questions this answers

- **Where do learners drop off?** Last `stage_view` (or `leave`) per run,
  against `course_complete` count.
- **Which part is hardest?** `answer` with `result = wrong` grouped by `part`,
  and `place` to see whether it's the building, floor or door digit.
- **How long does a run take?** `course_complete.seconds`; per stage,
  `stage_complete.seconds`.
- **Does the look matter?** Any of the above split by `look`.
- **Phone vs desktop?** Split by `device` / `input`.

## How it hooks into the course

The course dispatches these events on `document`, and `track.js` listens:
`stagechange`, `quizopen`, `answer`, `blanksolved`, `stagecomplete`,
`coursecomplete`, `coursereset`. The UI signals come from click listeners on
the existing buttons and a `MutationObserver` on `#draghint`, so the course
code itself only had to gain the `answer`, `stagecomplete`, `coursecomplete`
and `coursereset` dispatches (identical in all four course files).

Umami limits: event names ≤ 50 characters, string values ≤ 500, flat data
only. The cloud free tier caps monthly events; a full run is roughly 100–150
events.
