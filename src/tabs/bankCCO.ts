// CCO-style problem sets (PS1–PS4), organized by the November–January prep
// schedule. Multi-part free-response with worked solutions. All ORIGINAL —
// written to match the format and difficulty of the Canadian Chemistry
// Olympiad advanced problem sets, never copied from real papers.
import type { FRQ } from './bankPart2';

export interface ProblemSet {
  id: string;
  month: string;
  label: string;
  blurb: string;
  problems: FRQ[];
}

export const CCO_SETS: ProblemSet[] = [
  {
    id: 'ps1', month: 'November', label: 'PS1 · Analytical & Quantitative',
    blurb: 'Complexometric and redox titrations, gravimetry, activity, and error-aware quantitative analysis.',
    problems: [
      {
        topic: 'acids', title: 'Water hardness by EDTA',
        prompt: 'A 50.00 mL water sample is titrated with 0.01000 M EDTA. At pH 10 (total hardness) it requires 15.60 mL. A second 50.00 mL portion at pH 12 (Mg²⁺ masked as hydroxide) requires 9.20 mL.',
        parts: [
          { q: '(a) Find the total moles of Ca²⁺ + Mg²⁺ in the first sample.', a: 'EDTA binds 1:1: n = 0.01000 M × 15.60 mL = <b>0.1560 mmol</b> = 1.560×10⁻⁴ mol total.' },
          { q: '(b) Determine [Ca²⁺] and [Mg²⁺] separately.', a: 'At pH 12 only Ca²⁺ reacts: n(Ca) = 0.01000 × 9.20 = 0.0920 mmol → [Ca²⁺] = 0.0920/50.00 = <b>1.84×10⁻³ M</b>. Mg by difference: 0.1560 − 0.0920 = 0.0640 mmol → [Mg²⁺] = <b>1.28×10⁻³ M</b>.' },
          { q: '(c) Express total hardness as ppm CaCO₃ (M = 100.09).', a: 'Total metal = 1.560×10⁻⁴ mol in 0.05000 L = 3.12×10⁻³ M. As CaCO₃: 3.12×10⁻³ × 100.09 = 0.312 g/L = <b>312 ppm</b> (very hard water).' },
          { q: '(d) Why is the titration buffered, and what happens to the endpoint at pH 6?', a: 'The buffer keeps EDTA in the Y⁴⁻ form (raises α₄, hence K′ = α₄K_f). At pH 6, α₄ ≈ 2×10⁻⁵ collapses K′ below ~10⁸ and the endpoint break becomes too gradual to read — <span class="trap">the conditional constant, not K_f, decides feasibility.</span>' },
        ],
      },
      {
        topic: 'redox', title: 'Iron ore by dichromate',
        prompt: 'A 0.5000 g iron-ore sample is dissolved, all iron reduced to Fe²⁺, and titrated with 0.02000 M K₂Cr₂O₇, requiring 24.50 mL.<br>Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O',
        parts: [
          { q: '(a) Moles of dichromate and of iron.', a: 'n(Cr₂O₇²⁻) = 0.02000 × 24.50 = 0.4900 mmol; ratio 1:6 → n(Fe) = 6 × 0.4900 = <b>2.940 mmol</b>.' },
          { q: '(b) Mass percent of iron (M = 55.85) in the ore.', a: 'mass Fe = 2.940×10⁻³ × 55.85 = 0.1642 g → %Fe = 0.1642/0.5000 × 100 = <b>32.84%</b>.' },
          { q: '(c) Why must all iron be Fe²⁺ before titrating, and how is residual reductant removed?', a: 'Dichromate only oxidizes Fe²⁺; any Fe³⁺ remaining would be undercounted. A pre-reductant (SnCl₂) converts Fe³⁺→Fe²⁺, and its slight excess is destroyed (HgCl₂) before titration so it doesn\'t also consume dichromate — otherwise the result reads high.' },
        ],
      },
      {
        topic: 'stoich', title: 'Activity effect on solubility',
        prompt: 'Ksp(AgCl) = 1.8×10⁻¹⁰ (thermodynamic, in activities). Compare its solubility in pure water and in 0.10 M KNO₃. Use the Davies equation.',
        parts: [
          { q: '(a) Solubility in pure water (ideal, γ = 1).', a: 's = √Ksp = √(1.8×10⁻¹⁰) = <b>1.34×10⁻⁵ M</b>.' },
          { q: '(b) Estimate γ± of Ag⁺/Cl⁻ at I = 0.10 M (Davies).', a: 'log γ± = −0.51(1)(1)[√0.10/(1+√0.10) − 0.3(0.10)] = −0.51[0.240 − 0.030] = −0.107 → γ± ≈ <b>0.78</b>.' },
          { q: '(c) Solubility in 0.10 M KNO₃, and explain the direction.', a: 'Ksp = (γ±)²[Ag⁺][Cl⁻] → s = √(Ksp)/γ± = 1.34×10⁻⁵/0.78 = <b>1.7×10⁻⁵ M</b>, about 28% higher. The inert electrolyte screens the ions (γ± &lt; 1), so more must dissolve to keep the activity product fixed — the <b>diverse-ion (salt) effect</b>, opposite to the common-ion effect.' },
        ],
      },
    ],
  },
  {
    id: 'ps2', month: 'December', label: 'PS2 · Spectroscopy + Advanced Synthesis',
    blurb: 'Structure elucidation from IR/NMR/MS, and multistep synthetic reasoning.',
    problems: [
      {
        topic: 'organic', title: 'Structure from combined spectra',
        prompt: 'An unknown C₄H₈O₂ shows: MS M⁺ = 88, strong loss to m/z 43; IR strong band 1740 cm⁻¹, no broad O–H; ¹H NMR: δ 2.0 (s, 3H), δ 4.1 (q, 2H), δ 1.25 (t, 3H).',
        parts: [
          { q: '(a) Degrees of unsaturation and what the IR band implies.', a: 'DoU = (2·4+2−8)/2 = <b>1</b>. The sharp 1740 cm⁻¹ with no broad O–H is an <b>ester carbonyl</b> (not an acid) — the one degree of unsaturation.' },
          { q: '(b) Interpret the ¹H NMR pattern.', a: 'δ1.25 (t) + δ4.1 (q) in 3:2 is an <b>ethyl on oxygen</b> (–OCH₂CH₃, deshielded CH₂). δ2.0 singlet (3H) is an isolated <b>acetyl methyl</b> CH₃C(=O)–.' },
          { q: '(c) Give the structure and confirm with the MS fragment.', a: '<b>Ethyl acetate, CH₃COOCH₂CH₃.</b> M⁺ = 88 ✓. Loss to m/z 43 = the acylium ion CH₃CO⁺ (88 − 45 for OEt), the diagnostic ester cleavage.' },
        ],
      },
      {
        topic: 'organic', title: 'Isotope pattern and the nitrogen rule',
        prompt: 'A compound gives M⁺ = 93 with an M+2 peak about one-third the height of M⁺.',
        parts: [
          { q: '(a) What does the M+2 ≈ ⅓ M pattern indicate?', a: 'A single <b>chlorine</b> atom: ³⁵Cl:³⁷Cl ≈ 3:1 gives M:M+2 ≈ 3:1. (Bromine would give ~1:1.)' },
          { q: '(b) Apply the nitrogen rule.', a: 'M⁺ = 93 is odd → an <b>odd number of nitrogen atoms</b> (one N is simplest).' },
          { q: '(c) Propose a molecular formula and a structure.', a: 'Subtract Cl (35): 93 − 35 = 58 for the rest, with one N. C₃H₈N fits (3·12+8+14 = 58). Formula C₃H₈ClN → e.g. <b>3-chloropropan-1-amine, ClCH₂CH₂CH₂NH₂</b> (M = 93.5 → nominal 93).' },
        ],
      },
      {
        topic: 'organic', title: 'Multistep synthesis & pericyclic step',
        prompt: 'Design reasoning: convert cyclohexanone into bicyclo product via an intermediate diene, and separately justify a Diels–Alder step.',
        parts: [
          { q: '(a) Make an alkene from cyclohexanone (2 steps).', a: '(1) Reduce with NaBH₄ → cyclohexanol; (2) acid-catalyzed dehydration (or POCl₃/pyridine) → <b>cyclohexene</b>. Alternatively a Wittig gives an exocyclic alkene at a chosen position.' },
          { q: '(b) A diene reacts with maleic anhydride. State the stereochemical outcome and the rule.', a: 'A thermal <b>Diels–Alder [4+2]</b>: 6 π electrons, Woodward–Hoffmann thermally allowed suprafacial–suprafacial. The diene must be <b>s-cis</b>; addition is syn on both partners and <b>endo</b>-selective, giving a cis ring fusion — stereospecific.' },
          { q: '(c) Why would you protect a ketone before adding a Grignard elsewhere?', a: 'A Grignard would add to the ketone. Convert it to a cyclic <b>acetal</b> (ethylene glycol, H⁺) first; it is inert to the organometallic, then hydrolyze back with aqueous acid after the Grignard step — orthogonal protection.' },
        ],
      },
    ],
  },
  {
    id: 'ps3', month: 'January', label: 'PS3 · Coordination + Solid-State + Descriptive',
    blurb: 'Ligand-field analysis, crystal structures and structure–property reasoning in inorganic chemistry.',
    problems: [
      {
        topic: 'descriptive', title: 'Two iron complexes',
        prompt: 'Compare [Fe(H₂O)₆]³⁺ and [Fe(CN)₆]³⁻. H₂O is weak-field, CN⁻ is strong-field.',
        parts: [
          { q: '(a) d-electron count and spin state of each.', a: 'Both are Fe³⁺ = <b>d⁵</b>. Weak-field aqua: high spin t₂g³e_g² → <b>5 unpaired</b>. Strong-field cyanide: low spin t₂g⁵ → <b>1 unpaired</b>.' },
          { q: '(b) LFSE for each (ignore pairing energy).', a: 'High-spin d⁵: 3(−0.4)+2(+0.6) = <b>0 Δ_o</b>. Low-spin d⁵ = t₂g⁵: 5(−0.4) = <b>−2.0 Δ_o</b> — the extra stabilization that makes CN⁻ complexes inert.' },
          { q: '(c) Predict and explain the magnetic moments.', a: 'μ = √(n(n+2)) BM: aqua √(5·7) = <b>5.92 BM</b>; cyanide √(1·3) = <b>1.73 BM</b>. Measuring μ (Evans method) distinguishes the two — a direct read on Δ_o vs pairing energy.' },
        ],
      },
      {
        topic: 'bonding', title: 'Copper metal from its unit cell',
        prompt: 'Copper crystallizes FCC with edge length a = 361.5 pm; M(Cu) = 63.55 g/mol.',
        parts: [
          { q: '(a) Atoms per cell and the atomic radius.', a: 'FCC: Z = 8(⅛)+6(½) = <b>4 atoms</b>. Atoms touch along the face diagonal: 4r = a√2 → r = 361.5·√2/4 = <b>127.8 pm</b>.' },
          { q: '(b) Density of copper.', a: 'a = 3.615×10⁻⁸ cm → a³ = 4.72×10⁻²³ cm³. ρ = ZM/(N_A a³) = (4×63.55)/(6.022×10²³ × 4.72×10⁻²³) = <b>8.93 g/cm³</b> ✓ (matches the handbook value).' },
          { q: '(c) The FCC packing efficiency is 74%. Why can\'t equal spheres pack more tightly?', a: 'FCC and HCP are the two closest-packings of equal spheres; 74% is the proven maximum (Kepler). The remaining 26% is unavoidable void — octahedral and tetrahedral holes, which is where interstitial atoms (C in steel) or the smaller ion in ionic lattices sit.' },
        ],
      },
      {
        topic: 'descriptive', title: 'Radius ratio and structure choice',
        prompt: 'Ionic radii: Na⁺ 102 pm, Cl⁻ 181 pm, Cs⁺ 167 pm, Zn²⁺ 74 pm, S²⁻ 184 pm.',
        parts: [
          { q: '(a) Predict the coordination number of Na⁺ in NaCl.', a: 'r₊/r₋ = 102/181 = 0.564 → the 0.414–0.732 window → <b>6-coordinate (octahedral)</b>. NaCl is the rock-salt structure ✓.' },
          { q: '(b) Predict the structure type for CsCl.', a: 'r₊/r₋ = 167/181 = 0.923 → 0.732–1.0 window → <b>8-coordinate (cubic)</b>. CsCl adopts the body-centred-cubic-like CsCl structure ✓.' },
          { q: '(c) Zn²⁺/S²⁻ = 74/184 = 0.40 predicts what, and what is actually observed?', a: '0.225–0.414 → <b>4-coordinate (tetrahedral)</b>, and ZnS (zinc blende/wurtzite) is indeed tetrahedral ✓. <span class="trap">Radius-ratio rules are a useful guide but fail when bonding is significantly covalent</span> — ZnS is borderline and its tetrahedral choice also reflects covalency.' },
        ],
      },
    ],
  },
  {
    id: 'ps4', month: 'January', label: 'PS4 · Advanced Thermo/Kinetics + Biochemistry',
    blurb: 'Transition-state theory, enzyme kinetics, and quantitative bioenergetics.',
    problems: [
      {
        topic: 'kinetics', title: 'Activation parameters from Eyring',
        prompt: 'A reaction\'s rate constant is measured at several temperatures. An Eyring plot of ln(k/T) vs 1/T gives slope = −6.05×10³ K and intercept = 23.8.',
        parts: [
          { q: '(a) Find ΔH‡ from the slope.', a: 'slope = −ΔH‡/R → ΔH‡ = 6.05×10³ × 8.314 = 5.03×10⁴ J/mol = <b>50.3 kJ/mol</b>.' },
          { q: '(b) Find ΔS‡ from the intercept (intercept = ln(k_B/h) + ΔS‡/R; ln(k_B/h) = 23.76).', a: 'ΔS‡/R = 23.8 − 23.76 = 0.04 → ΔS‡ = 0.04 × 8.314 = <b>+0.3 J/mol·K ≈ 0</b> — a near-neutral entropy of activation, suggesting little ordering change (roughly unimolecular).' },
          { q: '(c) A different reaction gives ΔS‡ = −110 J/mol·K. What does that imply mechanistically?', a: 'A large negative ΔS‡ means the transition state is much more <b>ordered</b> than the reactants — two molecules coming together and losing translational/rotational freedom. Signature of an <b>associative/bimolecular</b> step.' },
        ],
      },
      {
        topic: 'kinetics', title: 'Enzyme kinetics with an inhibitor',
        prompt: 'For an enzyme, v is measured vs [S]. Without inhibitor: V_max = 120 µM/min, K_M = 4.0 mM. With 5 mM of inhibitor I (K_i = 2.5 mM), the apparent K_M becomes 12 mM while V_max is unchanged.',
        parts: [
          { q: '(a) What type of inhibition is this, and why?', a: 'K_M rises but V_max holds → <b>competitive inhibition</b>. The inhibitor competes for the active site; saturating substrate still reaches the same V_max.' },
          { q: '(b) Verify the apparent K_M with the competitive formula K_M′ = K_M(1+[I]/K_i).', a: 'K_M′ = 4.0(1 + 5/2.5) = 4.0(1+2) = <b>12 mM</b> ✓.' },
          { q: '(c) Compute v at [S] = 12 mM, with and without inhibitor.', a: 'Without: v = 120·12/(4+12) = 120·0.75 = <b>90 µM/min</b>. With: v = 120·12/(12+12) = 120·0.5 = <b>60 µM/min</b>. Raising [S] further would let the inhibited enzyme approach the SAME V_max — the hallmark of competitive inhibition.' },
        ],
      },
      {
        topic: 'thermo', title: 'Coupling and the reach of ATP',
        prompt: 'ATP hydrolysis has ΔG°′ = −30.5 kJ/mol. Glutamine synthesis (Glu + NH₃ → Gln + H₂O) has ΔG°′ = +14.2 kJ/mol and is driven by coupling to ATP.',
        parts: [
          { q: '(a) Net ΔG°′ of the coupled reaction; is it spontaneous?', a: 'Free energies add: −30.5 + 14.2 = <b>−16.3 kJ/mol</b> → spontaneous (K°′ &gt; 1). Coupling is why endergonic biosynthesis proceeds in the cell.' },
          { q: '(b) Estimate the equilibrium constant of the coupled reaction at 310 K.', a: 'K = e^(−ΔG°′/RT) = e^(16300/(8.314·310)) = e^(6.33) ≈ <b>560</b> — products strongly favoured.' },
          { q: '(c) Actual cellular [ATP]/[ADP] keeps the real ΔG well below ΔG°′. Which relation captures that, and which way does a high ATP/ADP ratio push it?', a: 'ΔG = ΔG°′ + RT ln Q. A high [ATP]/[ADP] makes Q for hydrolysis small (ln Q &lt; 0), so the <b>real ΔG is even more negative</b> than −30.5 kJ/mol — the cell maintains a large "phosphorylation potential" to keep coupled reactions driven far from equilibrium.' },
        ],
      },
    ],
  },
];
