// Sandbox tab — the original particle simulation, wrapped as a tab.
import type { Application } from 'pixi.js';
import { params } from '../sim';
import { stepMovement } from '../movement';
import { stepReactions } from '../reaction';
import { detectMolecules, type Molecule } from '../molecules';
import { initRender, syncRender } from '../render';
import { buildUI, applyPreset, updateCensus } from '../ui';
import type { TabDef, TabHandle } from './framework';
import { h } from './framework';

export const sandboxTab: TabDef = {
  id: 'sandbox',
  label: 'Sandbox',
  mount(root: HTMLElement): TabHandle {
    root.classList.add('sandbox-root');
    const stage = h('div', { id: 'stage' });
    const paneHost = h('div', { id: 'pane-host' });
    const sidebar = h('aside', { id: 'sidebar' },
      paneHost,
      h('div', { id: 'census' }),
      h('div', { id: 'concept' }),
    );
    root.appendChild(h('div', { class: 'sandbox-wrap' }, stage, sidebar));

    let appRef: Application | null = null;
    let visible = true;

    (async () => {
      const app = await initRender(stage);
      appRef = app;
      buildUI(paneHost);
      applyPreset(1); // start on "Water synthesis"

      let molecules: Molecule[] = [];
      let frame = 0;
      app.ticker.add((ticker) => {
        if (!params.paused) {
          const dt = Math.min(ticker.deltaTime, 2); // clamp tab-switch spikes
          stepMovement(dt, app.screen.width, app.screen.height);
          stepReactions();
        }
        if (frame % 15 === 0) molecules = detectMolecules();
        if (frame % 30 === 0) updateCensus(molecules);
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
