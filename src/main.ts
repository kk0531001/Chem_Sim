import './style.css';
import { initTabs, type TabsAPI } from './tabs/framework';
import { buildHome, TILE_HTML } from './home';
import { sandboxTab } from './tabs/sandbox';
import { quantumTab } from './tabs/quantum';
import { bondingTab } from './tabs/bonding';
import { stoichTab } from './tabs/stoich';
import { thermo1Tab } from './tabs/thermo1';
import { thermo2Tab } from './tabs/thermo2';
import { equilibriumTab } from './tabs/equilibrium';
import { aekTab } from './tabs/aek';
import { gasesTab } from './tabs/gases';
import { nuclearTab } from './tabs/nuclear';
import { organic1Tab } from './tabs/organic1';
import { organic2Tab } from './tabs/organic2';
import { labdataTab } from './tabs/labdata';
import { qbankTab } from './tabs/qbank';

const DEFS = [
  sandboxTab,
  quantumTab, bondingTab, stoichTab,
  thermo1Tab, thermo2Tab, equilibriumTab, aekTab, gasesTab,
  nuclearTab, organic1Tab, organic2Tab,
  labdataTab,
  qbankTab,
];

const appEl = document.getElementById('app')!;
const navEl = document.getElementById('nav-items')!;
const viewEl = document.getElementById('view')!;
const brandEl = document.getElementById('brand')!;
const homeLinkEl = document.getElementById('home-link')!;

brandEl.innerHTML = `${TILE_HTML}<span><b>ChemPrep</b><small>CCC Trainer</small></span>`;

let tabs: TabsAPI | null = null;

const home = buildHome(enterApp);
document.body.prepend(home);

function enterApp(tabId: string): void {
  home.hidden = true;
  appEl.hidden = false;
  if (!tabs) tabs = initTabs(DEFS, navEl, viewEl);
  if (tabs.current() === tabId) tabs.resume();
  else tabs.show(tabId);
}

function goHome(): void {
  tabs?.suspend(); // pause animation loops while the app is hidden
  appEl.hidden = true;
  home.hidden = false;
}

brandEl.addEventListener('click', goHome);
homeLinkEl.addEventListener('click', goHome);
