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
          + '<table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px"><tr><td>T / K</td><td>298</td><td>320</td><td>340</td><td>360</td></tr>'
          + '<tr><td>K_p</td><td>0.15</td><td>0.73</td><td>2.59</td><td>7.9</td></tr></table>'
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
          { q: '(d) Design the endpoint detection and name a suitable indicator.', a: 'Detect the potential jump with a <b>Pt indicator electrode</b> vs a reference (SCE) — potentiometric endpoint at the inflection. For a visual endpoint use a redox indicator whose transition potential lies in the break, e.g. <b>ferroin</b> (\\(E^\\circ\\approx1.06\\) V, pale-blue → red). Take fine (0.1 mL) increments through the jump and plot ΔE/ΔV to pin the maximum.' },
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
          + '<table style="margin:8px 0;border-collapse:separate;border-spacing:16px 3px"><tr><td>complex</td><td>A</td><td>B</td><td>C</td><td>D</td></tr>'
          + '<tr><td>μ_eff / BM</td><td>1.73</td><td>3.87</td><td>4.90</td><td>5.92</td></tr></table>'
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
          { q: '(c) [CuCl₄]²⁻ is yellow-green and tetrahedral. How do geometry and ligand field explain this?', a: 'Cl⁻ is a weak-field ligand and the geometry is <b>tetrahedral</b>, where \\(\\Delta_t \\approx \\tfrac49\\Delta_o\\) — a much smaller splitting. The small \\(\\Delta\\) shifts the d–d absorption to lower energy (absorbs red/violet), giving the yellow-green colour, and tetrahedral (no centre of symmetry) transitions are more allowed → more intense than octahedral.' },
          { q: '(d) Arrange the three by increasing Δ and state what you would measure to confirm it.', a: 'Increasing Δ: \\(\\ce{[CuCl4]^2-}\\) (tetrahedral, weak Cl) < \\(\\ce{[Cu(H2O)6]^2+}\\) < \\(\\ce{[Cu(NH3)4(H2O)2]^2+}\\). Confirm with <b>UV-vis</b>: measure \\(\\lambda_{max}\\) of the d–d band for each; \\(\\Delta \\propto 1/\\lambda_{max}\\) (via \\(E=hc/\\lambda\\)). Higher-field complexes absorb at shorter wavelength.' },
        ],
      },
    ],
  },
];
