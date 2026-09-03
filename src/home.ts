// Landing page — "Lab Journal" design: paper & ink, serif display type,
// one flame accent, and the chemistry itself as the artwork (a live mini
// simulation in the hero, figure panels with captions elsewhere).
import { h, prefersReducedMotion } from './tabs/framework';
import { mountHomepageAccountWidget } from './authWidget';
import { TOPICS, PATHS, pathTopics, renderTopicCard, difficultyBadges, moduleCompletion, moduleProgress, topicById } from './topics';
import { onProgressChange, lastTopic } from './progress';
import { recommendNext } from './recommend';
import { CORPUS_COUNTS } from './content/counts';
import { CLOCK_ICON } from './icons';
import { COMP_PLAIN, type Comp } from './content/topicIds';

// The tile is a logo mark, and it always sits immediately before the word
// "ChemPrep" — so its "Ch" (plus the "25" the stylesheet adds via ::after) is
// pure noise to a screen reader reading the wordmark. Hidden at the source, so
// every place that embeds TILE_HTML gets it right.
export const TILE_HTML = `<span class="tile" aria-hidden="true">Ch</span>`;

// ---- static figure SVGs for the feature rows (dark panels, one accent) ----
const FIG_TITRATION = `
<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#242b33" stroke-width="1">${[40, 80, 120, 160].map(y => `<line x1="34" y1="${y}" x2="306" y2="${y}"/>`).join('')}</g>
  <line x1="34" y1="14" x2="34" y2="182" stroke="#3a424d" stroke-width="1.2"/>
  <line x1="34" y1="182" x2="306" y2="182" stroke="#3a424d" stroke-width="1.2"/>
  <path d="M 40 172 C 110 164, 130 152, 158 140 C 172 132, 174 60, 190 46 C 220 24, 268 22, 300 20"
        fill="none" stroke="#e8590c" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="172" cy="96" r="4.5" fill="#f5f0e8"/>
  <text x="182" y="92" fill="#8a939e" font-size="10.5" font-family="Menlo, monospace">equivalence</text>
  <text x="40" y="26" fill="#8a939e" font-size="10" font-family="Menlo, monospace">pH</text>
  <text x="252" y="196" fill="#8a939e" font-size="10" font-family="Menlo, monospace">V added</text>
</svg>`;

const FIG_ENERGY = `
<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <line x1="30" y1="182" x2="306" y2="182" stroke="#3a424d" stroke-width="1.2"/>
  <path d="M 36 120 C 90 120, 100 44, 160 44 C 220 44, 226 140, 300 140"
        fill="none" stroke="#5c646e" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M 36 120 C 96 120, 112 78, 160 78 C 210 78, 230 140, 300 140"
        fill="none" stroke="#e8590c" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="160" y1="44" x2="160" y2="120" stroke="#8a939e" stroke-width="1" stroke-dasharray="2 3"/>
  <text x="168" y="64" fill="#8a939e" font-size="10.5" font-family="Menlo, monospace">Ea, catalyzed ↓</text>
  <text x="38" y="110" fill="#8a939e" font-size="10" font-family="Menlo, monospace">reactants</text>
  <text x="252" y="132" fill="#8a939e" font-size="10" font-family="Menlo, monospace">products</text>
</svg>`;

const FIG_DECAY = `
<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  ${Array.from({ length: 60 }, (_, i) => {
    const x = 46 + (i % 10) * 16, y = 30 + Math.floor(i / 10) * 15;
    const dead = (i * 7 + 3) % 11 < 4;
    return `<circle cx="${x}" cy="${y}" r="4" fill="${dead ? '#2c333c' : '#f5f0e8'}"/>`;
  }).join('')}
  <path d="M 36 132 C 90 150, 150 166, 300 176" fill="none" stroke="#e8590c" stroke-width="2.2" stroke-linecap="round"/>
  <text x="222" y="160" fill="#8a939e" font-size="10.5" font-family="Menlo, monospace">N = N₀·(½)^(t/t½)</text>
</svg>`;

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
    const Q = A > 1e-6 ? (B * B) / A : Infinity;
    out.innerHTML = `[N₂O₄] = <b>${A.toFixed(3)}</b> · [NO₂] = <b>${B.toFixed(3)}</b> · `
      + `Q = [NO₂]²/[N₂O₄] = <b>${Number.isFinite(Q) ? Q.toFixed(2) : '—'}</b> (K = 0.50)`;
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
    h('p', { class: 'fig-cap', html: '<b>Fig. 5</b> — push either side and the system walks back until Q meets K again. Nothing here is scripted: the curves are the rate equations being integrated in your browser.' }),
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

function competitionCard(name: string, badge: string, line: string): HTMLElement {
  return h('article', { class: 'comp-card reveal' },
    h('div', { class: 'comp-card-top' },
      h('h3', {}, name),
      ...difficultyBadges([badge]),
    ),
    // The acronym said in plain words, first, for a reader who has met none of
    // them. Same line as the menu's Level filter and the guide headers.
    h('p', { class: 'comp-count', style: 'margin:0 0 var(--s-2)' },
      COMP_PLAIN[badge.toLowerCase() as Comp]),
    h('p', {}, line),
    h('p', { class: 'comp-count' },
      `${TOPICS.filter(t => t.difficulty.includes(badge)).length} of ${TOPICS.length} modules are pitched at this level`),
  );
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
      : p.done === 0 ? `Nothing answered yet — the quiz opens with ${Math.min(5, p.total)} warm-ups.`
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
  const progress = h('div', { class: 'scroll-progress' });

  // ---- top bar ----
  const accountHolder = h('div', {});
  const topBar = h('div', { class: 'home-top' },
    h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>Chemistry, running</small>` }),
    h('div', { class: 'home-top-right' },
      h('button', { class: 'btn-ghost', onclick: onMenu }, 'All Topics'),
      accountHolder,
      h('button', { class: 'btn-ghost', onclick: () => onEnter(startTopic()) }, 'Open the app'),
    ),
  );
  mountHomepageAccountWidget(accountHolder);

  // ---- hero ----
  const sim = makeHeroSim();
  // One filled accent button per screen. For a returning student the Continue
  // block below IS the call to action, so "Start learning" — which for them
  // means "start over at the first module" — steps down to a ghost rather than
  // competing with it. Re-checked on every repaint, because the block can
  // appear while this page is open (another tab, a fresh sign-in).
  const startBtn = h('button', { class: 'btn-hero', onclick: () => onEnter(startTopic()) }, 'Start learning');
  const cont = continueBlock(onEnter);
  const syncStart = (): void => { startBtn.className = cont.el.hidden ? 'btn-hero' : 'btn-ghost'; };
  syncStart();
  onProgressChange(syncStart);
  const hero = h('section', { class: 'hero' },
    h('div', {},
      h('p', { class: 'eyebrow' }, 'Grade 11 to olympiad · interactive'),
      h('h1', { html: 'High school chemistry you can <em>run</em>.' }),
      // Every number in this sentence is interpolated from the corpus, for the
      // same reason the stats strip is: the page that promises numerical care
      // cannot be the one page nobody checks.
      h('p', { class: 'lede' },
        `${TOPICS.length} interactive modules, from atoms and moles to enzyme kinetics. ${CORPUS_COUNTS.mc} exam-style questions, ${CORPUS_COUNTS.frq} multi-part written problems and ${CORPUS_COUNTS.papers} full mock papers, every answer worked out. Start at the basics with no chemistry behind you, and the same modules carry on to contest level.`),
      h('div', { class: 'cta' },
        startBtn,
        h('button', {
          class: 'btn-ghost',
          // The reduced-motion block in style.css sets scroll-behavior, which an
          // explicit JS `behavior` option overrides — so gate it here too.
          onclick: () => document.querySelector('.topics')?.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          }),
        }, 'Browse the modules'),
      ),
      cont.el,
    ),
    h('div', {},
      h('div', { class: 'figure' }, sim.canvas),
      h('p', { class: 'fig-cap', html: '<b>Fig. 1</b> — hydrogen (white) and oxygen (orange) finding each other, live. Valence rules only: H makes one bond, O makes two. Click "Particle Sandbox" for the full engine.' }),
    ),
  );

  // ---- 05 · the corpus, counted ----
  // Every figure comes from TOPICS or CORPUS_COUNTS. The previous strip
  // hard-coded four numbers and three were wrong (18 modules, 650+ questions,
  // and "65+ simulations" / "90+ equations", which nothing counted at all).
  // A stat with no source of truth is not a stat, so those two are gone rather
  // than replaced with a fresh guess.
  const statDefs = [
    { n: TOPICS.length, label: 'interactive modules' },
    { n: CORPUS_COUNTS.mc, label: 'practice questions' },
    { n: CORPUS_COUNTS.frq, label: 'written problems, worked' },
    { n: CORPUS_COUNTS.papers, label: 'full mock papers' },
  ];
  const stats = h('section', { class: 'stats-sect' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '06'), h('h2', {}, 'What is actually in here')),
    h('p', { class: 'section-lede reveal' },
      'Counted from the question bank at build time, not rounded up for the landing page.'),
    h('div', { class: 'stats' },
      ...statDefs.map(s =>
        h('div', { class: 'stat reveal' },
          h('span', { class: 'stat-n', 'data-n': s.n }, '0'),
          h('span', { class: 'stat-label' }, s.label),
        )),
    ),
  );

  // ---- 01 · why it works (builds trust before the full catalog) ----
  const features = h('section', { class: 'features' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '01'), h('h2', {}, 'Why it works')),
    featureRow('left', 'Simulations, not flashcards',
      'The equilibrium module is a real kinetic system — add reactant, compress the vessel, heat it, and watch it chase K back down. Gases push on their walls. Nuclei decay at random yet trace the exponential law. You learn the behavior, not a sentence about the behavior.',
      'See the live equilibrium', () => onEnter('equilibrium'),
      FIG_ENERGY, '<b>Fig. 2</b> — a catalyst lowers the barrier for both directions; ΔH and K don\'t move.'),
    featureRow('right', 'Questions that explain themselves',
      'Every module quiz opens with five warm-ups, then twenty contest-level problems built around the classic traps. The exam-format bank adds Part I multiple choice, Part II free response with worked solutions, and Part III lab practicals. Every answer — right or wrong — comes with the reasoning.',
      'Open the question bank', () => onEnter('qbank'),
      FIG_TITRATION, '<b>Fig. 3</b> — a weak-acid titration curve. Half-equivalence gives pKa; equivalence sits above 7. Both facts are quiz questions.'),
    featureRow('left', 'The exam traps, catalogued',
      'The wet Erlenmeyer flask that changes nothing. The (2x)² inside the ICE table. Losing 4s before 3d. Chlorine\'s electron affinity beating fluorine\'s. The traps that reappear every year are marked in every theory panel and drilled in every quiz.',
      'Open Lab & Data', () => onEnter('labdata'),
      FIG_DECAY, '<b>Fig. 4</b> — sixty nuclei, each deciding at random; the ensemble still obeys first-order kinetics.'),
  );

  // ---- 02 · try one ----
  const demo = makeDemoSim();
  const demoSect = h('section', { class: 'demo-sect' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '02'), h('h2', {}, 'Try one right now')),
    h('p', { class: 'section-lede reveal' },
      'This is the equilibrium module\'s core simulation, running on this page. Disturb it and watch Le Chatelier\'s principle happen rather than be asserted.'),
    h('div', { class: 'reveal' }, demo.el),
    h('div', { style: 'text-align:center;margin-top:24px' },
      h('button', { class: 'btn-ghost', onclick: () => onEnter('equilibrium') }, 'Open the full module →'),
    ),
  );

  // ---- 03 · learning paths ----
  const paths = h('section', { class: 'paths-sect' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '03'), h('h2', {}, 'Ways through')),
    h('p', { class: 'section-lede reveal' },
      'Ordered runs through the modules that already exist — start at the top of one and work down, or ignore them entirely and pick your own. The first is the one to take if you are new here.'),
    h('div', { class: 'path-grid' },
      ...PATHS.map(p => {
        const mods = pathTopics(p);
        const mins = mods.reduce((s, t) => s + t.estMinutes, 0);
        // Badges are the union of the levels its modules carry, in tier order,
        // so a path can never claim a level none of its modules is pitched at.
        const levels = ['CCC', 'USNCO', 'CCO', 'IChO'].filter(d => mods.some(t => t.difficulty.includes(d)));

        // ---- progress along the path (ROADMAP F.2) ----
        // The paths were already data; what was missing is where you are in
        // one. Steps mark themselves done, and "Continue" jumps to the first
        // module that isn't — which is the only button on the card that knows
        // anything, and the reason a path beats a plain list of links.
        const steps = mods.map(t => h('button', {
          class: 'path-step', type: 'button', onclick: () => onEnter(t.id),
        }, t.title));
        const bar = h('div', { class: 'pbar' });
        const count = h('span', { class: 'path-count' });
        const cont = h('button', { class: 'btn path-continue', type: 'button' });
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
          const next = mods.find((_, i) => !done[i]);
          // Colon, not an em dash: four module titles already contain one
          // ("Organic I — Mechanisms"), and "Start — Organic I — Mechanisms"
          // reads as two separators fighting.
          cont.textContent = next ? `${n ? 'Continue' : 'Start'}: ${next.title}` : 'Revisit from the top';
          cont.onclick = () => onEnter((next ?? mods[0]).id);
        };
        paint();
        onProgressChange(paint);

        return h('article', { class: 'path-card reveal' },
          h('h3', {}, p.title),
          h('div', { class: 'topic-meta' },
            h('span', { class: 'meta-time', html: CLOCK_ICON }, ` ${Math.round(mins / 60)} h`),
            ...difficultyBadges(levels),
          ),
          h('p', {}, p.blurb),
          h('div', { class: 'path-progress' }, bar, count),
          h('ol', { class: 'path-steps' }, ...steps.map(s => h('li', {}, s))),
          cont,
        );
      }),
    ),
  );

  // ---- 04 · competition scope ----
  // Only what TopicMeta.difficulty supports — no dates, formats, cutoffs or
  // qualification rules, none of which this repo has a source for.
  const comps = h('section', { class: 'comps-sect' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '04'), h('h2', {}, 'Which competition')),
    h('p', { class: 'section-lede reveal' },
      'Every module carries the levels it is pitched at, from grade 11 up to international olympiad level. The same badges appear on each card below and throughout the app.'),
    h('div', { class: 'comp-grid' },
      competitionCard('CCC', 'CCC', 'The Canadian Chemistry Contest — the entry level here, and the assumed starting point for everything else.'),
      competitionCard('USNCO', 'USNCO', 'The US National Chemistry Olympiad. Broader coverage than CCC, with quantitative work expected throughout.'),
      competitionCard('CCO', 'CCO', 'The Canadian Chemistry Olympiad. Rigorous physical chemistry, coordination chemistry and multi-step synthesis.'),
      competitionCard('IChO', 'IChO', 'The International Chemistry Olympiad — the deepest material in the app, layered on top of the CCO modules.'),
    ),
  );

  // ---- 05 · the full catalog, grouped by domain ----
  // The catalogue is the SECONDARY way in, and it now looks like one: 27 equal
  // tiles competing at full weight was a decision the reader had to make before
  // they could start. The Resume card in the hero is the primary route; this is
  // the fallback for someone who wants something else, so it renders compact
  // and unemphasised under a lower-case aside of a heading.
  const groupsInOrder = [...new Set(TOPICS.map(t => t.group))];
  const topics = h('section', { class: 'topics' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '05'), h('h2', {}, 'or jump to a topic')),
    h('p', { class: 'section-lede reveal' },
      'Each module pairs hands-on simulations with the key equations and the traps examiners reuse, then tests you with a 25-question quiz — five warm-ups, twenty at contest level.'),
    ...groupsInOrder.flatMap(g => [
      h('h3', { class: 'topic-group-head reveal' }, g),
      h('div', { class: 'topic-grid' },
        ...TOPICS.filter(t => t.group === g)
          .map((t, i) => renderTopicCard(t, onEnter, ' reveal compact', `transition-delay:${(i % 3) * 60}ms`)),
      ),
    ]),
    h('div', { style: 'text-align:center;margin-top:34px' },
      h('button', { class: 'btn-ghost', onclick: onMenu }, 'Browse the full directory →'),
    ),
  );

  // ---- 03 · footer ----
  const footer = h('section', { class: 'home-end' },
    h('h2', { class: 'reveal' }, 'Ready when you are.'),
    h('p', { class: 'reveal' }, 'No accounts, no installs — everything runs locally in this tab.'),
    h('button', { class: 'btn-hero reveal', onclick: () => onEnter(startTopic()) }, 'Enter ChemPrep'),
  );

  const root = h('div', { id: 'home' },
    progress,
    h('main', { class: 'home-wrap' }, topBar, hero, features, demoSect, paths, comps, topics, stats, footer),
  );

  // ---- scroll reveals + count-up ----
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('visible');
      const num = e.target.querySelector<HTMLElement>('.stat-n');
      if (num && !num.dataset.done) { num.dataset.done = '1'; countUp(num); }
      io.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  root.querySelectorAll('.reveal, .feature').forEach(el => io.observe(el));

  // hero sim runs only while the hero is on screen and home is visible
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

  let ticking = false;
  root.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - root.clientHeight;
      progress.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
      ticking = false;
    });
  });

  // The hero is NOT revealed on a timer any more (plan3 §1.6). Its four
  // children each faded in behind a transition-delay that only started after
  // two animation frames, so the first thing anyone saw of this site was an
  // empty screen for the better part of a second — on a cold load, longer.
  // Everything below the fold keeps `.reveal`: that one is scroll-triggered,
  // so it is never what a reader is waiting on.
  requestAnimationFrame(() => sim.setRunning(true));

  return root;
}

function featureRow(side: 'left' | 'right', title: string, body: string, cta: string, go: () => void, figSVG: string, caption: string): HTMLElement {
  return h('div', { class: `feature ${side}` },
    h('div', { class: 'feature-text' },
      h('h3', {}, title),
      h('p', {}, body),
      h('button', { class: 'btn-ghost', onclick: go }, cta),
    ),
    h('div', { class: 'feature-visual' },
      h('div', { class: 'figure', html: figSVG }),
      h('p', { class: 'fig-cap', html: caption }),
    ),
  );
}

function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.n);
  const suffix = el.dataset.suffix ?? '';
  const t0 = performance.now();
  const dur = 900;
  const tick = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
