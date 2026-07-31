// Sandbox tab — the original particle simulation, wrapped as a tab.
import type { Application } from 'pixi.js';
import { params, particles } from '../sim';
import { stepMovement } from '../movement';
import { stepReactions } from '../reaction';
import { detectMolecules, type Molecule } from '../molecules';
import { initRender, syncRender } from '../render';
import { buildUI, updateCensus } from '../ui';
import type { TabDef, TabHandle } from './framework';
import { h, missionLadder } from './framework';

export const sandboxTab: TabDef = {
  id: 'sandbox',
  label: 'Sandbox',
  group: 'Playground',
  mount(root: HTMLElement): TabHandle {
    root.classList.add('sandbox-root');
    const stage = h('div', { id: 'stage' });
    const paneHost = h('div', { id: 'pane-host' });

    // Live readings for the missions. `molecules` is refreshed by the ticker
    // below; the mission checks read whatever the last census found, which is
    // exactly what the student is looking at.
    let molecules: Molecule[] = [];
    const freeAtomFrac = () =>
      particles.length === 0 ? 0 : particles.filter(p => p.bonds.length === 0).length / particles.length;
    const waterCount = () => molecules.filter(m => m.formula === 'H₂O').length;
    // True when H₂O outnumbers every other molecule in the box. Deliberately a
    // comparison rather than an absolute count: the atom budget depends on
    // which preset is loaded, so "mostly water" is the claim that survives it.
    const waterDominant = () => {
      const counts = new Map<string, number>();
      for (const m of molecules) counts.set(m.formula, (counts.get(m.formula) ?? 0) + 1);
      const water = counts.get('H₂O') ?? 0;
      if (water < 4) return false;
      let rival = 0;
      for (const [f, c] of counts) if (f !== 'H₂O') rival = Math.max(rival, c);
      return water > rival;
    };

    const missions = missionLadder([
      {
        id: 'msn-sbx-01',
        prompt: 'Load the <b>Water synthesis</b> preset and let it run until <b>H₂O is the most common molecule</b> in the census.',
        meter: () => ({ label: `${waterCount()} H₂O · ${waterDominant() ? 'leading the census' : 'not yet the most common'}`, pct: waterDominant() ? 100 : Math.min(90, waterCount() * 6) }),
        check: waterDominant,
        hints: [
          'Presets are in the panel at the top of this sidebar. Water synthesis starts you with 50 H and 20 O.',
          'Give it time — bonds form over several seconds. If it stalls, nudge the temperature up slightly so atoms meet more often.',
        ],
        explain: 'Oxygen has two open slots and hydrogen one, so the stable resting point of an H/O mixture is H₂O. Note what else appears: some O₂, some leftover H₂, and a few transient OH radicals. Even a "simple" reaction settles into a <em>mixture</em>, not a single clean product.',
      },
      {
        id: 'msn-sbx-02',
        prompt: 'Now pull that water apart <b>using temperature alone</b> — no adding or removing atoms. Get more than half the atoms unbonded.',
        meter: () => ({ label: `${(freeAtomFrac() * 100).toFixed(0)}% of atoms are free · target > 50%`, pct: freeAtomFrac() * 200 }),
        check: () => freeAtomFrac() > 0.5,
        hints: [
          'Bonds break when they get stretched past their limit. What makes atoms move violently enough to do that?',
          'Drag the temperature slider well up — past 5 or so — and watch the census empty out.',
        ],
        explain: 'Heat alone dissociates the sample, and it is reversible: cool it back down and the molecules re-form. That is the point — bond formation and bond breaking are always happening at once, and temperature sets which one wins. A high enough temperature makes even the products of a strongly exothermic reaction fall apart, which is why flames have a maximum useful temperature and why the Haber process cannot simply be run hotter.',
      },
    ]);

    const sidebar = h('aside', { id: 'sidebar' },
      paneHost,
      missions.el,
      h('div', { id: 'census' }),
      h('div', { id: 'concept' }),
    );
    root.appendChild(h('div', { class: 'sandbox-wrap' }, stage, sidebar));

    let appRef: Application | null = null;
    let visible = true;

    (async () => {
      const app = await initRender(stage);
      appRef = app;
      buildUI(paneHost); // starts empty — pick a preset or add atoms

      let frame = 0;
      app.ticker.add((ticker) => {
        if (!params.paused) {
          const dt = Math.min(ticker.deltaTime, 2); // clamp tab-switch spikes
          stepMovement(dt, app.screen.width, app.screen.height);
          stepReactions();
        }
        if (frame % 15 === 0) molecules = detectMolecules();
        // Polled on the census cadence, not every frame — the mission meters
        // report the same numbers the census shows, so they update together.
        if (frame % 30 === 0) { updateCensus(molecules); missions.tick(); }
        syncRender(molecules);
        frame++;
      });
      if (!visible) app.ticker.stop();
    })();

    return {
      onShow() { visible = true; appRef?.ticker.start(); },
      onHide() { visible = false; appRef?.ticker.stop(); },
    };
  },
};
