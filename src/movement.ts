import { particles, bonds, params, particleById, restLength, getBond } from './sim';

const SPRING_K = 0.09;      // bond spring stiffness
const SPRING_DAMP = 0.06;   // damping along the bond axis (stability)
const REPULSE_K = 0.35;     // soft push when unbonded atoms overlap
const MAX_SPEED = 12;
// Fixed timestep turning accumulated force into a velocity change
// (Δv = F/m · FORCE_DT), used by both the spring and repulsion passes.
// Deliberately NOT the frame dt handed to stepMovement: these springs are
// stiff, and letting a long or stuttering frame feed straight into the impulse
// makes them blow up. Empirically tuned — raise it and bonds go rigid and
// jittery, lower it and molecules turn floppy.
const FORCE_DT = 12;

// One integration step: springs, repulsion, thermostat, then Euler + walls.
export function stepMovement(dt: number, W: number, H: number): void {
  applyBondSprings();
  applyRepulsion();
  applyThermostat();

  for (const p of particles) {
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > MAX_SPEED) { p.vx *= MAX_SPEED / spd; p.vy *= MAX_SPEED / spd; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < p.radius) { p.x = p.radius; p.vx = Math.abs(p.vx); }
    if (p.x > W - p.radius) { p.x = W - p.radius; p.vx = -Math.abs(p.vx); }
    if (p.y < p.radius) { p.y = p.radius; p.vy = Math.abs(p.vy); }
    if (p.y > H - p.radius) { p.y = H - p.radius; p.vy = -Math.abs(p.vy); }
  }
}

function applyBondSprings(): void {
  for (const bond of bonds) {
    const a = particleById.get(bond.a)!;
    const b = particleById.get(bond.b)!;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const nx = dx / dist, ny = dy / dist;
    const stretch = dist - restLength(bond);
    // Spring force plus damping of relative velocity along the bond axis.
    const relV = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    const f = SPRING_K * stretch * bond.order + SPRING_DAMP * relV;
    a.vx += (f * nx) / a.mass * FORCE_DT;
    a.vy += (f * ny) / a.mass * FORCE_DT;
    b.vx -= (f * nx) / b.mass * FORCE_DT;
    b.vy -= (f * ny) / b.mass * FORCE_DT;
  }
}

function applyRepulsion(): void {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const minDist = a.radius + b.radius;
      const dx = b.x - a.x, dy = b.y - a.y;
      if (Math.abs(dx) > minDist || Math.abs(dy) > minDist) continue;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist >= minDist || getBond(a.id, b.id)) continue;
      const push = REPULSE_K * (minDist - dist) / minDist;
      const nx = dx / dist, ny = dy / dist;
      a.vx -= push * nx * FORCE_DT / a.mass;
      a.vy -= push * ny * FORCE_DT / a.mass;
      b.vx += push * nx * FORCE_DT / b.mass;
      b.vy += push * ny * FORCE_DT / b.mass;
    }
  }
}

// Velocity-rescaling thermostat: nudge the mean speed toward params.temperature.
function applyThermostat(): void {
  if (particles.length === 0) return;
  let total = 0;
  for (const p of particles) total += Math.hypot(p.vx, p.vy);
  const avg = total / particles.length;
  const target = params.temperature;
  let f = 1 + 0.03 * (target - avg) / Math.max(avg, 0.2);
  f = Math.min(1.03, Math.max(0.97, f));
  for (const p of particles) {
    p.vx *= f;
    p.vy *= f;
    // tiny thermal jitter so atoms never freeze completely
    p.vx += (Math.random() - 0.5) * 0.02 * target;
    p.vy += (Math.random() - 0.5) * 0.02 * target;
  }
}
