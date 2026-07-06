import type { Particle } from './particle';
import { particles, particleById } from './sim';
import type { Element } from './elements';

export interface Molecule {
  members: Particle[];
  formula: string; // Hill notation with unicode subscripts, e.g. CH₄
  name: string | null;
  cx: number; cy: number; // centroid, for canvas labels
}

// Known small molecules, keyed by plain Hill formula (C first, then H,
// then other elements alphabetically — so HCN keys as CHN, NH3 as H3N).
const NAMES: Record<string, string> = {
  H2: 'hydrogen gas', O2: 'oxygen gas', N2: 'nitrogen gas', O3: 'ozone',
  H2O: 'water', H2O2: 'hydrogen peroxide',
  CO: 'carbon monoxide', CO2: 'carbon dioxide',
  CH4: 'methane', C2H6: 'ethane', C2H4: 'ethylene', C2H2: 'acetylene',
  CH2O: 'formaldehyde', CH4O: 'methanol', C2H6O: 'ethanol / DME',
  H3N: 'ammonia', H4N2: 'hydrazine', CHN: 'hydrogen cyanide',
  NO: 'nitric oxide', NO2: 'nitrogen dioxide', HNO: 'nitroxyl',
  CH5N: 'methylamine', CH2O2: 'formic acid', C2H4O2: 'acetic acid',
  // reactive intermediates — worth naming so they read as chemistry, not bugs
  HO: 'hydroxyl radical', CH3: 'methyl radical', CH2: 'methylene',
  H2N: 'amino radical', CHO: 'formyl radical',
};

// Hill notation is correct but unfamiliar for a few molecules — show the
// conventional formula instead (NH₃, not H₃N).
const DISPLAY_OVERRIDE: Record<string, string> = {
  H3N: 'NH₃', H4N2: 'N₂H₄', H2N: 'NH₂', HO: 'OH', CHN: 'HCN',
};

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => n === 1 ? '' : String(n).split('').map(d => SUB[+d]).join('');

// Hill order: C first, then H, then remaining elements alphabetically.
function hillFormula(counts: Map<Element, number>): { plain: string; pretty: string } {
  const order: Element[] = counts.has('C') ? ['C', 'H', 'N', 'O'] : ['H', 'C', 'N', 'O'];
  let plain = '', pretty = '';
  for (const el of order) {
    const n = counts.get(el) ?? 0;
    if (n === 0) continue;
    plain += el + (n === 1 ? '' : n);
    pretty += el + sub(n);
  }
  return { plain, pretty };
}

// Connected components over the bond graph → list of molecules (size ≥ 2).
export function detectMolecules(): Molecule[] {
  const visited = new Set<number>();
  const molecules: Molecule[] = [];

  for (const start of particles) {
    if (visited.has(start.id) || start.bonds.length === 0) continue;
    const members: Particle[] = [];
    const queue = [start];
    visited.add(start.id);
    while (queue.length > 0) {
      const p = queue.pop()!;
      members.push(p);
      for (const partnerId of p.bonds) {
        if (visited.has(partnerId)) continue;
        visited.add(partnerId);
        queue.push(particleById.get(partnerId)!);
      }
    }
    const counts = new Map<Element, number>();
    let cx = 0, cy = 0;
    for (const m of members) {
      counts.set(m.element, (counts.get(m.element) ?? 0) + 1);
      cx += m.x; cy += m.y;
    }
    const { plain, pretty } = hillFormula(counts);
    molecules.push({
      members,
      formula: DISPLAY_OVERRIDE[plain] ?? pretty,
      name: NAMES[plain] ?? null,
      cx: cx / members.length, cy: cy / members.length,
    });
  }
  return molecules;
}
