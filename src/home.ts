// Landing page: hero, animated stats, topic grid, feature rows.
// Scroll animations via IntersectionObserver + CSS classes.
import { h } from './tabs/framework';

interface Topic { id: string; title: string; blurb: string; tag: string }

const TOPICS: Topic[] = [
  { id: 'sandbox', title: 'Particle Sandbox', tag: 'Playground', blurb: 'Spawn atoms and watch molecules self-assemble by valence rules. Heat the box until they shake apart.' },
  { id: 'quantum', title: 'Quantum & Atomic Structure', tag: 'Foundations', blurb: 'Real hydrogen orbitals, radial distributions, spectral series, and an electron-configuration builder.' },
  { id: 'bonding', title: 'Bonding, VSEPR & MO Theory', tag: 'Foundations', blurb: 'Every VSEPR shape with lone-pair sketches, plus MO diagrams that explain why O₂ is magnetic.' },
  { id: 'stoich', title: 'Stoichiometry & Solutions', tag: 'Foundations', blurb: 'Limiting reagents you can see, molarity and dilution tools, and the empirical-formula recipe.' },
  { id: 'thermo1', title: 'Thermodynamics I', tag: 'Physical', blurb: 'Calorimetry mixing, Hess\'s law cycles, and estimating ΔH from bond enthalpies.' },
  { id: 'thermo2', title: 'Thermodynamics II', tag: 'Physical', blurb: 'Entropy as microstate counting, the ΔG = ΔH − TΔS spontaneity map, and the ΔG° ↔ K converter.' },
  { id: 'equilibrium', title: 'Chemical Equilibrium', tag: 'Physical', blurb: 'A live N₂O₄ ⇌ 2NO₂ system you can shove around, an ICE solver, and the full Ksp toolkit.' },
  { id: 'aek', title: 'Acids, Redox & Kinetics', tag: 'Physical', blurb: 'Titration curves with a working buret, buffer design, galvanic cells, and integrated rate laws.' },
  { id: 'gases', title: 'Gases, IMFs & Phases', tag: 'Physical', blurb: 'A kinetic gas box, Maxwell–Boltzmann curves, draggable phase diagrams, Clausius–Clapeyron.' },
  { id: 'nuclear', title: 'Nuclear & Coordination', tag: 'Inorganic', blurb: 'Truly random decay against the exponential law, carbon dating, and crystal-field color prediction.' },
  { id: 'organic1', title: 'Organic I — Mechanisms', tag: 'Organic', blurb: 'The SN1 / SN2 / E1 / E2 decision engine, the pKa ladder, and carbocation stability.' },
  { id: 'organic2', title: 'Organic II & Symmetry', tag: 'Organic', blurb: 'Markovnikov predictions, EAS directing effects, the carbonyl map, and point groups.' },
  { id: 'qbank', title: 'Exam Question Bank', tag: 'Practice', blurb: 'Original exam-style practice organized like the real thing: Part I multiple choice, Part II free response with worked solutions, Part III lab practicals.' },
];

const MOLECULE_SVG = `
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="molecule">
  <g class="mol-spin">
    <polygon points="150,70 219,110 219,190 150,230 81,190 81,110" fill="none" stroke="currentColor" stroke-width="2" opacity="0.7"/>
    <circle cx="150" cy="150" r="52" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.45"/>
    <ellipse cx="150" cy="150" rx="118" ry="46" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" transform="rotate(24 150 150)"/>
    <ellipse cx="150" cy="150" rx="118" ry="46" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" transform="rotate(-24 150 150)"/>
    <circle cx="150" cy="70" r="7" fill="currentColor"/>
    <circle cx="219" cy="110" r="5" fill="currentColor" opacity="0.8"/>
    <circle cx="219" cy="190" r="7" fill="currentColor"/>
    <circle cx="150" cy="230" r="5" fill="currentColor" opacity="0.8"/>
    <circle cx="81" cy="190" r="7" fill="currentColor"/>
    <circle cx="81" cy="110" r="5" fill="currentColor" opacity="0.8"/>
    <circle cx="150" cy="150" r="9" fill="currentColor"/>
  </g>
</svg>`;

export const MARK_SVG = `
<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" class="mark">
  <polygon points="12,3 19.8,7.5 19.8,16.5 12,21 4.2,16.5 4.2,7.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>`;

export function buildHome(onEnter: (tabId: string) => void): HTMLElement {
  const progress = h('div', { class: 'scroll-progress' });

  // ---- hero ----
  const heroArt = h('div', { class: 'hero-art', html: MOLECULE_SVG });
  const hero = h('section', { class: 'hero' },
    heroArt,
    h('div', { class: 'hero-inner' },
      h('p', { class: 'eyebrow hero-in', style: 'transition-delay:.05s' }, 'CCC · CCO · USNCO preparation'),
      h('h1', { class: 'hero-in', style: 'transition-delay:.15s' }, 'Chemistry, running live in your browser.'),
      h('p', { class: 'lede hero-in', style: 'transition-delay:.28s' },
        'Twelve interactive modules — from quantum orbitals to organic mechanisms — with live simulations, worked calculators, and 450+ exam-style practice questions that explain every answer.'),
      h('div', { class: 'cta hero-in', style: 'transition-delay:.4s' },
        h('button', { class: 'btn-hero', onclick: () => onEnter('quantum') }, 'Start learning'),
        h('button', {
          class: 'btn-ghost', onclick: () => {
            document.querySelector('.topics')?.scrollIntoView({ behavior: 'smooth' });
          },
        }, 'Browse the modules'),
      ),
    ),
  );

  // ---- stats ----
  const statDefs = [
    { n: 12, suffix: '', label: 'topic modules' },
    { n: 40, suffix: '+', label: 'interactive tools' },
    { n: 450, suffix: '+', label: 'practice questions' },
    { n: 60, suffix: '+', label: 'key equations' },
  ];
  const statEls = statDefs.map(s =>
    h('div', { class: 'stat reveal' },
      h('div', { class: 'stat-n', 'data-n': s.n, 'data-suffix': s.suffix }, '0'),
      h('div', { class: 'stat-label' }, s.label),
    ));
  const stats = h('section', { class: 'stats' }, ...statEls);

  // ---- topic grid ----
  const grid = h('div', { class: 'topic-grid' },
    ...TOPICS.map((t, i) =>
      h('article', {
        class: 'topic-card reveal',
        style: `transition-delay:${(i % 3) * 90}ms`,
        onclick: () => onEnter(t.id),
      },
        h('div', { class: 'topic-tag' }, t.tag),
        h('h3', {}, t.title),
        h('p', {}, t.blurb),
        h('span', { class: 'topic-open' }, 'Open module'),
      )),
  );
  const topics = h('section', { class: 'topics' },
    h('h2', { class: 'reveal' }, 'Twelve modules. The whole syllabus.'),
    h('p', { class: 'section-lede reveal' }, 'Each module pairs hands-on simulations with a theory panel of key equations and known exam traps, then tests you with a 25-question quiz — five warm-ups, twenty at contest level.'),
    grid,
  );

  // ---- feature rows ----
  const features = h('section', { class: 'features' },
    featureRow('left', 'Simulations, not flashcards',
      'The equilibrium tab is a real kinetic system — add reactant, compress the vessel, or heat it, and watch it chase K back down. Gases push on their walls. Nuclei decay at random and still trace the exponential law. You learn the behavior, not the sentence about the behavior.',
      'See the live equilibrium', () => onEnter('equilibrium')),
    featureRow('right', 'Quizzes that teach',
      'Every topic has five warm-up questions to check the basics, then twenty contest-style problems built around the classic traps. Every answer — right or wrong — comes with the full reasoning, so a miss becomes a lesson instead of a lost mark.',
      'Try the mechanisms quiz', () => onEnter('organic1')),
    featureRow('left', 'The exam traps, catalogued',
      'The wet Erlenmeyer flask that changes nothing. The (2x)² in the ICE table. Losing 4s before 3d. Chlorine\'s electron affinity beating fluorine\'s. The traps olympiad setters reuse every year are marked in every theory panel and drilled in every quiz.',
      'Open Lab & Data', () => onEnter('labdata')),
  );

  // ---- footer CTA ----
  const footer = h('section', { class: 'home-end' },
    h('h2', { class: 'reveal' }, 'Ready when you are.'),
    h('p', { class: 'reveal' }, 'No accounts, no installs — everything runs locally in this tab.'),
    h('button', { class: 'btn-hero reveal', onclick: () => onEnter('quantum') }, 'Enter ChemPrep'),
  );

  const root = h('div', { id: 'home' }, progress, hero, stats, topics, features, footer);

  // ---- scroll behaviors ----
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('visible');
      const num = e.target.querySelector<HTMLElement>('.stat-n');
      if (num && !num.dataset.done) { num.dataset.done = '1'; countUp(num); }
      io.unobserve(e.target);
    }
  }, { threshold: 0.18 });
  root.querySelectorAll('.reveal, .feature').forEach(el => io.observe(el));

  let ticking = false;
  root.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - root.clientHeight;
      progress.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
      heroArt.style.transform = `translateY(${root.scrollTop * 0.3}px)`;
      ticking = false;
    });
  });

  // hero entrance
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('.hero-in').forEach(el => el.classList.add('visible'));
  }));

  return root;
}

function featureRow(side: 'left' | 'right', title: string, body: string, cta: string, go: () => void): HTMLElement {
  return h('div', { class: `feature ${side}` },
    h('div', { class: 'feature-text' },
      h('h3', {}, title),
      h('p', {}, body),
      h('button', { class: 'btn-ghost', onclick: go }, cta),
    ),
    h('div', { class: 'feature-visual', html: MOLECULE_SVG }),
  );
}

function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.n);
  const suffix = el.dataset.suffix ?? '';
  const t0 = performance.now();
  const dur = 1100;
  const tick = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
