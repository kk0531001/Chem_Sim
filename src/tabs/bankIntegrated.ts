// Integrated Challenges — multi-topic, multi-step Olympiad problems that mix two
// or more areas and demand experimental design, data interpretation, graph
// analysis, and open-response reasoning. All ORIGINAL (format/difficulty matched
// to CCO/IChO, never copied). Reuses the FRQ multi-part type + worked solutions.
import { miniPlot } from './framework';
import type { ProblemSet } from './bankCCO';

// van't Hoff data for N2O4(g) ⇌ 2NO2(g): consistent with ΔH° ≈ +57 kJ/mol.
const VH_T = [298, 320, 340, 360];
const VH_K = [0.15, 0.73, 2.59, 7.9];
const VH_INVT = VH_T.map(t => 1000 / t);          // 1000/T
const VH_LNK = VH_K.map(k => Math.log(k));
const vantHoffPlot = miniPlot(
  [{ xs: VH_INVT, ys: VH_LNK, color: '#e8590c' }],
  { xLabel: '1000 / T  (K⁻¹)', yLabel: 'ln K' },
);

// Potentiometric titration curve: 50.00 mL of 0.1000 M Fe²⁺ with 0.1000 M Ce⁴⁺.
const TITR_V = [0, 5, 10, 20, 25, 30, 40, 45, 49, 49.9, 50, 50.1, 51, 55, 60];
const TITR_E = [0.55, 0.73, 0.75, 0.78, 0.79, 0.80, 0.83, 0.85, 0.90, 0.99, 1.06, 1.20, 1.38, 1.43, 1.44];
const titrationPlot = miniPlot(
  [{ xs: TITR_V, ys: TITR_E, color: '#e8590c' },
   { xs: [50, 50], ys: [0.5, 1.5], color: '#7c8798', dashed: true }],
  { xLabel: 'V(Ce⁴⁺) added / mL', yLabel: 'E / V', yMin: 0.5, yMax: 1.5 },
);

// --- Kinetics + Experimental Data -------------------------------------------
// Second-order decay of NO2 modelled exactly: 1/[A] = 1/[A]0 + kt, [A]0 = 0.0500 M,
// k = 0.500 M^-1 s^-1, so the tabulated concentrations ARE the model's own values.
const NO2_T = [0, 20, 40, 60, 100, 160];
const NO2_C = NO2_T.map(t => 1 / (20 + 0.5 * t));
const firstOrderTestPlot = miniPlot(
  [{ xs: NO2_T, ys: NO2_C.map(c => Math.log(c)), color: '#e8590c' }],
  { xLabel: 't / s', yLabel: 'ln [NO₂]' },
);
const secondOrderTestPlot = miniPlot(
  [{ xs: NO2_T, ys: NO2_C.map(c => 1 / c), color: '#e8590c' }],
  { xLabel: 't / s', yLabel: '1 / [NO₂]  (M⁻¹)' },
);

// Arrhenius set: A = 1.0e11 s^-1, Ea = 80.0 kJ/mol, rounded to 3 s.f.
const ARR_T = [300, 310, 320, 330, 340];
const ARR_K = [1.17e-3, 3.30e-3, 8.70e-3, 2.17e-2, 5.11e-2];
const arrheniusPlot = miniPlot(
  [{ xs: ARR_T.map(t => 1000 / t), ys: ARR_K.map(k => Math.log(k)), color: '#e8590c' }],
  { xLabel: '1000 / T  (K⁻¹)', yLabel: 'ln k' },
);

// --- Acid–Base + Thermodynamics ---------------------------------------------
// Thermometric titration: linear rise to the equivalence volume, then a plateau.
const TT_V = [0, 4, 8, 12, 16, 20, 24, 28, 32];
const TT_TEMP = [21.00, 21.80, 22.60, 23.40, 24.20, 25.00, 25.00, 25.00, 25.00];
const thermometricPlot = miniPlot(
  [{ xs: TT_V, ys: TT_TEMP, color: '#e8590c' },
   { xs: [20, 20], ys: [20.5, 25.5], color: '#7c8798', dashed: true }],
  { xLabel: 'V(NaOH) added / mL', yLabel: 'T / °C', yMin: 20.5, yMax: 25.5 },
);

export const INTEGRATED_SETS: ProblemSet[] = [
  // ================= THERMODYNAMICS + EQUILIBRIUM =================
  {
    id: 'int-thermo-eq', month: 'Integrated', label: 'Thermodynamics + Equilibrium',
    blurb: 'van\'t Hoff graph analysis, coupling ΔG°/K, decomposition temperature, and Le Chatelier reasoning.',
    problems: [
      {
        id: 'int-thermo-eq-001',
        topic: 'thermo', title: 'ΔH° from the temperature dependence of K',
        prompt: 'For the equilibrium \\(\\ce{N2O4(g) <=> 2NO2(g)}\\), the equilibrium constant \\(K_p\\) was measured at four temperatures:'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px"><tr><td>T / K</td><td>298</td><td>320</td><td>340</td><td>360</td></tr>'
          + '<tr><td>K_p</td><td>0.15</td><td>0.73</td><td>2.59</td><td>7.9</td></tr></table></div>'
          + 'A plot of \\(\\ln K_p\\) versus \\(1/T\\) is shown.' + vantHoffPlot,
        parts: [
          { q: '(a) Explain why a graph of ln K vs 1/T is used, and derive what its slope represents.', a: 'The van\'t Hoff equation \\(\\ln K = -\\dfrac{\\Delta H^\\circ}{R}\\cdot\\dfrac{1}{T} + \\dfrac{\\Delta S^\\circ}{R}\\) is linear in \\(1/T\\): plotting \\(\\ln K\\) vs \\(1/T\\) gives a straight line of <b>slope \\(-\\Delta H^\\circ/R\\)</b> and intercept \\(\\Delta S^\\circ/R\\). Linearising lets you extract both thermodynamic quantities from measurements at several temperatures.' },
          { q: '(b) Use the two end points to estimate ΔH°.', a: 'Slope \\(= \\dfrac{\\ln 7.9 - \\ln 0.15}{(1/360) - (1/298)} = \\dfrac{2.07-(-1.90)}{0.002778 - 0.003356} = \\dfrac{3.97}{-5.78\\times10^{-4}} = -6.87\\times10^{3}\\ \\text{K}\\). Then \\(\\Delta H^\\circ = -R\\times\\text{slope} = -8.314\\times(-6870) = \\mathbf{+57.1\\ kJ/mol}\\).' },
          { q: '(c) Is the reaction endothermic or exothermic? Cross-check with Le Chatelier.', a: 'ΔH° > 0 → <b>endothermic</b>. Consistent with the data: raising T increases K (more dissociation to NO₂). Le Chatelier: heat behaves as a reactant, so heating shifts \\(\\ce{N2O4 -> 2NO2}\\) forward — and the sealed tube visibly darkens (brown NO₂) on warming.' },
          { q: '(d) Find ΔG° and ΔS° at 298 K.', a: '\\(\\Delta G^\\circ = -RT\\ln K = -8.314(298)\\ln(0.15) = -8.314(298)(-1.90) = \\mathbf{+4.7\\ kJ/mol}\\) (non-spontaneous as written at 298 K). Then \\(\\Delta S^\\circ = \\dfrac{\\Delta H^\\circ - \\Delta G^\\circ}{T} = \\dfrac{57.1-4.7}{298}\\times10^{3} = \\mathbf{+176\\ J/mol\\,K}\\) — large and positive, as expected when 1 mol gas → 2 mol gas.' },
          { q: '(e) Design an experiment to obtain each K_p value.', a: 'Seal a known amount of N₂O₄ in a rigid vessel of known volume; hold it in a thermostat at temperature T until constant. Measure the <b>total pressure</b> \\(P\\) (a pressure transducer) — or the NO₂ colour intensity by spectrophotometry at 400 nm (Beer\'s law). From the mass/moles charged and the measured P, an ICE table gives the partial pressures and hence \\(K_p = P_{NO_2}^2/P_{N_2O_4}\\). Repeat at each T, allowing equilibration each time; plot ln K vs 1/T.' },
        ],
      },
      {
        id: 'int-thermo-eq-002',
        topic: 'thermo', title: 'Decomposition temperature of limestone',
        prompt: 'For \\(\\ce{CaCO3(s) <=> CaO(s) + CO2(g)}\\): \\(\\Delta H^\\circ = +178\\ \\text{kJ/mol}\\), \\(\\Delta S^\\circ = +161\\ \\text{J/mol·K}\\) (treat both as T-independent).',
        parts: [
          { q: '(a) Write the equilibrium constant expression and explain the form.', a: '\\(K_p = P_{CO_2}\\). Pure solids have activity 1 and do not appear, so the position of equilibrium is fixed entirely by the CO₂ pressure above the solid at that T.' },
          { q: '(b) Find the temperature at which the CO₂ pressure reaches 1 atm.', a: 'At \\(P_{CO_2}=1\\) atm, \\(K_p = 1\\Rightarrow \\Delta G^\\circ = -RT\\ln K = 0\\). So \\(T = \\dfrac{\\Delta H^\\circ}{\\Delta S^\\circ} = \\dfrac{178000}{161} = \\mathbf{1106\\ K\\ (833\\,^\\circ C)}\\) — the decomposition temperature.' },
          { q: '(c) Below that temperature, is decomposition spontaneous in open air (P_CO₂ ≈ 3×10⁻⁴ atm)? Reason it out.', a: 'Spontaneity needs \\(Q < K\\). In open air \\(Q = P_{CO_2}=3\\times10^{-4}\\) atm is tiny, so even well below 1106 K the reaction can proceed until \\(P_{CO_2}\\) builds up to \\(K_p(T)\\). \\(\\Delta G = \\Delta G^\\circ + RT\\ln Q\\): the very negative \\(RT\\ln Q\\) term makes ΔG < 0 at lower T than the "1 atm" figure suggests. In a <b>sealed</b> vessel CO₂ accumulates and the reaction stops at equilibrium.' },
          { q: '(d) Explain the large positive ΔS°, and predict the effect of raising T.', a: 'A gas (CO₂) is produced from a solid → a big rise in disorder, hence \\(\\Delta S^\\circ>0\\). Raising T increases K (endothermic, van\'t Hoff) and makes \\(-T\\Delta S^\\circ\\) more negative, so decomposition becomes increasingly favourable — the basis of the lime kiln.' },
        ],
      },
      {
        id: 'int-thermo-eq-003',
        topic: 'equilibrium', title: 'Solubility, temperature, and the common-ion effect',
        prompt: 'For \\(\\ce{PbCl2(s) <=> Pb^2+ + 2Cl-}\\), \\(K_{sp} = 1.6\\times10^{-5}\\) at 25 °C and \\(3.3\\times10^{-5}\\) at 50 °C.',
        parts: [
          { q: '(a) Determine the molar solubility in pure water at 25 °C.', a: 'Let \\(s=[\\ce{Pb^2+}]\\), \\([\\ce{Cl-}]=2s\\): \\(K_{sp}=s(2s)^2=4s^3\\Rightarrow s=\\left(\\dfrac{1.6\\times10^{-5}}{4}\\right)^{1/3}=\\mathbf{1.6\\times10^{-2}\\ M}\\).' },
          { q: '(b) Use the two Ksp values to estimate ΔH°_soln (van\'t Hoff).', a: '\\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{\\Delta H^\\circ}{R}\\left(\\dfrac1{T_2}-\\dfrac1{T_1}\\right)\\). \\(\\ln(3.3/1.6)=0.724 = -\\dfrac{\\Delta H^\\circ}{8.314}\\left(\\dfrac1{323}-\\dfrac1{298}\\right) = -\\dfrac{\\Delta H^\\circ}{8.314}(-2.60\\times10^{-4})\\Rightarrow \\Delta H^\\circ = \\mathbf{+23\\ kJ/mol}\\) (endothermic — solubility rises with T ✓).' },
          { q: '(c) Find the solubility in 0.10 M NaCl and explain the shift.', a: 'Common ion: \\([\\ce{Cl-}]\\approx0.10\\) M. \\(K_{sp}=[\\ce{Pb^2+}](0.10)^2\\Rightarrow[\\ce{Pb^2+}]=\\dfrac{1.6\\times10^{-5}}{0.010}=\\mathbf{1.6\\times10^{-3}\\ M}\\) — a 10× drop. Added Cl⁻ pushes \\(Q>K_{sp}\\), precipitating PbCl₂ until equilibrium is restored (Le Chatelier).' },
          { q: '(d) At very high [Cl⁻], PbCl₂ redissolves as [PbCl₄]²⁻. Reconcile this with part (c).', a: 'The simple common-ion analysis ignores <b>complex formation</b>. At high [Cl⁻] the coupled equilibrium \\(\\ce{PbCl2 + 2Cl- <=> [PbCl4]^2-}\\) (large \\(K_f\\)) consumes the solid, so total dissolved lead rises again. Overall solubility is the sum over all species — a U-shaped curve vs [Cl⁻]. <span class="trap">Common-ion suppression only holds until complexation takes over.</span>' },
        ],
      },
    ],
  },

  // ================= ORGANIC + SPECTROSCOPY =================
  {
    id: 'int-org-spec', month: 'Integrated', label: 'Organic + Spectroscopy',
    blurb: 'Track a multi-step synthesis and confirm each product from IR/NMR/MS; distinguish isomers spectroscopically.',
    problems: [
      {
        id: 'int-org-spec-001',
        topic: 'organic', title: 'A three-step synthesis, confirmed spectroscopically',
        prompt: 'Toluene (\\(\\ce{C6H5CH3}\\)) is taken through: <b>Step 1</b> hot KMnO₄; <b>Step 2</b> SOCl₂; <b>Step 3</b> excess ethanol. Reason out each product and confirm with spectra.',
        parts: [
          { q: '(a) Step 1 product + one diagnostic IR/NMR feature.', a: 'Benzylic oxidation → <b>benzoic acid, \\(\\ce{C6H5COOH}\\)</b>. IR: very broad O–H 2500–3300 cm⁻¹ over the C–H region + C=O ~1690. ¹H NMR: broad \\(\\delta\\) 12 (1H, COOH) + 5 aromatic H.' },
          { q: '(b) Step 2 product and why SOCl₂ is chosen.', a: '<b>Benzoyl chloride, \\(\\ce{C6H5COCl}\\)</b>. SOCl₂ converts –COOH → –COCl with gaseous by-products (SO₂, HCl) that escape, driving the reaction and easing purification. IR C=O shifts UP to ~1770 cm⁻¹ (acid chloride), and the broad O–H disappears.' },
          { q: '(c) Step 3 product; predict its ¹H NMR and MS.', a: '<b>Ethyl benzoate, \\(\\ce{C6H5COOCH2CH3}\\)</b>. ¹H NMR: \\(\\delta\\) 8.0 & 7.4 (5H, aromatic), \\(\\delta\\) 4.35 (q, 2H, OCH₂), \\(\\delta\\) 1.38 (t, 3H, CH₃). IR C=O ~1720. MS: M⁺ = 150; base peak m/z 105 = \\(\\ce{C6H5CO+}\\) (loss of OEt, 45), and 77 = phenyl.' },
          { q: '(d) You are handed a bottle labelled "ethyl benzoate" but suspect it is benzoic acid. Which single technique settles it fastest, and what would you see?', a: 'A quick <b>IR</b>: benzoic acid shows the unmistakable very broad O–H (2500–3300) with C=O ~1690; ethyl benzoate has no O–H and C=O ~1720 plus strong C–O bands (1100–1300). Alternatively, add NaHCO₃ — the acid fizzes (CO₂), the ester does not.' },
        ],
      },
      {
        id: 'int-org-spec-002',
        topic: 'organic', title: 'Unknown from formula, IR, NMR and MS',
        prompt: 'An unknown contains only C, H, O. Combustion gives 62.0% C, 10.4% H (rest O). MS: M⁺ = 116. IR: strong 1740 cm⁻¹, no broad O–H. ¹H NMR: \\(\\delta\\) 2.05 (s, 3H), \\(\\delta\\) 4.10 (t, 2H), \\(\\delta\\) 1.6 (m, 2H), \\(\\delta\\) 1.4 (m, 2H), \\(\\delta\\) 0.93 (t, 3H).',
        parts: [
          { q: '(a) Determine the molecular formula.', a: 'In 100 g: C 62.0/12 = 5.17, H 10.4/1 = 10.4, O 27.6/16 = 1.73 → ratio 5.17:10.4:1.73 = 3:6:1 → empirical \\(\\ce{C3H6O}\\) (58). M⁺ = 116 = 2×58 → molecular formula \\(\\mathbf{\\ce{C6H12O2}}\\).' },
          { q: '(b) Degrees of unsaturation and what the IR shows.', a: '\\(\\text{DoU} = (2\\cdot6+2-12)/2 = 1\\). Sharp 1740 with no O–H = an <b>ester carbonyl</b> (the single degree of unsaturation).' },
          { q: '(c) Assemble the structure from the NMR.', a: '\\(\\delta\\) 2.05 (s, 3H) isolated CH₃ on C=O = acetate \\(\\ce{CH3CO-}\\). \\(\\delta\\) 4.10 (t, 2H, OCH₂) then 1.6/1.4 (2H each) then 0.93 (t, 3H) = an n-butyl chain on oxygen. Structure: <b>n-butyl acetate, \\(\\ce{CH3COOCH2CH2CH2CH3}\\)</b>.' },
          { q: '(d) Predict the two dominant MS fragments and justify.', a: 'm/z <b>43</b> = acylium \\(\\ce{CH3CO+}\\) (very stable) and m/z <b>56</b> = loss of acetic acid (60) from M⁺ giving \\(\\ce{C4H8+}\\) via a McLafferty-type rearrangement. The 43 acylium usually dominates ester spectra.' },
        ],
      },
      {
        id: 'int-org-spec-003',
        topic: 'organic', title: 'Telling isomers apart by spectroscopy',
        prompt: 'Three compounds share the formula \\(\\ce{C3H6O}\\): propanal, acetone (propan-2-one), and prop-2-en-1-ol (allyl alcohol).',
        parts: [
          { q: '(a) Use IR to separate the alcohol from the two carbonyls.', a: 'Allyl alcohol shows a broad O–H (3200–3550) and a weak C=C (~1650) but <b>no</b> strong ~1715 carbonyl. Both propanal and acetone show a strong C=O (~1715–1730) and no O–H.' },
          { q: '(b) Use ¹H NMR to distinguish propanal from acetone.', a: 'Propanal has the diagnostic <b>aldehyde H at δ 9.7</b> (t, 1H, coupled to CH₂), plus a CH₂ (~2.4) and CH₃ (~1.1). Acetone is a <b>single 6H singlet at δ 2.1</b> (two equivalent CH₃, no neighbours). The δ 9.7 peak alone is decisive.' },
          { q: '(c) Predict a distinguishing MS fragment for acetone.', a: 'Acetone (M⁺ = 58) loses •CH₃ to give the strong acylium m/z <b>43</b> (\\(\\ce{CH3CO+}\\)), typically the base peak. Propanal also shows 29 (\\(\\ce{CHO+}\\)/\\(\\ce{C2H5+}\\)) and loss of 29.' },
          { q: '(d) Design a single wet-chemical test that flags the aldehyde specifically.', a: 'Tollens\' reagent (\\(\\ce{[Ag(NH3)2]+}\\)) gives a <b>silver mirror</b> with propanal (aldehydes are oxidised) but not with acetone (ketone) or the alcohol. Fehling\'s/Benedict\'s (brick-red \\(\\ce{Cu2O}\\)) works similarly. This complements the spectroscopy with a fast confirmatory test.' },
        ],
      },
    ],
  },

  // ================= ELECTROCHEMISTRY + EQUILIBRIUM =================
  {
    id: 'int-echem-eq', month: 'Integrated', label: 'Electrochemistry + Equilibrium',
    blurb: 'Extract Ksp from electrode potentials, couple Nernst with acid/base and complexation, and read a titration curve.',
    problems: [
      {
        id: 'int-echem-eq-001',
        topic: 'redox', title: 'Ksp of AgCl from electrode potentials',
        prompt: 'Standard reduction potentials: \\(\\ce{Ag+ + e- -> Ag}\\), \\(E^\\circ = +0.800\\) V; \\(\\ce{AgCl + e- -> Ag + Cl-}\\), \\(E^\\circ = +0.222\\) V.',
        parts: [
          { q: '(a) Explain how these two potentials encode the solubility equilibrium of AgCl.', a: 'Both reduce Ag to the metal, but one starts from free \\(\\ce{Ag+}\\) and the other from \\(\\ce{Ag+}\\) held at the low concentration fixed by \\(\\ce{AgCl <=> Ag+ + Cl-}\\). Subtracting the half-reactions gives exactly \\(\\ce{AgCl <=> Ag+ + Cl-}\\), so the potential difference is a direct measure of \\(K_{sp}\\).' },
          { q: '(b) Calculate Ksp.', a: 'For \\(\\ce{AgCl <=> Ag+ + Cl-}\\): \\(E^\\circ_{cell} = E^\\circ(\\ce{AgCl/Ag}) - E^\\circ(\\ce{Ag+/Ag}) = 0.222 - 0.800 = -0.578\\) V. Then \\(\\log K_{sp} = \\dfrac{nE^\\circ}{0.0592} = \\dfrac{(1)(-0.578)}{0.0592} = -9.76\\Rightarrow K_{sp} = \\mathbf{1.7\\times10^{-10}}\\) ✓ (textbook \\(1.8\\times10^{-10}\\)).' },
          { q: '(c) Predict the potential of a silver electrode in 0.10 M Cl⁻ saturated with AgCl.', a: '\\([\\ce{Ag+}] = K_{sp}/[\\ce{Cl-}] = 1.7\\times10^{-10}/0.10 = 1.7\\times10^{-9}\\) M. Nernst: \\(E = 0.800 + 0.0592\\log(1.7\\times10^{-9}) = 0.800 - 0.518 = \\mathbf{+0.282\\ V}\\) — consistent with the AgCl/Ag couple at \\([\\ce{Cl-}]=0.10\\).' },
          { q: '(d) A ligand that forms [Ag(NH₃)₂]⁺ is added. Which way does E shift, and what does that reveal about coupling?', a: 'Complexation lowers free \\([\\ce{Ag+}]\\), so by Nernst \\(E\\) <b>drops</b>. The measured shift gives \\(K_f\\) of the ammine — the same trick as (b): an electrode reports free-ion activity, so any coupled equilibrium (solubility, complexation, protonation) that changes it can be quantified potentiometrically.' },
        ],
      },
      {
        id: 'int-echem-eq-002',
        topic: 'redox', title: 'Reading a redox titration curve',
        prompt: '50.00 mL of 0.1000 M \\(\\ce{Fe^2+}\\) is titrated with 0.1000 M \\(\\ce{Ce^4+}\\) (\\(\\ce{Fe^2+ + Ce^4+ -> Fe^3+ + Ce^3+}\\)). \\(E^\\circ(\\ce{Fe^3+/Fe^2+}) = 0.77\\) V, \\(E^\\circ(\\ce{Ce^4+/Ce^3+}) = 1.44\\) V. The measured electrode potential vs volume is shown.'
          + titrationPlot,
        parts: [
          { q: '(a) From the graph, locate the equivalence point and justify the volume.', a: 'The near-vertical jump is centred at <b>V = 50.00 mL</b> (dashed line). Stoichiometry is 1:1 and both solutions are 0.1000 M, so \\(V_{eq} = (0.1000\\times50.00)/0.1000 = 50.00\\) mL — matching the midpoint of the break.' },
          { q: '(b) What is the potential at the half-equivalence point (25.00 mL), and why?', a: 'There \\([\\ce{Fe^3+}]=[\\ce{Fe^2+}]\\), so \\(E = E^\\circ(\\ce{Fe^3+/Fe^2+}) = \\mathbf{0.77\\ V}\\) — the reading is buffered against the Fe couple before the equivalence point (curve is flat near 0.77–0.80 V, as plotted).' },
          { q: '(c) Calculate the equivalence-point potential.', a: 'For a 1:1 reaction, \\(E_{eq} = \\dfrac{E^\\circ_{Fe} + E^\\circ_{Ce}}{2} = \\dfrac{0.77 + 1.44}{2} = \\mathbf{1.10\\ V}\\) — the steep midpoint of the jump.' },
          { q: '(d) Design the endpoint detection and name a suitable indicator.', a: 'Detect the potential jump with a <b>Pt indicator electrode</b> vs a reference (SCE) — potentiometric endpoint at the inflection. For a visual endpoint use a redox indicator whose transition potential lies in the break, e.g. <b>ferroin</b> (\\(E^\\circ\\approx1.06\\) V, red → pale blue). Take fine (0.1 mL) increments through the jump and plot ΔE/ΔV to pin the maximum.' },
        ],
      },
      {
        id: 'int-echem-eq-003',
        topic: 'acids', title: 'Nernst meets pH: the quinhydrone-type electrode',
        prompt: 'A half-cell involves \\(\\ce{Q + 2H+ + 2e- -> QH2}\\) (quinone/hydroquinone), \\(E^\\circ = +0.699\\) V, with equal activities of Q and QH₂.',
        parts: [
          { q: '(a) Write the Nernst equation and show E depends only on pH.', a: '\\(E = E^\\circ - \\dfrac{0.0592}{2}\\log\\dfrac{[\\ce{QH2}]}{[\\ce{Q}][\\ce{H+}]^2}\\). With \\([\\ce{Q}]=[\\ce{QH2}]\\): \\(E = E^\\circ - \\dfrac{0.0592}{2}\\log\\dfrac{1}{[\\ce{H+}]^2} = E^\\circ - 0.0592\\,\\text{pH}\\). Linear in pH, slope −59.2 mV per unit — a working pH electrode.' },
          { q: '(b) Predict E at pH 4.00.', a: '\\(E = 0.699 - 0.0592(4.00) = 0.699 - 0.237 = \\mathbf{+0.462\\ V}\\).' },
          { q: '(c) The electrode is used to follow a weak-acid titration. Sketch/describe the E–volume behaviour near the half-equivalence point.', a: 'Since \\(E\\propto -\\text{pH}\\), the E–volume curve mirrors the titration curve (inverted): a buffered, gently sloping region where \\(\\text{pH} = \\text{p}K_a\\) at half-equivalence, then a sharp rise (E falls sharply) at the equivalence point. Reading \\(E\\) at half-equivalence gives pKa directly.' },
          { q: '(d) State one chemical limitation of this pH probe.', a: 'It fails in <b>strongly basic solution</b> (hydroquinone is a weak acid — it ionises/oxidises above ~pH 8–9) and in the presence of strong oxidants/reductants that shift the Q/QH₂ ratio away from unity, breaking the clean −59.2 mV/pH relation. (This is why the glass electrode superseded it.)' },
        ],
      },
    ],
  },

  // ================= CRYSTAL FIELD + MAGNETISM =================
  {
    id: 'int-cft-mag', month: 'Integrated', label: 'Crystal Field + Magnetism',
    blurb: 'Turn magnetic moments into electron counts and spin states, weigh CFSE vs pairing energy, and reason about colour.',
    problems: [
      {
        id: 'int-cft-mag-001',
        topic: 'descriptive', title: 'From magnetic moment to spin state',
        prompt: 'Two iron(II) complexes are studied. \\(\\ce{[Fe(H2O)6]^2+}\\) has \\(\\mu_{eff}\\approx 5.3\\) BM; \\(\\ce{[Fe(CN)6]^4-}\\) has \\(\\mu_{eff}=0\\). Use the spin-only formula \\(\\mu = \\sqrt{n(n+2)}\\) BM.',
        parts: [
          { q: '(a) How many unpaired electrons does each complex have?', a: 'Spin-only: \\(n=4\\Rightarrow\\mu=\\sqrt{4\\cdot6}=4.90\\) BM (measured 5.3 includes a small orbital contribution) → \\(\\ce{[Fe(H2O)6]^2+}\\) has <b>4 unpaired e⁻</b>. \\(\\mu=0\\Rightarrow n=0\\) → \\(\\ce{[Fe(CN)6]^4-}\\) has <b>0 unpaired e⁻</b>.' },
          { q: '(b) Both are d⁶. Assign high/low spin and the t₂g/e_g configuration.', a: 'Fe²⁺ is <b>d⁶</b>. Water is weak-field → <b>high-spin</b> \\(t_{2g}^4 e_g^2\\) (4 unpaired). Cyanide is strong-field → <b>low-spin</b> \\(t_{2g}^6 e_g^0\\) (0 unpaired, diamagnetic).' },
          { q: '(c) Explain the difference using Δ_o and the pairing energy P.', a: 'The spectrochemical series puts \\(\\ce{CN-}\\gg\\ce{H2O}\\). For CN⁻, \\(\\Delta_o > P\\): it costs less to pair electrons in \\(t_{2g}\\) than to promote them to \\(e_g\\) → low-spin. For H₂O, \\(\\Delta_o < P\\): electrons stay unpaired across both levels → high-spin.' },
          { q: '(d) Compute the CFSE (in units of Δ_o) for each and comment on the stabilisation.', a: 'CFSE \\(= (-0.4\\,n_{t_{2g}} + 0.6\\,n_{e_g})\\Delta_o\\) (ignoring pairing). High-spin \\(t_{2g}^4e_g^2\\): \\((-0.4\\cdot4+0.6\\cdot2)= \\mathbf{-0.4\\,\\Delta_o}\\). Low-spin \\(t_{2g}^6\\): \\((-0.4\\cdot6)= \\mathbf{-2.4\\,\\Delta_o}\\) (plus 2P for the extra pairs). The low-spin cyanide complex is far more crystal-field-stabilised, part of why it is kinetically inert.' },
        ],
      },
      {
        id: 'int-cft-mag-002',
        topic: 'descriptive', title: 'Identifying complexes from a magnetic data table',
        prompt: 'Room-temperature magnetic moments (octahedral complexes):'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px"><tr><td>complex</td><td>A</td><td>B</td><td>C</td><td>D</td></tr>'
          + '<tr><td>μ_eff / BM</td><td>1.73</td><td>3.87</td><td>4.90</td><td>5.92</td></tr></table></div>'
          + 'Use \\(\\mu = \\sqrt{n(n+2)}\\).',
        parts: [
          { q: '(a) Deduce the number of unpaired electrons in each.', a: '\\(\\sqrt{n(n+2)}\\): 1.73→<b>n=1</b>, 3.87→<b>n=3</b>, 4.90→<b>n=4</b>, 5.92→<b>n=5</b>. (Memorise: 1.73/2.83/3.87/4.90/5.92 for n = 1–5.)' },
          { q: '(b) Give a plausible d-configuration/ion for each.', a: 'A (n=1): e.g. \\(\\ce{Ti^3+}\\) d¹, or low-spin d⁵. B (n=3): \\(\\ce{Cr^3+}\\) d³ or high-spin d⁷. C (n=4): high-spin d⁶ (\\(\\ce{Fe^2+}\\)). D (n=5): high-spin d⁵ (\\(\\ce{Mn^2+}\\), \\(\\ce{Fe^3+}\\)) — the maximum for a first-row ion.' },
          { q: '(c) Why can one μ value map to more than one configuration? What extra data resolves it?', a: 'μ (spin-only) fixes only the number of unpaired electrons, not d-count or spin state (e.g. n=1 = d¹ or low-spin d⁵). Resolve with the <b>element/oxidation state</b>, the <b>ligand</b> (spectrochemical position → likely spin state), and the <b>UV-vis colour</b> (Δ_o). Orbital contributions and temperature dependence give further clues.' },
          { q: '(d) Complex D is nearly colourless and a very pale pink. Explain using selection rules.', a: 'D is high-spin d⁵ (\\(\\ce{Mn^2+}\\)): every d–d transition is both <b>spin-forbidden</b> (no way to move an electron without flipping a spin) and Laporte-forbidden, so absorptions are extremely weak → the salt is only faintly coloured. Contrast intense charge-transfer colours (e.g. \\(\\ce{MnO4-}\\)).' },
        ],
      },
      {
        id: 'int-cft-mag-003',
        topic: 'descriptive', title: 'Jahn–Teller, colour, and the spectrochemical series',
        prompt: 'Consider \\(\\ce{[Cu(H2O)6]^2+}\\) (pale blue), \\(\\ce{[Cu(NH3)4(H2O)2]^2+}\\) (deep blue), and \\(\\ce{[CuCl4]^2-}\\) (yellow-green).',
        parts: [
          { q: '(a) Cu²⁺ is d⁹. Predict and explain the Jahn–Teller distortion of the hexaaqua ion.', a: 'd⁹ = \\(t_{2g}^6 e_g^3\\): the unevenly filled \\(e_g\\) set (orbitals pointing at the ligands) drives a <b>strong tetragonal elongation</b> — the two axial Cu–O bonds lengthen. This lifts the \\(e_g\\) degeneracy and lowers the energy.' },
          { q: '(b) Why is the ammine complex a deeper blue than the aqua complex?', a: 'NH₃ is higher than H₂O in the spectrochemical series → larger \\(\\Delta_o\\). The d–d absorption moves to higher energy (shorter λ, into the orange-red), so the transmitted/observed colour is a more intense, deeper blue. (Replacing 4 H₂O by 4 NH₃ raises the average field.)' },
          { q: '(c) [CuCl₄]²⁻ is yellow-green and tetrahedral. How do geometry and ligand field explain this?', a: 'Cl⁻ is a weak-field ligand and the geometry is <b>tetrahedral</b>, where \\(\\Delta_t \\approx \\tfrac49\\Delta_o\\) — a much smaller splitting. The small \\(\\Delta\\) puts the d–d band at low energy — in the near-IR, which contributes no colour at all. <span class="trap">The yellow-green is NOT the d–d band: it comes from an intense Cl→Cu(II) charge-transfer absorption in the violet/blue.</span> Tetrahedral (no centre of symmetry) transitions are more allowed → more intense than octahedral, which is why these salts are so much more strongly coloured than \\(\\ce{[Cu(H2O)6]^2+}\\).' },
          { q: '(d) Arrange the three by increasing Δ and state what you would measure to confirm it.', a: 'Increasing Δ: \\(\\ce{[CuCl4]^2-}\\) (tetrahedral, weak Cl) < \\(\\ce{[Cu(H2O)6]^2+}\\) < \\(\\ce{[Cu(NH3)4(H2O)2]^2+}\\). Confirm with <b>UV-vis</b>: measure \\(\\lambda_{max}\\) of the d–d band for each; \\(\\Delta \\propto 1/\\lambda_{max}\\) (via \\(E=hc/\\lambda\\)). Higher-field complexes absorb at shorter wavelength.' },
        ],
      },
    ],
  },
  // ================= ORGANIC MECHANISM + STRUCTURE =================
  {
    id: 'int-mech-struct', month: 'Integrated', label: 'Organic Mechanism + Structure',
    blurb: 'Argue mechanisms rather than name them: rank competing pathways, read stereochemistry back to the intermediate, and design the kinetic or isotopic experiment that decides.',
    problems: [
      {
        id: 'int-mech-struct-001',
        topic: 'organic', title: 'The cation that moves: rearrangement and migratory aptitude',
        prompt: '3,3-Dimethylbutan-2-ol, \\(\\ce{CH3-CH(OH)-C(CH3)3}\\), is warmed with concentrated \\(\\ce{H2SO4}\\). The product is almost entirely a single tetrasubstituted alkene; the alkene expected from simple loss of water is essentially absent.',
        parts: [
          { q: '(a) Identify the cation formed immediately after loss of water, and say why it is a poor place to stop.', a: 'The OH is protonated and water leaves from C2, giving the <b>secondary</b> cation \\(\\ce{CH3-CH+-C(CH3)3}\\). It is poorly stabilised: C3 is quaternary and carries <b>no</b> C–H bonds, so the only hyperconjugative donors are the three C–H bonds of the C1 methyl. A secondary centre with just three \\(\\beta\\)-C–H bonds is about as bad as a secondary cation gets.' },
          { q: '(b) Two 1,2-shifts can be drawn from that cation. Rank them and justify which occurs.', a: 'From C1 only a <b>hydride</b> could migrate, and that would put the charge on C1 — a <b>primary</b> cation, strongly uphill, so it is never taken. From C3 only a <b>methyl</b> can migrate (C3 has no H). Methyl migration from C3 to C2 gives \\(\\ce{(CH3)2C+-CH(CH3)2}\\), the 2,3-dimethylbutan-2-yl cation: <b>tertiary</b>, with seven \\(\\beta\\)-C–H bonds (6 from the two methyls, 1 from the isopropyl methine) instead of three. Secondary → tertiary is worth roughly 60–70 kJ mol⁻¹ in the gas phase and remains decisive in solution, so the methyl shift wins and is faster than elimination from the unrearranged ion.' },
          { q: '(c) What must the migration geometry be, and what does that imply about the transition state?', a: 'The migrating C–C bond must be <b>aligned with (parallel to) the empty p orbital</b> on C2 — the bond donates its electron pair into that orbital as it moves. The transition state is therefore a <b>bridged, three-centre two-electron</b> species (a protonated cyclopropane-like corner-methyl bridge), not a free methyl anion and not two discrete steps. Because the group never becomes free, migration is <b>suprafacial</b>: a migrating carbon retains its own configuration.' },
          { q: '(d) Predict the major and minor alkenes, and explain why the unrearranged alkene is missing.', a: 'E1 from the rearranged tertiary cation: losing an H from the isopropyl methine gives <b>2,3-dimethylbut-2-ene</b> (tetrasubstituted, Zaitsev — the observed major product); losing an H from a methyl gives 2,3-dimethylbut-1-ene (only disubstituted, minor). The unrearranged secondary cation could only lose an H from C1 (C3 has none), which would give <b>3,3-dimethylbut-1-ene</b> — a monosubstituted alkene. Its absence is the experimental proof that rearrangement outruns elimination: the more stable cation and the more stable alkene are reached by the same shift.' },
          { q: '(e) 2,3-Diphenylbutane-2,3-diol, \\(\\ce{PhMeC(OH)-C(OH)MePh}\\), rearranges in acid to 3,3-diphenylbutan-2-one, \\(\\ce{Ph2C(CH3)-CO-CH3}\\), rather than to 2-methyl-1,2-diphenylpropan-1-one. Explain the migratory aptitude in mechanistic terms.', a: 'Acid ionises one OH to give the <b>benzylic</b> cation \\(\\ce{PhMeC+-C(OH)MePh}\\). The adjacent sp\u00b3 carbon carries a phenyl AND a methyl, so there is a genuine competition, and the group that migrates decides the product: <b>phenyl</b> migration puts two phenyls on one carbon and leaves \\(\\ce{Ph2C(CH3)-CO-CH3}\\) (observed), whereas <b>methyl</b> migration would have given \\(\\ce{PhMe2C-CO-Ph}\\) (not observed). Aryl wins because its bridged transition state is a <b>phenonium ion</b>: the ipso carbon bridges the two centres and the developing positive charge is delocalised into the ring, so the migrating group supplies its own anchimeric assistance. A bridging methyl offers only a two-electron C\u2013C bond with no \u03c0 system to delocalise into. The diagnostic test is substituent effects on the ring: p-methoxyphenyl migrates faster and p-nitrophenyl slower than phenyl, which is only sensible if positive charge is carried in the migrating ring at the transition state.' },
        ],
      },
      {
        id: 'int-mech-struct-002',
        topic: 'organic', title: 'Anti or syn? Reading stereochemistry back to the intermediate',
        prompt: '(E)- and (Z)-but-2-ene are each treated with \\(\\ce{Br2}\\) in \\(\\ce{CCl4}\\). Each gives a single stereochemical outcome, and the two outcomes are different: one alkene gives an optically inactive product that <b>cannot</b> be resolved, the other gives an optically inactive product that <b>can</b>.',
        parts: [
          { q: '(a) What intermediate does that pair of results demand, and what does it rule out?', a: 'A <b>bridged bromonium ion</b>: \\(\\ce{Br+}\\) adds to one face and spans both carbons, so the face that was shielded stays shielded and the second bromide must attack from the opposite face (<b>anti</b> addition). This rules out an open \\(\\beta\\)-bromocarbocation, which is free to rotate about the C2–C3 bond: rotation would scramble the relative configuration and both alkenes would converge on the same mixture of meso and (±) products. Getting <b>two different</b> single outcomes from two stereoisomeric alkenes is the definition of a stereospecific reaction and requires the alkene geometry to be preserved all the way to product.' },
          { q: '(b) Assign the product of (E)-but-2-ene and justify it.', a: 'Anti addition to the (E)-alkene gives <b>meso-2,3-dibromobutane, (2R,3S)</b> — optically inactive and not resolvable, because it is a single achiral compound with an internal mirror plane. Bromonium formation on the top face followed by backside attack at C2, and formation on the bottom face followed by backside attack at C3, give the <b>same</b> meso compound, which is why no enantiomers appear.' },
          { q: '(c) Assign the product of (Z)-but-2-ene and explain why it is optically inactive yet resolvable.', a: 'Anti addition to the (Z)-alkene gives the chiral pair <b>(2R,3R)</b> and <b>(2S,3S)</b>. Bromonium ion formation is equally likely on either face of the achiral alkene, so the two enantiomers form in exactly 1:1 ratio — a <b>racemate</b>: no net rotation, but the components are separable in principle (resolution). Contrast (b), where the single product is achiral and there is nothing to resolve.' },
          { q: '(d) You are given (Z)-but-2-ene and must make <b>meso</b>-butane-2,3-diol. Choose the reagent and prove the stereochemistry logically.', a: 'Use <b>syn</b> dihydroxylation: \\(\\ce{OsO4}\\) (then \\(\\ce{NaHSO3}\\)) or cold dilute alkaline \\(\\ce{KMnO4}\\). Both oxygens are delivered to the <b>same</b> face through a cyclic osmate/manganate ester, and syn addition to a (Z)-alkene gives the <b>meso</b> diol. The alternative route — \\(m\\)-CPBA epoxidation (syn, so the (Z)-alkene gives the <i>cis</i>-epoxide, itself meso) followed by acid-catalysed hydrolysis, which opens the epoxide by <b>anti</b> backside attack — inverts one centre and therefore gives the <b>(±)</b> diol instead. <span class="trap">Same alkene, same overall "add two OH", opposite stereochemistry: what matters is the number of stereochemistry-setting steps, not the functional group installed.</span>' },
          { q: '(e) Bromination of (Z)-but-2-ene in methanol gives mostly 2-bromo-3-methoxybutane, again anti. What does that add to the argument?', a: 'It shows the intermediate survives long enough to be intercepted by the <b>solvent</b>, so the addition is genuinely stepwise (electrophile first, nucleophile second) rather than a concerted four-centre delivery of \\(\\ce{Br2}\\). Crucially the captured product is <b>still anti and still stereospecific</b>, so the intercepted species still has both faces differentiated — a bridged bromonium ion, not a rotatable open cation. Anti stereospecificity plus solvent capture together pin the mechanism down in a way neither observation does alone.' },
        ],
      },
      {
        id: 'int-mech-struct-003',
        topic: 'organic', title: 'E2 or E1cb? Designing the experiment that decides',
        prompt: 'Treating \\(\\ce{PhSO2-CH2-CH2-OAr}\\) (Ar = 4-nitrophenyl) with dilute aqueous base gives the vinyl sulfone \\(\\ce{PhSO2-CH=CH2}\\) plus 4-nitrophenoxide. The rate law is \\(\\text{rate} = k[\\text{substrate}][\\ce{OH-}]\\). A colleague concludes "second order, therefore E2".',
        parts: [
          { q: '(a) Show that the rate law cannot distinguish the two mechanisms.', a: 'E2 is concerted: base removes the \\(\\alpha\\)-H (the one next to \\(\\ce{SO2Ph}\\)) while \\(\\ce{ArO-}\\) leaves, rate \\(= k_2[\\text{S}][\\ce{OH-}]\\). E1cb has a pre-equilibrium deprotonation, \\(\\ce{S + OH- <=>[K] C^- + H2O}\\), then rate-determining loss of \\(\\ce{ArO-}\\), rate \\(= k_{\\text{elim}}[\\ce{C^-}] = k_{\\text{elim}}K[\\text{S}][\\ce{OH-}]\\). Both are first order in substrate and first order in base; only the composite meaning of \\(k\\) differs. <span class="trap">Kinetic ORDER counts the species in the rate-determining transition state — it does not say whether they get there in one step or two.</span>' },
          { q: '(b) Design the isotopic experiment that settles it, and state what each outcome means.', a: 'Run the reaction in \\(\\ce{NaOD/D2O}\\), quench part-way, and recover <b>unreacted</b> substrate. If the \\(\\ce{CH2}\\) next to the sulfone has picked up deuterium, the carbanion is formed <b>reversibly and faster than it eliminates</b> — the (E1cb)\\(_R\\) signature. Clean recovery with no D incorporation means the C–H is broken only in the step that also expels the leaving group, i.e. <b>E2</b> (or an irreversible E1cb). The control matters: check that the recovered material has not simply exchanged after re-isolation, and follow the exchange rate against the elimination rate rather than just its presence.' },
          { q: '(c) Interpret a measured kinetic isotope effect of \\(k_H/k_D = 1.2\\) for the \\(\\alpha\\)-dideuterated substrate.', a: 'A concerted E2 breaks C–H in the rate-determining step and shows a large <b>primary</b> KIE, typically \\(k_H/k_D \\approx 5\\text{–}8\\) (largest when the proton is half-transferred). A value of 1.2 is far too small for that, so the C–H bond is <b>not</b> breaking in the rate-determining step: deprotonation is a fast pre-equilibrium and expulsion of \\(\\ce{ArO-}\\) is rate-determining — reversible <b>E1cb</b>. Note the caveat: an <i>irreversible</i> E1cb, where deprotonation itself is rate-determining, would also show a large primary KIE and look like E2 here; that is exactly why the exchange experiment in part (b) is needed alongside.' },
          { q: '(d) The leaving group is varied. E2-type substrates follow \\(\\ce{I- > Br- > Cl- > F-}\\), but this series gives F fastest of the halides. Explain.', a: 'In E2 the C–LG bond is substantially broken at the transition state, so the rate tracks <b>leaving-group ability</b> (weakest base / most polarisable leaves best): I > Br > Cl > F. In a reversible E1cb the rate is \\(k_{\\text{elim}}K\\), and \\(K\\) is the <b>acidity of the \\(\\beta\\)-C–H</b>. Fluorine is the most electronegative halogen, so it acidifies that C–H most and raises the carbanion concentration most — enough to overturn its wretched leaving-group ability. An inverted "element effect" of this kind is strong evidence for a discrete carbanion, because no concerted mechanism can reward the worst leaving group.' },
          { q: '(e) A single diastereomer of \\(\\ce{PhSO2-CHD-CHD-OAr}\\) gives both \\(E\\)- and \\(Z\\)-alkene in similar amounts. What does that prove, and what would E2 have given?', a: 'E2 requires the H and the leaving group to be <b>anti-periplanar</b> in one geometry-defining transition state, so a single diastereomer must give a <b>single</b> alkene geometry — E2 is stereospecific. Getting both geometries means the stereochemical information was lost between deprotonation and elimination: the intermediate is a <b>planar (or rapidly inverting) carbanion</b> that can rotate about the C–C bond before \\(\\ce{ArO-}\\) departs. Combined with (b), (c) and (d), the mechanism is reversible E1cb. Working backwards from the product mixture alone: loss of stereospecificity in a \\(\\beta\\)-elimination always means a discrete intermediate stood between the two bond-breaking events.' },
        ],
      },
    ],
  },
  // ================= KINETICS + EXPERIMENTAL DATA =================
  {
    id: 'int-kinetics-data', month: 'Integrated', label: 'Kinetics + Experimental Data',
    blurb: 'Read orders off an initial-rate table, decide first vs second order by linearising a concentration–time series, and pull Ea out of an Arrhenius plot.',
    problems: [
      {
        id: 'int-kinetics-data-001',
        topic: 'kinetics', title: 'Orders from an initial-rate table',
        prompt: 'The persulfate–iodide reaction \\(\\ce{S2O8^2- + 3I- -> 2SO4^2- + I3-}\\) was run at 298 K. Four initial-rate experiments were performed:'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px">'
          + '<tr><td>run</td><td>1</td><td>2</td><td>3</td><td>4</td></tr>'
          + '<tr><td>[S₂O₈²⁻]₀ / M</td><td>0.0400</td><td>0.0800</td><td>0.0400</td><td>0.0800</td></tr>'
          + '<tr><td>[I⁻]₀ / M</td><td>0.0400</td><td>0.0400</td><td>0.0800</td><td>0.0800</td></tr>'
          + '<tr><td>initial rate / M s⁻¹</td><td>1.76×10⁻⁵</td><td>3.52×10⁻⁵</td><td>3.52×10⁻⁵</td><td>7.04×10⁻⁵</td></tr>'
          + '</table></div>'
          + 'No rate law is given — deduce it.',
        parts: [
          { q: '(a) Determine the order with respect to each reactant, showing the comparison you used.', a: 'Compare runs where only ONE concentration changes.<br>Runs 1→2: \\([\\ce{I-}]\\) fixed, \\([\\ce{S2O8^2-}]\\) doubled, rate \\(3.52/1.76 = 2.00\\times\\). \\(2^m = 2 \\Rightarrow m = 1\\).<br>Runs 1→3: \\([\\ce{S2O8^2-}]\\) fixed, \\([\\ce{I-}]\\) doubled, rate \\(3.52/1.76 = 2.00\\times\\). \\(2^n = 2 \\Rightarrow n = 1\\).<br>So the reaction is <b>first order in \\(\\ce{S2O8^2-}\\) and first order in \\(\\ce{I-}\\)</b> (second order overall).' },
          { q: '(b) Write the rate law, then obtain k from every run as a consistency check. Give the units.', a: 'Rate \\(= k[\\ce{S2O8^2-}][\\ce{I-}]\\).<br>Run 1: \\(k = \\dfrac{1.76\\times10^{-5}}{(0.0400)(0.0400)} = \\dfrac{1.76\\times10^{-5}}{1.60\\times10^{-3}} = 1.10\\times10^{-2}\\).<br>Run 2: \\(\\dfrac{3.52\\times10^{-5}}{(0.0800)(0.0400)} = \\dfrac{3.52\\times10^{-5}}{3.20\\times10^{-3}} = 1.10\\times10^{-2}\\).<br>Run 3: identical denominator → \\(1.10\\times10^{-2}\\). Run 4: \\(\\dfrac{7.04\\times10^{-5}}{6.40\\times10^{-3}} = 1.10\\times10^{-2}\\).<br>All four agree: \\(k = \\mathbf{1.10\\times10^{-2}\\ M^{-1}\\,s^{-1}}\\). Units follow from \\(\\text{M s}^{-1} = k\\,\\text{M}^2\\) — second order overall ⇒ \\(\\text{M}^{-1}\\text{s}^{-1}\\). <span class="trap">Run 4 is redundant by design: if its k disagreed, the orders read off runs 1–3 would be wrong.</span>' },
          { q: '(c) Predict the initial rate for [S₂O₈²⁻]₀ = 0.0600 M, [I⁻]₀ = 0.0250 M, and the initial rate of formation of I₃⁻.', a: 'Rate \\(= (1.10\\times10^{-2})(0.0600)(0.0250) = (1.10\\times10^{-2})(1.50\\times10^{-3}) = \\mathbf{1.65\\times10^{-5}\\ M\\,s^{-1}}\\).<br>The stoichiometric coefficients of \\(\\ce{S2O8^2-}\\) and \\(\\ce{I3-}\\) are both 1, so \\(\\dfrac{d[\\ce{I3-}]}{dt} = -\\dfrac{d[\\ce{S2O8^2-}]}{dt} = 1.65\\times10^{-5}\\) M s⁻¹. (Iodide disappears three times as fast: \\(4.95\\times10^{-5}\\) M s⁻¹.)' },
          { q: '(d) Two mechanisms are proposed. (i) \\(\\ce{S2O8^2- + I- -> [S2O8I]^3-}\\) slow, then fast steps. (ii) \\(\\ce{S2O8^2- + I- <=> X}\\) fast pre-equilibrium, then \\(\\ce{X + I- -> Y}\\) slow. Which does the data support?', a: 'Mechanism (i): the rate-determining step is bimolecular in \\(\\ce{S2O8^2-}\\) and \\(\\ce{I-}\\), giving rate \\(= k[\\ce{S2O8^2-}][\\ce{I-}]\\) — <b>matches</b>.<br>Mechanism (ii): \\([\\ce{X}] = K[\\ce{S2O8^2-}][\\ce{I-}]\\), so rate \\(= k_2K[\\ce{S2O8^2-}][\\ce{I-}]^2\\) — <b>second order in iodide</b>, which would have made runs 1→3 a 4× rate increase, not 2×. The data <b>rules (ii) out</b>. Kinetics can never prove a mechanism, only eliminate ones inconsistent with the observed rate law.' },
          { q: '(e) Describe how each initial rate was measured, and justify calling it an "initial" rate.', a: 'Iodine-clock method. Into 50.0 mL of reaction mixture put a small fixed amount of thiosulfate plus starch: \\(\\ce{I3- + 2S2O3^2- -> 3I- + S4O6^2-}\\) consumes the triiodide as fast as it forms, and the blue starch complex appears only when the thiosulfate runs out. Time that appearance.<br>With 1.00 mL of 0.0100 M \\(\\ce{Na2S2O3}\\): \\(n(\\ce{S2O3^2-}) = 1.00\\times10^{-5}\\) mol → \\(n(\\ce{I3-}) = 5.00\\times10^{-6}\\) mol → \\(\\Delta[\\ce{I3-}] = 5.00\\times10^{-6}/0.0500 = 1.00\\times10^{-4}\\) M. For run 1, \\(t = \\dfrac{1.00\\times10^{-4}}{1.76\\times10^{-5}} = 5.7\\) s.<br>That endpoint consumes \\(1.00\\times10^{-4}\\) M of \\(\\ce{S2O8^2-}\\) — only <b>0.25%</b> of the 0.0400 M charged — so the concentrations are still effectively their initial values and \\(\\Delta[\\ce{I3-}]/\\Delta t\\) is the initial rate.' },
        ],
      },
      {
        id: 'int-kinetics-data-002',
        topic: 'kinetics', title: 'First or second order? Linearise the data',
        prompt: 'The gas-phase decomposition \\(\\ce{2NO2 -> 2NO + O2}\\) was followed at 592 K by monitoring \\([\\ce{NO2}]\\) spectrophotometrically:'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px">'
          + '<tr><td>t / s</td><td>0</td><td>20</td><td>40</td><td>60</td><td>100</td><td>160</td></tr>'
          + '<tr><td>[NO₂] / M</td><td>0.0500</td><td>0.0333</td><td>0.0250</td><td>0.0200</td><td>0.0143</td><td>0.0100</td></tr>'
          + '</table></div>'
          + 'The two candidate linearisations are plotted below.'
          + '<div>ln [NO₂] against t:</div>' + firstOrderTestPlot
          + '<div>1/[NO₂] against t:</div>' + secondOrderTestPlot,
        parts: [
          { q: '(a) State the integrated rate law for first and second order in a single reactant, and the plot each one linearises.', a: 'First order: \\(\\ln[\\ce{A}] = \\ln[\\ce{A}]_0 - kt\\) — a plot of \\(\\ln[\\ce{A}]\\) vs \\(t\\) is straight, slope \\(-k\\).<br>Second order: \\(\\dfrac{1}{[\\ce{A}]} = \\dfrac{1}{[\\ce{A}]_0} + kt\\) — a plot of \\(1/[\\ce{A}]\\) vs \\(t\\) is straight, slope \\(+k\\).<br>Whichever plot is straight identifies the order; a single concentration–time curve on its own cannot.' },
          { q: '(b) Build both columns from the table and say which test the data passes.', a: '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:14px 3px"><tr><td>t / s</td><td>0</td><td>20</td><td>40</td><td>60</td><td>100</td><td>160</td></tr><tr><td>ln [NO₂]</td><td>−3.00</td><td>−3.40</td><td>−3.69</td><td>−3.91</td><td>−4.25</td><td>−4.61</td></tr><tr><td>1/[NO₂] / M⁻¹</td><td>20.0</td><td>30.0</td><td>40.0</td><td>50.0</td><td>70.0</td><td>100.0</td></tr></table></div>'
            + 'Successive 20 s intervals change \\(\\ln[\\ce{NO2}]\\) by −0.40 then −0.29 then −0.22: the first-order plot <b>curves</b>. The \\(1/[\\ce{NO2}]\\) column rises by exactly 10.0 M⁻¹ per 20 s throughout: <b>the second-order plot is linear</b>. The reaction is <b>second order in \\(\\ce{NO2}\\)</b>.' },
          { q: '(c) Extract k from the slope, with units.', a: 'Using the two end points of the linear plot: \\(k = \\dfrac{100.0 - 20.0}{160 - 0} = \\dfrac{80.0\\ \\text{M}^{-1}}{160\\ \\text{s}} = \\mathbf{0.500\\ M^{-1}\\,s^{-1}}\\). Every interval gives the same value (\\(10.0/20 = 0.500\\)), confirming the fit. Rate \\(= k[\\ce{NO2}]^2\\).' },
          { q: '(d) Find the first two successive half-lives and explain why they differ — the fastest order test of all.', a: 'From 0.0500 M: half is 0.0250 M, reached at \\(t = \\mathbf{40\\ s}\\) (read straight from the table). Predicted: \\(t_{1/2} = \\dfrac{1}{k[\\ce{A}]_0} = \\dfrac{1}{(0.500)(0.0500)} = 40\\) s ✓.<br>Second half-life, starting from 0.0250 M: \\(t_{1/2} = \\dfrac{1}{(0.500)(0.0250)} = \\mathbf{80\\ s}\\) (so \\([\\ce{NO2}] = 0.0125\\) M at \\(t = 120\\) s; check \\(1/[\\ce{A}] = 20 + 0.5(120) = 80\\) M⁻¹ ✓).<br>The half-life <b>doubles each time</b> because \\(t_{1/2}\\propto 1/[\\ce{A}]_0\\) for second order. <span class="trap">A constant half-life is the signature of first order — here it is not constant, so first order is dead without plotting anything.</span>' },
          { q: '(e) How long to fall to 0.00500 M, and name one experimental artefact that would fake first-order behaviour.', a: '\\(\\dfrac{1}{0.00500} = 200 = 20 + 0.500t \\Rightarrow t = \\dfrac{180}{0.500} = \\mathbf{360\\ s}\\).<br>Artefact: a large excess of a second reagent (or a product that back-reacts) makes the observed decay <b>pseudo-first-order</b>; likewise, following only the first 10–15% of the reaction gives a curve so short that both plots look straight within the scatter. Fix: follow at least 3 half-lives and vary the initial concentration — a true second-order rate constant is independent of \\([\\ce{A}]_0\\), a pseudo-first-order one is not.' },
        ],
      },
      {
        id: 'int-kinetics-data-003',
        topic: 'kinetics', title: 'Activation energy from an Arrhenius plot',
        prompt: 'A first-order isomerisation was run at five temperatures and the rate constant measured each time:'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px">'
          + '<tr><td>T / K</td><td>300</td><td>310</td><td>320</td><td>330</td><td>340</td></tr>'
          + '<tr><td>k / s⁻¹</td><td>1.17×10⁻³</td><td>3.30×10⁻³</td><td>8.70×10⁻³</td><td>2.17×10⁻²</td><td>5.11×10⁻²</td></tr>'
          + '</table></div>'
          + 'The corresponding plot of \\(\\ln k\\) against \\(1000/T\\) is shown.' + arrheniusPlot,
        parts: [
          { q: '(a) Derive the linear form of the Arrhenius equation and state what the slope of this particular plot means.', a: '\\(k = A e^{-E_a/RT} \\Rightarrow \\ln k = \\ln A - \\dfrac{E_a}{R}\\cdot\\dfrac{1}{T}\\), linear in \\(1/T\\) with slope \\(-E_a/R\\) and intercept \\(\\ln A\\).<br>Because the x-axis here is \\(1000/T\\) rather than \\(1/T\\), the plotted slope is \\(-E_a/(1000R)\\), so \\(E_a = -\\text{slope}\\times 1000R\\). <span class="trap">Forgetting the factor of 1000 gives an activation energy 1000× too small.</span>' },
          { q: '(b) Read the slope off the two end points and calculate Ea.', a: 'End points: \\((1000/300,\\ \\ln 1.17\\times10^{-3}) = (3.333,\\ -6.751)\\) and \\((1000/340,\\ \\ln 5.11\\times10^{-2}) = (2.941,\\ -2.974)\\).<br>Slope \\(= \\dfrac{-2.974-(-6.751)}{2.941-3.333} = \\dfrac{3.777}{-0.392} = -9.63\\times10^{3}\\) K… in \\(1000/T\\) units, i.e. \\(-9.63\\) per unit.<br>\\(E_a = 9.63\\times 1000 \\times 8.314 = 8.01\\times10^{4}\\ \\text{J/mol} = \\mathbf{80.1\\ kJ/mol}\\).<br>(Equivalently, two-point form: \\(\\ln\\dfrac{k_2}{k_1} = -\\dfrac{E_a}{R}\\left(\\dfrac1{T_2}-\\dfrac1{T_1}\\right)\\); \\(\\ln\\dfrac{5.11\\times10^{-2}}{1.17\\times10^{-3}} = \\ln 43.7 = 3.777\\), and \\(\\dfrac1{340}-\\dfrac1{300} = -3.922\\times10^{-4}\\), so \\(E_a = \\dfrac{8.314\\times3.777}{3.922\\times10^{-4}} = 8.01\\times10^{4}\\) J/mol.)' },
          { q: '(c) Determine the pre-exponential factor A, with units.', a: 'Use the 300 K point: \\(\\ln A = \\ln k + \\dfrac{E_a}{RT} = -6.751 + \\dfrac{80100}{(8.314)(300)} = -6.751 + \\dfrac{80100}{2494.2} = -6.751 + 32.11 = 25.36\\).<br>\\(A = e^{25.36} = \\mathbf{1.0\\times10^{11}\\ s^{-1}}\\). Units are those of \\(k\\) (first order ⇒ s⁻¹), because the exponential is dimensionless. The value is a sensible order of magnitude for a unimolecular gas-phase process (\\(\\sim10^{11}\\!-\\!10^{13}\\) s⁻¹).' },
          { q: '(d) Predict k at 350 K, and state why extrapolating far beyond the measured range is unsafe.', a: '\\(\\ln k = \\ln A - \\dfrac{E_a}{RT} = 25.36 - \\dfrac{80100}{(8.314)(350)} = 25.36 - \\dfrac{80100}{2909.9} = 25.36 - 27.53 = -2.17\\).<br>\\(k = e^{-2.17} = \\mathbf{0.115\\ s^{-1}}\\) — about 100× the 300 K value over a 50 K span.<br>Extrapolation is unsafe because \\(E_a\\) and \\(A\\) are only weakly temperature-independent: over a wide range \\(A\\) picks up a \\(T^{1/2}\\)-type dependence, and a competing pathway with a different \\(E_a\\) can take over, putting a kink in the plot. A curved Arrhenius plot is itself evidence of a change of mechanism.' },
          { q: '(e) A catalyst lowers Ea to 55.0 kJ/mol with A unchanged. By what factor does the rate at 300 K increase?', a: '\\(\\dfrac{k_{cat}}{k} = \\dfrac{Ae^{-E_a^{cat}/RT}}{Ae^{-E_a/RT}} = \\exp\\!\\left(\\dfrac{E_a - E_a^{cat}}{RT}\\right) = \\exp\\!\\left(\\dfrac{80100-55000}{(8.314)(300)}\\right) = \\exp\\!\\left(\\dfrac{25100}{2494.2}\\right) = e^{10.06}\\).<br>\\(= \\mathbf{2.3\\times10^{4}}\\) — a 25 kJ/mol cut buys four orders of magnitude at room temperature. Note the catalyst lowers \\(E_a\\) for the forward AND reverse reaction equally, so \\(K\\) is unchanged: kinetics moves, thermodynamics does not.' },
        ],
      },
    ],
  },

  // ================= ACID–BASE + THERMODYNAMICS =================
  {
    id: 'int-acid-thermo', month: 'Integrated', label: 'Acid–Base + Thermodynamics',
    blurb: 'Build Ka out of ΔH° and ΔS°, push equilibrium constants to a new temperature with van\'t Hoff, and split a measured heat of neutralisation into its parts.',
    problems: [
      {
        id: 'int-acid-thermo-001',
        topic: 'acids', title: 'Ka of hydrofluoric acid from thermodynamic data',
        prompt: 'Standard thermodynamic data at 298 K for the aqueous species in \\(\\ce{HF(aq) <=> H+(aq) + F-(aq)}\\):'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px">'
          + '<tr><td>species</td><td>\\(\\ce{HF(aq)}\\)</td><td>\\(\\ce{H+(aq)}\\)</td><td>\\(\\ce{F-(aq)}\\)</td></tr>'
          + '<tr><td>ΔH°_f / kJ mol⁻¹</td><td>−320.1</td><td>0</td><td>−332.6</td></tr>'
          + '<tr><td>S° / J mol⁻¹ K⁻¹</td><td>88.7</td><td>0</td><td>−13.8</td></tr>'
          + '</table></div>'
          + 'No value of \\(K_a\\) is supplied.',
        parts: [
          { q: '(a) Calculate ΔH° and ΔS° for the dissociation.', a: '\\(\\Delta H^\\circ = [0 + (-332.6)] - (-320.1) = \\mathbf{-12.5\\ kJ/mol}\\) (dissociation is mildly <b>exothermic</b>).<br>\\(\\Delta S^\\circ = [0 + (-13.8)] - 88.7 = \\mathbf{-102.5\\ J\\,mol^{-1}K^{-1}}\\).' },
          { q: '(b) Obtain ΔG° and hence Ka at 298 K.', a: '\\(\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ = -12500 - (298)(-102.5) = -12500 + 30545 = +1.80\\times10^{4}\\ \\text{J/mol} = \\mathbf{+18.0\\ kJ/mol}\\).<br>\\(\\ln K_a = -\\dfrac{\\Delta G^\\circ}{RT} = -\\dfrac{18045}{(8.314)(298)} = -\\dfrac{18045}{2477.6} = -7.283\\).<br>\\(K_a = e^{-7.283} = \\mathbf{6.9\\times10^{-4}}\\) — matching the tabulated value for HF (\\(6.8\\times10^{-4}\\)) ✓.' },
          { q: '(c) Explain the negative ΔS°, given that one molecule becomes two ions.', a: 'Counting particles alone predicts \\(\\Delta S^\\circ > 0\\). <span class="trap">In water the dominant entropy term is not the particle count but the SOLVENT.</span> \\(\\ce{H+}\\) and the small, densely charged \\(\\ce{F-}\\) organise shells of water molecules around themselves (electrostriction), and that ordering of many solvent molecules outweighs the disorder gained by splitting one solute. Note \\(S^\\circ(\\ce{F-}) = -13.8\\) J/mol·K is <i>negative</i> on the convention \\(S^\\circ(\\ce{H+}) = 0\\) — the direct fingerprint of that solvent ordering. This is exactly why HF is weak: \\(\\Delta G^\\circ\\) is positive because of \\(-T\\Delta S^\\circ\\), not because of the enthalpy.' },
          { q: '(d) Estimate Ka at 310 K and state the direction of the change.', a: 'van\'t Hoff: \\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{\\Delta H^\\circ}{R}\\left(\\dfrac1{T_2}-\\dfrac1{T_1}\\right)\\).<br>\\(\\dfrac1{310}-\\dfrac1{298} = 3.2258\\times10^{-3}-3.3557\\times10^{-3} = -1.299\\times10^{-4}\\).<br>\\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{-12500}{8.314}\\times(-1.299\\times10^{-4}) = (1503.5)(-1.299\\times10^{-4}) = -0.1953\\).<br>\\(K_2 = (6.87\\times10^{-4})e^{-0.1953} = (6.87\\times10^{-4})(0.8226) = \\mathbf{5.7\\times10^{-4}}\\).<br>\\(K_a\\) <b>falls</b> as T rises — correct for an exothermic dissociation (Le Chatelier: heat is a product).' },
          { q: '(e) Calculate the pH of 0.100 M HF at 298 K, and check whether the usual approximation is legitimate.', a: 'Exact quadratic, \\(x = [\\ce{H+}]\\): \\(\\dfrac{x^2}{0.100-x} = 6.87\\times10^{-4}\\Rightarrow x^2 + 6.87\\times10^{-4}x - 6.87\\times10^{-5} = 0\\).<br>\\(x = \\dfrac{-6.87\\times10^{-4}+\\sqrt{(6.87\\times10^{-4})^2 + 4(6.87\\times10^{-5})}}{2} = \\dfrac{-6.87\\times10^{-4}+\\sqrt{2.7527\\times10^{-4}}}{2} = \\dfrac{-6.87\\times10^{-4}+1.6591\\times10^{-2}}{2} = 7.95\\times10^{-3}\\ \\text{M}\\).<br>\\(\\text{pH} = -\\log(7.95\\times10^{-3}) = \\mathbf{2.10}\\).<br>Check: ionisation is \\(7.95\\times10^{-3}/0.100 = \\mathbf{7.95\\%}\\), above the 5% limit, so the approximation \\(x=\\sqrt{K_aC}\\) is <b>not</b> valid here — it gives \\(8.29\\times10^{-3}\\) M, pH 2.08. <span class="trap">HF is weak but not that weak; always test the 5% rule before dropping the −x.</span>' },
        ],
      },
      {
        id: 'int-acid-thermo-002',
        topic: 'acids', title: 'Why a buffer\'s pH moves when you warm it',
        prompt: 'For the autoionisation \\(\\ce{2H2O <=> H3O+ + OH-}\\), \\(K_w = 1.00\\times10^{-14}\\) at 298 K and \\(\\Delta H^\\circ = +55.8\\ \\text{kJ/mol}\\). For \\(\\ce{NH3 + H2O <=> NH4+ + OH-}\\), \\(K_b = 1.80\\times10^{-5}\\) at 298 K and \\(\\Delta H^\\circ = +4.2\\ \\text{kJ/mol}\\). Treat both enthalpies as constant over the range.',
        parts: [
          { q: '(a) Calculate Kw at 310 K (body temperature).', a: '\\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{\\Delta H^\\circ}{R}\\left(\\dfrac1{310}-\\dfrac1{298}\\right) = -\\dfrac{55800}{8.314}\\times(-1.299\\times10^{-4}) = (-6711.6)(-1.299\\times10^{-4}) = +0.8718\\).<br>\\(K_w(310) = (1.00\\times10^{-14})e^{0.8718} = (1.00\\times10^{-14})(2.391) = \\mathbf{2.39\\times10^{-14}}\\) — autoionisation is endothermic, so warming water makes more ions.' },
          { q: '(b) Find the pH of pure water at 310 K. Is the water acidic?', a: 'In pure water \\([\\ce{H3O+}] = [\\ce{OH-}] = \\sqrt{K_w} = \\sqrt{2.39\\times10^{-14}} = 1.55\\times10^{-7}\\) M.<br>\\(\\text{pH} = -\\log(1.55\\times10^{-7}) = \\mathbf{6.81}\\) (equivalently \\(\\tfrac12\\text{p}K_w = \\tfrac12(13.62)\\)).<br><b>It is not acidic.</b> <span class="trap">Neutrality means \\([\\ce{H3O+}] = [\\ce{OH-}]\\), not pH = 7.00.</span> pH 7.00 is the neutral point only at 25 °C; at 37 °C the neutral pH is 6.81, and blood at pH 7.40 is therefore about 0.6 units to the basic side, not 0.4.' },
          { q: '(c) A buffer is 0.100 M NH₃ / 0.100 M NH₄Cl. Calculate its pH at 298 K and at 310 K.', a: 'Equal concentrations ⇒ \\(\\text{pOH} = \\text{p}K_b\\) at both temperatures (Henderson–Hasselbalch with the log term zero).<br><b>298 K:</b> \\(\\text{p}K_b = -\\log(1.80\\times10^{-5}) = 4.745\\); \\(\\text{p}K_w = 14.000\\); \\(\\text{pH} = 14.000 - 4.745 = \\mathbf{9.26}\\).<br><b>310 K:</b> \\(K_b\\) first — \\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{4200}{8.314}(-1.299\\times10^{-4}) = +0.0656\\), so \\(K_b = (1.80\\times10^{-5})(1.0678) = 1.92\\times10^{-5}\\) and \\(\\text{p}K_b = 4.716\\). With \\(\\text{p}K_w = -\\log(2.39\\times10^{-14}) = 13.622\\):<br>\\(\\text{pH} = 13.622 - 4.716 = \\mathbf{8.91}\\).<br>The buffer ratio never changed, yet the pH fell by <b>0.35 units</b>.' },
          { q: '(d) Attribute the shift to its two causes, and explain why an acetate buffer barely moves.', a: '\\(\\text{pH} = \\text{p}K_w - \\text{p}K_b\\), so \\(\\Delta\\text{pH} = \\Delta\\text{p}K_w - \\Delta\\text{p}K_b = (13.622-14.000) - (4.716-4.745) = -0.378 + 0.029 = \\mathbf{-0.35}\\).<br>The \\(K_w\\) term supplies −0.378 of it and the \\(K_b\\) term claws back only +0.029: <b>the shift is almost entirely the water autoionisation constant</b>, because \\(\\Delta H^\\circ(K_w) = +55.8\\) kJ/mol dwarfs \\(+4.2\\) kJ/mol.<br>An acetate buffer is governed by \\(\\text{pH} = \\text{p}K_a\\) of a neutral acid, with \\(\\Delta H^\\circ_a \\approx 0\\) — and \\(K_w\\) never enters. Its pH is therefore nearly temperature-independent. The rule generalises: <b>base</b> buffers (ammonia, tris) inherit the temperature dependence of \\(K_w\\); <b>acid</b> buffers do not.' },
          { q: '(e) Give two practical consequences for laboratory measurement.', a: '(i) <b>Calibrate the pH meter at the measurement temperature</b> with buffers whose certified pH at that temperature is quoted — a probe standardised at 25 °C and used at 37 °C reads a solution whose true pH has itself moved. Use the meter\'s automatic temperature compensation, and note it corrects the electrode\'s Nernst slope (\\(2.303RT/F\\)), <i>not</i> the sample\'s own equilibrium shift.<br>(ii) <b>Thermostat the cell</b> and quote the temperature with any pH. For biological work, prepare buffers at the working temperature: a tris buffer mixed to pH 8.0 on the bench at 25 °C is around pH 7.6 in a 37 °C incubator, which is enough to change enzyme activity.' },
        ],
      },
      {
        id: 'int-acid-thermo-003',
        topic: 'thermo', title: 'Splitting a heat of neutralisation',
        prompt: '100.0 mL of a monoprotic weak acid HA of unknown concentration is titrated in an insulated cell with 2.000 M NaOH, added in 4.00 mL portions, with the temperature recorded after each addition. The total heat capacity of the cell plus contents is 520 J K⁻¹ and may be taken as constant.'
          + '<div class="table-scroll"><table style="margin:8px 0;border-collapse:separate;border-spacing:14px 3px">'
          + '<tr><td>V(NaOH) / mL</td><td>0</td><td>4.00</td><td>8.00</td><td>12.00</td><td>16.00</td><td>20.00</td><td>24.00</td><td>28.00</td><td>32.00</td></tr>'
          + '<tr><td>T / °C</td><td>21.00</td><td>21.80</td><td>22.60</td><td>23.40</td><td>24.20</td><td>25.00</td><td>25.00</td><td>25.00</td><td>25.00</td></tr>'
          + '</table></div>' + thermometricPlot,
        parts: [
          { q: '(a) Locate the equivalence point from the data and find the concentration of HA.', a: 'The temperature climbs linearly to <b>20.00 mL</b> (dashed line) and is flat thereafter — the break is the equivalence point, because past it there is no more acid to neutralise.<br>\\(n(\\ce{NaOH}) = (0.02000\\ \\text{L})(2.000\\ \\text{M}) = 0.04000\\) mol \\(= n(\\ce{HA})\\) (1:1).<br>\\(c(\\ce{HA}) = \\dfrac{0.04000\\ \\text{mol}}{0.1000\\ \\text{L}} = \\mathbf{0.400\\ M}\\).' },
          { q: '(b) Calculate the molar enthalpy of neutralisation of HA.', a: '\\(\\Delta T = 25.00 - 21.00 = 4.00\\ \\text{K}\\), so \\(q = C\\Delta T = (520\\ \\text{J K}^{-1})(4.00\\ \\text{K}) = 2080\\ \\text{J}\\) released.<br>\\(\\Delta H_{neut} = -\\dfrac{q}{n} = -\\dfrac{2080\\ \\text{J}}{0.04000\\ \\text{mol}} = -5.20\\times10^{4}\\ \\text{J/mol} = \\mathbf{-52.0\\ kJ/mol}\\).' },
          { q: '(c) A parallel run with a strong acid gives −57.3 kJ/mol. Use a Hess cycle to extract ΔH° for the dissociation of HA.', a: 'The strong-acid figure is the enthalpy of \\(\\ce{H+(aq) + OH-(aq) -> H2O(l)}\\), \\(-57.3\\) kJ/mol. Neutralising a weak acid is that step preceded by its dissociation:<br>\\(\\ce{HA(aq) -> H+(aq) + A-(aq)}\\quad \\Delta H_{diss}\\)<br>\\(\\ce{H+(aq) + OH-(aq) -> H2O(l)}\\quad -57.3\\) kJ/mol<br>Sum \\(= \\ce{HA + OH- -> A- + H2O}\\), \\(\\Delta H_{neut} = -52.0\\) kJ/mol.<br>\\(\\Delta H_{diss} = -52.0 - (-57.3) = \\mathbf{+5.3\\ kJ/mol}\\) — endothermic, which is why neutralising a weak acid releases <b>less</b> heat than a strong one. <span class="trap">The deficit is a property of the acid, not a calorimeter error.</span>' },
          { q: '(d) Ka(HA) = 1.4×10⁻⁵ at 298 K. Find ΔG° and ΔS° for the dissociation, and predict Ka at 313 K.', a: '\\(\\Delta G^\\circ = -RT\\ln K_a = -(8.314)(298)\\ln(1.4\\times10^{-5}) = -(2477.6)(-11.176) = +2.77\\times10^{4}\\ \\text{J/mol} = \\mathbf{+27.7\\ kJ/mol}\\).<br>\\(\\Delta S^\\circ = \\dfrac{\\Delta H^\\circ - \\Delta G^\\circ}{T} = \\dfrac{5300 - 27691}{298} = \\dfrac{-22391}{298} = \\mathbf{-75.1\\ J\\,mol^{-1}K^{-1}}\\) — negative for the same solvent-ordering reason as any weak acid in water.<br>van\'t Hoff to 313 K: \\(\\dfrac1{313}-\\dfrac1{298} = -1.608\\times10^{-4}\\), so \\(\\ln\\dfrac{K_2}{K_1} = -\\dfrac{5300}{8.314}(-1.608\\times10^{-4}) = +0.1025\\) and \\(K_a(313) = (1.4\\times10^{-5})(1.108) = \\mathbf{1.55\\times10^{-5}}\\). A 15 K rise changes \\(K_a\\) by only 11% because \\(\\Delta H^\\circ\\) is small.' },
          { q: '(e) Explain the plateau after 20.00 mL, and give one advantage of this thermometric endpoint over an indicator.', a: 'Past equivalence the added NaOH has nothing left to react with, so no reaction enthalpy is released; the temperature holds steady (in a real run it drifts slightly <b>down</b> from heat loss and from dilution by titrant at room temperature — extrapolate the two straight segments back to their intersection to get \\(V_{eq}\\) and the true \\(\\Delta T\\)).<br>Advantage: the endpoint is a <b>heat</b> signal, so it works in coloured, turbid or opaque solutions where an indicator cannot be seen, and it still gives a sharp intersection for very weak acids (\\(K_a < 10^{-8}\\)) whose pH curve has no usable break — the enthalpy of neutralisation does not vanish just because the pH jump does.' },
        ],
      },
    ],
  },
];
