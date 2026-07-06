import './style.css';
import { initTabs } from './tabs/framework';
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

initTabs(
  [
    sandboxTab,
    quantumTab,
    bondingTab,
    stoichTab,
    thermo1Tab,
    thermo2Tab,
    equilibriumTab,
    aekTab,
    gasesTab,
    nuclearTab,
    organic1Tab,
    organic2Tab,
    labdataTab,
  ],
  document.getElementById('tabbar')!,
  document.getElementById('view')!,
);
