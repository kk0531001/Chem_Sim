// Thermodynamics II: entropy (microstates), Gibbs energy, ΔG° ↔ K.
import { h, card, cardWithMissions, missionLadder, theory, slider, plot, linspace, lnFactorial, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
import { THERMO2_QUIZ } from './questions1';


const R = 8.314; // J/mol·K

export const thermo2Tab: TabDef = {
  id: 'thermo2',
  label: 'Thermo II',
  group: 'Physical Chemistry',
  mount(root) {
    // ---- microstates ----
    const microCanvas = h('canvas', { width: 440, height: 240 });
    const microOut = h('div', { class: 'result' });
    const drawMicro = (N: number) => {
      const ks = linspace(0, N, N + 1);
      const lnW = ks.map(k => lnFactorial(N) - lnFactorial(Math.round(k)) - lnFactorial(N - Math.round(k)));
      const maxLnW = Math.max(...lnW);
      plot(microCanvas, [
        { xs: ks, ys: lnW.map(v => Math.exp(v - maxLnW)), color: '#6fc3ff', label: 'W (relative)' },
      ], { xLabel: 'molecules in LEFT half of box', yLabel: 'number of microstates W' });
      const wAll = 1; // all on one side
      const wHalf = Math.exp(lnFactorial(N) - 2 * lnFactorial(Math.round(N / 2)));
      microOut.innerHTML =
        `N = ${N} gas molecules, two halves of a container.<br>` +
        `W(all ${N} on left) = <b>${wAll}</b> microstate · W(even split) ≈ <b>${wHalf.toExponential(2)}</b> microstates<br>` +
        `S = k<sub>B</sub> ln W → spreading out wins by a factor of ${wHalf.toExponential(1)}.` +
        ` Gases expand, mix, and never un-mix — <b>not</b> because of forces, but because the spread-out arrangement has astronomically more microstates.`;
    };
    const microCard = card('Entropy = counting microstates (S = k ln W)',
      slider({ label: 'N molecules', min: 4, max: 200, step: 2, value: 40, onInput: drawMicro }),
      microCanvas, microOut,
    );
    drawMicro(40);

    // ---- Gibbs explorer ----
    const gibbsCanvas = h('canvas', { width: 440, height: 260 });
    const gibbsOut = h('div', { class: 'result' });
    let dH = -92, dS = -199; // Haber process defaults (kJ, J/K)
    const crossT = () => (dS !== 0 ? (dH * 1000) / dS : NaN);

    const gibbsMissions = missionLadder([
      {
        id: 'msn-th2-01',
        prompt: 'The sliders start on the Haber process (ΔH = −92 kJ/mol, ΔS = −199 J/mol·K). Read the graph and give the <b>crossover temperature</b> — the T where ΔG changes sign — to the nearest 10 K.',
        // Checked against the CURRENT slider state, not a frozen 462 K, so a
        // student who explores first and answers second isn't marked wrong.
        numeric: { label: 'crossover T (K)', placeholder: 'e.g. 350', step: 1, validate: n => Math.abs(n - crossT()) <= 15 },
        hints: [
          'ΔG = ΔH − TΔS. Crossover is where ΔG = 0.',
          'Rearranged, T = ΔH/ΔS — but mind the units: ΔH is in kJ and ΔS is in J.',
        ],
        explain: '<b>T = ΔH/ΔS = (−92 000 J)/(−199 J/K) ≈ 462 K</b> (189 °C). Below that the exothermic term wins and ammonia synthesis is spontaneous; above it the entropy penalty of 4 gas moles → 2 takes over. Industry runs at ~700 K anyway, where ΔG° is <em>un</em>favourable, because at 462 K the rate is hopeless — and then recovers the yield with 200 atm of pressure. Thermodynamics says what is possible, not what is practical.',
      },
      {
        id: 'msn-th2-02',
        prompt: 'Now build the opposite case: a reaction that is <b>non-spontaneous when cold and spontaneous when hot</b>, crossing over near <b>800 K</b>.',
        meter: () => {
          const t = crossT();
          const right = dH > 0 && dS > 0;
          return { label: right ? `entropy-driven, crossover at ${t.toFixed(0)} K · target 800 K` : 'need ΔH > 0 and ΔS > 0', pct: right ? Math.max(0, 100 - Math.abs(t - 800) / 4) : 0 };
        },
        check: () => dH > 0 && dS > 0 && Math.abs(crossT() - 800) < 40,
        hints: [
          'Which of the four ΔH/ΔS sign combinations is spontaneous only at high T?',
          'Both positive. Then pick a pair whose ratio ΔH/ΔS is about 800 — e.g. ΔH = +160 kJ with ΔS = +200 J/K.',
        ],
        explain: 'ΔH > 0, ΔS > 0 — endothermic but entropy-producing, so the −TΔS term only wins once T is large enough. This is the thermal decomposition pattern: CaCO₃ → CaO + CO₂ has ΔH ≈ +178 kJ and ΔS ≈ +161 J/K, crossing over near 1100 K, which is why a lime kiln has to be run red-hot.',
      },
    ]);

    const drawGibbs = () => {
      const Ts = linspace(1, 1500, 200);
      const dGs = Ts.map(T => dH - (T * dS) / 1000);
      const Tcross = crossT();
      plot(gibbsCanvas, [
        { xs: Ts, ys: dGs, color: '#6fc3ff', label: 'ΔG (kJ/mol)' },
        { xs: [1, 1500], ys: [0, 0], color: '#5a6a7d', dash: [4, 4] },
      ], {
        xLabel: 'T (K)', yLabel: 'ΔG (kJ/mol)',
        markers: Tcross > 0 && Tcross < 1500 ? [{ x: Tcross, y: 0, label: `T = ${Tcross.toFixed(0)} K` }] : [],
      });
      let regime: string;
      if (dH < 0 && dS > 0) regime = 'spontaneous at ALL temperatures (ΔH<0, ΔS>0)';
      else if (dH > 0 && dS < 0) regime = 'NEVER spontaneous (ΔH>0, ΔS<0)';
      else if (dH < 0 && dS < 0) regime = `spontaneous at LOW T (below ${Tcross > 0 ? Tcross.toFixed(0) + ' K' : '—'}) — enthalpy-driven`;
      else regime = `spontaneous at HIGH T (above ${Tcross > 0 ? Tcross.toFixed(0) + ' K' : '—'}) — entropy-driven`;
      gibbsOut.innerHTML = `ΔG = ΔH − TΔS → <b>${regime}</b><br>` +
        `<span class="muted">Defaults are the Haber process (N₂+3H₂→2NH₃): exothermic but entropy-negative (4 gas mol → 2), so it "wants" low T — but low T is too slow, hence 450 °C + catalyst + high P as the industrial compromise.</span>`;
      gibbsMissions.tick();
    };
    const gibbsCard = cardWithMissions('ΔG = ΔH − TΔS explorer', gibbsMissions,
      slider({ label: 'ΔH (kJ/mol)', min: -300, max: 300, step: 2, value: dH, onInput: v => { dH = v; drawGibbs(); } }),
      slider({ label: 'ΔS (J/mol·K)', min: -400, max: 400, step: 2, value: dS, onInput: v => { dS = v; drawGibbs(); } }),
      gibbsCanvas, gibbsOut,
    );
    drawGibbs();

    // ---- ΔG° ↔ K ----
    const kOut = h('div', { class: 'result' });
    let dG0 = -20, Tk = 298;
    const kCalc = () => {
      const K = Math.exp((-dG0 * 1000) / (R * Tk));
      kOut.innerHTML = `K = e<sup>−ΔG°/RT</sup> = <b class="big">${K < 0.001 || K > 9999 ? K.toExponential(2) : K.toFixed(3)}</b> at ${Tk} K<br>` +
        `${dG0 < 0 ? 'ΔG° < 0 → K > 1: products favored at equilibrium.' : dG0 > 0 ? 'ΔG° > 0 → K < 1: reactants favored (reaction still happens, just not far).' : 'ΔG° = 0 → K = 1.'}` +
        `<br><span class="muted">Every ~5.7 kJ/mol of ΔG° at 298 K shifts K by a factor of 10.</span>`;
    };
    const kCard = card('ΔG° = −RT ln K converter',
      slider({ label: 'ΔG° (kJ/mol)', min: -60, max: 60, step: 1, value: dG0, onInput: v => { dG0 = v; kCalc(); } }),
      slider({ label: 'T (K)', min: 100, max: 1200, step: 1, value: Tk, onInput: v => { Tk = v; kCalc(); } }),
      kOut,
    );
    kCalc();

    root.append(
      h('div', { class: 'cards' }, microCard, gibbsCard, kCard, card('Quick quiz', quiz(THERMO2_QUIZ, 5)), challengeLadder('thermo2')),
      theory('Theory & key equations — entropy / Gibbs energy', `
<h4>Second & third laws</h4>
<span class="eq">ΔS<sub>univ</sub> = ΔS<sub>sys</sub> + ΔS<sub>surr</sub> &gt; 0 for spontaneous · ΔS<sub>surr</sub> = −ΔH<sub>sys</sub>/T</span>
<ul>
<li>Third law: perfect crystal at 0 K has S = 0 → absolute entropies S° exist (never 0 or negative at 298 K, unlike ΔH°f).</li>
<li>ΔS°<sub>rxn</sub> = Σ nS°(products) − Σ nS°(reactants).</li>
</ul>
<h4>Predicting the sign of ΔS</h4>
<ul>
<li>Gas moles rule almost everything: Δn<sub>gas</sub> &gt; 0 → ΔS &gt; 0. Same gas moles → look at complexity/mixing.</li>
<li>S°: gas ≫ liquid &gt; solid; more atoms per molecule → more S; dissolving gas in water → ΔS &lt; 0 (!).</li>
</ul>
<h4>Gibbs energy</h4>
<span class="eq">ΔG = ΔH − TΔS &nbsp;·&nbsp; ΔG° = −RT ln K &nbsp;·&nbsp; ΔG = ΔG° + RT ln Q &nbsp;·&nbsp; ΔG° = −nFE°</span>
<ul>
<li>Four cases: (−,+) always spontaneous · (+,−) never · (−,−) low T only · (+,+) high T only. Crossover at T = ΔH/ΔS.</li>
<li><span class="trap">ΔG° &gt; 0 does NOT mean "no reaction" — it means K &lt; 1. The reaction runs until Q = K.</span></li>
<li>At equilibrium ΔG = 0 (not ΔG°!). Phase transitions at the normal transition T: ΔG = 0 → ΔS = ΔH/T (e.g., ΔS<sub>vap</sub> ≈ 88 J/mol·K for many liquids, Trouton's rule).</li>
<li>Coupling: a positive-ΔG step can be driven by a very negative one (ATP in biology; carbothermal reduction in metallurgy).</li>
</ul>`, true),
    );
  },
};
