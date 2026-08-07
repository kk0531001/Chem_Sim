import './style.css';
import { initTabs, h, autoTypeset, type TabDef, type TabsAPI } from './tabs/framework';
import { buildHome, TILE_HTML } from './home';
import { buildMenuPage } from './menu';
import { initRouter, navigate, onRouteChange, parseRoute, routeToPath, type Route } from './router';
import { TOPICS, topicById, difficultyBadges } from './topics';
import { CLOCK_ICON, ARROW_ICON, topicIconSVG } from './icons';
import { initProgress, needsIdMigration, onProgressChange } from './progress';
import { recommendNext } from './recommend';
import { initSearch } from './search';
import { MODES, MODE_SHORT, MODE_LABEL, activeMode, setMode, onModeChange } from './mode';
import { mountSidebarAccountPanel } from './authWidget';
import { mountFeedback } from './feedback';
import { buildGuidePage } from './guide';
import { guideBySlug } from './guides';
import { viewTopic, reportQuizzes } from './signals';

/**
 * The sidebar, and the loader for each module behind it.
 *
 * Every tab is fetched on FIRST VISIT, not at startup. Statically importing all
 * 25 put the whole app — pixi.js and tweakpane for the one sandbox tab, KaTeX,
 * and every one of the 919 questions — into the entry bundle, so a reader who
 * only wanted the homepage downloaded 1.76 MB of chemistry they never opened.
 * Vite gives each `import()` below its own chunk for free.
 *
 * This table is the ONE place the sidebar's short labels live (the tab modules
 * export a bare `{ id, mount }`); the longer public names, blurbs and ordering
 * stay in topics.ts. Order here is the sidebar's, grouped by chemistry domain,
 * and must match that module's run in TOPICS.
 */
const LAZY: { id: string; label: string; group: string; load: () => Promise<{ default?: unknown } & Record<string, unknown>> }[] = [
  { id: 'sandbox', label: 'Sandbox', group: 'Playground', load: () => import('./tabs/sandbox') },
  // Foundations
  { id: 'quantum', label: 'Quantum', group: 'Foundations', load: () => import('./tabs/quantum') },
  { id: 'periodicity', label: 'Periodicity', group: 'Foundations', load: () => import('./tabs/periodicity') },
  { id: 'bonding', label: 'Bonding & MO', group: 'Foundations', load: () => import('./tabs/bonding') },
  { id: 'stoich', label: 'Stoichiometry', group: 'Foundations', load: () => import('./tabs/stoich') },
  // Physical Chemistry
  { id: 'thermo1', label: 'Thermo I', group: 'Physical Chemistry', load: () => import('./tabs/thermo1') },
  { id: 'thermo2', label: 'Thermo II', group: 'Physical Chemistry', load: () => import('./tabs/thermo2') },
  { id: 'gases', label: 'Gases & Phases', group: 'Physical Chemistry', load: () => import('./tabs/gases') },
  { id: 'equilibrium', label: 'Equilibrium', group: 'Physical Chemistry', load: () => import('./tabs/equilibrium') },
  { id: 'aek', label: 'Acids · Redox · Kinetics', group: 'Physical Chemistry', load: () => import('./tabs/aek') },
  { id: 'physchem', label: 'Advanced Physical', group: 'Physical Chemistry', load: () => import('./tabs/physchem') },
  { id: 'biophys', label: 'Physical & Biochem', group: 'Physical Chemistry', load: () => import('./tabs/biophys') },
  // Organic Chemistry
  { id: 'organic1', label: 'Organic I', group: 'Organic Chemistry', load: () => import('./tabs/organic1') },
  { id: 'organic2', label: 'Organic II', group: 'Organic Chemistry', load: () => import('./tabs/organic2') },
  { id: 'organic3', label: 'Organic III — Synthesis', group: 'Organic Chemistry', load: () => import('./tabs/organic3') },
  { id: 'polymers', label: 'Polymers', group: 'Organic Chemistry', load: () => import('./tabs/polymers') },
  // Inorganic Chemistry
  { id: 'nuclear', label: 'Nuclear & Coord.', group: 'Inorganic Chemistry', load: () => import('./tabs/nuclear') },
  { id: 'coordchem', label: 'Coordination & Organometallic', group: 'Inorganic Chemistry', load: () => import('./tabs/coordchem') },
  { id: 'advinorganic', label: 'Advanced Inorganic', group: 'Inorganic Chemistry', load: () => import('./tabs/advinorganic') },
  // Laboratory Skills
  { id: 'labdata', label: 'Lab & Data', group: 'Laboratory Skills', load: () => import('./tabs/labdata') },
  { id: 'labtech', label: 'Lab Techniques', group: 'Laboratory Skills', load: () => import('./tabs/labtech') },
  { id: 'analytical', label: 'Analytical & Quant.', group: 'Laboratory Skills', load: () => import('./tabs/analytical') },
  // Spectroscopy
  { id: 'spectroscopy', label: 'Spectroscopy & Synthesis', group: 'Spectroscopy', load: () => import('./tabs/spectroscopy') },
  { id: 'structure', label: 'Structure Determination', group: 'Spectroscopy', load: () => import('./tabs/structure') },
  // Practice
  { id: 'qbank', label: 'Question Bank', group: 'Practice', load: () => import('./tabs/qbank') },
];

// Each tab module exports exactly one TabDef; find it by shape rather than by
// name, so a module's export can be renamed without breaking the loader.
const DEFS: TabDef[] = LAZY.map(({ id, label, group, load }) => ({
  id, label, group,
  mount: root => load().then(mod => {
    const def = Object.values(mod).find(
      (v): v is TabDef => !!v && typeof v === 'object' && typeof (v as TabDef).mount === 'function',
    );
    if (!def) throw new Error(`tab module "${id}" exports no TabDef`);
    return def.mount(root);
  }),
}));
const VALID_IDS = new Set(DEFS.map(d => d.id));

const appEl = document.getElementById('app')!;
const mainEl = document.getElementById('app-main')!;
const navEl = document.getElementById('nav-items')!;
const viewEl = document.getElementById('view')!;
const brandEl = document.getElementById('brand')!;
const homeLinkEl = document.getElementById('home-link')!;
const menuLinkEl = document.getElementById('menu-link')!;
const searchLinkEl = document.getElementById('search-link')!;
const modePickerEl = document.getElementById('mode-picker')!;
const progressLinkEl = document.getElementById('progress-link')!;
const crumbEl = document.getElementById('topic-crumb')!;
const prereqEl = document.getElementById('topic-prereq')!;
const footerEl = document.getElementById('topic-footer')!;
const notFoundEl = document.createElement('div');
notFoundEl.id = 'notfound';
notFoundEl.hidden = true;
mainEl.insertBefore(notFoundEl, footerEl);

brandEl.innerHTML = `${TILE_HTML}<span><b>ChemPrep</b><small>CCC Trainer</small></span>`;

// ---- mobile drawer ---------------------------------------------------------
// Under 900px the sidebar slides in over the lesson. Deliberately NOT a focus
// trap: the order is a nav drawer, not a modal dialog, and a trap here would
// mean building (and getting wrong) escape handling that the browser already
// gives us for free. What it does owe the user is that focus goes somewhere
// useful on open and comes back to the button on close.
const navToggleEl = document.getElementById('nav-toggle') as HTMLButtonElement;
const navBackdropEl = document.getElementById('nav-backdrop')!;
const sidenavEl = document.getElementById('sidenav')!;

function setDrawer(open: boolean): void {
  appEl.classList.toggle('nav-open', open);
  navToggleEl.setAttribute('aria-expanded', String(open));
  navBackdropEl.hidden = !open;
  if (open) sidenavEl.querySelector<HTMLElement>('#menu-link')?.focus();
  else if (sidenavEl.contains(document.activeElement)) navToggleEl.focus();
}
const closeDrawer = () => { if (appEl.classList.contains('nav-open')) setDrawer(false); };

navToggleEl.addEventListener('click', () => setDrawer(!appEl.classList.contains('nav-open')));
navBackdropEl.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
// Resizing past the breakpoint leaves the drawer class stranded on a layout
// that no longer uses it. The CSS makes that harmless to look at — every drawer
// rule lives inside the max-width query — but aria-expanded="true" on a
// display:none control is a lie, and shrinking back would reveal an open drawer
// nobody asked for.
//
// The MediaQueryList is kept in a module-level const rather than created inline:
// an unreferenced MQL is a documented garbage-collection hazard in some engines,
// where the listener stops firing once the object is collected.
//
// NOT VERIFIED IN THE PREVIEW PANE: its viewport override changes the metrics
// without dispatching `resize` or matchMedia `change` (both probed, both zero),
// so this handler cannot be exercised there. `matches` does flip correctly, so
// the query itself is live. Check this one by dragging a real browser window.
const desktopMQ = window.matchMedia('(min-width: 901px)');
desktopMQ.addEventListener('change', e => { if (e.matches) closeDrawer(); });

let tabs: TabsAPI | null = null;

const home = buildHome(id => navigate({ kind: 'topic', id }), () => navigate({ kind: 'menu' }));
document.body.prepend(home);

const menuPage = buildMenuPage(
  id => navigate({ kind: 'topic', id }),
  () => navigate({ kind: 'home' }),
  slug => navigate({ kind: 'guide', slug }),
);
menuPage.hidden = true;
document.body.appendChild(menuPage);

// I.3 competition landing pages. Built on first visit, not at startup: they are
// entry points from search, so a reader who arrives anywhere else should not pay
// for two of them. One element per guide, kept once built — the same pattern as
// the progress dashboard above.
const guidePages = new Map<string, HTMLElement>();
function showGuide(slug: string): void {
  for (const [s, el] of guidePages) el.hidden = s !== slug;
  if (guidePages.has(slug)) return;
  const guide = guideBySlug(slug);
  if (!guide) return;
  const el = buildGuidePage(
    guide,
    id => navigate({ kind: 'topic', id }),
    () => navigate({ kind: 'home' }),
    () => navigate({ kind: 'menu' }),
  );
  guidePages.set(slug, el);
  document.body.appendChild(el);
}

// The dashboard reads the whole corpus (to count what a topic contains and to
// name the questions in the history list), so it is loaded on FIRST VISIT to
// /progress rather than statically — the same rule that keeps the homepage off
// the question banks. Built once and then kept: it re-renders itself from the
// progress store, so there is nothing to rebuild on a second visit.
let progressPage: HTMLElement | null = null;
let progressLoading = false;
function showProgressPage(): void {
  if (progressPage) { progressPage.hidden = false; return; }
  if (progressLoading) return;
  progressLoading = true;
  void import('./progressPage').then(m => {
    progressPage = m.buildProgressPage();
    // A slow import can land after the user has already navigated on; only
    // reveal it if /progress is still the route being shown.
    progressPage.hidden = parseRoute(location.pathname).kind !== 'progress';
    document.body.appendChild(progressPage);
    autoTypeset(progressPage);
  }).finally(() => { progressLoading = false; });
}

function updateTopicChrome(tabId: string): void {
  const idx = TOPICS.findIndex(t => t.id === tabId);
  const topic = TOPICS[idx];
  crumbEl.replaceChildren();
  prereqEl.replaceChildren();
  footerEl.replaceChildren();
  if (!topic) return;

  // Breadcrumb as a labelled landmark wrapping an ordered list — the trail is a
  // sequence, and aria-current="page" marks where you actually are. The "/"
  // separators are gone from the DOM (CSS draws them now) so they aren't read
  // out. The time/difficulty meta sits OUTSIDE the nav: it describes the topic,
  // it isn't a step in the trail.
  crumbEl.append(
    h('nav', { class: 'crumb-nav', 'aria-label': 'Breadcrumb' },
      h('ol', { class: 'crumb-list' },
        h('li', {}, h('button', { type: 'button', class: 'crumb-link', onclick: () => navigate({ kind: 'home' }) }, 'Home')),
        h('li', {}, h('button', { type: 'button', class: 'crumb-link', onclick: () => navigate({ kind: 'menu' }) }, topic.group)),
        h('li', {}, h('span', { class: 'crumb-current', 'aria-current': 'page' }, topic.title)),
      ),
    ),
    h('span', { class: 'crumb-meta' },
      h('span', { class: 'meta-time', html: CLOCK_ICON }, ` ${topic.estMinutes} min`),
      ...difficultyBadges(topic.difficulty),
    ),
  );

  // prerequisites (only shown when the topic has any)
  const prereqs = topic.prereqs.map(id => topicById(id)).filter((t): t is NonNullable<typeof t> => !!t);
  if (prereqs.length) {
    prereqEl.append(
      h('span', { class: 'prereq-label' }, 'Recommended first:'),
      ...prereqs.map(p => h('button', {
        type: 'button', class: 'prereq-chip',
        'aria-label': `Recommended first: ${p.title}`,
        onclick: () => navigate({ kind: 'topic', id: p.id }),
      }, p.title)),
    );
  }

  // previous (plain link) + next lesson (rich recommendation card)
  //
  // "Previous" stays strictly linear — it means "the module before this one",
  // and a back-link that moved around would break the one navigation people
  // expect to be dumb. "Next" is a RECOMMENDATION (F.3) and says why.
  const prev = TOPICS[idx - 1];
  const rec = recommendNext(tabId);
  const next = rec?.topic;
  footerEl.append(
    prev
      ? h('button', {
          type: 'button', class: 'topic-prev-btn',
          // the "←" would be read as a bare arrow glyph, and "Chemical
          // Equilibrium" alone doesn't say which direction it goes
          'aria-label': `Previous lesson: ${prev.title}`,
          onclick: () => navigate({ kind: 'topic', id: prev.id }),
        }, `← ${prev.title}`)
      : h('span', {}),
    next
      ? h('button', {
          type: 'button', class: 'next-lesson-card',
          // collapses the card's icon + label + title + time + badges into one
          // spoken name; the detail is still on screen
          // The reason rides in the accessible name too — it is the difference
          // between advice and an unexplained jump, and a screen-reader user
          // needs it at least as much as a sighted one.
          'aria-label': `Next lesson: ${next.title}, ${next.estMinutes} min — ${rec!.reason}`,
          onclick: () => navigate({ kind: 'topic', id: next.id }),
        },
          h('span', { class: 'next-lesson-icon', html: topicIconSVG(next.icon) }),
          h('span', { class: 'next-lesson-body' },
            h('span', { class: 'next-lesson-label' }, 'Next lesson'),
            h('span', { class: 'next-lesson-title' }, next.title),
            h('span', { class: 'next-lesson-why' }, rec!.reason),
            h('span', { class: 'next-lesson-meta' },
              h('span', { class: 'meta-time', html: CLOCK_ICON }, ` ${next.estMinutes} min`),
              ...difficultyBadges(next.difficulty),
            ),
          ),
          h('span', { class: 'next-lesson-arrow', html: ARROW_ICON }),
        )
      : h('span', {}),
  );
}

const BASE_TITLE = 'ChemPrep — Chemistry Olympiad Trainer';

// Which topic we were last on, so a navigation can be told apart from a reload
// or a resume (focus should move on the former only).
let lastTopicId: string | null = null;

function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const nextDiagonal = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = nextDiagonal;
    }
  }
  return previous[b.length];
}

function nearestTopics(path: string): typeof TOPICS {
  const query = path.replace(/^\/topic\//i, '').toLowerCase();
  return [...TOPICS]
    .map(topic => ({
      topic,
      score: Math.min(...[topic.slug, ...(topic.aliases ?? []), topic.title].map(name => levenshtein(query, name.toLowerCase()))),
    }))
    .sort((a, b) => a.score - b.score || a.topic.title.localeCompare(b.topic.title))
    .slice(0, 3)
    .map(({ topic }) => topic);
}

function renderNotFound(path: string): void {
  crumbEl.replaceChildren();
  prereqEl.replaceChildren();
  footerEl.replaceChildren();
  notFoundEl.replaceChildren();

  const requestedPath = document.createElement('code');
  requestedPath.className = 'notfound-path';
  requestedPath.textContent = path;
  const suggestions = nearestTopics(path);
  notFoundEl.append(
    h('section', { class: 'notfound-view', 'aria-labelledby': 'notfound-heading' },
      h('p', { class: 'notfound-kicker' }, '404'),
      h('h1', { id: 'notfound-heading' }, 'No topic at this URL'),
      h('p', { class: 'notfound-copy' }, 'We could not find ', requestedPath, '.'),
      suggestions.length
        ? h('div', { class: 'notfound-suggestions' },
            h('h2', {}, 'Closest topics'),
            ...suggestions.map(topic => h('button', {
              type: 'button', class: 'notfound-topic', onclick: () => navigate({ kind: 'topic', id: topic.id }),
            }, topic.title)),
          )
        : null,
      h('div', { class: 'notfound-actions' },
        h('button', { type: 'button', class: 'notfound-primary', onclick: () => navigate({ kind: 'menu' }) }, 'Browse all topics'),
        h('button', { type: 'button', class: 'notfound-secondary', onclick: () => navigate({ kind: 'home' }) }, 'Back to homepage'),
      ),
    ),
  );
}

function showRoute(route: Route): void {
  // I.2 measurement, before any of the rendering: a topic's dwell row is
  // written when the topic is LEFT, so every exit path — another module, the
  // menu, the homepage, a 404 — has to pass through one place, and this is it.
  const topicNow = route.kind === 'topic' && VALID_IDS.has(route.id) ? route.id : null;
  if (topicNow !== lastTopicId) reportQuizzes();
  viewTopic(topicNow);

  home.hidden = route.kind !== 'home';
  menuPage.hidden = route.kind !== 'menu';
  if (route.kind === 'guide') showGuide(route.slug);
  else for (const el of guidePages.values()) el.hidden = true;
  notFoundEl.hidden = route.kind !== 'notfound';
  viewEl.hidden = route.kind === 'notfound';
  if (route.kind === 'progress') showProgressPage();
  else if (progressPage) progressPage.hidden = true;

  if (route.kind === 'notfound') {
    appEl.hidden = false;
    tabs?.suspend();
    renderNotFound(route.path);
    lastTopicId = null;
    document.title = 'Not found — ChemPrep';
    return;
  }
  if (route.kind !== 'topic') {
    appEl.hidden = true;
    tabs?.suspend();
    lastTopicId = null;
    document.title = route.kind === 'menu' ? 'All Topics — ChemPrep'
      : route.kind === 'progress' ? 'Your Progress — ChemPrep'
      : route.kind === 'guide' ? `${guideBySlug(route.slug)?.title ?? 'Study guide'} — ChemPrep`
      : BASE_TITLE;
    return;
  }
  if (!VALID_IDS.has(route.id)) {
    appEl.hidden = false;
    tabs?.suspend();
    notFoundEl.hidden = false;
    viewEl.hidden = true;
    renderNotFound(location.pathname);
    lastTopicId = null;
    document.title = 'Not found — ChemPrep';
    return;
  }
  appEl.hidden = false;
  // Selecting a module from the drawer must close it, or the lesson you just
  // chose is hidden behind the thing you chose it from.
  if (!tabs) tabs = initTabs(DEFS, navEl, viewEl, id => { closeDrawer(); navigate({ kind: 'topic', id }); });
  if (tabs.current() === route.id) tabs.resume();
  else tabs.show(route.id);
  updateTopicChrome(route.id);

  // On a real page change in a JS-routed app nothing tells a screen reader that
  // the content was replaced — the URL changes and the DOM swaps silently. Two
  // fixes, both standard: rename the document, and move focus to the top of
  // <main> so the next thing read is the new breadcrumb and lesson rather than
  // wherever the old page's focus happened to be.
  const topic = topicById(route.id);
  const canonicalPath = routeToPath(route);
  // The search string is CARRIED, not dropped: a tab can be handed a prepared
  // view through it (the dashboard opens qbank on a filtered results page), and
  // that tab reads location.search when it mounts — which happens after this,
  // because tabs load lazily.
  if (location.pathname !== canonicalPath) history.replaceState({}, '', canonicalPath + location.search);
  document.title = topic ? `${topic.title} — ChemPrep` : BASE_TITLE;
  if (lastTopicId && lastTopicId !== route.id) mainEl.focus({ preventScroll: true });
  lastTopicId = route.id;
}

onRouteChange(showRoute);
showRoute(initRouter());

// The next-lesson card is DERIVED from progress (F.3), so it must not go stale
// while the student answers the quiz underneath it — finishing a module should
// change what comes next, immediately. Registered once, not per navigation:
// onProgressChange has no unsubscribe.
//
// Skipped while the footer holds focus. Rebuilding it would drop the keyboard
// user out of the control they are on, and a recommendation that updates one
// answer later is a much smaller problem than that.
onProgressChange(() => {
  if (!lastTopicId) return;
  if (footerEl.contains(document.activeElement)) return;
  updateTopicChrome(lastTopicId);
});

brandEl.addEventListener('click', () => navigate({ kind: 'home' }));
homeLinkEl.addEventListener('click', () => navigate({ kind: 'home' }));
menuLinkEl.addEventListener('click', () => navigate({ kind: 'menu' }));
progressLinkEl.addEventListener('click', () => { closeDrawer(); navigate({ kind: 'progress' }); });

// Search is global: the overlay binds `/` and Cmd/Ctrl-K on the document, so it
// works from the homepage and the menu too, not just inside the app shell.
const search = initSearch();
searchLinkEl.addEventListener('click', () => { closeDrawer(); search.open(); });

// ---- competition mode (Phase G) ----
//
// A row of radio-behaving buttons rather than a <select>: there are five, they
// are the site's primary framing, and a picker you can see the state of at a
// glance is worth the extra 40px in a sidebar this tall.
{
  const btns = MODES.map(m => {
    const b = h('button', {
      type: 'button', class: 'mode-btn', title: MODE_LABEL[m],
      onclick: () => setMode(m),
    }, MODE_SHORT[m]);
    return [m, b] as const;
  });
  modePickerEl.append(
    h('span', { class: 'mode-label' }, 'Preparing for'),
    h('div', { class: 'mode-btns' }, ...btns.map(([, b]) => b)),
  );
  const sync = (): void => {
    for (const [m, b] of btns) {
      const on = m === activeMode();
      b.classList.toggle('active', on);
      // aria-pressed, not aria-checked: these are toggle buttons in a group,
      // not a native radio set, and pressed is what a button can honestly claim.
      b.setAttribute('aria-pressed', String(on));
    }
  };
  sync();
  onModeChange(sync);
  // The mode changes what the footer recommends and what the cards are marked
  // with, so a switch has to repaint the page you are already on.
  onModeChange(() => { if (lastTopicId) updateTopicChrome(lastTopicId); });
}

// ---- LaTeX / mhchem typesetting (KaTeX) across app view, home, and menu ----
autoTypeset(viewEl, home, menuPage);

// ---- progress / account panel ----
mountSidebarAccountPanel(document.getElementById('progress-panel')!);
// I.2: a way to report a wrong answer or a broken sim, on every page of the app.
mountFeedback(homeLinkEl);
// The id migration has to run AFTER initProgress: it rewrites the stored keys,
// so the local set (and the remote merge, when signed in) must be loaded first.
// It is also the only startup work that needs the whole question corpus, and it
// runs at most once per browser — so check its flag before paying for the
// import. A first-time visitor never fetches the registry here at all.
void initProgress().then(() => {
  if (!needsIdMigration()) return;
  return import('./content/registry').then(m => m.migrateLegacyProgress());
});

// Content sanity checks — a duplicated question id silently makes two questions
// share one progress record, and an out-of-range answer index makes a question
// unanswerable. Both are invisible at runtime, so surface them in dev.
if (import.meta.env.DEV) {
  void import('./content/registry').then(({ auditCorpus, auditTopicPages, corpusBreakdown, CORPUS_COUNTS }) => {
    const problems = auditCorpus();
    if (problems.length) console.error(`[content audit] ${problems.length} problem(s)`, problems.slice(0, 20));
    else console.info(`[content audit] clean — ${CORPUS_COUNTS.mc} MC + ${CORPUS_COUNTS.frq} written, all ids unique`);
    console.info('[corpus]', corpusBreakdown());

    // The page contract (D.4). Missions and reset buttons can't be seen from
    // here — they exist only once a tab mounts — so topicPage() checks those
    // itself and reports under the same [page contract] prefix.
    const page = auditTopicPages();
    if (page.problems.length) console.error(`[page contract] ${page.problems.length} problem(s)`, page.problems);
    else console.info(`[page contract] clean — every module has an intro, references, a 25-question quiz and misconception coverage`);
    console.info(`[page contract] ${page.misconceptions} misconception boxes across the module quizzes`);
  });

  const topicProblems: string[] = [];
  const owners = new Map<string, string>();
  for (const topic of TOPICS) {
    if (!topic.slug) topicProblems.push(`${topic.id} has no slug`);
    if (topic.slug === 'menu') topicProblems.push(`${topic.id} uses reserved slug "menu"`);
    if (topic.slug !== topic.id && !topic.aliases?.includes(topic.id)) {
      topicProblems.push(`${topic.id} is not reachable at its bare id`);
    }
    for (const name of [topic.slug, ...(topic.aliases ?? [])]) {
      const owner = owners.get(name);
      if (owner && owner !== topic.id) topicProblems.push(`${name} is claimed by ${owner} and ${topic.id}`);
      else owners.set(name, topic.id);
    }
  }
  if (topicProblems.length) console.error(`[topic audit] ${topicProblems.length} problem(s)`, topicProblems);
  else console.info(`[topic audit] clean — ${TOPICS.length} topics have unique route names`);
}
