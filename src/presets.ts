import type { Element } from './elements';

export interface Preset {
  name: string;
  atoms: Partial<Record<Element, number>>;
  temperature: number;
  concept: string; // short explanation shown in the concept box
}

export const PRESETS: Preset[] = [
  {
    name: 'Hydrogen gas',
    atoms: { H: 50 },
    temperature: 1.2,
    concept: 'Covalent bonding & diatomic molecules — each H has one electron and one open slot (the yellow pip). Two H atoms share a pair and form H₂. Once bonded, both slots are full: H₂ is inert here, which is why hydrogen never exists as lone atoms in nature.',
  },
  {
    name: 'Water synthesis',
    atoms: { H: 50, O: 20 },
    temperature: 1.4,
    concept: 'Valence — oxygen has 2 open slots, hydrogen has 1. Watch O grab two H atoms to form H₂O. Some O pairs will double-bond into O₂ instead; that competition between products is real chemistry. Bonding releases energy (atoms slow down when they bond = exothermic).',
  },
  {
    name: 'Air (N₂ / O₂)',
    atoms: { N: 40, O: 14 },
    temperature: 1.6,
    concept: 'Multiple bonds — nitrogen (valence 3) forms N≡N, a triple bond drawn as three lines. Triple bonds are shorter and much harder to break, which is why N₂ makes up 78% of air and barely reacts with anything at room temperature.',
  },
  {
    name: 'Organic soup',
    atoms: { C: 12, H: 45, O: 10, N: 6 },
    temperature: 1.5,
    concept: 'Carbon skeletons — carbon\'s 4 slots let it be a hub: CH₄ (methane), NH₃ (ammonia), CH₂O (formaldehyde), even C–C chains. This tetravalence is the entire reason organic chemistry — and life — exists.',
  },
  {
    name: 'Thermal decomposition',
    atoms: { H: 40, O: 20 },
    temperature: 5.5,
    concept: 'Activation energy & equilibrium — at high temperature, atoms move fast enough to stretch bonds past their limit and molecules shake apart. Lower the temperature slider and watch them re-form. The bond ↔ break balance shifting with temperature is Le Chatelier in action.',
  },
];
