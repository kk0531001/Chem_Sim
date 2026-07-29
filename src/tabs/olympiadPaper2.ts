// Mock Paper 2 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper2: OlympiadPaper = {
  id: 'mock2',
  label: 'Mock Paper 2',
  blurb: 'Second full-length practice contest — 25 multiple-choice and written problems across all topics.',
  partA: [
    { q: 'How many oxygen atoms are in 0.50 mol of \\(\\ce{Al2(SO4)3}\\)?', opts: ['6.0×10²³', '3.6×10²⁴', '7.2×10²⁴', '1.8×10²⁴'], a: 1, why: '12 O per formula unit → 0.50 × 12 × 6.02×10²³ = 3.6×10²⁴.' },
    { q: 'At the same T and P, equal volumes of two gases contain equal numbers of:', opts: ['atoms', 'molecules', 'electrons', 'grams'], a: 1, why: 'Avogadro\'s law — equal volumes at the same T, P contain equal numbers of molecules.' },
    { q: 'The percent yield is 80.0% and the theoretical yield is 25.0 g. The actual yield is:', opts: ['31.3 g', '20.0 g', '5.0 g', '45.0 g'], a: 1, why: 'Actual = 0.800 × 25.0 = 20.0 g.' },
    { q: 'Doubling the concentration of a reactant quadruples the rate. The order in that reactant is:', opts: ['0', '1', '2', '3'], a: 2, why: 'rate ∝ [A]ⁿ; 2ⁿ = 4 → n = 2 (second order).' },
    { q: 'For an exothermic equilibrium, increasing the temperature causes K to:', opts: ['increase', 'decrease', 'stay the same', 'become zero'], a: 1, why: 'Heat is a product; adding heat shifts left, lowering K (van\'t Hoff).' },
    { q: 'The conjugate base of \\(\\ce{HSO4^-}\\) is:', opts: ['\\(\\ce{H2SO4}\\)', '\\(\\ce{SO4^2-}\\)', '\\(\\ce{H2O}\\)', '\\(\\ce{OH-}\\)'], a: 1, why: 'Removing one H⁺ from HSO₄⁻ gives SO₄²⁻.' },
    { q: 'The pH of a 0.10 M solution of a weak acid with Ka = 1.0×10⁻⁵ is about:', opts: ['1.0', '3.0', '5.0', '7.0'], a: 1, why: '[H⁺] ≈ √(Ka·C) = √(10⁻⁵·0.10) = √10⁻⁶ = 10⁻³ → pH = 3.0.' },
    { q: 'Adding \\(\\ce{NaCl}\\) to a saturated solution of \\(\\ce{AgCl}\\) causes the AgCl solubility to:', opts: ['increase', 'decrease', 'stay the same', 'double'], a: 1, why: 'Common-ion effect: added Cl⁻ shifts \\(\\ce{AgCl <=> Ag+ + Cl-}\\) left, lowering solubility.' },
    { q: 'How many moles of electrons are needed to deposit 1.0 mol of Al from \\(\\ce{Al^3+}\\)?', opts: ['1', '2', '3', '6'], a: 2, why: '\\(\\ce{Al^3+ + 3e- -> Al}\\) — 3 mol electrons per mol Al.' },
    { q: 'In the reaction \\(\\ce{2Fe^3+ + Sn^2+ -> 2Fe^2+ + Sn^4+}\\), the reducing agent is:', opts: ['Fe³⁺', 'Sn²⁺', 'Fe²⁺', 'Sn⁴⁺'], a: 1, why: 'Sn²⁺ is oxidized (loses electrons), so it is the reducing agent.' },
    { q: 'The ground-state electron configuration of \\(\\ce{Cu}\\) (Z = 29) is:', opts: ['[Ar]3d⁹4s²', '[Ar]3d¹⁰4s¹', '[Ar]3d¹⁰4s²', '[Ar]3d⁸4s²'], a: 1, why: 'A filled 3d¹⁰ is extra-stable, so Cu is [Ar]3d¹⁰4s¹ (one of the d-block exceptions).' },
    { q: 'Which species has the smallest radius?', opts: ['\\(\\ce{Na+}\\)', '\\(\\ce{Mg^2+}\\)', '\\(\\ce{F-}\\)', '\\(\\ce{O^2-}\\)'], a: 1, why: 'All are isoelectronic (10 e⁻); the highest nuclear charge (Mg, Z=12) pulls electrons in tightest.' },
    { q: 'The bond order of \\(\\ce{O2}\\) from molecular-orbital theory is:', opts: ['1', '1.5', '2', '3'], a: 2, why: 'O₂ has bond order (8−4)/2 = 2, with two unpaired electrons (paramagnetic).' },
    { q: 'The shape of the \\(\\ce{XeF4}\\) molecule is:', opts: ['tetrahedral', 'square planar', 'see-saw', 'octahedral'], a: 1, why: 'AX₄E₂ (6 domains, two lone pairs opposite) → square planar.' },
    { q: 'Which compound contains both ionic and covalent bonding?', opts: ['\\(\\ce{NaCl}\\)', '\\(\\ce{CO2}\\)', '\\(\\ce{Na2SO4}\\)', '\\(\\ce{CH4}\\)'], a: 2, why: 'Na₂SO₄: ionic between Na⁺ and SO₄²⁻, covalent within the sulfate ion.' },
    { q: 'Which pair are geometric (cis–trans) isomers?', opts: ['butane / isobutane', 'cis- and trans-2-butene', 'ethanol / dimethyl ether', 'glucose / fructose'], a: 1, why: 'Restricted rotation about the C=C of 2-butene gives cis and trans forms.' },
    { q: 'The functional group in \\(\\ce{CH3COOH}\\) is:', opts: ['aldehyde', 'ketone', 'carboxylic acid', 'ester'], a: 2, why: 'The –COOH group is a carboxylic acid.' },
    { q: 'Which reagent oxidizes a primary alcohol all the way to a carboxylic acid?', opts: ['NaBH₄', 'hot acidified KMnO₄', 'H₂/Pd', 'PCC'], a: 1, why: 'Strong oxidant KMnO₄ takes a 1° alcohol → aldehyde → carboxylic acid (PCC stops at the aldehyde).' },
    { q: 'Which ion gives a brick-red flame test colour?', opts: ['\\(\\ce{Ca^2+}\\)', '\\(\\ce{Ba^2+}\\)', '\\(\\ce{K+}\\)', '\\(\\ce{Cu^2+}\\)'], a: 0, why: 'Ca²⁺ burns brick-red; Ba²⁺ green, K⁺ lilac, Cu²⁺ blue-green.' },
    { q: 'A nuclide undergoes β⁻ decay. Its atomic number:', opts: ['increases by 1', 'decreases by 1', 'stays the same', 'decreases by 2'], a: 0, why: 'A neutron → proton + electron, so Z rises by 1 while A is unchanged.' },
    { q: 'A student reports a titre of 24.35 mL. The number of significant figures is:', opts: ['2', '3', '4', '5'], a: 2, why: '2, 4, 3, 5 are all significant → 4 significant figures.' },
    { q: 'The osmotic pressure of a solution is measured mainly to determine a solute\'s:', opts: ['boiling point', 'molar mass', 'density', 'colour'], a: 1, why: 'π = MRT (or via molar concentration) — a sensitive colligative route to molar mass, good for macromolecules.' },
    { q: 'For which reaction is ΔS most positive?', opts: ['\\(\\ce{H2O(l) -> H2O(s)}\\)', '\\(\\ce{2H2 + O2 -> 2H2O(l)}\\)', '\\(\\ce{CaCO3(s) -> CaO(s) + CO2(g)}\\)', '\\(\\ce{N2 + 3H2 -> 2NH3}\\)'], a: 2, why: 'A gas is produced from a solid — a large increase in disorder.' },
    { q: 'A reaction has ΔG° = −RT ln K. If K < 1, then ΔG° is:', opts: ['negative', 'zero', 'positive', 'infinite'], a: 2, why: 'K < 1 → ln K < 0 → −RT ln K > 0, so ΔG° is positive (non-spontaneous under standard conditions).' },
    { q: 'How many photons of wavelength 500 nm carry a total energy of 3.97×10⁻¹⁹ J? (E = hc/λ, one photon)', opts: ['1', '2', '10', '0.5'], a: 0, why: 'One photon at 500 nm has E = hc/λ = (6.63×10⁻³⁴·3.0×10⁸)/(5.0×10⁻⁷) = 3.97×10⁻¹⁹ J — so exactly one photon.' },
  ],
  partB: [
    {
      topic: 'stoich', title: 'B1 — Empirical and molecular formula from combustion',
      prompt: 'Combustion of 0.500 g of a hydrocarbon gives 1.571 g \\(\\ce{CO2}\\) and 0.643 g \\(\\ce{H2O}\\). Its molar mass is 42 g/mol.',
      parts: [
        { q: '(a) Find the moles of C and H, and the empirical formula.', a: 'n(C) = 1.571/44.01 = 0.0357 mol; n(H) = 2 × 0.643/18.02 = 0.0714 mol. Ratio C:H = 1:2 → empirical formula <b>CH₂</b>.' },
        { q: '(b) Determine the molecular formula.', a: 'Empirical mass (CH₂) = 14. 42/14 = 3 → molecular formula <b>C₃H₆</b> (propene or cyclopropane).' },
        { q: '(c) Confirm all carbon and hydrogen came from the sample.', a: 'mass C = 0.0357 × 12.01 = 0.429 g; mass H = 0.0714 × 1.008 = 0.072 g; sum = 0.501 g ≈ 0.500 g sample → consistent, no other element.' },
      ],
    },
    {
      topic: 'acids', title: 'B2 — Weak-acid equilibrium and a buffer',
      prompt: 'Acetic acid has Ka = 1.8×10⁻⁵.',
      parts: [
        { q: '(a) Calculate the pH of 0.100 M acetic acid.', a: '[H⁺] ≈ √(Ka·C) = √(1.8×10⁻⁵ × 0.100) = √(1.8×10⁻⁶) = 1.34×10⁻³ → pH = <b>2.87</b>.' },
        { q: '(b) What is the pH after adding sodium acetate to make it 0.100 M in acetate?', a: 'Equal [HA] and [A⁻]: pH = pKa = −log(1.8×10⁻⁵) = <b>4.74</b> — a buffer at its maximum capacity.' },
        { q: '(c) Explain what happens to the pH if a little strong acid is added to the buffer.', a: 'Added H⁺ is consumed by acetate (\\(\\ce{A- + H+ -> HA}\\)); the ratio [A⁻]/[HA] changes only slightly, so the pH barely moves — that is buffering.' },
      ],
    },
    {
      topic: 'kinetics', title: 'B3 — Rate law from initial rates',
      prompt: 'For \\(\\ce{A + B -> products}\\): doubling [A] doubles the rate; doubling [B] leaves the rate unchanged. When [A]=[B]=0.10 M the rate is 2.0×10⁻³ M/s.',
      parts: [
        { q: '(a) Determine the rate law and overall order.', a: 'First order in A, zero order in B → rate = k[A]. Overall order = <b>1</b>.' },
        { q: '(b) Calculate the rate constant k with units.', a: 'k = rate/[A] = 2.0×10⁻³ / 0.10 = <b>2.0×10⁻² s⁻¹</b>.' },
        { q: '(c) What does zero order in B suggest about the mechanism?', a: 'B does not appear in (or before) the rate-determining step — e.g. the slow step involves only A, and B reacts in a later fast step.' },
      ],
    },
    {
      topic: 'redox', title: 'B4 — Electrolysis and Faraday\'s laws',
      prompt: 'Molten \\(\\ce{Al2O3}\\) is electrolyzed at a constant current of 5.00 A for 1.00 hour (F = 96 485 C/mol).',
      parts: [
        { q: '(a) How many moles of electrons pass?', a: 'Q = It = 5.00 × 3600 = 1.80×10⁴ C → n(e⁻) = 18000/96485 = <b>0.187 mol</b>.' },
        { q: '(b) What mass of aluminium is deposited? \\(\\ce{Al^3+ + 3e- -> Al}\\).', a: 'n(Al) = 0.187/3 = 0.0622 mol → mass = 0.0622 × 26.98 = <b>1.68 g</b>.' },
        { q: '(c) What volume of O₂ at STP forms at the anode? \\(\\ce{2O^2- -> O2 + 4e-}\\).', a: 'n(O₂) = 0.187/4 = 0.0467 mol → V = 0.0467 × 22.4 = <b>1.05 L</b>.' },
      ],
    },
  ],
};
