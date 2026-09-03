// Chemical equilibrium: live N2O4 ⇌ 2NO2 kinetic simulation with Le Chatelier
// perturbations, plus an ICE-table solver.
import { h, playPause, cardWithMissions, missionLadder, theory, slider, select, button, plot, quiz, numberInput, numVal, type TabDef, type TabHandle, ctlRow, task } from './framework';
import { topicPage } from './page';
import { EQUILIBRIUM_QUIZ } from './questions1';


export const equilibriumTab: TabDef = {
  id: 'equilibrium',
  mount(root): TabHandle {
    // ---- live sim: N2O4 (A) ⇌ 2 NO2 (B) ----
    let kf = 0.30, kr = 0.60; // K = kf/kr = 0.5
    let A = 1.0, B = 0.0;     // mol/L
    const histT: number[] = [], histA: number[] = [], histB: number[] = [];
    let t = 0;
    let visible = true;
    let frameId: number | null = null;
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

    // Readings the missions check against. `fracNO2` is the fraction of the
    // nitrogen that has ended up as NO₂ — the "extent of dissociation" — which
    // is what actually responds to a volume change. The raw [NO₂] can rise for
    // two quite different reasons, so it is the wrong thing to test.
    const Kof = () => kf / kr;
    const Qof = () => (A > 1e-9 ? (B * B) / A : Infinity);
    const atEq = () => { const q = Qof(); return Number.isFinite(q) && Math.abs(q - Kof()) / Kof() < 0.03; };
    const fracNO2 = () => (A + B > 1e-9 ? B / (A + B) : 0);
    let pressedInert = false;

    const missions = missionLadder([
      {
        id: 'msn-eq-01',
        prompt: 'Push the mixture to <b>more than 50% NO₂</b> (by moles) and let it settle — <b>without</b> touching temperature, so K never moves.',
        meter: () => ({ label: `NO₂ = ${(fracNO2() * 100).toFixed(1)}% of the moles · target > 50%${atEq() ? '' : ' (still settling)'}`, pct: (fracNO2() / 0.5) * 100 }),
        check: () => Math.abs(kf - 0.30) < 1e-9 && Math.abs(kr - 0.60) < 1e-9 && atEq() && fracNO2() > 0.50,
        hints: [
          'Adding more N₂O₄ makes more NO₂ — but watch the percentage rather than the raw concentration, and see whether it goes the way you expect.',
          'The two sides have different numbers of gas molecules: 1 on the left, 2 on the right. Which volume change favours the side with more molecules?',
          'Expand the volume — a single press of "expand ×2" is enough (45.7% → 56.2%).',
        ],
        explain: 'Expanding favours the side with <b>more</b> gas molecules, so dissociation increases. Note what "+0.5 M N₂O₄" did instead: it produced more NO₂ in absolute terms but a <em>smaller</em> percentage of it — concentrating an equilibrium pushes it toward fewer particles. Neither move changed K.',
      },
      {
        id: 'msn-eq-02',
        prompt: 'Press <b>"+ Ar (inert, constant V)"</b> and watch the traces. What happens to the position of the equilibrium?',
        // Nudges toward pressing the button first, then gets out of the way.
        // Not a gate — a student who already knows the answer isn't blocked.
        meter: () => (pressedInert ? null : { label: 'press the argon button and watch the two traces', pct: 0 }),
        choices: [
          { label: 'Nothing moves', value: 'none' },
          { label: 'Shifts left (fewer moles)', value: 'left' },
          { label: 'Shifts right (more moles)', value: 'right' },
        ],
        validateChoice: v => v === 'none',
        explain: 'Nothing. Argon raises the <em>total</em> pressure but not the partial pressure of anything in the equilibrium — [N₂O₄] and [NO₂] are unchanged, so Q is unchanged and there is nothing to correct. <span class="trap">"Increase the pressure → shifts to fewer moles" is only true when the pressure rise comes from squeezing the volume.</span> At constant <em>pressure</em>, adding argon forces the volume up, and then it does shift right.',
        hints: ['Write out Q = [NO₂]²/[N₂O₄]. Does adding a gas that appears nowhere in that expression change its value at constant volume?'],
      },
      {
        id: 'msn-eq-03',
        prompt: 'Now find the one stress that changes <b>K itself</b>: get K above <b>0.80</b>.',
        meter: () => ({ label: `K = ${Kof().toFixed(2)} · target > 0.80`, pct: (Kof() / 0.8) * 100 }),
        check: () => Kof() > 0.80 && atEq(),
        hints: [
          'Four of the buttons cannot do this, no matter how many times you press them.',
          'The forward reaction is endothermic (ΔH° = +57 kJ). Treat heat as a reactant.',
        ],
        explain: 'Only <b>temperature</b> changes K. Everything else — adding, removing, compressing, expanding, catalysing — moves Q and lets the system chase the same old K. Heating an endothermic forward reaction raises K, which is why this flask goes deep brown when warmed and colourless in ice.',
      },
    ]);

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
      missions.tick();
    }

    // Tab visibility AND the student's play/pause both gate the integrator.
    // Under prefers-reduced-motion the sim opens paused on a drawn frame.
    const play = playPause(() => draw());
    function loop(): void {
      if (visible && play.playing()) {
        step();
        draw();
      }
      frameId = requestAnimationFrame(loop);
    }

    const note = (msg: string) => { eventOut.textContent = msg; };
    const simCard = cardWithMissions('Live equilibrium: N₂O₄(g) ⇌ 2NO₂(g)  (colorless ⇌ brown, ΔH° = +57 kJ)', missions,
      task('Disturb the mixture with each button in turn and watch Q move away from K and then back.'),
      play.el, simCanvas, qkOut,
      h('div', {},
        button('+0.5 M N₂O₄', () => { A += 0.5; note('Added reactant → Q < K → shifts right: some of the added N₂O₄ converts, but [N₂O₄] still ends higher than before.'); }),
        button('+0.5 M NO₂', () => { B += 0.5; note('Added product → Q > K → shifts left, consuming part of the added NO₂.'); }),
        button('compress ×2', () => { A *= 2; B *= 2; note('Halving V doubles both concentrations, but Q = [NO₂]²/[N₂O₄] quadruples the numerator → Q > K → shifts toward fewer gas moles (left). The mixture lightens.'); }),
        button('expand ×2', () => { A /= 2; B /= 2; note('Doubling V → Q < K → shifts toward more gas moles (right). More brown NO₂.'); }),
        // Deliberately a no-op on the state: argon changes the total pressure
        // and nothing else. The button exists so the "nothing happens" is
        // something the student watches rather than something they're told.
        button('+ Ar (inert, constant V)', () => {
          pressedInert = true;
          note('Argon added. Total pressure rose, but [N₂O₄] and [NO₂] did not change — so Q did not change, and neither trace moves. An inert gas at constant volume does nothing at all.');
        }),
        button('heat ↑', () => { kf *= 2.2; kr *= 1.25; note('Forward reaction is endothermic → heating raises K (heat acts like a reactant). Both rates rise; kf rises more. More NO₂ at the new equilibrium.'); }),
        button('cool ↓', () => { kf /= 2.2; kr /= 1.25; note('Cooling lowers K → shifts left toward N₂O₄. This flask goes colorless in ice — a classic demo.'); }),
        button('reset', () => { A = 1; B = 0; kf = 0.30; kr = 0.60; histT.length = 0; histA.length = 0; histB.length = 0; t = 0; note('Reset.'); }),
      ),
      eventOut,
      h('p', { class: 'muted' }, 'Only temperature changes K itself — concentration and volume changes just move Q, and the system chases K back.'),
      h('p', { class: 'muted', html: 'This simulator\'s forward/reverse rates happen to equal the stoichiometric coefficients (rate<sub>f</sub> ∝ [N₂O₄], rate<sub>r</sub> ∝ [NO₂]²) because N₂O₄ ⇌ 2NO₂ really is believed to proceed as a single elementary step both ways — not because rate laws in general can be read off a balanced equation. For any reaction that happens in more than one step, the rate law has to come from experiment (see Kinetics).' }),
    );

    // ---- ICE solver ----
    let pKa = 4.74, C0 = 0.10;
    const iceOut = h('div', { class: 'result' });
    const iceTable = h('div', {});
    // Exposed for the missions: the shortcut's validity and the ionized
    // fraction are exactly what the two goals below are about.
    let approxValid = true, pctIonized = 0;

    const iceMissions = missionLadder([
      {
        id: 'msn-eq-04',
        prompt: 'Keep the acid at acetic acid\'s pK<sub>a</sub> of <b>4.74</b> and dilute it until the "small x" shortcut <b>stops being valid</b>.',
        meter: () => ({ label: `${pctIonized.toFixed(1)}% ionized · the shortcut fails past 5%`, pct: (pctIonized / 5) * 100 }),
        check: () => Math.abs(pKa - 4.74) < 0.03 && !approxValid,
        hints: [
          'The 5% rule compares x with the initial concentration. You cannot change x without changing C₀ — so change C₀.',
          'Which direction makes x a BIGGER share of what you started with: more concentrated, or more dilute?',
          'Take C₀ down toward 0.001 M.',
        ],
        explain: 'Dilution. The shortcut assumes x is negligible next to C₀, and x only falls as √C₀ while C₀ falls linearly — so the ratio x/C₀ grows as you dilute. Below roughly 0.002 M for this acid it passes 5% and the quadratic becomes compulsory.',
      },
      {
        id: 'msn-eq-05',
        prompt: 'Diluting raised the pH (fewer H⁺ overall) <em>and</em> raised the percent ionized at the same time. Is that a contradiction?',
        hints: [
          'Percent ionized is a ratio; [H⁺] is an amount. A ratio can rise while the quantity on top falls.',
          'Kₐ is a constant at fixed temperature — nothing you do with a volumetric flask changes it.',
        ],
        choices: [
          { label: 'No — a larger share of less acid', value: 'ok' },
          { label: 'Yes — one of them must be wrong', value: 'no' },
          { label: 'No — dilution raises Kₐ', value: 'ka' },
        ],
        validateChoice: v => v === 'ok',
        explain: 'No contradiction, and K<sub>a</sub> never moved. Dilution shifts the dissociation equilibrium to the right (Le Chatelier — water is a "reactant"), so a <em>larger fraction</em> ionizes; but there is less acid to start with, so the <em>absolute</em> [H⁺] still falls and the pH rises. Fraction and amount move in opposite directions. This is Ostwald\'s dilution law.',
      },
    ]);

    function iceCalc(): void {
      const Ka = Math.pow(10, -pKa);
      // HA ⇌ H+ + A− : x² / (C0 − x) = Ka → x² + Ka·x − Ka·C0 = 0
      const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C0)) / 2;
      const approxX = Math.sqrt(Ka * C0);
      const pct = (x / C0) * 100;
      const okApprox = (approxX / C0) * 100 < 5;
      approxValid = okApprox;
      pctIonized = (approxX / C0) * 100;
      iceTable.innerHTML =
        `<div class="table-scroll"><table class="ref-table"><tr><th></th><th>HA</th><th>H⁺</th><th>A⁻</th></tr>` +
        `<tr><td>Initial</td><td>${C0.toFixed(3)}</td><td>≈0</td><td>0</td></tr>` +
        `<tr><td>Change</td><td>−x</td><td>+x</td><td>+x</td></tr>` +
        `<tr><td>Equilibrium</td><td>${(C0 - x).toPrecision(3)}</td><td>${x.toPrecision(3)}</td><td>${x.toPrecision(3)}</td></tr></table></div>`;
      iceOut.innerHTML =
        `exact (quadratic): x = [H⁺] = <b>${x.toPrecision(3)} M</b> → pH = <b class="big">${(-Math.log10(x)).toFixed(2)}</b> · ${pct.toFixed(1)}% ionized<br>` +
        `approximation x ≈ √(K<sub>a</sub>C₀) = ${approxX.toPrecision(3)} — ` +
        (okApprox ? '<b style="color:#7ae27a">valid</b> (&lt;5% rule ✓)' : '<b class="trap">NOT valid (&gt;5% — use the quadratic)</b>') +
        `<br><span class="muted">Dilute the acid and watch % ionization rise even as pH climbs — Le Chatelier on the dissociation.</span>`;
      iceMissions.tick();
    }
    const iceCard = cardWithMissions('ICE table solver: HA ⇌ H⁺ + A⁻', iceMissions,
      task('Push the concentration down at fixed pKa until the small-x approximation stops being safe, and watch the table report it.'),
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
    // Common-ion concentration, log10 M. Starts low enough that the
    // suppression mission has something to do — at the old 10⁻² M default,
    // AgCl was already suppressed 745×, past the goal before the student
    // touched anything.
    let logC = -3.5;
    const kspOut = h('div', { class: 'result' });
    const qOut = h('div', { class: 'result' });
    const catIn = numberInput({ value: 0.001, min: 1e-9, max: 10, step: 0.0001 });
    const anIn = numberInput({ value: 0.001, min: 1e-9, max: 10, step: 0.0001 });

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

    // How far the common ion has suppressed solubility, for the mission below.
    let suppression = 1;

    const kspMissions = missionLadder([
      {
        id: 'msn-eq-06',
        prompt: 'Gravimetric analysis only works if essentially all the analyte precipitates. With <b>AgCl</b> selected, add enough Cl⁻ to cut its solubility by a factor of <b>100 or more</b>.',
        meter: () => ({ label: `${salt.name}: suppressed ${suppression.toPrecision(3)}× · target 100×`, pct: (suppression / 100) * 100 }),
        check: () => salt.name === 'AgCl' && suppression >= 100,
        hints: [
          'AgCl dissolves to give one Ag⁺ and one Cl⁻, so K_sp = s². Adding Cl⁻ from elsewhere forces s down to keep the product constant.',
          'For a 1:1 salt, s falls roughly in proportion to the common-ion concentration. You need [Cl⁻] around 10⁻³ M.',
        ],
        explain: 'This is why a gravimetric chloride determination is done with a deliberate <em>excess</em> of silver: the common ion drives the residual dissolved AgCl down by orders of magnitude, so what stays in solution is small enough to ignore when you weigh the precipitate. Push the excess much further, though, and AgCl starts redissolving as [AgCl₂]⁻ — an effect this simple K_sp model does not include.',
      },
      {
        id: 'msn-eq-07',
        prompt: 'Switch the salt above to <b>Ag₂CrO₄</b>, then use the mixing-check calculator below: with the anion field (CrO₄²⁻) set to <b>0.010</b>, dial in the cation (Ag⁺) concentration at which the red Ag₂CrO₄ indicator is JUST about to precipitate (Q ≈ Ksp).',
        meter: () => {
          if (salt.name !== 'Ag₂CrO₄') return { label: 'select Ag₂CrO₄ above first', pct: 0 };
          const an = numVal(anIn), cat = numVal(catIn);
          if (!(an > 0 && cat > 0)) return { label: 'enter both concentrations below', pct: 0 };
          const Q = cat * cat * an;
          return { label: `Q = ${Q.toExponential(2)} vs Ksp = ${salt.ksp.toExponential(1)} · target Q ≈ Ksp`, pct: Math.min(100, (Q / salt.ksp) * 100) };
        },
        check: () => {
          if (salt.name !== 'Ag₂CrO₄') return false;
          const an = numVal(anIn), cat = numVal(catIn);
          if (!(an > 0 && cat > 0) || Math.abs(an - 0.010) / 0.010 > 0.05) return false;
          const Q = cat * cat * an;
          return Math.abs(Q - salt.ksp) / salt.ksp < 0.15;
        },
        verify: true,
        hints: [
          'Q for Ag₂CrO₄ = [Ag⁺]²[CrO₄²⁻]. Set that equal to Ksp and solve for [Ag⁺].',
          '[Ag⁺] ≈ 1.0×10⁻⁵ M when [CrO₄²⁻] = 0.010 M.',
        ],
        explain: 'At [Ag⁺] ≈ 1.05×10⁻⁵ M, Ag₂CrO₄ just reaches Q = Ksp. Compare that to AgCl\'s threshold under the same 0.010 M common-ion concentration: [Ag⁺] = Ksp/[Cl⁻] = 1.8×10⁻⁸ M — nearly <b>600× lower</b>. That gap is the whole Mohr-titration trick: essentially all the Cl⁻ has already precipitated as AgCl by the time enough Ag⁺ is around for the red Ag₂CrO₄ endpoint color to appear.',
      },
    ]);

    function kspCalc(): void {
      const { m, n, ksp, MM } = salt;
      const s = Math.pow(ksp / (Math.pow(m, m) * Math.pow(n, n)), 1 / (m + n));
      const C = Math.pow(10, logC);
      const sCommon = commonIonSolubility(ksp, m, n, C, s);
      suppression = s / sCommon;
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
      kspMissions.tick();
      qCalc();
    }
    function qCalc(): void {
      const cat = numVal(catIn), an = numVal(anIn);
      if (!(cat > 0 && an > 0)) { kspMissions.tick(); return; }
      const Q = Math.pow(cat, salt.m) * Math.pow(an, salt.n);
      qOut.innerHTML = `Q = [cation]^${salt.m}[anion]^${salt.n} = <b>${Q.toExponential(2)}</b> vs Ksp = ${salt.ksp.toExponential(1)} → ` +
        (Q > salt.ksp ? '<b style="color:#ff8a6f">Q &gt; Ksp: precipitate forms</b> until Q falls to Ksp'
          : Q < salt.ksp ? '<b style="color:#7ae27a">Q &lt; Ksp: stays dissolved</b> (unsaturated)'
            : '<b>Q = Ksp: exactly saturated</b>');
      // Mission 7 reads the cation/anion inputs directly, so its meter needs to
      // repaint on every keystroke here too, not just when the salt/common-ion
      // controls above trigger kspCalc().
      kspMissions.tick();
    }
    [catIn, anIn].forEach(i => i.addEventListener('input', qCalc));
    const kspCard = cardWithMissions('Ksp — solubility equilibria', kspMissions,
      task('Add a common ion and watch molar solubility fall, then use the mixing check below to decide whether a precipitate forms.'),
      select('salt', SALTS.map(s2 => ({ value: s2.name, label: `${s2.name} (Ksp ${s2.ksp.toExponential(1)})` })), v => { salt = SALTS.find(s2 => s2.name === v)!; kspCalc(); }, salt.name),
      slider({ label: `[common ion] log₁₀`, min: -4, max: 0, step: 0.1, value: logC, fmt: v => `${Math.pow(10, v).toExponential(1)} M`, onInput: v => { logC = v; kspCalc(); } }),
      kspOut,
      h('h3', {}, 'Will a precipitate form? (mixing check)'),
      ctlRow('[cation] after mixing (M)', catIn),
      ctlRow('[anion] after mixing (M)', anIn),
      qOut,
      h('p', { class: 'muted' }, 'Remember to recompute concentrations after dilution when two solutions are mixed (each is diluted by the combined volume) BEFORE computing Q. Selective precipitation: the salt whose Ksp is exceeded first precipitates first — that\'s how Ag₂CrO₄\'s red color signals the endpoint after AgCl finishes (Mohr titration).'),
    );
    kspCalc();

    root.append(topicPage('equilibrium', {
      sims: [simCard, iceCard, kspCard],
      quiz: quiz(EQUILIBRIUM_QUIZ, 10),
      theory: [
        theory('Basics — Chemical Equilibrium', `
<h3>What this is about</h3>
<p>Most reactions do not run until a reactant is gone. They stop part-way and stay there, and this block covers what that resting point is, how it is measured, and what moves it.</p>
<h3>Equilibrium is busy, not still</h3>
<p>Seal N₂O₄ gas in a flask and some of it breaks apart into NO₂. As NO₂ builds up, pairs of NO₂ start joining back into N₂O₄. Before long the two reactions are running at the same speed. From then on the amounts stop changing, and that state is chemical equilibrium.</p>
<p>Nothing has actually stopped. Molecules keep converting in both directions, only at matching rates, which is why equilibrium is called dynamic. A double arrow ⇌ replaces → to show that a reaction settles this way.</p>
<p>The amounts that stop changing are hardly ever equal to each other. Equal rates and equal concentrations are two different claims, and only the first one is true.</p>
<h3>The equilibrium constant</h3>
<p>The equilibrium constant, K, is the ratio of product amounts to reactant amounts once a reaction has settled. For N₂O₄(g) ⇌ 2NO₂(g) it is <span class="eq">K = [NO₂]² ÷ [N₂O₄]</span>. Square brackets mean concentration in mol/L, and each concentration is raised to the power of its coefficient in the balanced equation. Suppose a flask settles at [NO₂] = 0.60 M and [N₂O₄] = 0.90 M. Then K = 0.60² ÷ 0.90 = 0.40.</p>
<p>K is one number for one reaction at one temperature. A K far above 1 makes the top of the fraction large, so products dominate at equilibrium. A K far below 1 means the mixture is mostly reactants. K says nothing at all about how long the mixture took to get there.</p>
<h3>Solids and pure liquids are left out</h3>
<p>A pure solid or a pure liquid keeps the same density however much of it sits in the flask, so it has no concentration that can change. Its fixed value is folded into K and it is simply left out of the expression. Only gases and dissolved substances are written in.</p>
<h3>Q says which way the reaction will move</h3>
<p>The reaction quotient, Q, is the same fraction as K but worked out from the amounts present right now rather than at equilibrium. Comparing the two tells you what happens next. Q smaller than K means there is too little product, so the reaction runs forward. Q larger than K means it runs backward. Q equal to K means the mixture already has its equilibrium composition and nothing shifts.</p>
<h3>What moves it, and what does not</h3>
<p>Adding a reactant, removing a product or squeezing a gas mixture all change Q. The reaction then shifts until Q matches K again, but K itself is untouched. A catalyst speeds the forward and reverse reactions up by the same amount, so it arrives at the same equilibrium sooner and changes neither Q nor K.</p>
<p>Temperature is the one change that alters K. Splitting N₂O₄ into NO₂ absorbs 57 kJ per mole, so warming the flask favours the split and raises K. The gas darkens on warming and pales in ice, because NO₂ is brown and N₂O₄ is colourless. The first card runs this reaction live with K and Q both on screen.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Say what is equal at equilibrium and what is not.</li>
<li>Write K for a simple gas reaction, leave out pure solids and liquids, and read off what a large or small K means.</li>
<li>Compare Q with K to say which way a mixture will move, and name the one change that alters K.</li>
</ul>`, true),
        theory('Exam-level reference — Chemical Equilibrium', `
<h3>The law of mass action</h3>
<span class="eq">aA + bB ⇌ cC + dD: &nbsp; K = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ — omit pure solids & liquids!</span>
<ul>
<li>K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn(gas)</sup>. Reverse the reaction → 1/K. Multiply by n → Kⁿ. Add reactions → multiply K's.</li>
<li>Q uses the same expression with current (non-equilibrium) values. Q &lt; K → forward; Q &gt; K → reverse.</li>
</ul>
<h3>Le Chatelier — what actually changes K?</h3>
<div class="table-scroll"><table><tr><th>stress</th><th>response</th><th>K changes?</th></tr>
<tr><td>add reactant</td><td>shift right</td><td>no</td></tr>
<tr><td>shrink volume (gas)</td><td>shift to fewer gas moles</td><td>no</td></tr>
<tr><td>add inert gas, constant V</td><td><b>no shift</b> (concentrations unchanged)</td><td>no</td></tr>
<tr><td>raise T, endothermic fwd</td><td>shift right</td><td><b>K increases</b></td></tr>
<tr><td>catalyst</td><td><b>no shift</b> — reaches equilibrium faster</td><td>no</td></tr></table></div>
<h3>Quantitative tools</h3>
<span class="eq">van 't Hoff: ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)</span>
<ul>
<li>ICE tables: define x from stoichiometry, watch coefficient multipliers ((2x)² for 2NO₂!).</li>
<li>5% rule: if x &lt; 5% of initial, the "small x" shortcut is fine. If K is huge, run the reaction to completion first, then come back a little.</li>
<li><span class="trap">K<sub>sp</sub>: for Ca₃(PO₄)₂ → 3Ca²⁺ + 2PO₄³⁻, K<sub>sp</sub> = (3s)³(2s)² = 108s⁵. Common-ion effect lowers solubility.</span></li>
</ul>`),
      ],
    }));

    loop();
    return {
      onShow() { visible = true; },
      onHide() { visible = false; },
      onDestroy() { if (frameId !== null) cancelAnimationFrame(frameId); },
    };
  },
};
