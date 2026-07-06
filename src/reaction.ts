import type { Bond, Particle } from './particle';
import {
  particles, bonds, params, particleById,
  addBond, removeBond, getBond, freeValence, restLength,
} from './sim';

// Bond formation: close + slow + both atoms have a free valence slot.
// Bonding is exothermic here — we damp velocities so molecules stay together.
export function stepReactions(): void {
  formBonds();
  breakStretchedBonds();
}

function formBonds(): void {
  const maxDist = params.bondDist;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) continue;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) continue;

      const existing = getBond(a.id, b.id);
      if (existing) {
        maybeUpgradeOrder(existing, a, b, dist);
        continue;
      }
      const relSpd = Math.hypot(a.vx - b.vx, a.vy - b.vy);
      if (relSpd > params.maxRelVelocity) continue;
      if (freeValence(a) < 1 || freeValence(b) < 1) continue;
      // Atoms with existing partners are slower to accept new ones — this
      // gives bond-order upgrades time to win, so N≡N beats N–N–N chains.
      const penalty = Math.pow(0.45, a.bonds.length + b.bonds.length);
      if (Math.random() > penalty) continue;
      addBond(a, b);
      a.vx *= 0.7; a.vy *= 0.7; // energy release
      b.vx *= 0.7; b.vy *= 0.7;
    }
  }
}

// A bonded pair sitting at short range can share another electron pair:
// single → double → triple, if both atoms still have valence to spare.
// H (valence 1) can never multi-bond; O=O, C=O, N≡N emerge naturally.
function maybeUpgradeOrder(bond: Bond, a: Particle, b: Particle, dist: number): void {
  if (bond.order >= 3) return;
  if (freeValence(a) < 1 || freeValence(b) < 1) return;
  if (dist > restLength(bond) * 1.25) return;
  // An isolated pair (only bonded to each other) upgrades eagerly — that's
  // how O=O and N≡N form before a third atom can attach.
  const isolatedPair = a.bonds.length === 1 && b.bonds.length === 1;
  const chance = isolatedPair ? params.multiBondChance * 6 : params.multiBondChance;
  if (Math.random() > chance) return;
  bond.order = (bond.order + 1) as Bond['order'];
  a.vx *= 0.8; a.vy *= 0.8;
  b.vx *= 0.8; b.vy *= 0.8;
}

// Thermal dissociation: a bond stretched past its limit snaps. The thermostat
// is what stretches them — raise the temperature and molecules shake apart,
// higher-order bonds hold on longer (a crude activation-energy analogue).
function breakStretchedBonds(): void {
  for (let i = bonds.length - 1; i >= 0; i--) {
    const bond = bonds[i];
    const a = particleById.get(bond.a)!;
    const b = particleById.get(bond.b)!;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const limit = restLength(bond) * (params.breakStretch + (bond.order - 1) * 0.25);
    // Boltzmann-ish thermal dissociation: hot systems randomly shake bonds
    // apart, and each extra bond order roughly triples the "activation energy".
    const thermal = Math.max(0, params.temperature - 2.5) * 0.004 / Math.pow(3, bond.order - 1);
    if (dist > limit || Math.random() < thermal) {
      if (bond.order > 1) {
        bond.order = (bond.order - 1) as Bond['order']; // peel off one pair first
      } else {
        removeBond(bond);
      }
    }
  }
}
