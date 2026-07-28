import './style.css';
import { initTabs, h, type TabsAPI } from './tabs/framework';
import { buildHome, TILE_HTML } from './home';
import { buildMenuPage } from './menu';
import { initRouter, navigate, onRouteChange, type Route } from './router';
import { TOPICS } from './topics';
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
import { labdataTab } from './tabs/labdata';
import { analyticalTab } from './tabs/analytical';
import { spectroscopyTab } from './tabs/spectroscopy';
import { advInorganicTab } from './tabs/advinorganic';
import { biophysTab } from './tabs/biophys';
import { qbankTab } from './tabs/qbank';
import { initProgress } from './progress';
import { mountSidebarAccountPanel } from './authWidget';

const DEFS = [
  sandboxTab,
  quantumTab, periodicityTab, bondingTab, stoichTab,
  thermo1Tab, thermo2Tab, equilibriumTab, aekTab, gasesTab,
  nuclearTab, organic1Tab, organic2Tab, polymersTab,
  labdataTab,
  analyticalTab, spectroscopyTab, advInorganicTab, biophysTab,
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
const footerEl = document.getElementById('topic-footer')!;

brandEl.innerHTML = `${TILE_HTML}<span><b>ChemPrep</b><small>CCC Trainer</small></span>`;

let tabs: TabsAPI | null = null;

const home = buildHome(id => navigate({ kind: 'topic', id }), () => navigate({ kind: 'menu' }));
document.body.prepend(home);

const menuPage = buildMenuPage(id => navigate({ kind: 'topic', id }), () => navigate({ kind: 'home' }));
menuPage.hidden = true;
document.body.appendChild(menuPage);

function updateCrumbAndFooter(tabId: string): void {
  const idx = TOPICS.findIndex(t => t.id === tabId);
  const topic = TOPICS[idx];
  crumbEl.replaceChildren();
  footerEl.replaceChildren();
  if (!topic) return;
  crumbEl.append(
    h('button', { class: 'crumb-link', onclick: () => navigate({ kind: 'home' }) }, 'Home'),
    h('span', { class: 'crumb-sep' }, '/'),
    h('button', { class: 'crumb-link', onclick: () => navigate({ kind: 'menu' }) }, topic.group),
    h('span', { class: 'crumb-sep' }, '/'),
    h('span', { class: 'crumb-current' }, topic.title),
  );
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
  footerEl.append(
    prev ? h('button', { class: 'topic-nav-btn', onclick: () => navigate({ kind: 'topic', id: prev.id }) }, `← ${prev.title}`) : h('span', {}),
    next ? h('button', { class: 'topic-nav-btn', onclick: () => navigate({ kind: 'topic', id: next.id }) }, `${next.title} →`) : h('span', {}),
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
  if (!tabs) tabs = initTabs(DEFS, navEl, viewEl);
  if (tabs.current() === route.id) tabs.resume();
  else tabs.show(route.id);
  updateCrumbAndFooter(route.id);
}

onRouteChange(showRoute);
showRoute(initRouter());

brandEl.addEventListener('click', () => navigate({ kind: 'home' }));
homeLinkEl.addEventListener('click', () => navigate({ kind: 'home' }));
menuLinkEl.addEventListener('click', () => navigate({ kind: 'menu' }));

// ---- progress / account panel ----
mountSidebarAccountPanel(document.getElementById('progress-panel')!);
void initProgress();
