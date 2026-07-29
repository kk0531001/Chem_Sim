// Chemical equilibrium: live N2O4 ⇌ 2NO2 kinetic simulation with Le Chatelier
// perturbations, plus an ICE-table solver.
import { h, card, theory, slider, select, button, plot, quiz, type TabDef, type TabHandle } from './framework';
import { EQUILIBRIUM_QUIZ } from './questions1';


export const equilibriumTab: TabDef = {
  id: 'equilibrium',
  label: 'Equilibrium',
  group: 'Physical Chemistry',
  mount(root): TabHandle {
    // ---- live sim: N2O4 (A) ⇌ 2 NO2 (B) ----
    let kf = 0.30, kr = 0.60; // K = kf/kr = 0.5
    let A = 1.0, B = 0.0;     // mol/L
    const histT: number[] = [], histA: number[] = [], histB: number[] = [];
    let t = 0;
    let visible = true;
    const simCanvas = h('canvas', { width: 480, height: 250 });
    const qkOut = h('div', { class: 'result' });
    const eventOut = h('p', { class: 'muted' }, 'Watch [N₂O₄] fall and [NO₂] rise until forward and reverse rates match.');

    function step(): void {
      for (let i = 0; i < 4; i++) {
        const fwd = kf * A;          // rate = kf[N2O4]
        const rev = kr * B * B;      // rate = kr[NO2]^2
        const dt = 0.02;
        const dx = (fwd - rev) * dt;
        A = Math.max(0, A - dx);
        B = Math.max(0, B + 2 * dx);
        t += dt;
      }
      histT.push(t); histA.push(A); histB.push(B);
      if (histT.length > 700) { histT.shift(); histA.shift(); histB.shift(); }
    }

    function draw(): void {
      plot(simCanvas, [
        { xs: histT, ys: histA, color: '#6fc3ff', label: '[N₂O₄]' },
        { xs: histT, ys: histB, color: '#ff8a6f', label: '[NO₂]' },
      ], { xLabel: 't (s)', yLabel: 'conc (M)', yMin: 0 });
      const K = kf / kr;
      const Q = A > 1e-9 ? (B * B) / A : Infinity;
      const rel = Math.abs(Q - K) / K;
      qkOut.innerHTML =
        `K = k<sub>f</sub>/k<sub>r</sub> = <b>${K.toFixed(2)}</b> · Q = [NO₂]²/[N₂O₄] = <b>${Number.isFinite(Q) ? Q.toFixed(2) : '∞'}</b> → ` +
        (rel < 0.02 ? '<b style="color:#7ae27a">at equilibrium (Q = K)</b>' :
          Q < K ? '<b style="color:#ff8a6f">Q &lt; K → shifting right (making NO₂)</b>' :
            '<b style="color:#6fc3ff">Q &gt; K → shifting left (making N₂O₄)</b>') +
        `<br>rate<sub>f</sub> = ${(kf * A).toFixed(3)} · rate<sub>r</sub> = ${(kr * B * B).toFixed(3)} M/s`;
    }

    function loop(): void {
      if (visible) {
        step();
        draw();
      }
      requestAnimationFrame(loop);
    }

    const note = (msg: string) => { eventOut.textContent = msg; };
    const simCard = card('Live equilibrium: N₂O₄(g) ⇌ 2NO₂(g)  (colorless ⇌ brown, ΔH° = +57 kJ)',
      simCanvas, qkOut,
      h('div', {},
        button('+0.5 M N₂O₄', () => { A += 0.5; note('Added reactant → Q < K → shifts right: some of the added N₂O₄ converts, but [N₂O₄] still ends higher than before.'); }),
        button('+0.5 M NO₂', () => { B += 0.5; note('Added product → Q > K → shifts left, consuming part of the added NO₂.'); }),
        button('compress ×2', () => { A *= 2; B *= 2; note('Halving V doubles both concentrations, but Q = [NO₂]²/[N₂O₄] quadruples the numerator → Q > K → shifts toward fewer gas moles (left). The mixture lightens.'); }),
        button('expand ×2', () => { A /= 2; B /= 2; note('Doubling V → Q < K → shifts toward more gas moles (right). More brown NO₂.'); }),
        button('heat ↑', () => { kf *= 2.2; kr *= 1.25; note('Forward reaction is endothermic → heating raises K (heat acts like a reactant). Both rates rise; kf rises more. More NO₂ at the new equilibrium.'); }),
        button('cool ↓', () => { kf /= 2.2; kr /= 1.25; note('Cooling lowers K → shifts left toward N₂O₄. This flask goes colorless in ice — a classic demo.'); }),
        button('reset', () => { A = 1; B = 0; kf = 0.30; kr = 0.60; histT.length = 0; histA.length = 0; histB.length = 0; t = 0; note('Reset.'); }),
      ),
      eventOut,
      h('p', { class: 'muted' }, 'Only temperature changes K itself — concentration and volume changes just move Q, and the system chases K back.'),
    );

    // ---- ICE solver ----
    let pKa = 4.74, C0 = 0.10;
    const iceOut = h('div', { class: 'result' });
    const iceTable = h('div', {});
    function iceCalc(): void {
      const Ka = Math.pow(10, -pKa);
      // HA ⇌ H+ + A− : x² / (C0 − x) = Ka → x² + Ka·x − Ka·C0 = 0
      const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C0)) / 2;
      const approxX = Math.sqrt(Ka * C0);
      const pct = (x / C0) * 100;
      const okApprox = (approxX / C0) * 100 < 5;
      iceTable.innerHTML =
        `<table class="ref-table"><tr><th></th><th>HA</th><th>H⁺</th><th>A⁻</th></tr>` +
        `<tr><td>Initial</td><td>${C0.toFixed(3)}</td><td>≈0</td><td>0</td></tr>` +
        `<tr><td>Change</td><td>−x</td><td>+x</td><td>+x</td></tr>` +
        `<tr><td>Equilibrium</td><td>${(C0 - x).toPrecision(3)}</td><td>${x.toPrecision(3)}</td><td>${x.toPrecision(3)}</td></tr></table>`;
      iceOut.innerHTML =
        `exact (quadratic): x = [H⁺] = <b>${x.toPrecision(3)} M</b> → pH = <b class="big">${(-Math.log10(x)).toFixed(2)}</b> · ${pct.toFixed(1)}% ionized<br>` +
        `approximation x ≈ √(K<sub>a</sub>C₀) = ${approxX.toPrecision(3)} — ` +
        (okApprox ? '<b style="color:#7ae27a">valid</b> (&lt;5% rule ✓)' : '<b class="trap">NOT valid (&gt;5% — use the quadratic)</b>') +
        `<br><span class="muted">Dilute the acid and watch % ionization rise even as pH climbs — Le Chatelier on the dissociation.</span>`;
    }
    const iceCard = card('ICE table solver: HA ⇌ H⁺ + A⁻',
      slider({ label: 'pKa', min: 1, max: 10, step: 0.05, value: pKa, fmt: v => `${v.toFixed(2)} (Ka=${Math.pow(10, -v).toExponential(1)})`, onInput: v => { pKa = v; iceCalc(); } }),
      slider({ label: 'C₀ (M)', min: 0.001, max: 1, step: 0.001, value: C0, fmt: v => v.toFixed(3), onInput: v => { C0 = v; iceCalc(); } }),
      iceTable, iceOut,
    );
    iceCalc();

    // ---- Ksp solver ----
    interface Salt { name: string; m: number; n: number; ksp: number; MM: number; expr: string; common: string }
    const SALTS: Salt[] = [
      { name: 'AgCl', m: 1, n: 1, ksp: 1.8e-10, MM: 143.3, expr: 'Ksp = s·s = s²', common: 'Cl⁻' },
      { name: 'BaSO₄', m: 1, n: 1, ksp: 1.1e-10, MM: 233.4, expr: 'Ksp = s²', common: 'SO₄²⁻' },
      { name: 'PbCl₂', m: 1, n: 2, ksp: 1.7e-5, MM: 278.1, expr: 'Ksp = (s)(2s)² = 4s³', common: 'Cl⁻' },
      { name: 'CaF₂', m: 1, n: 2, ksp: 3.9e-11, MM: 78.1, expr: 'Ksp = (s)(2s)² = 4s³', common: 'F⁻' },
      { name: 'Ag₂CrO₄', m: 2, n: 1, ksp: 1.1e-12, MM: 331.7, expr: 'Ksp = (2s)²(s) = 4s³', common: 'CrO₄²⁻' },
      { name: 'Fe(OH)₃', m: 1, n: 3, ksp: 2.8e-39, MM: 106.9, expr: 'Ksp = (s)(3s)³ = 27s⁴', common: 'OH⁻' },
      { name: 'Ca₃(PO₄)₂', m: 3, n: 2, ksp: 2.1e-33, MM: 310.2, expr: 'Ksp = (3s)³(2s)² = 108s⁵', common: 'PO₄³⁻' },
    ];
    let salt = SALTS[0];
    let logC = -2; // common-ion concentration, log10 M
    const kspOut = h('div', { class: 'result' });
    const qOut = h('div', { class: 'result' });
    const catIn = h('input', { type: 'number', value: '0.001', step: '0.0001' });
    const anIn = h('input', { type: 'number', value: '0.001', step: '0.0001' });

    // Exact common-ion solubility: solve (m·s)^m · (C + n·s)^n = Ksp for s.
    // The textbook shortcut drops the n·s the dissolving solid itself adds,
    // which only holds while C >> s. Below that it diverges badly — PbCl2 at
    // [Cl-] = 1e-4 M came out at ~1700 M against a true 1.6e-2 M — so solve
    // the full expression instead. The left side is strictly increasing in s,
    // and adding a common ion can never push s above its pure-water value, so
    // [0, sPure] always brackets the root and bisection is safe.
    function commonIonSolubility(ksp: number, m: number, n: number, C: number, sPure: number): number {
      const f = (s: number) => Math.pow(m * s, m) * Math.pow(C + n * s, n) - ksp;
      let lo = 0, hi = sPure;
      for (let i = 0; i < 120; i++) {
        const mid = (lo + hi) / 2;
        if (f(mid) < 0) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }

    function kspCalc(): void {
      const { m, n, ksp, MM } = salt;
      const s = Math.pow(ksp / (Math.pow(m, m) * Math.pow(n, n)), 1 / (m + n));
      const C = Math.pow(10, logC);
      const sCommon = commonIonSolubility(ksp, m, n, C, s);
      const sApprox = Math.pow(ksp / Math.pow(C, n), 1 / m) / m;
      // Show the shortcut alongside the exact answer, and say plainly when it
      // has left its valid regime — knowing when an approximation breaks is
      // itself the olympiad skill here.
      const approxOk = Math.abs(sApprox - sCommon) / sCommon < 0.05;
      const pow = (base: string, e: number) => (e === 1 ? base : `${base}<sup>${e}</sup>`);
      const ns = n > 1 ? `${n}s` : 's';
      const exactExpr = `${pow(m > 1 ? `(${m}s)` : '(s)', m)}${pow(`(C + ${ns})`, n)} = Ksp`;
      kspOut.innerHTML =
        `<b>${salt.name}</b>: ${salt.expr} = ${ksp.toExponential(1)}<br>` +
        `molar solubility in pure water: s = <b>${s.toExponential(2)} M</b> (${(s * MM * 1000).toPrecision(2)} mg/L)<br>` +
        `with [${salt.common}] = ${C.toExponential(1)} M already present: s = <b>${sCommon.toExponential(2)} M</b> ` +
        `(suppressed ${(s / sCommon).toPrecision(3)}×)<br>` +
        `<span class="${approxOk ? 'muted' : 'trap'}">Textbook shortcut, assuming [${salt.common}] ≈ C: ${sApprox.toExponential(2)} M — ` +
        (approxOk
          ? `agrees here, because C ≫ s.`
          : `<b>invalid here.</b> C is not ≫ s, so the ${ns} contributed by the dissolving solid can't be dropped. The figure above solves ${exactExpr} exactly.`) +
        `</span><br>` +
        `<span class="muted">Common-ion effect = Le Chatelier on dissolution. The coefficient trap: for ${salt.name}, s is NOT √Ksp unless it's 1:1.</span>`;
      qCalc();
    }
    function qCalc(): void {
      const cat = Number(catIn.value), an = Number(anIn.value);
      if (!(cat > 0 && an > 0)) return;
      const Q = Math.pow(cat, salt.m) * Math.pow(an, salt.n);
      qOut.innerHTML = `Q = [cation]^${salt.m}[anion]^${salt.n} = <b>${Q.toExponential(2)}</b> vs Ksp = ${salt.ksp.toExponential(1)} → ` +
        (Q > salt.ksp ? '<b style="color:#ff8a6f">Q &gt; Ksp: precipitate forms</b> until Q falls to Ksp'
          : Q < salt.ksp ? '<b style="color:#7ae27a">Q &lt; Ksp: stays dissolved</b> (unsaturated)'
            : '<b>Q = Ksp: exactly saturated</b>');
    }
    [catIn, anIn].forEach(i => i.addEventListener('input', qCalc));
    const kspCard = card('Ksp — solubility equilibria',
      select('salt', SALTS.map(s2 => ({ value: s2.name, label: `${s2.name} (Ksp ${s2.ksp.toExponential(1)})` })), v => { salt = SALTS.find(s2 => s2.name === v)!; kspCalc(); }, salt.name),
      slider({ label: `[common ion] log₁₀`, min: -4, max: 0, step: 0.1, value: logC, fmt: v => `${Math.pow(10, v).toExponential(1)} M`, onInput: v => { logC = v; kspCalc(); } }),
      kspOut,
      h('h3', {}, 'Will a precipitate form? (mixing check)'),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, '[cation] after mixing (M)'), catIn),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, '[anion] after mixing (M)'), anIn),
      qOut,
      h('p', { class: 'muted' }, 'Remember to recompute concentrations after dilution when two solutions are mixed (each is diluted by the combined volume) BEFORE computing Q. Selective precipitation: the salt whose Ksp is exceeded first precipitates first — that\'s how Ag₂CrO₄\'s red color signals the endpoint after AgCl finishes (Mohr titration).'),
    );
    kspCalc();

    root.append(
      h('div', { class: 'cards' }, simCard, iceCard, kspCard, card('Quick quiz', quiz(EQUILIBRIUM_QUIZ, 5))),
      theory('Theory & key equations — equilibrium (highest-volume olympiad topic)', `
<h4>The law of mass action</h4>
<span class="eq">aA + bB ⇌ cC + dD: &nbsp; K = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ — omit pure solids & liquids!</span>
<ul>
<li>K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn(gas)</sup>. Reverse the reaction → 1/K. Multiply by n → Kⁿ. Add reactions → multiply K's.</li>
<li>Q uses the same expression with current (non-equilibrium) values. Q &lt; K → forward; Q &gt; K → reverse.</li>
</ul>
<h4>Le Chatelier — what actually changes K?</h4>
<table><tr><th>stress</th><th>response</th><th>K changes?</th></tr>
<tr><td>add reactant</td><td>shift right</td><td>no</td></tr>
<tr><td>shrink volume (gas)</td><td>shift to fewer gas moles</td><td>no</td></tr>
<tr><td>add inert gas, constant V</td><td><b>no shift</b> (concentrations unchanged)</td><td>no</td></tr>
<tr><td>raise T, endothermic fwd</td><td>shift right</td><td><b>K increases</b></td></tr>
<tr><td>catalyst</td><td><b>no shift</b> — reaches equilibrium faster</td><td>no</td></tr></table>
<h4>Quantitative tools</h4>
<span class="eq">van 't Hoff: ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)</span>
<ul>
<li>ICE tables: define x from stoichiometry, watch coefficient multipliers ((2x)² for 2NO₂!).</li>
<li>5% rule: if x &lt; 5% of initial, the "small x" shortcut is fine. If K is huge, run the reaction to completion first, then come back a little.</li>
<li><span class="trap">K<sub>sp</sub>: for Ca₃(PO₄)₂ → 3Ca²⁺ + 2PO₄³⁻, K<sub>sp</sub> = (3s)³(2s)² = 108s⁵. Common-ion effect lowers solubility.</span></li>
</ul>`, true),
    );

    loop();
    return {
      onShow() { visible = true; },
      onHide() { visible = false; },
    };
  },
};
