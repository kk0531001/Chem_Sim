// Landing page — "Lab Journal" design: paper & ink, serif display type, one
// flame accent. Six blocks and nothing else (plan3 Phase 5): top bar, hero,
// Try it, Start here, three reasons, footer. Everything is visible on arrival;
// the only motion on the page is the two simulations.
import { h } from './tabs/framework';
import { mountHomepageAccountWidget } from './authWidget';
import { TOPICS, PATHS, pathTopics, moduleCompletion, moduleProgress, topicById } from './topics';
import { onProgressChange, lastTopic } from './progress';
import { recommendNext } from './recommend';

// The tile is a logo mark, and it always sits immediately before the word
// "ChemPrep" — so its "Ch" (plus the "25" the stylesheet adds via ::after) is
// pure noise to a screen reader reading the wordmark. Hidden at the source, so
// every place that embeds TILE_HTML gets it right.
export const TILE_HTML = `<span class="tile" aria-hidden="true">Ch</span>`;

// ---- live hero simulation: H and O atoms bonding into water ----
function makeHeroSim(): { canvas: HTMLCanvasElement; setRunning: (v: boolean) => void } {
  const canvas = h('canvas', {
    width: 520, height: 340, role: 'img',
    'aria-label': 'Animated simulation: white hydrogen atoms and orange oxygen '
      + 'atoms drifting and bonding into water molecules under valence rules.',
  });
  const ctx = canvas.getContext('2d')!;
  interface Atom { x: number; y: number; vx: number; vy: number; el: 'H' | 'O'; bonds: number[] }
  const atoms: Atom[] = [];
  const W = 520, Hh = 340;
  for (let i = 0; i < 30; i++) {
    atoms.push({
      x: 20 + Math.random() * (W - 40), y: 20 + Math.random() * (Hh - 40),
      vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6,
      el: i < 20 ? 'H' : 'O', bonds: [],
    });
  }
  const R = (a: Atom) => (a.el === 'H' ? 5 : 8);
  const MAXB = (a: Atom) => (a.el === 'H' ? 1 : 2);
  let running = false;

  // WCAG 2.2.2: motion that starts on its own and runs indefinitely needs a way
  // out, and this canvas has no pause control by design. Honour the OS setting
  // instead — let the reaction play out to a settled frame (most H₂O has formed
  // by then), then stop for good, so the figure still shows chemistry rather
  // than an empty box.
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const FRAME_BUDGET = 240;
  let drawn = 0;

  function frame(): void {
    if (running) {
      // move + walls
      for (const a of atoms) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < R(a)) { a.x = R(a); a.vx = Math.abs(a.vx); }
        if (a.x > W - R(a)) { a.x = W - R(a); a.vx = -Math.abs(a.vx); }
        if (a.y < R(a)) { a.y = R(a); a.vy = Math.abs(a.vy); }
        if (a.y > Hh - R(a)) { a.y = Hh - R(a); a.vy = -Math.abs(a.vy); }
      }
      // bond / spring / rare break
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const a = atoms[i], b = atoms[j];
          if (a.el === b.el) continue; // only H–O bonds in this toy
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.01;
          const bonded = a.bonds.includes(j);
          if (bonded) {
            const rest = R(a) + R(b) + 4;
            const f = 0.03 * (d - rest);
            a.vx += (f * dx) / d; a.vy += (f * dy) / d;
            b.vx -= (f * dx) / d; b.vy -= (f * dy) / d;
            if (Math.random() < 0.0004) { // occasional break keeps it alive
              a.bonds = a.bonds.filter(k => k !== j);
              b.bonds = b.bonds.filter(k => k !== i);
            }
          } else if (d < 26 && a.bonds.length < MAXB(a) && b.bonds.length < MAXB(b)) {
            a.bonds.push(j); b.bonds.push(i);
            a.vx *= 0.75; a.vy *= 0.75; b.vx *= 0.75; b.vy *= 0.75;
          }
        }
      }
      // draw
      ctx.fillStyle = '#111417';
      ctx.fillRect(0, 0, W, Hh);
      ctx.strokeStyle = '#8a939e';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < atoms.length; i++) {
        for (const j of atoms[i].bonds) {
          if (j < i) continue;
          ctx.beginPath();
          ctx.moveTo(atoms[i].x, atoms[i].y);
          ctx.lineTo(atoms[j].x, atoms[j].y);
          ctx.stroke();
        }
      }
      for (const a of atoms) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, R(a), 0, Math.PI * 2);
        ctx.fillStyle = a.el === 'H' ? '#f5f0e8' : '#e8590c';
        ctx.fill();
      }
      drawn++;
    }
    if (reduceMotion && drawn >= FRAME_BUDGET) return; // settle and freeze
    requestAnimationFrame(frame);
  }
  frame();
  return { canvas, setRunning: v => { running = v; } };
}

// ---- touchable demo: N2O4 <=> 2 NO2, the equilibrium module's core sim ----
//
// Deliberately a small reimplementation rather than an import of equilibrium.ts.
// That module carries a 25-question bank, a challenge ladder and seven mission
// definitions; pulling it in to draw two curves would put all of that in the
// landing page's chunk, which is exactly what D.10's budget is meant to stop.
// The physics is the same twenty lines either way.
function makeDemoSim(): { el: HTMLElement; setRunning: (v: boolean) => void } {
  const KF = 0.30, KR = 0.60;              // K = kf/kr = 0.5, as in the module
  const K = KF / KR;
  const SETTLED = 0.005;                   // |Q − K| below this reads as settled
  const A0 = 1.0;
  let A = A0, B = 0, t = 0;
  const histA: number[] = [], histB: number[] = [];
  const canvas = h('canvas', {
    width: 560, height: 240, role: 'img',
    'aria-label': 'Live plot of a chemical equilibrium: the concentration of '
      + 'dinitrogen tetroxide falls and nitrogen dioxide rises until the forward '
      + 'and reverse rates match, then both hold steady.',
  });
  const ctx = canvas.getContext('2d')!;
  const out = h('p', { class: 'demo-readout' });
  let running = false, frameId: number | null = null;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  function step(): void {
    const dt = 0.05;
    const rf = KF * A, rr = KR * B * B;
    A += (-rf + rr) * dt;
    B += (2 * rf - 2 * rr) * dt;
    A = Math.max(0, A); B = Math.max(0, B);
    t += dt;
    histA.push(A); histB.push(B);
    if (histA.length > 560) { histA.shift(); histB.shift(); }
  }

  function draw(): void {
    const W = 560, Hh = 240;
    ctx.clearRect(0, 0, W, Hh);
    const yOf = (v: number) => Hh - 24 - (v / 1.6) * (Hh - 48);
    ctx.strokeStyle = '#242b33'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 24 + (i / 4) * (Hh - 48);
      ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(W - 12, y); ctx.stroke();
    }
    const trace = (hist: number[], color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
      hist.forEach((v, i) => {
        const x = 34 + (i / 560) * (W - 46);
        i ? ctx.lineTo(x, yOf(v)) : ctx.moveTo(x, yOf(v));
      });
      ctx.stroke();
    };
    trace(histA, '#f5f0e8');
    trace(histB, '#e8590c');
    ctx.fillStyle = '#8a939e'; ctx.font = '11px Menlo, monospace';
    ctx.fillText('N₂O₄', 40, 20);
    ctx.fillStyle = '#e8590c';
    ctx.fillText('NO₂', 84, 20);
    // No Q/K algebra on the landing page — that is the module's job. What a
    // first-time reader can check with their own eyes is the two numbers and
    // whether they are still changing, so that is all this says. "Settled" is
    // measured the way the sim itself defines it: the reaction quotient has
    // reached K, within the drift one integration step can produce.
    const Q = A > 1e-6 ? (B * B) / A : Infinity;
    const settled = Number.isFinite(Q) && Math.abs(Q - K) < SETTLED;
    out.textContent = `Brown NO₂ is ${B.toFixed(2)} mol/L · colourless N₂O₄ is `
      + `${A.toFixed(2)} mol/L · it is ${settled ? 'settled' : 'moving'}.`;
  }

  function loop(): void {
    if (running) { for (let i = 0; i < 3; i++) step(); draw(); }
    frameId = requestAnimationFrame(loop);
  }

  const disturb = (label: string, fn: () => void) =>
    h('button', { class: 'btn-ghost', type: 'button', onclick: () => { fn(); if (reduceMotion) { for (let i = 0; i < 400; i++) step(); draw(); } } }, label);

  const el = h('div', { class: 'demo-card' },
    h('div', { class: 'figure' }, canvas),
    out,
    h('div', { class: 'demo-controls' },
      disturb('Add N₂O₄', () => { A += 0.6; }),
      disturb('Add NO₂', () => { B += 0.6; }),
      disturb('Reset', () => { A = A0; B = 0; t = 0; histA.length = 0; histB.length = 0; }),
    ),
  );

  // Reduced motion: draw one settled frame instead of animating, and let the
  // buttons jump straight to the new equilibrium rather than sliding to it.
  // Otherwise draw a single frame and stop — the rAF loop is not started here,
  // so the demo costs nothing at all until it is scrolled into view.
  if (reduceMotion) for (let i = 0; i < 400; i++) step();
  draw();

  return {
    el,
    setRunning: v => {
      running = v && !reduceMotion;
      if (!v && frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
      else if (v && frameId === null && !reduceMotion) loop();
    },
  };
}

/**
 * "Continue — <module>", for someone who has been here before.
 *
 * OMITTED ENTIRELY for a first-time visitor — not rendered as an empty state.
 * A "you have no progress yet" panel above the fold is a worse first
 * impression than the hero it would be pushing down, and there is nothing the
 * reader can do about it except the thing the hero already asks them to do.
 *
 * It repaints on `onProgressChange`, which `setLastTopic` fires — so leaving a
 * module updates it without the homepage knowing anything about routing.
 * Exported because /today is this block and almost nothing else.
 */
export function continueBlock(onEnter: (id: string, section?: string) => void): { el: HTMLElement; refresh: () => void } {
  const el = h('section', { class: 'continue', 'aria-label': 'Pick up where you left off' });
  function refresh(): void {
    const last = lastTopic();
    const topic = last ? topicById(last.id) : null;
    el.hidden = !topic;
    if (!topic) { el.replaceChildren(); return; }
    // The position inside the module, read from the solved set rather than
    // stored alongside the id — see setLastTopic. Modules with no bank of
    // their own (the sandbox, the question bank) simply have no meter.
    const p = moduleProgress(topic.id);
    const pct = p ? Math.round((p.done / p.total) * 100) : 0;
    const next = recommendNext(topic.id);
    // One line saying what the next move IS, derived from the same solved
    // count as the meter rather than stored — a second source would be a
    // second thing to get out of step with the bar sitting next to it.
    const step = !p ? topic.blurb
      // No quiz count here: the banks are no longer "five warm-ups then
      // twenty", and a number in this line is one more thing that goes stale
      // every time a module gains a question.
      : p.done === 0 ? 'Nothing answered yet — start at the first question.'
      : p.done >= p.total ? 'Quiz complete — the challenge ladder is what is left.'
      : `${p.total - p.done} of ${p.total} questions still unanswered.`;
    const kids: (HTMLElement | null)[] = [
      h('p', { class: 'continue-eyebrow' }, 'Pick up where you left off'),
      h('h2', { class: 'continue-title' }, topic.title),
      h('p', { class: 'continue-step' }, step),
      p ? h('div', { class: 'continue-meter' },
        h('div', { class: 'pbar', role: 'img', 'aria-label': `${p.done} of ${p.total} questions solved` },
          h('div', { class: `pbar-fill${p.done ? '' : ' zero'}`, style: `width:${p.done ? Math.max(pct, 2) : 0}%` })),
        h('span', { class: 'continue-count' }, `${p.done}/${p.total} solved`),
      ) : null,
      // THE one accent button on this card. "Recommended next" is a different
      // module, so it stays a quiet alternative — two filled buttons side by
      // side is two primary actions, which is none.
      // The EXACT section they left open, not the module's first page — the
      // section is passed through rather than left to the topic page's own
      // fallback so the URL is right from the first navigation, with no bare
      // /topic/<slug> entry rewritten a moment later.
      h('button', { class: 'btn-hero continue-cta', type: 'button', onclick: () => onEnter(topic.id, last?.section) },
        `Resume ${topic.title}`),
      next ? h('button', {
        class: 'btn btn-quiet continue-next', type: 'button', onclick: () => onEnter(next.topic.id),
      }, `Recommended next: ${next.topic.title}`) : null,
    ];
    el.replaceChildren(...kids.filter((k): k is HTMLElement => k !== null));
  }
  refresh();
  onProgressChange(refresh);
  return { el, refresh };
}

/**
 * Where every "start here" button goes.
 *
 * NOT quantum. The first module of the beginner run when there is one, and
 * moles otherwise — a reader who has just been told they can start at the
 * basics must not land on orbitals. Resolved at CLICK TIME, so the run can be
 * added to PATHS later and this picks it up with no edit here.
 */
const startTopic = (): string =>
  PATHS.find(p => p.id === 'start-here')?.topicIds[0] ?? 'stoich';

export function buildHome(onEnter: (tabId: string, section?: string) => void, onMenu: () => void): HTMLElement {
  // ---- 1 · top bar ----
  const accountHolder = h('div', {});
  const topBar = h('div', { class: 'home-top' },
    h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b>` }),
    h('div', { class: 'home-top-right' },
      h('button', { class: 'btn-ghost', onclick: onMenu }, 'All topics'),
      accountHolder,
    ),
  );
  mountHomepageAccountWidget(accountHolder);

  // ---- 2 · hero ----
  const sim = makeHeroSim();
  // THE one filled button on the page. For a returning student the Continue
  // block below IS the call to action, so this steps down to a ghost rather
  // than competing with it — re-checked on every repaint, because the block can
  // appear while this page is open (another tab, a fresh sign-in).
  const startBtn = h('button', { class: 'btn-hero', onclick: () => onEnter(startTopic()) }, 'Start with the basics');
  const cont = continueBlock(onEnter);
  const syncStart = (): void => { startBtn.className = cont.el.hidden ? 'btn-hero' : 'btn-ghost'; };
  syncStart();
  onProgressChange(syncStart);
  const hero = h('section', { class: 'hero' },
    h('div', {},
      h('p', { class: 'eyebrow' }, 'From the basics to olympiad · interactive'),
      h('h1', { html: 'High school chemistry you can <em>run</em>.' }),
      h('p', { class: 'lede' },
        'Interactive lessons from the first mole up to olympiad level. Every topic '
        + 'starts with the basics and every answer is explained.'),
      h('div', { class: 'cta' },
        startBtn,
        // A page, not a scroll: the catalogue this used to jump to is gone, and
        // /menu is where someone comparing modules was always going to end up.
        h('button', { class: 'btn-ghost', onclick: onMenu }, `See all ${TOPICS.length} topics`),
      ),
      cont.el,
    ),
    h('div', {},
      h('div', { class: 'figure' }, sim.canvas),
      h('p', { class: 'fig-cap' },
        'Hydrogen and oxygen atoms bonding into water, live. Hydrogen makes one '
        + 'bond, oxygen makes two.'),
    ),
  );

  // ---- 3 · try it ----
  const demo = makeDemoSim();
  const demoSect = h('section', { class: 'demo-sect' },
    h('div', { class: 'sect-head' }, h('h2', {}, 'Try it')),
    h('p', { class: 'section-lede' }, 'Press Add NO₂ and watch the mixture settle back.'),
    demo.el,
    h('div', { class: 'home-more' },
      h('button', { class: 'btn-ghost', onclick: () => onEnter('equilibrium') }, 'Open the equilibrium topic'),
    ),
  );

  // ---- 4 · start here ----
  // One run, not four. The other three are a sentence pointing at /menu: a
  // reader who already knows they want the organic sequence does not need it
  // spelled out on the front page, and a reader who does not is being asked to
  // choose before they have started.
  const run = PATHS.find(p => p.id === 'start-here');
  const mods = run ? pathTopics(run) : [];
  const steps = mods.map(t => h('button', {
    class: 'path-step', type: 'button', onclick: () => onEnter(t.id),
  }, t.title));
  const bar = h('div', { class: 'pbar' });
  const count = h('span', { class: 'path-count' });
  const meter = h('div', { class: 'path-progress' }, bar, count);
  const runBtn = h('button', { class: 'btn path-continue', type: 'button' });
  const paint = (): void => {
    const done = mods.map(t => moduleCompletion(t.id) >= 1);
    const n = done.filter(Boolean).length;
    steps.forEach((s, i) => s.classList.toggle('done', done[i]));
    bar.replaceChildren(h('div', {
      class: `pbar-fill${n ? '' : ' zero'}`,
      style: `width:${n ? Math.max(Math.round((n / mods.length) * 100), 2) : 0}%`,
    }));
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `${n} of ${mods.length} modules complete`);
    count.textContent = n === mods.length ? 'Complete' : `${n}/${mods.length} modules`;
    count.classList.toggle('all-done', n === mods.length);
    // Hidden on a first visit: an empty bar reading "0/8" is a progress report
    // on something the reader has not been offered yet.
    meter.hidden = n === 0;
    const next = mods.find((_, i) => !done[i]);
    // Colon, not an em dash: four module titles already contain one
    // ("Organic I — Mechanisms"), and "Continue — Organic I — Mechanisms"
    // reads as two separators fighting.
    runBtn.textContent = !n ? 'Start step 1'
      : next ? `Continue: ${next.title}` : 'Revisit from the top';
    runBtn.onclick = () => onEnter((next ?? mods[0]).id);
  };
  paint();
  onProgressChange(paint);
  const mins = mods.reduce((s, t) => s + t.estMinutes, 0);
  const startHere = h('section', { class: 'start-sect' },
    h('div', { class: 'sect-head' }, h('h2', {}, 'Start here')),
    h('p', { class: 'meta-time' }, `${mins} minutes in total`),
    h('ol', { class: 'path-steps' }, ...steps.map(s => h('li', {}, s))),
    meter,
    runBtn,
    h('p', { class: 'home-other-runs' },
      'Doing a contest? Runs for CCC, organic, and advanced are in ',
      h('button', { class: 'link-btn', type: 'button', onclick: onMenu }, 'All topics'),
      '.'),
  );

  // ---- 5 · three reasons ----
  const reasons = h('section', { class: 'reasons' },
    h('p', {}, 'Simulations you control, not videos.'),
    h('p', {}, 'Every answer explained, right or wrong.'),
    h('p', {}, 'A Basics level in every topic, then exam-style.'),
  );

  // ---- 6 · footer ----
  const footer = h('section', { class: 'home-end' },
    h('p', {},
      'Made for high-school students, free, no account needed to start. ',
      h('button', { class: 'link-btn', type: 'button', onclick: onMenu }, 'All topics'),
    ),
  );

  const root = h('div', { id: 'home' },
    h('main', { class: 'home-wrap' }, topBar, hero, demoSect, startHere, reasons, footer),
  );

  // The page has NO scroll-triggered reveal: everything is on screen from the
  // first paint. The only two IntersectionObservers left are the ones that stop
  // a simulation nobody is looking at.
  const simIO = new IntersectionObserver(entries => {
    sim.setRunning(entries.some(e => e.isIntersecting) && !root.hidden);
  }, { threshold: 0.05 });
  simIO.observe(sim.canvas);

  // Same treatment for the demo, which starts stopped: it costs nothing until
  // it is scrolled to, and gives its frame back the moment it leaves.
  const demoIO = new IntersectionObserver(entries => {
    demo.setRunning(entries.some(e => e.isIntersecting) && !root.hidden);
  }, { threshold: 0.05 });
  demoIO.observe(demo.el);

  requestAnimationFrame(() => sim.setRunning(true));

  return root;
}
