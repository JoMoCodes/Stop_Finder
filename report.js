/* ============================================================
   Stop Finder — end-of-run report (shared by every course page)

   What it does
   - Listens to the events the course dispatches on `document`
     (stagechange, quizopen, quizclose, answer, blanksolved,
     stagecomplete, coursecomplete, coursereset, partreset) and keeps a
     record of the learner's run: every question, every building, every
     part, on an *active* clock that pauses while the tab is hidden or
     the learner has been idle for a while.
   - When the course completes it turns that record into the report and
     renders it into `#report` inside the `#finale` dialog. The course
     still owns showing / hiding the dialog and the `#fagain` / `#fclose`
     buttons; this module adds the "Try Part N again" / "Back to the
     menu" action, moves the buttons into place, and handles the
     dialog's focus, Tab loop and `inert` siblings while it is open.
   - Nothing is stored or sent: the report lives in memory for this run
     and is rebuilt from scratch after "Start over".

   The design (what is shown, the grade model, the copy) is written up
   in docs/report.md; the two design reviews it was synthesised from are
   in docs/run-report/.

   Debugging
   - `sfReport.summary()` in the console returns the current numbers.
   - `sfReport.demo('nearly' | 'perfect' | 'ready' | 'again')` renders the
     report with made-up data so the layout can be checked without
     playing the course.
   ============================================================ */

/* ---- the curriculum, as the report describes it ---- */
const PART_TITLES = {
  1: 'Count in order',
  2: 'First digit = floor',
  3: 'Leading digits = building',
  4: 'Front and back',
  5: 'No floor digit',
};
const HOME_URL = 'https://jomocodes.github.io/Stop_Finder/';
const PLACE_ORDER = ['building', 'floor', 'door'];   // ties in "most missed" go to the costlier place

/* ---- active clock: performance.now() minus the time the learner was away ----
   "Away" is the tab being hidden, or no pointer / key / touch / wheel input
   for IDLE_MS. A phone left on the table must not become a nine-minute Part 3. */
const IDLE_MS = 90000;
let pausedAt = null, lost = 0, idleTimer = null, idle = false;
const now = () => (pausedAt === null ? performance.now() : pausedAt) - lost;
const wall = () => performance.now();
function pause() { if (pausedAt === null) pausedAt = performance.now(); }
function resume() { if (pausedAt !== null) { lost += performance.now() - pausedAt; pausedAt = null; } }
function syncClock() {
  if (document.visibilityState === 'hidden' || idle) pause(); else resume();
}
function armIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { idle = true; syncClock(); }, IDLE_MS);
}
function onInput() {
  if (idle) { idle = false; syncClock(); }
  armIdle();
}
document.addEventListener('visibilitychange', syncClock);
for (const ev of ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'])
  document.addEventListener(ev, onInput, { passive: true, capture: true });
armIdle();

/* ---- context, the same way track.js sees it ---- */
const mq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
const LOOK = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
const deviceClass = () => (innerWidth <= 640 ? 'phone' : innerWidth <= 1024 ? 'tablet' : 'desktop');

/* ---- helpers ---- */
const r1 = x => Math.round(x * 10) / 10;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function stageName(st) {
  if (!st) return '';
  if (st.type === 'plex') return `Building ${st.number}`;
  if (st.type === 'tower') return `Building ${st.label}`;
  return `Building ${st.building}`;
}

/* the partial number the door showed before it was solved (mirrors a11yMask) */
function maskFor(st, value) {
  if (!st) return '?';
  if (st.type === 'row' && st.floors) {
    for (const row of st.floors)
      for (const cell of row)
        if (Array.isArray(cell) && cell[0] === value) return cell[1];
  } else if (st.type === 'block' && st.blanks) {
    return st.blanks[value] || '?';
  } else if (st.type === 'seq' && st.blanks) {
    return st.blanks[value - st.base] || '?';
  }
  return '?';
}

/* digit places of a unit number, exactly as the course's splitPlaces() cuts them */
function splitPlaces(val, type) {
  const str = String(val), n = str.length;
  if (type === 'building') return [{ text: str, place: 'building' }];
  if (type === 'tower' && n === 3) return [{ text: str[0], place: 'floor' }, { text: str.slice(1), place: 'door' }];
  if ((type === 'row' || type === 'block') && n >= 4)
    return [{ text: str.slice(0, n - 3), place: 'building' }, { text: str[n - 3], place: 'floor' }, { text: str.slice(n - 2), place: 'door' }];
  if (type === 'seq' && n >= 3) return [{ text: str.slice(0, n - 2), place: 'building' }, { text: str.slice(n - 2), place: 'door' }];
  return [{ text: str, place: 'door' }];
}

/* which digit place a wrong pick got wrong, from the coloured segments the
   quiz draws for the pick and for the right answer */
function wrongPlace(chosen, expected) {
  if (!Array.isArray(chosen) || !Array.isArray(expected)) return 'door';
  for (const seg of expected) {
    const c = chosen.find(x => x.place === seg.place);
    if (!c || c.text !== seg.text) return seg.place;
  }
  return 'door';
}

/* ============================================================
   the run record
   ============================================================ */
let restarts = 0;
let run = null;
const history = [];        // completed runs this session: { firstTry, questions, seconds }
const STAGE_BY_INDEX = new Map();   // filled from stagechange events (index -> STAGES entry)

function newRun() {
  return {
    t0: now(), w0: wall(), startedAt: Date.now(),
    finishedAt: null, finished: false, historyEntry: null,
    curIndex: -1, curStage: null, curAt: 0,
    stages: new Map(),        // index -> stage record
    questions: [],            // in the order they were first opened
    byBlank: new WeakMap(),   // bstate -> question record
    open: null,               // the question whose panel is open
    solvedOrder: [],          // question records in the order they were solved
    completedOrder: [],       // stage indexes in the order they were completed
    firstGo: {},              // part -> { firstTry, questions, seconds } before "Try Part N again"
    retries: 0,
  };
}

function stageRec(index, st) {
  let s = run.stages.get(index);
  if (!s) {
    s = {
      index, part: st ? st.part : 0, kind: st ? st.kind : 'quiz', type: st ? st.type : '',
      name: stageName(st), seconds: 0, after: 0, visits: 0, completed: false, completedAt: null, questions: [],
    };
    run.stages.set(index, s);
  }
  return s;
}

/* book the time on the current stage since it was shown (or since the last flush) */
function flushStage() {
  const s = run.curStage;
  if (!s) return;
  const dt = now() - run.curAt;
  run.curAt = now();
  if (!s.completed) s.seconds += dt;
  else s.after += dt;
  for (const q of s.questions) if (q.opened !== null && q.solved === null) q.seconds += dt;
  if (run.open && run.open.solved === null) run.open.openSeconds += dt;
}

function onStageChange(e) {
  const { index, stage } = e.detail || {};
  if (stage && !STAGE_BY_INDEX.has(index)) STAGE_BY_INDEX.set(index, stage);
  flushStage();
  const s = stageRec(index, stage);
  s.visits++;
  run.curIndex = index; run.curStage = s; run.curAt = now();
  run.open = null;
}

function question(bstate, type) {
  let q = run.byBlank.get(bstate);
  if (q) return q;
  const s = run.curStage || stageRec(run.curIndex, null);
  const st = STAGE_BY_INDEX.get(run.curIndex);
  const kind = type === 'building' ? 'building' : 'door';
  q = {
    id: run.questions.length + 1,
    part: s.part, stageIndex: s.index, building: s.name, kind,
    type: kind === 'building' ? 'building' : (st ? st.type : 'plex'),
    mask: kind === 'building' ? '' : maskFor(st, bstate.value),
    value: bstate.value,
    opened: null, solved: null, seconds: 0, openSeconds: 0, firstPick: null,
    opens: 0, wrong: 0, places: [], picks: [],
  };
  run.byBlank.set(bstate, q);
  run.questions.push(q);
  s.questions.push(q);
  return q;
}

function onQuizOpen(e) {
  const d = e.detail || {};
  if (!d.bstate) return;
  flushStage();
  const q = question(d.bstate, d.type);
  q.opens++;
  if (q.opened === null) q.opened = now();
  run.open = q;
}

function onQuizClose() { flushStage(); run.open = null; }

function onAnswer(e) {
  const d = e.detail || {};
  if (!d.bstate) return;
  flushStage();
  const q = question(d.bstate, d.type);
  if (q.opened === null) q.opened = now();
  const at = q.seconds;
  if (q.firstPick === null) q.firstPick = at;
  const pick = { picked: d.picked, correct: !!d.correct, at: r1(at / 1000) };
  if (!d.correct) {
    pick.place = d.type === 'building' ? 'building' : wrongPlace(d.chosen, d.expected);
    q.wrong++;
    q.places.push(pick.place);
  }
  q.picks.push(pick);
}

function onBlankSolved(e) {
  const d = e.detail || {};
  if (!d.bstate) return;
  flushStage();
  const q = run.byBlank.get(d.bstate);
  if (!q || q.solved !== null) return;
  q.solved = now();
  run.solvedOrder.push(q);
}

function onStageComplete(e) {
  const { index, stage } = e.detail || {};
  flushStage();
  const s = stageRec(index, stage);
  if (s.completed) return;
  s.completed = true;
  s.completedAt = now();
  run.completedOrder.push(index);
}

function onCourseComplete() {
  flushStage();
  run.finished = true;
  run.finishedAt = Date.now();
  run.wallSeconds = (wall() - run.w0) / 1000;
  run.activeSeconds = (now() - run.t0) / 1000;
  const sum = summary();
  const entry = { firstTry: sum.totals.firstTry, questions: sum.totals.questions, seconds: sum.activeSeconds };
  if (run.historyEntry) Object.assign(run.historyEntry, entry);   // a retried part updates this run's entry
  else { history.push(entry); run.historyEntry = entry; }
  render(sum);
}

function onCourseReset() {
  restarts++;
  run = newRun();
  clearReport();
}

/* "Try Part N again": the course has rebuilt that part's buildings, so its
   questions start afresh; the first go is kept for one line in the report */
function onPartReset(e) {
  const p = e.detail && e.detail.part;
  if (!p) return;
  flushStage();
  const qs = run.questions.filter(q => q.part === p);
  const ss = [...run.stages.values()].filter(s => s.part === p);
  run.firstGo[p] = {
    firstTry: qs.filter(q => q.solved !== null && q.wrong === 0).length,
    questions: qs.length,
    seconds: r1(ss.reduce((n, s) => n + s.seconds, 0) / 1000),
  };
  run.questions = run.questions.filter(q => q.part !== p);
  run.solvedOrder = run.solvedOrder.filter(q => q.part !== p);
  for (const s of ss) run.stages.delete(s.index);
  run.completedOrder = run.completedOrder.filter(i => !ss.some(s => s.index === i));
  run.finished = false; run.finishedAt = null;
  run.curStage = null; run.open = null;
  run.retries++;
  clearReport();
}

/* ============================================================
   the summary the report is drawn from
   ============================================================ */
function summary() {
  if (!run) return null;
  flushStage();
  const questions = run.questions.map(q => ({
    id: q.id, part: q.part, stageIndex: q.stageIndex, building: q.building, kind: q.kind, type: q.type,
    mask: q.mask, value: q.value,
    seconds: r1(q.seconds / 1000),               // first open -> solved, while on its building
    openSeconds: r1(q.openSeconds / 1000),       // only while its options panel was open
    firstPick: q.firstPick === null ? null : r1(q.firstPick / 1000),
    wrong: q.wrong, places: q.places.slice(), picks: q.picks.slice(), opens: q.opens,
    solved: q.solved !== null,
  }));

  const stages = [...run.stages.values()].sort((a, b) => a.index - b.index).map(s => {
    const qs = questions.filter(q => q.stageIndex === s.index);
    return {
      index: s.index, part: s.part, kind: s.kind, type: s.type, name: s.name,
      seconds: r1(s.seconds / 1000), after: r1(s.after / 1000), visits: s.visits, completed: s.completed,
      questions: qs.length,
      firstTry: qs.filter(q => q.solved && q.wrong === 0).length,
      wrong: qs.reduce((n, q) => n + q.wrong, 0),
      solved: qs.filter(q => q.solved).length,
    };
  });

  const parts = [1, 2, 3, 4, 5].map(p => {
    const ss = stages.filter(s => s.part === p);
    const qs = questions.filter(q => q.part === p);
    const seconds = r1(ss.reduce((n, s) => n + s.seconds, 0));
    const exampleSeconds = r1(ss.filter(s => s.kind === 'example').reduce((n, s) => n + s.seconds, 0));
    const quizSeconds = r1(seconds - exampleSeconds);
    const wrong = qs.reduce((n, q) => n + q.wrong, 0);
    const firstTry = qs.filter(q => q.solved && q.wrong === 0).length;
    const slowest = qs.reduce((m, q) => (q.solved && (!m || q.seconds > m.seconds) ? q : m), null);
    const placeCount = {};
    for (const q of qs) for (const pl of q.places) placeCount[pl] = (placeCount[pl] || 0) + 1;
    return {
      part: p, title: PART_TITLES[p], seconds, exampleSeconds, quizSeconds,
      buildings: ss.length, questions: qs.length, solved: qs.filter(q => q.solved).length,
      firstTry, wrong, picks: qs.reduce((n, q) => n + q.picks.length, 0),
      firstTryRate: qs.length ? firstTry / qs.length : 1,
      pace: qs.length ? r1(quizSeconds / qs.length) : 0,
      medianSeconds: median(qs.filter(q => q.solved).map(q => q.seconds)),
      slowest: slowest ? { id: slowest.id, mask: slowest.mask, value: slowest.value, seconds: slowest.seconds } : null,
      worstPlace: mostMissed(placeCount), placeCount,
      completed: ss.length > 0 && ss.every(s => s.completed),
      firstGo: run.firstGo[p] || null,
    };
  });

  // longest run of first-try answers, in the order they were solved
  let streak = 0, best = 0;
  for (const q of run.solvedOrder) { streak = q.wrong === 0 ? streak + 1 : 0; if (streak > best) best = streak; }

  const total = questions.length;
  const firstTry = questions.filter(q => q.solved && q.wrong === 0).length;
  const wrong = questions.reduce((n, q) => n + q.wrong, 0);
  const picks = questions.reduce((n, q) => n + q.picks.length, 0);
  const placeCount = {};
  for (const q of questions) for (const pl of q.places) placeCount[pl] = (placeCount[pl] || 0) + 1;
  const inOrder = run.completedOrder.every((idx, i) => i === 0 || idx > run.completedOrder[i - 1]);
  const activeSeconds = r1(run.finished ? run.activeSeconds : (now() - run.t0) / 1000);
  const wallSeconds = r1(run.finished ? run.wallSeconds : (wall() - run.w0) / 1000);

  return {
    look: LOOK, device: deviceClass(), input: mq('(pointer: coarse)') ? 'touch' : 'pointer',
    motion: mq('(prefers-reduced-motion: reduce)') ? 'reduced' : 'full',
    startedAt: run.startedAt, finishedAt: run.finishedAt, finished: run.finished,
    wallSeconds, activeSeconds,
    awaySeconds: r1(Math.max(0, wallSeconds - activeSeconds)),
    previous: history[history.length - (run.historyEntry ? 2 : 1)] || null,
    questions, stages, parts,
    totals: {
      questions: total, solved: questions.filter(q => q.solved).length,
      firstTry, wrong, picks,
      firstTryRate: total ? firstTry / total : 1,
      accuracy: picks ? (picks - wrong) / picks : 1,
      streak: best,
      medianSeconds: median(questions.filter(q => q.solved).map(q => q.seconds)),
      taskSeconds: r1(parts.reduce((n, p) => n + p.seconds, 0)),
      exampleSeconds: r1(parts.reduce((n, p) => n + p.exampleSeconds, 0)),
      quizSeconds: r1(parts.reduce((n, p) => n + p.quizSeconds, 0)),
      placeCount, worstPlace: mostMissed(placeCount),
      restarts, retries: run.retries, inOrder,
    },
  };
}

function median(arr) {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y);
  const m = a.length >> 1;
  return r1(a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2);
}
function mostMissed(placeCount) {
  const keys = Object.keys(placeCount).filter(k => placeCount[k] > 0);
  if (!keys.length) return null;
  keys.sort((a, b) => (placeCount[b] - placeCount[a]) || (PLACE_ORDER.indexOf(a) - PLACE_ORDER.indexOf(b)));
  return keys[0];
}

/* ============================================================
   the grade: first-try count, a tier per part, an outcome, a target part
   ============================================================ */
function tierOf(firstTry, n) {
  if (!n) return 'solid';
  const r = firstTry / n;
  return r >= 0.8 ? 'solid' : r >= 0.5 ? 'nearly' : 'again';
}
const TIER_RANK = { again: 0, nearly: 1, solid: 2 };
const TIER_WORD = { solid: 'solid', nearly: 'nearly', again: 'try again' };

function grade(sum) {
  const parts = sum.parts.filter(p => p.questions > 0);
  const tiers = {};
  for (const p of parts) tiers[p.part] = tierOf(p.firstTry, p.questions);
  const perfect = sum.totals.questions > 0 && sum.totals.firstTry === sum.totals.questions;
  let outcome;
  if (perfect) outcome = 'perfect';
  else if (parts.every(p => tiers[p.part] === 'solid')) outcome = 'ready';
  else if (parts.some(p => tiers[p.part] === 'again')) outcome = 'again';
  else outcome = 'nearly';
  // the part to try again: worst tier, then lowest first-try rate, then most
  // wrong picks, then the earlier part (later parts build on it)
  let target = null;
  if (!perfect) {
    const sorted = parts.slice().sort((a, b) =>
      (TIER_RANK[tiers[a.part]] - TIER_RANK[tiers[b.part]]) ||
      (a.firstTryRate - b.firstTryRate) || (b.wrong - a.wrong) || (a.part - b.part));
    target = sorted[0] || null;
  }
  return { outcome, tiers, target };
}

/* ============================================================
   copy
   ============================================================ */
function headline(g) {
  const n = g.target ? g.target.part : 0;
  return {
    perfect: 'Every door, first try.',
    ready: 'You’re ready for the route.',
    nearly: `Nearly there — one more go at Part ${n}.`,
    again: `Worth another go at Part ${n}.`,
  }[g.outcome];
}

/* the one thing you are good at: first rule that fits */
function goodLine(sum, g) {
  const t = sum.totals;
  if (t.firstTry === t.questions) return 'Every single one on the first try.';
  const clean = sum.parts.filter(p => p.questions > 0 && p.firstTry === p.questions);
  if (clean.length) { const p = clean[clean.length - 1]; return `Every door in Part ${p.part} on the first try.`; }
  const best = sum.parts.filter(p => p.questions > 0)
    .sort((a, b) => (b.firstTryRate - a.firstTryRate) || (b.part - a.part))[0];
  return best ? `Strongest: Part ${best.part} — ${best.firstTry} of ${best.questions} on the first try.` : '';
}

/* the one thing to try: names the target part and the digit place that cost most */
function tryLine(sum, g) {
  const t = sum.totals;
  if (g.outcome === 'perfect') return 'Nothing to fix. Go find some doors.';
  const p = g.target;
  const misses = t.wrong === 1 ? '1 miss' : `${t.wrong} misses`;
  if (g.outcome === 'ready') {
    const pl = t.worstPlace;
    if (pl && p && p.part >= 2 && p.part <= 4) return `Only ${misses}, mostly the ${placeHTML(pl)} digit. Worth a glance next time.`;
    return `Only ${misses} in all. Worth a glance at Part ${p ? p.part : ''} next time.`;
  }
  if (p.part === 1) return 'In Part 1, count on from the door next to it — that’s where the misses were.';
  if (p.part === 5) return 'In Part 5, one count runs round all four sides — that’s where the misses were.';
  const pl = p.worstPlace || 'door';
  return `In Part ${p.part}, watch the ${placeHTML(pl)} digit — most misses were there.`;
}

/* ---- time formatting: m:ss, or "9 s" under a minute; a spoken version for screen readers ---- */
function fmt(sec, { short = false } = {}) {
  const s = Math.round(sec);
  if (short && s < 60) return `${s} s`;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? `${h}:` : '') + `${mm}:${String(r).padStart(2, '0')}`;
}
function spoken(sec) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const bits = [];
  if (h) bits.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m) bits.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (r || !bits.length) bits.push(`${r} second${r === 1 ? '' : 's'}`);
  return bits.join(' ');
}
function timeHTML(sec, opts) {
  return `<span aria-hidden="true">${fmt(sec, opts)}</span><span class="sr-only">${spoken(sec)}</span>`;
}
function placeHTML(place) { return `<span class="pl-${place}">${place}</span>`; }

/* a unit number with its digit places coloured as the quiz colours them;
   `missed` places get a dotted underline as well as the word in the row */
function unitHTML(value, type, missed = []) {
  return `<span class="fnum">` + splitPlaces(value, type).map(sg =>
    `<span class="pl pl-${sg.place}${missed.includes(sg.place) ? ' pl-miss' : ''}">${esc(sg.text)}</span>`).join('') + '</span>';
}
function maskHTML(mask) {
  const shown = mask.replace(/_/g, '▢');
  const said = mask === '?' ? 'blank door' : mask.replace(/_+/g, ' blank ').replace(/\s+/g, ' ').trim();
  return `<span aria-hidden="true">${esc(shown)}</span><span class="sr-only">${esc(said)}</span>`;
}

/* ============================================================
   rendering (into #report inside the #finale dialog)
   ============================================================ */
const dialog = document.getElementById('finale');
const reportEl = document.getElementById('report');
const actionsEl = dialog && dialog.querySelector('.factions');
const againBtn = document.getElementById('fagain');
const closeBtn = document.getElementById('fclose');
let rendered = false;

function clearReport() {
  if (!reportEl) return;
  detachButtons();
  reportEl.innerHTML = '';
  rendered = false;
  syncReportButton();
}
/* the course wired #fagain / #fclose at load, so they are moved, never rebuilt */
function detachButtons() {
  if (actionsEl && actionsEl.parentNode) actionsEl.parentNode.removeChild(actionsEl);
  if (closeBtn && closeBtn.parentNode) closeBtn.parentNode.removeChild(closeBtn);
  const extra = actionsEl && actionsEl.querySelector('#fpart, #fhome');
  if (extra) extra.remove();
}

function render(sum) {
  if (!reportEl || !sum) return;
  detachButtons();
  const g = grade(sum);
  const t = sum.totals;
  const n = t.questions;
  const parts = sum.parts;

  const eyebrow = `<span class="fsite">Apartment numbers · </span>all 14 buildings` +
    (t.restarts ? ` · run ${t.restarts + 1}` : '') +
    (t.retries ? ` · ${t.retries === 1 ? 'one part' : t.retries + ' parts'} retried` : '');

  let delta = '';
  if (sum.previous && sum.previous.questions) {
    const d = t.firstTry - sum.previous.firstTry;
    const word = d > 0 ? `<span class="up">▲ ${d}</span> vs your last run`
      : d < 0 ? `<span class="down">▼ ${-d}</span> vs your last run`
      : 'Same as your last run';
    delta = `<p class="fdelta">${word} (${sum.previous.firstTry} of ${sum.previous.questions}) · ` +
      `${timeHTML(sum.activeSeconds)} vs ${timeHTML(sum.previous.seconds)}</p>`;
  }

  const stats = `
    <div class="fstats">
      <div><small>Time</small><b>${timeHTML(sum.activeSeconds)}</b></div>
      <div><small>Misses</small><b>${t.wrong}</b></div>
      <div><small>Best streak</small><b>${t.streak === n && n ? `all ${n}` : `${t.streak} in a row`}</b></div>
    </div>`;

  const good = goodLine(sum, g), tryIt = tryLine(sum, g);
  const lines = `<div class="flines">` +
    (good ? `<p><span class="g" aria-hidden="true">✓</span><span>${good}</span></p>` : '') +
    `<p><span class="t" aria-hidden="true">→</span><span>${tryIt}</span></p></div>`;

  const rows = parts.map(p => partRow(p, g, sum)).join('');

  const foot = [];
  foot.push(`Reading the examples ${timeHTML(t.exampleSeconds)} · answering ${timeHTML(t.quizSeconds)}` +
    (sum.activeSeconds - t.taskSeconds >= 30 ? ` · looking around ${timeHTML(sum.activeSeconds - t.taskSeconds)}` : ''));
  if (sum.awaySeconds >= 60) foot.push(`You stepped away for ${timeHTML(sum.awaySeconds)} — not counted.`);

  reportEl.innerHTML = `
    <p class="feyebrow">${eyebrow}</p>
    <h2 id="ftitle" tabindex="-1">${headline(g)}</h2>
    <div id="fsum">
      <p class="fhero"><b>${t.firstTry}</b> <span>of ${n} on the first try</span></p>
      ${delta}
      <div class="fmeter" aria-hidden="true"><i style="--v:${n ? t.firstTry / n : 0}"></i></div>
      ${stats}
      ${lines}
    </div>
    <div class="fparts">
      <h3>Part by part</h3>
      ${rows}
    </div>
    <div class="ffoot">${foot.map(x => `<p>${x}</p>`).join('')}</div>`;

  // the close button goes to the corner, the action row after the advice
  if (closeBtn) {
    closeBtn.className = 'ghost fx';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close and keep looking around');
    reportEl.insertBefore(closeBtn, reportEl.firstChild);
  }
  if (actionsEl) {
    let primary;
    if (g.target) {
      primary = document.createElement('button');
      primary.id = 'fpart';
      primary.textContent = `Try Part ${g.target.part} again ▸`;
      primary.onclick = () => document.dispatchEvent(new CustomEvent('retrypart', { detail: { part: g.target.part } }));
    } else {
      primary = document.createElement('a');
      primary.id = 'fhome';
      primary.href = HOME_URL;
      primary.textContent = 'Back to the menu ▸';
    }
    if (againBtn) { againBtn.className = 'ghost'; againBtn.textContent = 'Start over'; }
    actionsEl.insertBefore(primary, actionsEl.firstChild);
    reportEl.insertBefore(actionsEl, reportEl.querySelector('.fparts'));
  }
  rendered = true;
  syncReportButton();
}

function partRow(p, g, sum) {
  const tier = g.tiers[p.part] || 'solid';
  const has = p.questions > 0;
  const count = has ? `${p.firstTry} of ${p.questions} · <span class="ftier tier-${tier}">${TIER_WORD[tier]}</span>` : 'no questions';
  const stages = sum.stages.filter(s => s.part === p.part && s.kind === 'quiz');
  const buildings = stages.map(s => {
    const qs = sum.questions.filter(q => q.stageIndex === s.index)
      .sort((a, b) => (a.kind === 'building') - (b.kind === 'building') || a.value - b.value);
    const doors = qs.filter(q => q.kind === 'door').length;
    const named = qs.some(q => q.kind === 'building');
    const head = `${esc(s.name)} · ${doors} door${doors === 1 ? '' : 's'}${named ? ' + name' : ''} · ${timeHTML(s.seconds)}`;
    return `<div class="fbld">${head}</div>` + qs.map(questionRow).join('');
  }).join('');
  const pace = has && p.pace ? ` · about ${Math.round(p.pace)} s a door` : '';
  const split = `<p class="fsplit">Reading the example ${timeHTML(p.exampleSeconds)} · answering ${timeHTML(p.quizSeconds)}${pace}</p>`;
  const firstGo = p.firstGo ? `<p class="fsplit">Second go · first go: ${p.firstGo.firstTry} of ${p.firstGo.questions} in ${timeHTML(p.firstGo.seconds)}.</p>` : '';
  return `
    <details class="fpart">
      <summary>
        <span class="fname">Part ${p.part} · ${esc(p.title)}</span>
        <span class="frow">
          <span class="fbar" aria-hidden="true"><i style="--v:${has ? p.firstTry / p.questions : 0}"></i></span>
          <span class="fcount">${count}</span>
          <span class="ftime">${timeHTML(p.seconds)}</span>
        </span>
      </summary>
      <div class="fbody">${split}${firstGo}${buildings}</div>
    </details>`;
}

function questionRow(q) {
  const missed = [...new Set(q.places)];
  const shown = q.kind === 'building' ? '<span class="fmask">Name the building</span>' : `<span class="fmask">${maskHTML(q.mask)}</span>`;
  const answer = `<span class="fans">${shown} <span class="farrow" aria-hidden="true">→</span><span class="sr-only">, answer</span> ` +
    `${unitHTML(q.value, q.kind === 'building' ? 'building' : q.type, missed)}</span>`;
  // "missed: floor, door ×2" — each place once, with a count when it was missed more than once
  const counts = {};
  for (const pl of q.places) counts[pl] = (counts[pl] || 0) + 1;
  const list = missed.map(pl => placeHTML(pl) + (counts[pl] > 1 ? ` ×${counts[pl]}` : '')).join(', ');
  const result = q.wrong === 0
    ? `<span class="fres ok"><span aria-hidden="true">✓ </span>first try</span>`
    : `<span class="fres">missed: ${list}</span>`;
  return `<div class="fq">${answer}${result}<span class="ftime">${timeHTML(q.seconds, { short: true })}</span></div>`;
}

/* ============================================================
   the dialog: focus, Tab loop, inert siblings, and a way back in
   ============================================================ */
let reportBtn = null;
function syncReportButton() {
  if (!reportBtn) return;
  const open = dialog && !dialog.classList.contains('hidden');
  reportBtn.classList.toggle('hidden', !rendered || open);
}

function wireDialog() {
  if (!dialog) return;
  dialog.tabIndex = -1;
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-describedby', 'fsum');

  // a "Report" button in the bottom bar brings the report back after "keep looking around"
  const bar = document.getElementById('bottombar');
  if (bar) {
    reportBtn = document.createElement('button');
    reportBtn.id = 'freport';
    reportBtn.className = 'ghost hidden';
    reportBtn.textContent = 'Report';
    reportBtn.onclick = () => dialog.classList.remove('hidden');
    const next = document.getElementById('next');
    bar.insertBefore(reportBtn, next);
  }

  const siblings = () => [...document.body.children].filter(el => el !== dialog && el.tagName !== 'SCRIPT');
  let wasOpen = false;
  function sync() {
    const open = !dialog.classList.contains('hidden');
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) {
      for (const el of siblings()) el.inert = true;
      requestAnimationFrame(() => {
        const title = document.getElementById('ftitle');
        (title || dialog).focus({ preventScroll: true });
        dialog.scrollTop = 0;
      });
    } else {
      for (const el of siblings()) el.inert = false;
      // back to the course: the bottom bar's button if one is showing, else the scene
      const next = document.getElementById('next'), back = document.getElementById('back');
      const target = (next && !next.classList.contains('hidden')) ? next
        : (back && !back.classList.contains('hidden')) ? back
        : document.querySelector('#app canvas');
      if (target) target.focus({ preventScroll: true });
    }
    syncReportButton();
  }
  new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['class'] });

  dialog.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (closeBtn) closeBtn.click(); return; }
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button, a[href], summary, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hidden && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog || document.activeElement === document.getElementById('ftitle'))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

/* ============================================================
   styles for the report's contents (the dialog shell itself is styled
   by the course page, next to its other panels)
   ============================================================ */
const CSS = `
#report { color: #eef2f6; }
#report .fx { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; padding: 0; border-radius: 50%;
  font-size: 22px; line-height: 1; display: flex; align-items: center; justify-content: center; z-index: 1; }
#report .feyebrow { margin: 2px 48px 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9fb0c0; }
#report h2 { margin: 0 44px 10px 0; color: #ffd9a0; font-size: 22px; line-height: 1.25; }
#report h2:focus, #report h2:focus-visible { outline: none; box-shadow: none; }
#report .fhero { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin: 0; }
#report .fhero b { font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
#report .fhero span { font-size: 16px; font-weight: 500; color: #dfe6ee; }
#report .fdelta { margin: 8px 0 0; font-size: 14px; color: #9fb0c0; font-variant-numeric: tabular-nums; }
#report .fdelta .up { color: #7ee0a0; }
#report .fdelta .down { color: #ff9a8a; }
#report .fmeter { height: 10px; border-radius: 5px; background: rgba(255,255,255,.18); overflow: hidden; margin: 12px 0 14px; }
#report .fmeter i, #report .fbar i { display: block; height: 100%; width: calc(var(--v) * 100%); background: #57c97e;
  border-radius: inherit; animation: f-fill .6s ease-out; }
#report .fstats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0 0 14px; }
#report .fstats small { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9fb0c0; margin-bottom: 3px; }
#report .fstats b { font-size: 22px; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
#report .flines p { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 6px; margin: 0 0 8px; font-size: 15px; line-height: 1.45; color: #eef2f6; }
#report .flines .g { color: #7ee0a0; font-weight: 700; }
#report .flines .t { color: #ffd9a0; font-weight: 700; }
#report .factions { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0 18px; }
#report .factions a { display: inline-flex; align-items: center; justify-content: center; text-decoration: none;
  font: inherit; font-size: 16px; font-weight: 600; color: #08130c; background: #57c97e; border-radius: 999px;
  padding: 13px 30px; box-shadow: 0 8px 22px rgba(0,0,0,.35); transition: transform .1s ease, background .12s ease; }
#report .factions a:hover { transform: translateY(-2px); background: #6fe096; }
#report .fparts { border-top: 1px solid rgba(255,255,255,.14); padding-top: 14px; }
#report .fparts h3 { margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9fb0c0; }
#report details { border-radius: 10px; }
#report summary { list-style: none; cursor: pointer; position: relative; min-height: 44px; padding: 8px 6px 8px 22px; border-radius: 10px; }
#report summary::-webkit-details-marker { display: none; }
#report summary::before { content: '▸'; position: absolute; left: 6px; top: 9px; color: #9fb0c0; font-size: 14px; }
#report details[open] > summary::before { content: '▾'; }
@media (hover: hover) { #report summary:hover { background: rgba(255,255,255,.06); } }   /* no stuck highlight after a tap */
#report .fname { display: block; font-size: 15px; font-weight: 600; }
#report .frow { display: grid; grid-template-columns: minmax(80px, 1fr) auto 52px; gap: 10px; align-items: center; margin-top: 6px;
  font-size: 14px; font-variant-numeric: tabular-nums; }
#report .fbar { display: block; height: 6px; border-radius: 3px; background: rgba(255,255,255,.18); overflow: hidden; }
#report .fcount { white-space: nowrap; }
#report .ftier { font-weight: 600; }
#report .tier-solid { color: #7ee0a0; }
#report .tier-nearly { color: #ffd9a0; }
#report .tier-again { color: #ff9a8a; }
#report .ftime { color: #9fb0c0; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
#report .fbody { padding: 2px 6px 10px 22px; font-size: 14px; }
#report .fsplit { margin: 0 0 8px; color: #9fb0c0; font-size: 13px; line-height: 1.5; }
#report .fbld { margin: 10px 0 4px; color: #9fb0c0; font-size: 13px; font-weight: 600; }
#report .fq { display: grid; grid-template-columns: minmax(0, 1fr) auto 44px; gap: 10px; align-items: center; min-height: 30px; line-height: 1.4; }
#report .fq .fans { min-width: 0; }
#report .fq .fmask { font-variant-numeric: tabular-nums; color: #dfe6ee; }
#report .fq .farrow { color: #6f8298; margin: 0 2px; }
#report .fq .fnum { font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
#report .fq .fres { color: #dfe6ee; }
#report .fq .fres.ok { color: #7ee0a0; }
#report .fq .ftime { font-size: 13px; color: #9fb0c0; }
#report .pl + .pl { margin-left: .1em; }
#report .pl-miss { text-decoration: underline dotted 2px; text-underline-offset: 3px; }
#report .ffoot { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.14); color: #9fb0c0; font-size: 13px; line-height: 1.5; }
#report .ffoot p { margin: 0 0 4px; }
@keyframes f-fill { from { width: 0; } }

/* phones, portrait: full-screen dialog (the shell rule lives in the course page) */
@media (max-width: 640px) {
  #report .feyebrow .fsite { display: none; }
  #report .fhero b { font-size: 40px; }
  #report .fstats { gap: 8px; }
  #report .fstats b { font-size: 20px; }
  #report .factions { flex-direction: column; margin: 14px 0 16px; }
  #report .factions button, #report .factions a { width: 100%; min-height: 48px; }
  #report .factions .ghost { min-height: 44px; }
  #report .frow { grid-template-columns: minmax(60px, 1fr) auto 48px; gap: 8px; }
  #report .fq { grid-template-columns: minmax(0, 1fr) auto 40px; gap: 8px; }
  #report .fq .fres { white-space: normal; }
}
@media (pointer: coarse) {
  #report .fx { width: 44px; height: 44px; }
}
/* phones, landscape: the shell shrinks its padding; keep the hero readable */
@media (max-height: 520px) and (orientation: landscape) {
  #report h2 { font-size: 19px; }
  #report .fhero b { font-size: 36px; }
  #report .factions { margin: 12px 0 14px; }
}
@media (max-width: 400px) {
  #report .fstats small { letter-spacing: .04em; }
}`;

function injectStyle() {
  if (document.getElementById('report-style')) return;
  const style = document.createElement('style');
  style.id = 'report-style';
  style.textContent = CSS;
  document.head.appendChild(style);
}

/* ============================================================
   a made-up run, for checking the layout without playing the course
   ============================================================ */
function demo(kind = 'nearly') {
  const wrongsFor = {
    perfect: () => 0,
    ready: (part, i) => (i === 1 && part === 3 ? 1 : 0),
    nearly: (part, i) => (i === 0 ? 1 : i === 1 ? 2 : 0),
    again: (part, i) => (part === 3 && i < 9 ? 1 + (i % 3) : i === 0 ? 1 : 0),
  }[kind] || (() => 0);
  const stages = [
    { i: 1, part: 1, type: 'plex', name: 'Building 2', values: [112] },
    { i: 2, part: 1, type: 'plex', name: 'Building 3', values: [115, 116] },
    { i: 3, part: 1, type: 'plex', name: 'Building 4', values: [118, 119, 120] },
    { i: 5, part: 2, type: 'tower', name: 'Building B', values: [222] },
    { i: 6, part: 2, type: 'tower', name: 'Building C', values: [236, 335, 437, 137] },
    { i: 8, part: 3, type: 'row', name: 'Building 7', values: [7103, 7105, 7107, 7109], masks: ['710_', '71_5', '7_07', '_109'], building: 7 },
    { i: 9, part: 3, type: 'row', name: 'Building 13', values: [13117, 13119, 13121, 13123, 13218, 13220, 13222, 13224, 13226],
      masks: ['1_117', '13_19', '131_1', '1312_', '132__', '132_0', '13__2', '1__24', '__226'], building: 13 },
    { i: 11, part: 4, type: 'block', name: 'Building 19', values: [19101, 19109, 19203, 19211, 19305, 19407, 19415, 19102, 19110, 19204, 19212, 19306, 19314],
      masks: ['1_101', '19_09', '1920_', '__211', '193__', '19_07', '19_15', '191__', '191__', '19___', '19___', '19___', '19___'] },
    { i: 13, part: 5, type: 'seq', name: 'Building 12', values: [1231, 1232, 1236, 1237, 1240, 1241, 1243, 1244, 1245, 1246, 1247, 1249, 1250],
      masks: ['12__', '12__', '123_', '123_', '____', '____', '____', '____', '____', '____', '12__', '12__', '12__'] },
  ];
  run = newRun();
  const perPart = {};
  for (const s of stages) {
    const rec = stageRec(s.i, { part: s.part, type: s.type, kind: 'quiz' });
    rec.name = s.name; rec.completed = true; rec.visits = 1;
    const list = s.values.map((v, k) => ({ v, mask: s.masks ? s.masks[k] : '?', kind: 'door' }));
    if (s.building) list.push({ v: s.building, mask: '', kind: 'building' });
    for (const item of list) {
      perPart[s.part] = (perPart[s.part] || 0);
      const wrong = Math.min(3, wrongsFor(s.part, perPart[s.part]++));
      const secs = 4000 + wrong * 9000 + ((item.v * 7) % 11) * 900;
      const q = {
        id: run.questions.length + 1, part: s.part, stageIndex: s.i, building: s.name, kind: item.kind,
        type: item.kind === 'building' ? 'building' : s.type, mask: item.mask, value: item.v,
        opened: 0, solved: secs, seconds: secs, openSeconds: secs, firstPick: 2000, opens: 1,
        wrong, places: [], picks: [],
      };
      const places = item.kind === 'building' ? ['building'] : s.type === 'tower' ? ['floor', 'door'] :
        (s.type === 'row' || s.type === 'block') ? ['floor', 'building', 'door'] : ['door'];
      for (let w = 0; w < wrong; w++) q.places.push(places[w % places.length]);
      run.questions.push(q); rec.questions.push(q); run.solvedOrder.push(q);
      rec.seconds += secs;
    }
    run.completedOrder.push(s.i);
  }
  for (const [i, part] of [[0, 1], [4, 2], [7, 3], [10, 4], [12, 5]]) {
    const rec = stageRec(i, { part, type: 'x', kind: 'example' });
    rec.name = 'Example'; rec.completed = true; rec.visits = 1; rec.seconds = 25000 + part * 8000;
    run.completedOrder.push(i);
  }
  run.finished = true; run.finishedAt = Date.now();
  run.activeSeconds = [...run.stages.values()].reduce((n, s) => n + s.seconds, 0) / 1000 + 70;
  run.wallSeconds = run.activeSeconds + (kind === 'again' ? 250 : 0);
  if (kind === 'again') history.unshift({ firstTry: 38, questions: 53, seconds: 820 });
  render(summary());
  if (dialog) dialog.classList.remove('hidden');
}

/* ============================================================
   wiring — only on pages that have the course UI
   ============================================================ */
const isCourse = !!document.getElementById('jumpbar');

function wireCourse() {
  run = newRun();
  document.addEventListener('stagechange', onStageChange);
  document.addEventListener('quizopen', onQuizOpen);
  document.addEventListener('quizclose', onQuizClose);
  document.addEventListener('answer', onAnswer);
  document.addEventListener('blanksolved', onBlankSolved);
  document.addEventListener('stagecomplete', onStageComplete);
  document.addEventListener('coursecomplete', onCourseComplete);
  document.addEventListener('coursereset', onCourseReset);
  document.addEventListener('partreset', onPartReset);
  injectStyle();
  wireDialog();
}

if (isCourse) wireCourse();

window.sfReport = {
  summary,
  grade: () => { const s = summary(); return s ? grade(s) : null; },
  render: () => render(summary()),
  demo,
};
