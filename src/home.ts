// Landing page — "Lab Journal" design: paper & ink, serif display type,
// one flame accent, and the chemistry itself as the artwork (a live mini
// simulation in the hero, figure panels with captions elsewhere).
import { h } from './tabs/framework';
import { mountHomepageAccountWidget } from './authWidget';
import { TOPICS } from './topics';

export const TILE_HTML = `<span class="tile">Ch</span>`;

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
  <text x="40" y="26" fill="#5c646e" font-size="10" font-family="Menlo, monospace">pH</text>
  <text x="252" y="196" fill="#5c646e" font-size="10" font-family="Menlo, monospace">V added</text>
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
  <text x="38" y="110" fill="#5c646e" font-size="10" font-family="Menlo, monospace">reactants</text>
  <text x="252" y="132" fill="#5c646e" font-size="10" font-family="Menlo, monospace">products</text>
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
  const canvas = h('canvas', { width: 520, height: 340 });
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
    }
    requestAnimationFrame(frame);
  }
  frame();
  return { canvas, setRunning: v => { running = v; } };
}

export function buildHome(onEnter: (tabId: string) => void, onMenu: () => void): HTMLElement {
  const progress = h('div', { class: 'scroll-progress' });

  // ---- top bar ----
  const accountHolder = h('div', {});
  const topBar = h('div', { class: 'home-top' },
    h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>CCC Trainer</small>` }),
    h('div', { class: 'home-top-right' },
      h('button', { class: 'btn-ghost', onclick: onMenu }, 'All Topics'),
      accountHolder,
      h('button', { class: 'btn-ghost', onclick: () => onEnter('quantum') }, 'Open the app'),
    ),
  );
  mountHomepageAccountWidget(accountHolder);

  // ---- hero ----
  const sim = makeHeroSim();
  const hero = h('section', { class: 'hero' },
    h('div', {},
      h('p', { class: 'eyebrow hero-in' }, 'CCC · CCO · USNCO preparation'),
      h('h1', { class: 'hero-in', style: 'transition-delay:.06s', html: 'The chemistry in this page is <em>actually running</em>.' }),
      h('p', { class: 'lede hero-in', style: 'transition-delay:.12s' },
        'Eighteen interactive modules — quantum orbitals to enzyme kinetics — plus 650+ exam-style questions and the advanced CCO problem sets, every answer worked out. Built for olympiad preparation, not for slideshows.'),
      h('div', { class: 'cta hero-in', style: 'transition-delay:.18s' },
        h('button', { class: 'btn-hero', onclick: () => onEnter('quantum') }, 'Start learning'),
        h('button', {
          class: 'btn-ghost',
          onclick: () => document.querySelector('.topics')?.scrollIntoView({ behavior: 'smooth' }),
        }, 'Browse the modules'),
      ),
    ),
    h('div', { class: 'hero-in', style: 'transition-delay:.1s' },
      h('div', { class: 'figure' }, sim.canvas),
      h('p', { class: 'fig-cap', html: '<b>Fig. 1</b> — hydrogen (white) and oxygen (orange) finding each other, live. Valence rules only: H makes one bond, O makes two. Click "Particle Sandbox" for the full engine.' }),
    ),
  );

  // ---- stats strip ----
  const statDefs = [
    { n: 18, suffix: '', label: 'interactive modules' },
    { n: 65, suffix: '+', label: 'simulations & tools' },
    { n: 650, suffix: '+', label: 'practice questions' },
    { n: 90, suffix: '+', label: 'key equations' },
  ];
  const stats = h('section', { class: 'stats' },
    ...statDefs.map(s =>
      h('div', { class: 'stat reveal' },
        h('span', { class: 'stat-n', 'data-n': s.n, 'data-suffix': s.suffix }, '0'),
        h('span', { class: 'stat-label' }, s.label),
      )),
  );

  // ---- 01 · modules ----
  const topics = h('section', { class: 'topics' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '01'), h('h2', {}, 'The whole syllabus, module by module')),
    h('p', { class: 'section-lede reveal' },
      'Each module pairs hands-on simulations with the key equations and the traps examiners reuse, then tests you with a 25-question quiz — five warm-ups, twenty at contest level.'),
    h('div', { class: 'topic-grid' },
      ...TOPICS.map((t, i) =>
        h('article', {
          class: `topic-card reveal${t.wide ? ' span2' : ''}`,
          style: `transition-delay:${(i % 3) * 60}ms`,
          onclick: () => onEnter(t.id),
        },
          h('div', { class: 'topic-tag' }, t.tag),
          h('h3', {}, t.title),
          h('p', {}, t.blurb),
          h('span', { class: 'topic-open' }, 'Open module →'),
        )),
    ),
    h('div', { style: 'text-align:center;margin-top:30px' },
      h('button', { class: 'btn-ghost', onclick: onMenu }, 'Browse the full directory →'),
    ),
  );

  // ---- 02 · why it works ----
  const features = h('section', { class: 'features' },
    h('div', { class: 'sect-head reveal' }, h('span', { class: 'sect-no' }, '02'), h('h2', {}, 'Why it works')),
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

  // ---- 03 · footer ----
  const footer = h('section', { class: 'home-end' },
    h('h2', { class: 'reveal' }, 'Ready when you are.'),
    h('p', { class: 'reveal' }, 'No accounts, no installs — everything runs locally in this tab.'),
    h('button', { class: 'btn-hero reveal', onclick: () => onEnter('quantum') }, 'Enter ChemPrep'),
  );

  const root = h('div', { id: 'home' },
    progress,
    h('div', { class: 'home-wrap' }, topBar, hero, stats, topics, features, footer),
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

  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('.hero-in').forEach(el => el.classList.add('visible'));
    sim.setRunning(true);
  }));

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
