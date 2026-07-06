// Gases, IMFs, phase diagrams, solutions: kinetic gas box, Maxwell-Boltzmann,
// interactive phase diagrams, colligative properties.
import { h, card, theory, slider, select, plot, linspace, type TabDef, type TabHandle } from './framework';

const Rgas = 8.314, R_atm = 0.08206;

// ---- gas particle box ----
function makeGasBox(): { el: HTMLElement; setVisible: (v: boolean) => void } {
  let n = 1.0, T = 300, V = 20; // mol, K, L
  const canvas = h('canvas', { width: 460, height: 260 });
  const out = h('div', { class: 'result' });
  const pts: { x: number; y: number; vx: number; vy: number }[] = [];
  let visible = false;

  function resync(): void {
    const count = Math.round(n * 60);
    while (pts.length < count) pts.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0 });
    pts.length = count;
    const s = Math.sqrt(T) * 0.0011;
    for (const p of pts) {
      const ang = Math.random() * Math.PI * 2;
      const sp = s * (0.5 + Math.random());
      p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp;
    }
    const P = (n * R_atm * T) / V;
    out.innerHTML = `P = nRT/V = (${n.toFixed(1)} × 0.0821 × ${T}) / ${V} = <b class="big">${P.toFixed(2)} atm</b>` +
      `<br><span class="muted">Smaller box (higher P at same T): more wall collisions per second. Hotter: faster particles AND harder hits — P ∝ T at fixed V.</span>`;
  }

  function frame(): void {
    if (visible) {
      const ctx = canvas.getContext('2d')!;
      const W = canvas.width, Hh = canvas.height;
      const boxW = W * (0.3 + 0.7 * (V - 5) / 45); // box width tracks V
      ctx.clearRect(0, 0, W, Hh);
      ctx.strokeStyle = '#3a4a5d'; ctx.strokeRect(1, 1, boxW - 2, Hh - 2);
      ctx.fillStyle = '#6fc3ff';
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > 1) { p.x = 1; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > 1) { p.y = 1; p.vy = -Math.abs(p.vy); }
        ctx.beginPath(); ctx.arc(4 + p.x * (boxW - 8), 4 + p.y * (Hh - 8), 2.5, 0, 7); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
  resync();

  const el = card('Kinetic molecular theory: the gas box (PV = nRT)',
    slider({ label: 'n (mol)', min: 0.2, max: 3, step: 0.1, value: n, fmt: v => v.toFixed(1), onInput: v => { n = v; resync(); } }),
    slider({ label: 'T (K)', min: 50, max: 1000, step: 10, value: T, onInput: v => { T = v; resync(); } }),
    slider({ label: 'V (L)', min: 5, max: 50, step: 1, value: V, onInput: v => { V = v; resync(); } }),
    canvas, out,
  );
  return { el, setVisible: v => { visible = v; } };
}

// ---- Maxwell-Boltzmann ----
const GASES = [
  { name: 'He (4)', M: 0.004 }, { name: 'Ne (20)', M: 0.020 }, { name: 'N₂ (28)', M: 0.028 },
  { name: 'O₂ (32)', M: 0.032 }, { name: 'CO₂ (44)', M: 0.044 }, { name: 'Cl₂ (71)', M: 0.071 },
];
function makeMB(): HTMLElement {
  let T = 300, gasIdx = 2;
  const canvas = h('canvas', { width: 460, height: 250 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    const M = GASES[gasIdx].M;
    const vs = linspace(0, 3000, 300);
    const f = (v: number, m: number, temp: number) => {
      const a = m / (2 * Rgas * temp);
      return Math.pow(a / Math.PI, 1.5) * 4 * Math.PI * v * v * Math.exp(-a * v * v);
    };
    plot(canvas, [
      { xs: vs, ys: vs.map(v => f(v, M, T)), color: '#6fc3ff', label: `${GASES[gasIdx].name}, ${T}K` },
      { xs: vs, ys: vs.map(v => f(v, M, T + 300)), color: '#ff8a6f', label: `same gas, ${T + 300}K`, dash: [4, 3] },
    ], { xLabel: 'speed (m/s)', yLabel: 'fraction of molecules' });
    const vp = Math.sqrt(2 * Rgas * T / M), vavg = Math.sqrt(8 * Rgas * T / (Math.PI * M)), vrms = Math.sqrt(3 * Rgas * T / M);
    out.innerHTML = `v<sub>p</sub> = √(2RT/M) = <b>${vp.toFixed(0)}</b> &lt; v̄ = √(8RT/πM) = <b>${vavg.toFixed(0)}</b> &lt; v<sub>rms</sub> = √(3RT/M) = <b>${vrms.toFixed(0)} m/s</b>` +
      `<br><span class="muted">Higher T: curve flattens and shifts right — total area stays 1. The high-speed tail is what feeds reactions (only molecules with E > Ea react).</span>` +
      `<br>Graham's law: rate₁/rate₂ = √(M₂/M₁). He effuses ${Math.sqrt(GASES[gasIdx].M / 0.004).toFixed(1)}× faster than ${GASES[gasIdx].name.split(' ')[0]}.`;
  }
  const el = card('Maxwell–Boltzmann speed distribution',
    select('gas', GASES.map((g, i) => ({ value: String(i), label: g.name })), v => { gasIdx = Number(v); draw(); }, '2'),
    slider({ label: 'T (K)', min: 100, max: 900, step: 10, value: T, onInput: v => { T = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- phase diagram ----
function makePhase(): HTMLElement {
  let substance: 'water' | 'co2' = 'water';
  const canvas = h('canvas', { width: 460, height: 300 });
  const out = h('div', { class: 'result' });
  // temp in °C, P on log10(atm) axis from -4 to 3
  const DATA = {
    water: { triple: [0.01, 0.006], critical: [374, 218], tMin: -80, tMax: 450, slNeg: true },
    co2: { triple: [-56.6, 5.11], critical: [31.1, 72.8], tMin: -140, tMax: 60, slNeg: false },
  };
  let pt: [number, number] = [25, 0]; // T °C, log10 P

  function boundaries(sub: 'water' | 'co2') {
    const d = DATA[sub];
    const [Tt, Pt] = d.triple, [Tc, Pc] = d.critical;
    const lt = Math.log10(Pt), lc = Math.log10(Pc);
    // sublimation: below triple; vaporization: triple→critical; fusion: near-vertical
    const subl = (T: number) => lt + (T - Tt) * 0.045;
    const vap = (T: number) => lt + ((T - Tt) / (Tc - Tt)) * (lc - lt);
    const fusT = (lp: number) => Tt + (lp - lt) * (d.slNeg ? -1.2 : 1.6); // T of S/L line at logP
    return { subl, vap, fusT, Tt, lt, Tc, lc };
  }

  function classify(T: number, lp: number): string {
    const b = boundaries(substance);
    if (T > b.Tc && lp > b.lc) return 'SUPERCRITICAL FLUID';
    if (T <= b.Tt) return lp > b.subl(T) ? 'SOLID' : 'GAS';
    if (T < b.fusT(lp) && lp > b.lt) return 'SOLID';
    if (T > b.Tc) return 'GAS';
    return lp > b.vap(T) ? 'LIQUID' : 'GAS';
  }

  function draw(): void {
    const d = DATA[substance];
    const b = boundaries(substance);
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, Hh = canvas.height;
    const X = (T: number) => 40 + ((T - d.tMin) / (d.tMax - d.tMin)) * (W - 55);
    const Y = (lp: number) => Hh - 30 - ((lp + 4) / 7) * (Hh - 45);
    ctx.clearRect(0, 0, W, Hh);
    ctx.strokeStyle = '#3a4a5d';
    ctx.strokeRect(40, 15, W - 55, Hh - 45);
    ctx.font = '10px monospace'; ctx.fillStyle = '#5a6a7d'; ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const T = d.tMin + (i / 5) * (d.tMax - d.tMin);
      ctx.fillText(T.toFixed(0) + '°C', X(T), Hh - 16);
    }
    ctx.textAlign = 'right';
    for (let lp = -4; lp <= 3; lp++) ctx.fillText(`10^${lp}`, 38, Y(lp) + 3);
    ctx.textAlign = 'left';
    ctx.fillText('P (atm)', 4, 12);

    const line = (fn: (T: number) => number, t0: number, t1: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      let first = true;
      for (let T = t0; T <= t1; T += (t1 - t0) / 100) {
        const y = Y(Math.max(-4, Math.min(3, fn(T))));
        if (first) { ctx.moveTo(X(T), y); first = false; } else ctx.lineTo(X(T), y);
      }
      ctx.stroke();
    };
    line(b.subl, d.tMin, b.Tt, '#9fb4c7');            // sublimation
    line(b.vap, b.Tt, b.Tc, '#6fc3ff');                // vaporization
    // fusion (drawn as T(lp))
    ctx.strokeStyle = '#7ae27a'; ctx.lineWidth = 2; ctx.beginPath();
    for (let lp = b.lt; lp <= 3; lp += 0.05) {
      const x = X(b.fusT(lp));
      if (lp === b.lt) ctx.moveTo(x, Y(lp)); else ctx.lineTo(x, Y(lp));
    }
    ctx.stroke();
    // special points
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath(); ctx.arc(X(b.Tt), Y(b.lt), 4, 0, 7); ctx.fill();
    ctx.fillText('triple', X(b.Tt) + 6, Y(b.lt) + 12);
    ctx.beginPath(); ctx.arc(X(b.Tc), Y(b.lc), 4, 0, 7); ctx.fill();
    ctx.fillText('critical', X(b.Tc) - 55, Y(b.lc) - 6);
    // current point
    ctx.fillStyle = '#ff5577';
    ctx.beginPath(); ctx.arc(X(pt[0]), Y(pt[1]), 6, 0, 7); ctx.fill();

    const phase = classify(pt[0], pt[1]);
    out.innerHTML = `At <b>${pt[0].toFixed(0)} °C</b> and <b>${Math.pow(10, pt[1]).toPrecision(2)} atm</b>: <b class="big">${phase}</b>` +
      (substance === 'water' ? '<br><span class="muted">Water\'s solid–liquid line leans LEFT (negative slope): ice is less dense than water, so pressure melts it. Almost unique.</span>'
        : '<br><span class="muted">CO₂\'s triple point is above 1 atm → at ambient pressure it sublimes (dry ice) and liquid CO₂ can\'t exist below 5.1 atm.</span>');
  }

  function setFromEvent(ev: MouseEvent): void {
    const d = DATA[substance];
    const rect = canvas.getBoundingClientRect();
    const mx = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const my = (ev.clientY - rect.top) * (canvas.height / rect.height);
    const T = d.tMin + ((mx - 40) / (canvas.width - 55)) * (d.tMax - d.tMin);
    const lp = ((canvas.height - 30 - my) / (canvas.height - 45)) * 7 - 4;
    pt = [Math.max(d.tMin, Math.min(d.tMax, T)), Math.max(-4, Math.min(3, lp))];
    draw();
  }
  let dragging = false;
  canvas.addEventListener('mousedown', e => { dragging = true; setFromEvent(e); });
  canvas.addEventListener('mousemove', e => { if (dragging) setFromEvent(e); });
  window.addEventListener('mouseup', () => { dragging = false; });

  const el = card('Phase diagram — click/drag the red point',
    select('substance', [{ value: 'water', label: 'H₂O (negative-slope fusion line)' }, { value: 'co2', label: 'CO₂ (dry ice, sublimes)' }],
      v => { substance = v as 'water' | 'co2'; pt = substance === 'water' ? [25, 0] : [-40, 0]; draw(); }, 'water'),
    canvas, out,
  );
  draw();
  return el;
}

// ---- Clausius-Clapeyron ----
const LIQUIDS = [
  { name: 'water', dH: 40.7, bp: 373.15 },
  { name: 'ethanol', dH: 38.6, bp: 351.5 },
  { name: 'diethyl ether', dH: 26.5, bp: 307.6 },
  { name: 'benzene', dH: 30.7, bp: 353.2 },
];
function makeCC(): HTMLElement {
  let liq = LIQUIDS[0], Tc = 25, Pext = 0.33;
  const canvas = h('canvas', { width: 460, height: 240 });
  const out = h('div', { class: 'result' });
  function calc(): void {
    const T = Tc + 273.15;
    // ln(P/1 atm) = −ΔH/R · (1/T − 1/Tb)
    const P = Math.exp((-liq.dH * 1000 / Rgas) * (1 / T - 1 / liq.bp));
    const Tbp = 1 / (1 / liq.bp - (Rgas * Math.log(Pext)) / (liq.dH * 1000));
    const Ts = linspace(Math.max(233, liq.bp - 120), liq.bp + 40, 200);
    const Ps = Ts.map(t => Math.exp((-liq.dH * 1000 / Rgas) * (1 / t - 1 / liq.bp)));
    plot(canvas, [
      { xs: Ts.map(t => t - 273.15), ys: Ps, color: '#6fc3ff', label: 'vapor pressure' },
      { xs: [Ts[0] - 273.15, Ts[Ts.length - 1] - 273.15], ys: [Pext, Pext], color: '#ffe27a', dash: [4, 3], label: `P ext = ${Pext.toFixed(2)} atm` },
    ], {
      xLabel: 'T (°C)', yLabel: 'P (atm)', yMin: 0, yMax: 2.2,
      markers: [{ x: Tbp - 273.15, y: Pext, label: `boils at ${(Tbp - 273.15).toFixed(0)} °C` }],
    });
    out.innerHTML =
      `<span class="eq">ln(P₂/P₁) = −(ΔH<sub>vap</sub>/R)(1/T₂ − 1/T₁)</span>` +
      `${liq.name} (ΔH<sub>vap</sub> = ${liq.dH} kJ/mol, normal bp ${(liq.bp - 273.15).toFixed(1)} °C):<br>` +
      `vapor pressure at ${Tc.toFixed(0)} °C = <b>${P < 0.01 ? P.toExponential(2) : P.toFixed(3)} atm</b> (${(P * 760).toFixed(0)} torr)<br>` +
      `boiling point at ${Pext.toFixed(2)} atm = <b>${(Tbp - 273.15).toFixed(1)} °C</b>` +
      `<br><span class="muted">A liquid boils when its vapor pressure reaches the external pressure. 0.33 atm ≈ Everest summit — water boils at ~71 °C there, too cool for good tea. Plot ln P vs 1/T for a straight line with slope −ΔH<sub>vap</sub>/R.</span>`;
  }
  const el = card('Clausius–Clapeyron: vapor pressure & boiling',
    select('liquid', LIQUIDS.map(l => ({ value: l.name, label: `${l.name} (ΔHvap ${l.dH} kJ/mol)` })), v => { liq = LIQUIDS.find(l => l.name === v)!; calc(); }, liq.name),
    slider({ label: 'T (°C)', min: -20, max: 150, step: 1, value: Tc, onInput: v => { Tc = v; calc(); } }),
    slider({ label: 'external P (atm)', min: 0.05, max: 2, step: 0.01, value: Pext, fmt: v => v.toFixed(2), onInput: v => { Pext = v; calc(); } }),
    canvas, out,
  );
  calc();
  return el;
}

// ---- colligative ----
function makeColligative(): HTMLElement {
  let m = 1.0, i = 2;
  const out = h('div', { class: 'result' });
  const calc = () => {
    out.innerHTML =
      `For water (K<sub>b</sub> = 0.512, K<sub>f</sub> = 1.86 °C·kg/mol):<br>` +
      `ΔT<sub>b</sub> = i·K<sub>b</sub>·m = <b>+${(i * 0.512 * m).toFixed(2)} °C</b> → boils at ${(100 + i * 0.512 * m).toFixed(2)} °C<br>` +
      `ΔT<sub>f</sub> = i·K<sub>f</sub>·m = <b>−${(i * 1.86 * m).toFixed(2)} °C</b> → freezes at ${(-i * 1.86 * m).toFixed(2)} °C<br>` +
      `π = iMRT ≈ <b>${(i * m * 0.08206 * 298).toFixed(1)} atm</b> at 25 °C (assuming M ≈ m)<br>` +
      `<span class="muted">i = van 't Hoff factor: NaCl→2, CaCl₂→3, glucose→1 (real i is a bit lower from ion pairing). Colligative = counts particles, doesn't care what they are.</span>`;
  };
  const el = card('Colligative properties calculator',
    slider({ label: 'molality (mol/kg)', min: 0.1, max: 5, step: 0.1, value: m, fmt: v => v.toFixed(1), onInput: v => { m = v; calc(); } }),
    slider({ label: 'i (particles)', min: 1, max: 4, step: 1, value: i, onInput: v => { i = v; calc(); } }),
    out,
  );
  calc();
  return el;
}

export const gasesTab: TabDef = {
  id: 'gases',
  label: 'Gases & Phases',
  mount(root): TabHandle {
    const gasBox = makeGasBox();
    root.append(
      h('div', { class: 'cards' }, gasBox.el, makeMB(), makePhase(), makeCC(), makeColligative()),
      theory('Theory & key equations — gases / IMF / solutions', `
<h4>Gas laws</h4>
<span class="eq">PV = nRT (R = 0.08206 L·atm/mol·K = 8.314 J/mol·K) · P<sub>i</sub> = x<sub>i</sub>P<sub>total</sub> (Dalton) · rate ∝ 1/√M (Graham)</span>
<ul>
<li>STP: 0 °C, 1 bar → 22.7 L/mol (old 1 atm def: 22.4). Density: M = dRT/P.</li>
<li>Real gases: van der Waals (P + an²/V²)(V − nb) = nRT. Deviations worst at high P, low T. a ~ attractions (makes P lower than ideal), b ~ molecular volume.</li>
<li><span class="trap">Collecting gas over water: P(gas) = P(total) − P(H₂O vapor).</span></li>
</ul>
<h4>Intermolecular forces (weakest → strongest)</h4>
<ul>
<li>London dispersion (everything; grows with polarizability/size — I₂ solid, F₂ gas) &lt; dipole–dipole &lt; H-bond (H on N/O/F) &lt; ion–dipole (solvation).</li>
<li>Boiling point logic: HF &lt; H₂O despite F's EN — water forms 2 H-bonds per molecule. Branching lowers bp (less contact area).</li>
<li>IMFs explain: surface tension, viscosity, capillarity, volatility, miscibility ("like dissolves like").</li>
</ul>
<h4>Solutions</h4>
<span class="eq">Raoult: P = x<sub>solvent</sub>P° · Henry: S = kP (gas solubility) · ΔT = iKm · π = iMRT</span>
<ul>
<li>Gas solubility: ↑ with pressure, ↓ with temperature (warm soda goes flat). Most solids: ↑ with T.</li>
<li>Positive deviation from Raoult (A–B weaker than A–A/B–B) → higher vapor P, minimum-boiling azeotrope (ethanol–water).</li>
<li>Colligative properties count dissolved particles — great for finding molar masses of unknowns.</li>
</ul>`, true),
    );
    return {
      onShow() { gasBox.setVisible(true); },
      onHide() { gasBox.setVisible(false); },
    };
  },
};
