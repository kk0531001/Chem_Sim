import './style.css';
import { initTabs, h, autoTypeset, type TabsAPI } from './tabs/framework';
import { buildHome, TILE_HTML } from './home';
import { buildMenuPage } from './menu';
import { initRouter, navigate, onRouteChange, type Route } from './router';
import { TOPICS, topicById, difficultyBadges } from './topics';
import { CLOCK_ICON, ARROW_ICON, topicIconSVG } from './icons';
import { sandboxTab } from './tabs/sandbox';
import { quantumTab } from './tabs/quantum';
import { bondingTab } from './tabs/bonding';
import { stoichTab } from './tabs/stoich';
import { periodicityTab } from './tabs/periodicity';
import { polymersTab } from './tabs/polymers';
import { thermo1Tab } from './tabs/thermo1';
import { thermo2Tab } from './tabs/thermo2';
import { equilibriumTab } from './tabs/equilibrium';
import { aekTab } from './tabs/aek';
import { gasesTab } from './tabs/gases';
import { nuclearTab } from './tabs/nuclear';
import { organic1Tab } from './tabs/organic1';
import { organic2Tab } from './tabs/organic2';
import { organic3Tab } from './tabs/organic3';
import { labdataTab } from './tabs/labdata';
import { labTechTab } from './tabs/labtech';
import { analyticalTab } from './tabs/analytical';
import { spectroscopyTab } from './tabs/spectroscopy';
import { structureTab } from './tabs/structure';
import { advInorganicTab } from './tabs/advinorganic';
import { coordChemTab } from './tabs/coordchem';
import { physChemTab } from './tabs/physchem';
import { biophysTab } from './tabs/biophys';
import { qbankTab } from './tabs/qbank';
import { initProgress } from './progress';
import { auditCorpus, migrateLegacyProgress, CORPUS_COUNTS } from './content/registry';
import { mountSidebarAccountPanel } from './authWidget';

const DEFS = [
  sandboxTab,
  // Foundations
  quantumTab, periodicityTab, bondingTab, stoichTab,
  // Physical Chemistry
  thermo1Tab, thermo2Tab, gasesTab, equilibriumTab, aekTab, physChemTab, biophysTab,
  // Organic Chemistry
  organic1Tab, organic2Tab, organic3Tab, polymersTab,
  // Inorganic Chemistry
  nuclearTab, coordChemTab, advInorganicTab,
  // Laboratory Skills
  labdataTab, labTechTab, analyticalTab,
  // Spectroscopy
  spectroscopyTab, structureTab,
  // Practice
  qbankTab,
];
const VALID_IDS = new Set(DEFS.map(d => d.id));

const appEl = document.getElementById('app')!;
const mainEl = document.getElementById('app-main')!;
const navEl = document.getElementById('nav-items')!;
const viewEl = document.getElementById('view')!;
const brandEl = document.getElementById('brand')!;
const homeLinkEl = document.getElementById('home-link')!;
const menuLinkEl = document.getElementById('menu-link')!;
const crumbEl = document.getElementById('topic-crumb')!;
const prereqEl = document.getElementById('topic-prereq')!;
const footerEl = document.getElementById('topic-footer')!;

brandEl.innerHTML = `${TILE_HTML}<span><b>ChemPrep</b><small>CCC Trainer</small></span>`;

let tabs: TabsAPI | null = null;

const home = buildHome(id => navigate({ kind: 'topic', id }), () => navigate({ kind: 'menu' }));
document.body.prepend(home);

const menuPage = buildMenuPage(id => navigate({ kind: 'topic', id }), () => navigate({ kind: 'home' }));
menuPage.hidden = true;
document.body.appendChild(menuPage);

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
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
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
          'aria-label': `Next lesson: ${next.title}, ${next.estMinutes} min`,
          onclick: () => navigate({ kind: 'topic', id: next.id }),
        },
          h('span', { class: 'next-lesson-icon', html: topicIconSVG(next.icon) }),
          h('span', { class: 'next-lesson-body' },
            h('span', { class: 'next-lesson-label' }, 'Next lesson'),
            h('span', { class: 'next-lesson-title' }, next.title),
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

function showRoute(route: Route): void {
  home.hidden = route.kind !== 'home';
  menuPage.hidden = route.kind !== 'menu';

  if (route.kind !== 'topic') {
    appEl.hidden = true;
    tabs?.suspend();
    lastTopicId = null;
    document.title = route.kind === 'menu' ? `All Topics — ChemPrep` : BASE_TITLE;
    return;
  }
  if (!VALID_IDS.has(route.id)) { navigate({ kind: 'home' }, true); return; }
  appEl.hidden = false;
  if (!tabs) tabs = initTabs(DEFS, navEl, viewEl, id => navigate({ kind: 'topic', id }));
  if (tabs.current() === route.id) tabs.resume();
  else tabs.show(route.id);
  updateTopicChrome(route.id);

  // On a real page change in a JS-routed app nothing tells a screen reader that
  // the content was replaced — the URL changes and the DOM swaps silently. Two
  // fixes, both standard: rename the document, and move focus to the top of
  // <main> so the next thing read is the new breadcrumb and lesson rather than
  // wherever the old page's focus happened to be.
  const topic = topicById(route.id);
  document.title = topic ? `${topic.title} — ChemPrep` : BASE_TITLE;
  if (lastTopicId && lastTopicId !== route.id) mainEl.focus({ preventScroll: true });
  lastTopicId = route.id;
}

onRouteChange(showRoute);
showRoute(initRouter());

brandEl.addEventListener('click', () => navigate({ kind: 'home' }));
homeLinkEl.addEventListener('click', () => navigate({ kind: 'home' }));
menuLinkEl.addEventListener('click', () => navigate({ kind: 'menu' }));

// ---- LaTeX / mhchem typesetting (KaTeX) across app view, home, and menu ----
autoTypeset(viewEl, home, menuPage);

// ---- progress / account panel ----
mountSidebarAccountPanel(document.getElementById('progress-panel')!);
// The id migration has to run AFTER initProgress: it rewrites the stored keys,
// so the local set (and the remote merge, when signed in) must be loaded first.
void initProgress().then(migrateLegacyProgress);

// Content sanity checks — a duplicated question id silently makes two questions
// share one progress record, and an out-of-range answer index makes a question
// unanswerable. Both are invisible at runtime, so surface them in dev.
if (import.meta.env.DEV) {
  const problems = auditCorpus();
  if (problems.length) console.error('[content audit]', problems);
  else console.info(`[content audit] clean — ${CORPUS_COUNTS.mc} MC + ${CORPUS_COUNTS.frq} written, all ids unique`);
}
