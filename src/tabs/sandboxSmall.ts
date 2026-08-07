// The sandbox's stand-in below the mobile breakpoint (W3.5).
//
// The particle box is a drag-and-drop instrument on a wide canvas with a
// Tweakpane control panel down the side: there is no honest phone layout for
// it, and pretending otherwise costs the reader ~500 kB of pixi.js and
// tweakpane to discover that. THIS module is what main.ts loads instead, so
// neither library is fetched at all — the guard has to live in the loader,
// because sandbox.ts pulls pixi in through sim.ts at import time.
//
// Everything here is static markup: no canvas, no ticker, nothing to suspend.
import type { TabDef, TabHandle } from './framework';
import { h } from './framework';

// A frozen frame of what the box does: two H₂O molecules and a free radical,
// drawn in the same dark-panel palette as the homepage figures.
const FIG_BOX = `
<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="A frozen frame of the particle sandbox: two water molecules and a free hydroxyl radical drifting in a box.">
  <rect x="8" y="8" width="304" height="174" rx="8" fill="none" stroke="#242b33" stroke-width="1.2"/>
  <g stroke="#5c646e" stroke-width="3" stroke-linecap="round">
    <line x1="78" y1="58" x2="104" y2="44"/><line x1="78" y1="58" x2="104" y2="76"/>
    <line x1="196" y1="128" x2="222" y2="114"/><line x1="196" y1="128" x2="222" y2="146"/>
    <line x1="118" y1="132" x2="146" y2="132"/>
  </g>
  <g font-family="Menlo, monospace" font-size="9" text-anchor="middle" fill="#141a21">
    <circle cx="78" cy="58" r="13" fill="#e8590c"/><text x="78" y="61.5">O</text>
    <circle cx="104" cy="44" r="9" fill="#c9d1d9"/><text x="104" y="47">H</text>
    <circle cx="104" cy="76" r="9" fill="#c9d1d9"/><text x="104" y="79">H</text>
    <circle cx="196" cy="128" r="13" fill="#e8590c"/><text x="196" y="131.5">O</text>
    <circle cx="222" cy="114" r="9" fill="#c9d1d9"/><text x="222" y="117">H</text>
    <circle cx="222" cy="146" r="9" fill="#c9d1d9"/><text x="222" y="149">H</text>
    <circle cx="118" cy="132" r="13" fill="#e8590c"/><text x="118" y="135.5">O</text>
    <circle cx="146" cy="132" r="9" fill="#c9d1d9"/><text x="146" y="135">H</text>
  </g>
  <text x="160" y="176" fill="#8a939e" font-size="10" font-family="Menlo, monospace" text-anchor="middle">
    2 H₂O + ·OH — the census counts these live
  </text>
</svg>`;

export const sandboxSmallTab: TabDef = {
  id: 'sandbox',
  mount(root: HTMLElement): TabHandle {
    root.append(h('section', { class: 'card' },
      h('h2', {}, 'Reaction sandbox'),
      // Same slot the task line takes on every other sim card — the one
      // sentence that says what to do, directly under the title.
      h('p', { class: 'card-task' }, 'Best on a larger screen — save it for later.'),
      h('div', { class: 'figure', html: FIG_BOX }),
      h('p', { class: 'fig-cap' }, 'Fig. 1 — a frame from the sandbox: atoms drift, bond when they collide with free valence, and break apart again when you raise the temperature.'),
      h('p', {}, 'The sandbox is a drag-and-drop particle box with a control panel: temperature, bond strength, presets, and a live molecule census. It needs a wide canvas and a pointer, so it is not loaded here. Open this page on a laptop or desktop and it will be waiting.'),
      h('p', { class: 'muted' }, 'Every other module on the site works on this screen.'),
    ));
    return {};
  },
};
