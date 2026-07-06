import { Pane } from 'tweakpane';
import { params, particles, spawnParticle, clearAll } from './sim';
import { ELEMENTS, ELEMENT_CONFIG, type Element } from './elements';
import { PRESETS } from './presets';
import { attachParticle, detachParticle, app } from './render';
import type { Molecule } from './molecules';

export function spawnMany(element: Element, count: number): void {
  const W = app.screen.width, H = app.screen.height;
  for (let i = 0; i < count; i++) {
    const p = spawnParticle(
      element,
      20 + Math.random() * (W - 40),
      20 + Math.random() * (H - 40),
    );
    attachParticle(p);
  }
}

export function applyPreset(index: number): void {
  const preset = PRESETS[index];
  clearAll(detachParticle);
  params.temperature = preset.temperature;
  for (const el of ELEMENTS) {
    const n = preset.atoms[el];
    if (n) spawnMany(el, n);
  }
  const box = document.getElementById('concept')!;
  box.innerHTML = `<strong>${preset.name}</strong><br>${preset.concept}`;
}

export function buildUI(container: HTMLElement): Pane {
  const pane = new Pane({ title: 'Chemistry Engine', container });

  const sim = pane.addFolder({ title: 'Simulation' });
  sim.addBinding(params, 'temperature', { min: 0.1, max: 8, step: 0.1, label: 'temperature' });
  sim.addBinding(params, 'paused');

  const bondsF = pane.addFolder({ title: 'Bonding', expanded: false });
  bondsF.addBinding(params, 'bondDist', { min: 20, max: 60, step: 1, label: 'bond dist' });
  bondsF.addBinding(params, 'maxRelVelocity', { min: 0.5, max: 8, step: 0.1, label: 'max rel vel' });
  bondsF.addBinding(params, 'breakStretch', { min: 1.2, max: 2.5, step: 0.05, label: 'break stretch' });
  bondsF.addBinding(params, 'multiBondChance', { min: 0, max: 0.2, step: 0.01, label: 'multi-bond p' });

  const spawn = pane.addFolder({ title: 'Add atoms' });
  for (const el of ELEMENTS) {
    spawn.addButton({ title: `+10 ${ELEMENT_CONFIG[el].name} (${el})` })
      .on('click', () => spawnMany(el, 10));
  }
  spawn.addButton({ title: 'Clear all' }).on('click', () => {
    clearAll(detachParticle);
    document.getElementById('concept')!.innerHTML = '';
  });

  const presetsF = pane.addFolder({ title: 'Concept presets' });
  PRESETS.forEach((preset, i) => {
    presetsF.addButton({ title: preset.name }).on('click', () => applyPreset(i));
  });

  const display = pane.addFolder({ title: 'Display', expanded: false });
  display.addBinding(params, 'showLabels', { label: 'formula labels' });
  display.addBinding(params, 'showValence', { label: 'valence pips' });

  return pane;
}

// Molecule census panel — updated a few times per second, not every frame.
export function updateCensus(molecules: Molecule[]): void {
  const counts = new Map<string, { n: number; name: string | null }>();
  for (const mol of molecules) {
    const entry = counts.get(mol.formula) ?? { n: 0, name: mol.name };
    entry.n++;
    counts.set(mol.formula, entry);
  }
  const freeAtoms = particles.filter(p => p.bonds.length === 0).length;
  const rows = [...counts.entries()]
    .sort((x, y) => y[1].n - x[1].n)
    .map(([formula, { n, name }]) =>
      `<tr><td>${n}×</td><td><strong>${formula}</strong></td><td>${name ?? ''}</td></tr>`)
    .join('');
  document.getElementById('census')!.innerHTML =
    `<h2>Molecules</h2><table>${rows}</table>` +
    `<p class="muted">${freeAtoms} free atoms · ${particles.length} total</p>`;
}
