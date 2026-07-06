import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Particle } from './particle';
import { particles, bonds, particleById, params, freeValence, restLength } from './sim';
import type { Molecule } from './molecules';

export let app: Application;
let bondLayer: Graphics;
let atomLayer: Container;
let labelLayer: Container;

const labelPool: Text[] = [];
const lastDrawnFree = new Map<number, number>(); // atom redraw cache
const labelStyle = new TextStyle({
  fontFamily: 'monospace', fontSize: 13, fill: 0xaee8ff,
  stroke: { color: 0x0b0e14, width: 3 },
});

export async function initRender(host: HTMLElement): Promise<Application> {
  app = new Application();
  await app.init({ background: 0x0b0e14, resizeTo: host, antialias: true });
  host.appendChild(app.canvas);
  bondLayer = new Graphics();
  atomLayer = new Container();
  labelLayer = new Container();
  app.stage.addChild(bondLayer, atomLayer, labelLayer);
  return app;
}

export function attachParticle(p: Particle): void {
  drawAtom(p);
  atomLayer.addChild(p.gfx);
  const letter = new Text({
    text: p.element,
    style: {
      fontFamily: 'monospace', fontSize: Math.max(9, p.radius),
      fill: p.element === 'H' || p.element === 'O' ? 0x222222 : 0xffffff,
      fontWeight: 'bold',
    },
  });
  letter.anchor.set(0.5);
  p.gfx.addChild(letter);
}

export function detachParticle(p: Particle): void {
  p.gfx.destroy({ children: true });
  lastDrawnFree.delete(p.id);
}

function drawAtom(p: Particle): void {
  const free = params.showValence ? freeValence(p) : -1;
  if (lastDrawnFree.get(p.id) === free) return;
  lastDrawnFree.set(p.id, free);
  p.gfx.clear();
  p.gfx.circle(0, 0, p.radius).fill(p.color);
  p.gfx.circle(0, 0, p.radius).stroke({ width: 1.5, color: 0x000000, alpha: 0.35 });
  // open valence slots shown as pips around the rim
  if (free > 0) {
    for (let k = 0; k < free; k++) {
      const ang = -Math.PI / 2 + (k * 2 * Math.PI) / p.maxBonds;
      p.gfx.circle(Math.cos(ang) * (p.radius + 3), Math.sin(ang) * (p.radius + 3), 2)
        .fill({ color: 0xffe27a, alpha: 0.9 });
    }
  }
}

export function syncRender(molecules: Molecule[]): void {
  // bonds: one Graphics redrawn per frame; double/triple drawn as parallel lines
  bondLayer.clear();
  for (const bond of bonds) {
    const a = particleById.get(bond.a)!;
    const b = particleById.get(bond.b)!;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const px = -dy / dist, py = dx / dist; // perpendicular
    const stretched = dist > restLength(bond) * 1.3;
    const color = stretched ? 0xff8855 : 0x9fb4c7;
    const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-2.5, 2.5] : [-4, 0, 4];
    for (const off of offsets) {
      bondLayer.moveTo(a.x + px * off, a.y + py * off)
        .lineTo(b.x + px * off, b.y + py * off)
        .stroke({ width: 2, color, alpha: 0.85 });
    }
  }

  for (const p of particles) {
    drawAtom(p);
    p.gfx.position.set(p.x, p.y);
  }

  // molecule formula labels from a pooled Text list
  let used = 0;
  if (params.showLabels) {
    for (const mol of molecules) {
      if (mol.members.length < 2) continue;
      let label = labelPool[used];
      if (!label) {
        label = new Text({ text: '', style: labelStyle });
        label.anchor.set(0.5);
        labelPool.push(label);
        labelLayer.addChild(label);
      }
      label.text = mol.name ? `${mol.formula} ${mol.name}` : mol.formula;
      const top = Math.min(...mol.members.map(m => m.y - m.radius));
      label.position.set(mol.cx, top - 12);
      label.visible = true;
      used++;
    }
  }
  for (let i = used; i < labelPool.length; i++) labelPool[i].visible = false;
}
