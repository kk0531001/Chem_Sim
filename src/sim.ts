import { Graphics } from 'pixi.js';
import type { Bond, Particle } from './particle';
import { ELEMENT_CONFIG, type Element } from './elements';

// ---- top-level simulation state ----
export const particles: Particle[] = [];
export const bonds: Bond[] = [];
let nextId = 0;

// Fast lookups kept in sync by addBond/removeBond.
export const particleById = new Map<number, Particle>();
const bondByKey = new Map<string, Bond>();

const pairKey = (a: number, b: number) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// ---- tunable parameters (bound to the Tweakpane UI) ----
export const params = {
  temperature: 1.4,   // target mean speed — the thermostat drives toward this
  bondDist: 32,       // max center distance for a bond to form
  maxRelVelocity: 3.0,// atoms colliding faster than this bounce instead of bonding
  breakStretch: 1.55, // bond snaps when stretched past restLength * this
  multiBondChance: 0.06, // per-frame chance a close bonded pair upgrades order
  paused: false,
  showLabels: true,   // molecule formula labels
  showValence: true,  // open bond-slot pips around each atom
};

export function spawnParticle(element: Element, x: number, y: number): Particle {
  const cfg = ELEMENT_CONFIG[element];
  const p: Particle = {
    id: nextId++, element, x, y,
    vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
    radius: cfg.radius, color: cfg.color, maxBonds: cfg.maxBonds, mass: cfg.mass,
    bonds: [], gfx: new Graphics(),
  };
  particles.push(p);
  particleById.set(p.id, p);
  return p;
}

export function getBond(aId: number, bId: number): Bond | undefined {
  return bondByKey.get(pairKey(aId, bId));
}

// Valence already used = sum of bond orders (a double bond uses 2 slots).
export function valenceUsed(p: Particle): number {
  let used = 0;
  for (const partnerId of p.bonds) {
    const b = getBond(p.id, partnerId);
    if (b) used += b.order;
  }
  return used;
}

export function freeValence(p: Particle): number {
  return p.maxBonds - valenceUsed(p);
}

export function addBond(a: Particle, b: Particle): Bond {
  const bond: Bond = { a: a.id, b: b.id, order: 1 };
  bonds.push(bond);
  bondByKey.set(pairKey(a.id, b.id), bond);
  a.bonds.push(b.id);
  b.bonds.push(a.id);
  return bond;
}

export function removeBond(bond: Bond): void {
  const i = bonds.indexOf(bond);
  if (i !== -1) bonds.splice(i, 1);
  bondByKey.delete(pairKey(bond.a, bond.b));
  const a = particleById.get(bond.a);
  const b = particleById.get(bond.b);
  if (a) a.bonds.splice(a.bonds.indexOf(bond.b), 1);
  if (b) b.bonds.splice(b.bonds.indexOf(bond.a), 1);
}

export function clearAll(onRemove: (p: Particle) => void): void {
  for (const p of particles) onRemove(p);
  particles.length = 0;
  bonds.length = 0;
  particleById.clear();
  bondByKey.clear();
}

// Equilibrium bond length; higher-order bonds pull atoms closer.
export function restLength(bond: Bond): number {
  const a = particleById.get(bond.a)!;
  const b = particleById.get(bond.b)!;
  return a.radius + b.radius + 4 - (bond.order - 1) * 3;
}
