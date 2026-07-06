// Element definitions — CPK-ish colors, valence (maxBonds), relative mass.
export type Element = 'H' | 'C' | 'N' | 'O';

export interface ElementConfig {
  name: string;
  radius: number;
  color: number;    // PixiJS hex
  maxBonds: number; // valence: H:1  C:4  N:3  O:2
  mass: number;     // relative atomic mass, used by the integrator
}

export const ELEMENT_CONFIG: Record<Element, ElementConfig> = {
  H: { name: 'Hydrogen', radius: 7,  color: 0xe8e8e8, maxBonds: 1, mass: 1 },
  C: { name: 'Carbon',   radius: 12, color: 0x555555, maxBonds: 4, mass: 12 },
  N: { name: 'Nitrogen', radius: 11, color: 0x3050f8, maxBonds: 3, mass: 14 },
  O: { name: 'Oxygen',   radius: 10, color: 0xff4444, maxBonds: 2, mass: 16 },
};

export const ELEMENTS: Element[] = ['H', 'C', 'N', 'O'];
