import type { Graphics } from 'pixi.js';
import type { Element } from './elements';

export interface Particle {
  id: number;
  element: Element;
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: number;    // PixiJS hex e.g. 0xFF4444
  maxBonds: number; // H:1  C:4  N:3  O:2
  mass: number;
  bonds: number[];  // partner Particle ids (one entry per bond, any order)
  gfx: Graphics;
}

export interface Bond {
  a: number; b: number; // Particle ids
  order: 1 | 2 | 3;     // single / double / triple (N≡N, C≡O need 3)
}
