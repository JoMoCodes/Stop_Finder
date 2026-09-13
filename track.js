/* ============================================================
   Stop Finder — course run tracking (shared by every course page)

   What it does
   - Listens to the events the course already dispatches on `document`
     (stagechange, quizopen, blanksolved, answer, stagecomplete,
     coursecomplete, coursereset, partreset) plus a few UI clicks, and turns
     them into flat analytics events.
   - Sends them to Umami (cookieless, no personal data). Each run of the
     course gets a random id so answers can be grouped per run; nothing
     identifies the person.
   - Keeps the last 200 events in localStorage (`sf.events`) and, with
     `?debug` on the URL or `localStorage.sf.debug = '1'`, logs each one to
     the console. `window.sfTrack.events()` in devtools prints the buffer.

   Setup
   1. Paste your Umami website id into UMAMI.websiteId below
      (Umami → Settings → Websites → Edit → "Website ID").
   2. That's it. The Umami script is only loaded when an id is set, and never
      on localhost unless the URL has `?track=1`, so local previews don't
      pollute the dashboard.

   Opt-out: `localStorage.setItem('sf.optout', '1')` stops all sending.
   ============================================================ */

export const UMAMI = {
  src: 'https://cloud.umami.is/script.js',
  websiteId: 'aef960bc-14d4-492c-8c1d-93fef7dfd959',   // <- paste your Umami website id here
};

const MAX_BUFFER = 200;
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
};

const params = new URLSearchParams(location.search);
const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
const DEBUG = params.has('debug') || LS.get('sf.debug') === '1';
const OPT_OUT = LS.get('sf.optout') === '1';
const SEND = !!UMAMI.websiteId && !OPT_OUT && (!isLocal || params.get('track') === '1');

/* ---- context every event carries ---- */
const LOOK = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
const mq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
function deviceClass() {
  const w = innerWidth;
  return w <= 640 ? 'phone' : w <= 1024 ? 'tablet' : 'desktop';
}
const INPUT = mq('(pointer: coarse)') ? 'touch' : 'pointer';
const MOTION = mq('(prefers-reduced-motion: reduce)') ? 'reduced' : 'full';

/* ---- per-run state ---- */
function newId() {
  try { if (crypto.randomUUID) return crypto.randomUUID().slice(0, 8); } catch (e) { /* old browsers */ }
  return Math.random().toString(36).slice(2, 10);
}
const run = { id: newId(), t0: performance.now(), wrong: 0, restarts: 0, stagesDone: 0 };
const secs = since => Math.round((performance.now() - since) / 10) / 100;

/* ---- the sink ---- */
const queue = [];
let umamiReady = false;

function umamiSend(name, data) {
  try { window.umami.track(name, data); } catch (e) { /* never break the course */ }
}
function flush() {
  while (queue.length) { const [n, d] = queue.shift(); umamiSend(n, d); }
}
function loadUmami() {
  if (!SEND) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = UMAMI.src;
  s.dataset.websiteId = UMAMI.websiteId;
  document.head.appendChild(s);
  // the script exposes window.umami once it has booted; poll rather than rely on `load`
  let tries = 0;
  const poll = setInterval(() => {
    if (window.umami && typeof window.umami.track === 'function') {
      umamiReady = true; clearInterval(poll); flush();
    } else if (++tries > 60) clearInterval(poll);   // ~30 s: blocked or offline
  }, 500);
}

function buffer(ev) {
  let list = [];
  try { list = JSON.parse(LS.get('sf.events') || '[]'); } catch (e) { list = []; }
  list.push(ev);
  if (list.length > MAX_BUFFER) list = list.slice(-MAX_BUFFER);
  LS.set('sf.events', JSON.stringify(list));
}

/** Record one event. `props` must be flat (strings / numbers). */
export function track(name, props = {}) {
  const data = {
    look: LOOK, device: deviceClass(), input: INPUT, motion: MOTION,
    run: run.id, t: secs(run.t0),
    ...props,
  };
  if (DEBUG) console.debug('[track]', name, data);
  buffer({ ...data, name, at: Date.now() });
  if (!SEND) return;
  if (umamiReady) umamiSend(name, data); else queue.push([name, data]);
}

/* ============================================================
   Course wiring — only on pages that have the course UI
   ============================================================ */
const isCourse = !!document.getElementById('jumpbar');

function stageProps(stage, index) {
  if (!stage) return { stage: index };
  return {
    stage: index,
    part: stage.part,
    kind: stage.kind,                        // example | quiz
    type: stage.type,                        // apartments: plex | tower | row | block | seq · houses: street | block | court | loop
    stage_name: String(stage.label ?? stage.number ?? stage.building ?? ''),
  };
}

/* which digit place a wrong pick got wrong, given the coloured segments the
   quiz itself uses: [{text, place}] for the pick and for the right answer */
function wrongPlace(chosen, expected) {
  if (!Array.isArray(chosen) || !Array.isArray(expected)) return 'unknown';
  for (const seg of expected) {
    const c = chosen.find(x => x.place === seg.place);
    if (!c || c.text !== seg.text) return seg.place;
  }
  return 'unknown';
}

function wireCourse() {
  let cur = null, curIndex = -1, stageAt = performance.now(), stageWrong = 0;
  const opened = new WeakMap();     // bstate -> { at, kind }
  const left = new Set();           // stages a `leave` was already sent for this run
  const done = new Set();           // stages already reported complete this run

  track('course_start', { viewport: `${innerWidth}x${innerHeight}` });

  document.addEventListener('stagechange', e => {
    const { index, stage } = e.detail || {};
    const props = stageProps(stage, index);
    if (cur) { props.from = curIndex; props.from_seconds = secs(stageAt); }
    cur = stage; curIndex = index; stageAt = performance.now(); stageWrong = 0;
    track('stage_view', props);
  });

  document.addEventListener('quizopen', e => {
    const bs = e.detail && e.detail.bstate;
    if (!bs) return;
    const kind = (e.detail.type === 'building') ? 'building' : 'door';
    opened.set(bs, { at: performance.now(), kind });
    track('quiz_open', { ...stageProps(cur, curIndex), quiz: kind, expected: String(bs.value) });
  });

  // dispatched by chooseOption(): { bstate, picked, correct, attempt, type, chosen, expected }
  // (`chosen` / `expected` are the coloured digit segments the quiz draws)
  document.addEventListener('answer', e => {
    const d = e.detail || {};
    const bs = d.bstate;
    const kind = d.type === 'building' ? 'building' : 'door';
    const o = opened.get(bs) || { at: performance.now(), kind };
    o.kind = kind; opened.set(bs, o);
    const props = {
      ...stageProps(cur, curIndex),
      quiz: kind,
      result: d.correct ? 'right' : 'wrong',
      picked: String(d.picked),
      expected: bs ? String(bs.value) : '',
      attempt: d.attempt,
      seconds: secs(o.at),
    };
    if (!d.correct) {
      props.place = d.place || (d.type === 'building' ? 'building' : wrongPlace(d.chosen, d.expected));   // a course may name the place itself
      run.wrong++; stageWrong++;
    }
    track('answer', props);
  });

  document.addEventListener('blanksolved', e => {
    const bs = e.detail && e.detail.bstate;
    if (!bs) return;
    const o = opened.get(bs) || { at: performance.now(), kind: 'door' };
    track('blank_solved', {
      ...stageProps(cur, curIndex),
      quiz: o.kind,
      value: String(bs.value),
      attempts: (bs.wrongCount || 0) + 1,
      seconds: secs(o.at),
    });
  });

  document.addEventListener('stagecomplete', e => {
    const { index, stage } = e.detail || {};
    if (done.has(index)) return;               // revisiting a finished stage
    done.add(index);
    run.stagesDone++;
    track('stage_complete', { ...stageProps(stage, index), seconds: secs(stageAt), wrong: stageWrong });
  });

  document.addEventListener('coursecomplete', () => {
    track('course_complete', { seconds: secs(run.t0), wrong: run.wrong, restarts: run.restarts });
  });

  document.addEventListener('coursereset', () => {
    track('course_restart', { seconds: secs(run.t0), wrong: run.wrong, stages_done: run.stagesDone });
    run.id = newId(); run.t0 = performance.now(); run.wrong = 0; run.stagesDone = 0; run.restarts++;
    left.clear(); done.clear();
  });

  // "Try Part N again" on the report: that part's stages will complete again
  document.addEventListener('partreset', e => {
    const d = e.detail || {};
    for (const i of d.stages || []) done.delete(i);
    track('part_retry', { part: d.part, seconds: secs(run.t0), wrong: run.wrong });
  });

  // the Houses course: a step to another viewpoint (chevron / map / key / button / road)
  document.addEventListener('walk', e => {
    const d = e.detail || {};
    if (d.via === 'stage') return;                         // placed there by the stage, not a step
    track('walk', { ...stageProps(cur, curIndex), via: String(d.via || ''), node: d.node });
  });

  /* ---- UI signals: help, camera reset, view / walk buttons, jump bar ---- */
  const on = (sel, fn) => document.querySelectorAll(sel).forEach(el => el.addEventListener('click', fn));
  on('#helpbtn', () => track('help_open', stageProps(cur, curIndex)));
  on('#resetview', () => track('view_reset', stageProps(cur, curIndex)));
  on('#viewbar button[data-view]', e => track('view_switch', { ...stageProps(cur, curIndex), view: e.currentTarget.dataset.view }));
  on('#jumpbar button[data-part]', e => {
    const to = Number(e.currentTarget.dataset.part);
    if (cur && cur.part === to) return;                    // same part, not a jump
    track('jump', { from_part: cur ? cur.part : 0, to_part: to, from: curIndex });
  });

  // the drag hint / "click a glowing door" tip: a learner who needed a nudge
  const hint = document.getElementById('draghint');
  if (hint && 'MutationObserver' in window) {
    let shown = false;
    new MutationObserver(() => {
      const now = hint.classList.contains('show');
      if (now && !shown) track('hint_shown', { ...stageProps(cur, curIndex), hint: /glowing/i.test(hint.textContent) ? 'tip' : 'controls' });
      shown = now;
    }).observe(hint, { attributes: true, attributeFilter: ['class'] });
  }

  // best-effort drop-off marker: where the learner was when the tab went away
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || left.has(curIndex)) return;
    left.add(curIndex);
    track('leave', { ...stageProps(cur, curIndex), seconds: secs(run.t0), stages_done: run.stagesDone });
  });
}

/* ---- boot ---- */
loadUmami();
if (isCourse) wireCourse();

window.sfTrack = {
  track,
  events() { try { return JSON.parse(LS.get('sf.events') || '[]'); } catch (e) { return []; } },
  clear() { LS.set('sf.events', '[]'); },
};
