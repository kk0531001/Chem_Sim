import './style.css';
import { initTabs, h, type TabsAPI } from './tabs/framework';
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

  // breadcrumb + this topic's own time/difficulty meta
  crumbEl.append(
    h('button', { class: 'crumb-link', onclick: () => navigate({ kind: 'home' }) }, 'Home'),
    h('span', { class: 'crumb-sep' }, '/'),
    h('button', { class: 'crumb-link', onclick: () => navigate({ kind: 'menu' }) }, topic.group),
    h('span', { class: 'crumb-sep' }, '/'),
    h('span', { class: 'crumb-current' }, topic.title),
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
      ...prereqs.map(p => h('button', { class: 'prereq-chip', onclick: () => navigate({ kind: 'topic', id: p.id }) }, p.title)),
    );
  }

  // previous (plain link) + next lesson (rich recommendation card)
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
  footerEl.append(
    prev
      ? h('button', { class: 'topic-prev-btn', onclick: () => navigate({ kind: 'topic', id: prev.id }) }, `← ${prev.title}`)
      : h('span', {}),
    next
      ? h('button', { class: 'next-lesson-card', onclick: () => navigate({ kind: 'topic', id: next.id }) },
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

function showRoute(route: Route): void {
  home.hidden = route.kind !== 'home';
  menuPage.hidden = route.kind !== 'menu';

  if (route.kind !== 'topic') {
    appEl.hidden = true;
    tabs?.suspend();
    return;
  }
  if (!VALID_IDS.has(route.id)) { navigate({ kind: 'home' }, true); return; }
  appEl.hidden = false;
  if (!tabs) tabs = initTabs(DEFS, navEl, viewEl, id => navigate({ kind: 'topic', id }));
  if (tabs.current() === route.id) tabs.resume();
  else tabs.show(route.id);
  updateTopicChrome(route.id);
}

onRouteChange(showRoute);
showRoute(initRouter());

brandEl.addEventListener('click', () => navigate({ kind: 'home' }));
homeLinkEl.addEventListener('click', () => navigate({ kind: 'home' }));
menuLinkEl.addEventListener('click', () => navigate({ kind: 'menu' }));

// ---- progress / account panel ----
mountSidebarAccountPanel(document.getElementById('progress-panel')!);
void initProgress();
