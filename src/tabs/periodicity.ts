// Periodicity — interactive trends explorer, Slater's-rules Z_eff calculator,
// and the anomaly/amphoterism reference. (IChO area 4.)
import { h, card, cardWithMissions, missionLadder, theory, select, plot, quiz, type TabDef, task } from './framework';
import { topicPage } from './page';
import { PERIODICITY_QUIZ } from './questions5';

// Period-2 and period-3 data: IE1 (kJ/mol), atomic radius (pm), EA (kJ/mol, +ve released),
// Pauling electronegativity. Values are standard textbook figures.
interface Elem { sym: string; Z: number; ie1: number; radius: number; ea: number; en: number }
const PERIOD2: Elem[] = [
  { sym: 'Li', Z: 3, ie1: 520, radius: 152, ea: 60, en: 0.98 },
  { sym: 'Be', Z: 4, ie1: 899, radius: 112, ea: 0, en: 1.57 },
  { sym: 'B', Z: 5, ie1: 801, radius: 85, ea: 27, en: 2.04 },
  { sym: 'C', Z: 6, ie1: 1086, radius: 77, ea: 122, en: 2.55 },
  { sym: 'N', Z: 7, ie1: 1402, radius: 75, ea: 0, en: 3.04 },
  { sym: 'O', Z: 8, ie1: 1314, radius: 73, ea: 141, en: 3.44 },
  { sym: 'F', Z: 9, ie1: 1681, radius: 71, ea: 328, en: 3.98 },
  { sym: 'Ne', Z: 10, ie1: 2081, radius: 69, ea: 0, en: 0 },
];
const PERIOD3: Elem[] = [
  { sym: 'Na', Z: 11, ie1: 496, radius: 186, ea: 53, en: 0.93 },
  { sym: 'Mg', Z: 12, ie1: 738, radius: 160, ea: 0, en: 1.31 },
  { sym: 'Al', Z: 13, ie1: 578, radius: 143, ea: 42, en: 1.61 },
  { sym: 'Si', Z: 14, ie1: 786, radius: 118, ea: 134, en: 1.90 },
  { sym: 'P', Z: 15, ie1: 1012, radius: 110, ea: 72, en: 2.19 },
  { sym: 'S', Z: 16, ie1: 1000, radius: 103, ea: 200, en: 2.58 },
  { sym: 'Cl', Z: 17, ie1: 1251, radius: 99, ea: 349, en: 3.16 },
  { sym: 'Ar', Z: 18, ie1: 1521, radius: 97, ea: 0, en: 0 },
];

function makeTrends(): HTMLElement {
  let prop: 'ie1' | 'radius' | 'ea' | 'en' = 'ie1';
  const canvas = h('canvas', { width: 500, height: 280 });
  const out = h('div', { class: 'result' });
  const LABEL = { ie1: 'first ionization energy (kJ/mol)', radius: 'atomic radius (pm)', ea: 'electron affinity (kJ/mol)', en: 'electronegativity (Pauling)' };
  function draw(): void {
    // plot period 2 and period 3 as two series on a shared "position in period" axis
    const pos = [1, 2, 3, 4, 5, 6, 7, 8];
    plot(canvas, [
      { xs: pos, ys: PERIOD2.map(e => e[prop]), color: '#e8590c', label: 'period 2' },
      { xs: pos, ys: PERIOD3.map(e => e[prop]), color: '#7c8798', label: 'period 3' },
    ], { xLabel: 'position in period (group 1 → 18)', yLabel: LABEL[prop] });
    let note = '';
    if (prop === 'ie1') note = 'Note the two dips: <b>Be→B</b> (new higher-energy 2p) and <b>N→O</b> (pairing repulsion in 2p⁴). The same pattern repeats in period 3 (Mg→Al, P→S).';
    else if (prop === 'radius') note = 'Radius <b>decreases</b> across each period (rising Z_eff) and each period-3 element is larger than its period-2 congener (extra shell).';
    else if (prop === 'ea') note = 'Zero bars are the stable-shell cases (Be, N, Ne — noble gases and filled/half-filled shells barely accept electrons). <b>F\'s EA is smaller than Cl\'s</b> — small-atom electron repulsion.';
    else note = 'Electronegativity rises toward the top-right; the noble gases are left off the Pauling scale (shown as 0).';
    out.innerHTML = `Showing <b>${LABEL[prop]}</b>.<br>${note}`;
  }
  const el = card('Periodic trends explorer',
    task('Switch between the four properties and find where each one breaks its trend across a period.'),
    select('property', [
      { value: 'ie1', label: 'first ionization energy' },
      { value: 'radius', label: 'atomic radius' },
      { value: 'ea', label: 'electron affinity' },
      { value: 'en', label: 'electronegativity' },
    ], v => { prop = v as typeof prop; draw(); }, 'ie1'),
    canvas, out,
    h('p', { class: 'muted' }, 'Both curves are plotted against position in the period so period 2 and period 3 line up group-for-group.'),
  );
  draw();
  return el;
}

// ---- Slater's rules Z_eff ----
function makeSlater(): HTMLElement {
  const ELEMS = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
  let Z = 16; // sulfur
  const out = h('div', { class: 'result' });
  // build config as [ (n, l-group, count) ] using Slater grouping: (1s)(2s2p)(3s3p)(3d)(4s4p)...
  function slater(z: number): { zeff: number; s: number; group: string } {
    // Fill order for grouping — 4s BEFORE 3d (Madelung's (n+l) rule: 4s has
    // n+l=4, 3d has n+l=5), matching quantum.ts's electronConfig(). Getting
    // this order backwards was a real bug: for K (Z=19) and Ca (Z=20), it
    // reported the outermost electron as "3d" with the wrong Zeff, when both
    // are actually 4s¹/4s² with zero 3d electrons.
    const caps: [string, number][] = [['1s', 2], ['2s2p', 8], ['3s3p', 8], ['4s4p', 8], ['3d', 10]];
    let e = z; const filled: [string, number][] = [];
    for (const [g, cap] of caps) { if (e <= 0) break; const n = Math.min(cap, e); filled.push([g, n]); e -= n; }
    const lastIdx = filled.length - 1;
    const [lastG, lastN] = filled[lastIdx];
    // shielding of an electron in the last group
    let s = 0;
    // same group: 0.35 each (0.30 for 1s), minus the electron itself
    const same = lastG === '1s' ? 0.30 : 0.35;
    s += (lastN - 1) * same;
    // for s/p valence: n-1 shell shields 0.85, deeper 1.00
    if (lastG.startsWith('4')) {
      // n-1 = 3 shell (3s3p + 3d), deeper = 1s2s2p
      for (let i = 0; i < lastIdx; i++) {
        const [g, n] = filled[i];
        if (g.startsWith('3')) s += n * 0.85; else s += n * 1.00;
      }
    } else if (lastG.startsWith('3s')) {
      for (let i = 0; i < lastIdx; i++) {
        const [g, n] = filled[i];
        if (g.startsWith('2')) s += n * 0.85; else s += n * 1.00;
      }
    } else if (lastG.startsWith('2')) {
      for (let i = 0; i < lastIdx; i++) { const [, n] = filled[i]; s += n * 1.00; }
    } else if (lastG === '3d') {
      // d electron: everything inside shields 1.00, same-group 0.35
      for (let i = 0; i < lastIdx; i++) { const [, n] = filled[i]; s += n * 1.00; }
    }
    return { zeff: z - s, s, group: lastG };
  }
  const missions = missionLadder([
    {
      id: 'msn-per-01',
      prompt: 'Check the Z<sub>eff</sub> of <b>Na</b>\'s valence electron, then switch to <b>K</b> — same group, 8 more protons. Is K\'s Z<sub>eff</sub> much bigger, much smaller, or about the same as Na\'s?',
      hints: [
        'Read both numbers off the calculator before answering — this one punishes guessing from the proton count.',
        'Z_eff = Z − S. Going Na → K adds 8 protons, but how much shielding do the 8 extra core electrons contribute?',
      ],
      meter: () => ({ label: `${ELEMS[Z - 1]}: Zeff = ${slater(Z).zeff.toFixed(2)} — check both Na and K before answering`, pct: 0 }),
      choices: [
        { label: 'Much bigger (8 more protons)', value: 'bigger' },
        { label: 'Much smaller', value: 'smaller' },
        { label: 'About the same', value: 'same' },
      ],
      validateChoice: v => v === 'same',
      explain: 'Almost exactly the same: Z<sub>eff</sub>(Na, 3s) = 2.20 and Z<sub>eff</sub>(K, 4s) = 2.20. Each extra proton picked up going down a group is nearly cancelled by an extra full shell of core electrons shielding it (each core electron blocks 0.85–1.00 of a proton\'s charge). <span class="trap">Z<sub>eff</sub> on the valence electron stays roughly constant down a group</span> — it is the growing n (a bigger, higher-energy orbital, farther from the nucleus) that lowers ionization energy and raises atomic radius down a group, not a weakening nuclear pull.',
    },
  ]);
  function calc(): void {
    const { zeff, s, group } = slater(Z);
    out.innerHTML =
      `<b>${ELEMS[Z - 1]}</b> (Z = ${Z}) · outermost group ${group}<br>` +
      `screening constant S = <b>${s.toFixed(2)}</b> → Z_eff = Z − S = <b class="big">${zeff.toFixed(2)}</b><br>` +
      `<span class="muted">Slater: same-group electrons shield 0.35 (0.30 for 1s); the (n−1) shell 0.85; deeper shells 1.00. Rising Z_eff across a period is what drives radius↓, IE↑, EN↑.</span>`;
    missions.tick();
  }
  const el = cardWithMissions("Slater's rules — effective nuclear charge", missions,
    task('Step across a period and then down a group, and compare how Z_eff changes in each direction.'),
    select('element', ELEMS.map((s, i) => ({ value: String(i + 1), label: `${s} (Z=${i + 1})` })), v => { Z = Number(v); calc(); }, String(Z)),
    out,
  );
  calc();
  return el;
}

function makeAnomalies(): HTMLElement {
  return h('div', { class: 'cards' },
    card('Anomalies, diagonals & amphoterism',
      task('Learn each anomaly with its reason attached — the exam asks why, not which.'),
      h('h3', {}, 'Trend-breaking anomalies (know the WHY)'),
      h('ul', {},
        h('li', { html: '<b>IE dip Be→B:</b> B\'s electron leaves a higher-energy 2p, shielded by the 2s².' }),
        h('li', { html: '<b>IE dip N→O:</b> O pairs a 2p electron (2p⁴); pairing repulsion aids removal. N\'s half-filled 2p³ is extra stable.' }),
        h('li', { html: '<b>EA F < Cl:</b> adding an electron to F\'s tiny 2p shell crowds it (repulsion), releasing less energy than for Cl.' }),
        h('li', { html: '<b>2nd IE jump:</b> huge once you break into a noble-gas core — the jump position gives the group number.' }),
      ),
      h('h3', {}, 'Diagonal relationships'),
      h('p', { html: 'Li~Mg, Be~Al, B~Si — similar charge/radius ratio → similar chemistry (Li and Mg both form nitrides; Be and Al both amphoteric).' }),
      h('h3', {}, 'Amphoterism & oxide acidity'),
      h('p', { html: 'Amphoteric oxides/hydroxides: <b>Al, Zn, Be, Sn, Pb</b> — dissolve in both acid and base. Across a period, oxides go basic (Na₂O) → amphoteric (Al₂O₃) → acidic (SO₃, Cl₂O₇).' }),
    ),
  );
}

export const periodicityTab: TabDef = {
  id: 'periodicity',
  mount(root) {
    root.append(topicPage('periodicity', {
      sims: [makeTrends(), makeSlater(), makeAnomalies()],
      quiz: quiz(PERIODICITY_QUIZ, 10),
      theory: [
        theory('Basics — Periodicity', `
<h3>What this is about</h3>
<p>The periodic table is arranged so that atoms behaving alike line up in the same column. This block covers the four properties that change in a regular way across a row and down a column, and the reason each one moves.</p>
<h3>Rows, columns and two competing pulls</h3>
<p>A row of the table is a period and a column is a group. Moving one step to the right adds one proton to the nucleus and one electron to the same outer shell. Moving one step down starts a whole new shell, further from the nucleus.</p>
<p>Two things decide how tightly an outer electron is held. The nucleus pulls it inward, and the inner electrons push it out and get in the way of that pull. Screening is the name for that blocking effect. What survives it is the effective nuclear charge, Z_eff, the pull an outer electron actually feels once the inner electrons have screened part of the nucleus.</p>
<h3>Atomic radius</h3>
<p>Atomic radius measures how far the outermost electrons sit from the nucleus. Across period 3 it falls from 186 picometres (pm) at sodium to 99 pm at chlorine. Each added proton is barely screened by an electron entering the same shell, so Z_eff rises and the shell is drawn inward. Down group 1 the radius rises, from 152 pm at lithium to 186 pm at sodium, because sodium's outer electron sits in a new and larger shell.</p>
<h3>Ionisation energy</h3>
<p>The first ionisation energy is the energy needed to pull the outermost electron off one atom in the gas phase. Lithium needs 520 kJ/mol and sodium only 496 kJ/mol, so less energy is required further down the group. That electron is in a bigger shell with more inner electrons in the way, so it is held loosely. Across a period the ionisation energy climbs instead, because the same shell is being gripped by a stronger effective pull.</p>
<h3>Electron affinity and electronegativity</h3>
<p>Electron affinity is the energy released when a gaseous atom gains an electron. Chlorine releases 349 kJ/mol and fluorine only 328 kJ/mol, so this one does not simply improve up the group. Electronegativity is a different quantity: it is how strongly an atom pulls on the electrons of a bond it already shares. On the Pauling scale it rises going up and to the right, and fluorine tops the scale at 3.98.</p>
<h3>An ion is a different size from its atom</h3>
<p>An ion is an atom that has gained or lost electrons and so carries a charge, written as a superscript: Na⁺ has lost one electron and Cl⁻ has gained one. A positive ion is a cation and a negative ion is an anion. Losing an electron makes a particle smaller and gaining one makes it larger. Sodium gives up its entire outer shell to become Na⁺, so Na⁺ is far smaller than Na. Line up Na, Na⁺, Mg²⁺ and Al³⁺ and the neutral sodium atom is the largest by a wide margin, because the other three have each shed a whole shell.</p>
<h3>Metals and non-metals</h3>
<p>Metallic character means how readily an atom gives up electrons. It follows straight from ionisation energy, since electrons that are held loosely leave easily. That happens going down a group and to the left, so the strongest metals sit at the bottom left and the non-metals at the top right.</p>
<p>The first card plots all four properties for period 2 against period 3. Every place a line bends the wrong way has a reason behind it, and the later sections of this module give those reasons.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>State what happens to radius, ionisation energy and electronegativity across a period and down a group.</li>
<li>Explain each of those directions using effective nuclear charge and screening.</li>
<li>Rank an atom against its own ion by size, and point to the most metallic and most electronegative corners of the table.</li>
</ul>`, true),
        theory('Core — Periodicity', `
<h3>What this block adds</h3>
<p>Basics gave the four trends and the direction each one runs. Core puts numbers on them, estimates the effective nuclear charge by counting, and turns the trends into a way of comparing any two atoms.</p>
<h3>Counting the effective nuclear charge</h3>
<p>An outer electron feels the nuclear charge minus whatever the other electrons screen. A rough count treats each inner-shell electron as blocking one unit of charge, and electrons in the same shell as blocking almost none.</p>
<p>Sodium has 11 protons and 10 inner electrons, so its outer electron feels about 11 − 10 = 1. Chlorine has 17 protons and the same 10 inner electrons, so its outer electrons feel about 17 − 10 = 7. Seven times the pull, across a single row, is what every trend below is made of. Written in general, with Z the number of protons and S the screening from the other electrons:</p>
<p><span class="eq">Z_eff ≈ Z − S</span></p>
<h3>Atomic radius and ionic radius</h3>
<p>Across period 3 the radius falls from 186 pm at sodium to 99 pm at chlorine. Z_eff climbs by about one unit per step while the outer shell stays at n = 3, so the shell is drawn in tighter. Down group 1 the radius rises: 152 pm at lithium, 186 pm at sodium, 227 pm at potassium. Each step down adds a whole shell.</p>
<p>An ion is a different size from its parent atom. Na⁺ is 102 pm against sodium's 186 pm, because losing the single 3s electron removes the third shell entirely. Cl⁻ is 181 pm against chlorine's 99 pm, because the extra electron adds repulsion to a shell whose nuclear pull has not changed.</p>
<p>Ions with the same number of electrons are called isoelectronic, and among them only the proton count matters. O²⁻ (140 pm), F⁻ (133 pm), Na⁺ (102 pm) and Mg²⁺ (72 pm) all hold 10 electrons. The size shrinks as the protons rise from 8 to 12.</p>
<h3>First ionisation energy</h3>
<p>Across period 3 the first ionisation energy climbs from 496 kJ/mol at sodium to 1251 kJ/mol at chlorine and 1521 kJ/mol at argon. A smaller atom with a higher Z_eff holds its outer electron more tightly.</p>
<p>The climb is not perfectly smooth, and the two breaks have plain reasons. Aluminium needs 578 kJ/mol against magnesium's 738, because aluminium's electron leaves a 3p orbital that starts out higher than magnesium's 3s. Sulfur needs 1000 kJ/mol against phosphorus's 1012. Sulfur is the first in the row to put two electrons in one 3p orbital, and those two repel.</p>
<h3>Electronegativity and electron affinity</h3>
<p>Electronegativity is how hard an atom pulls on the electrons of a bond it is already in. It follows Z_eff and size together, so it climbs across a period and falls down a group. On the Pauling scale period 3 runs 0.93 at sodium, 1.90 at silicon and 3.16 at chlorine. Fluorine is highest at 3.98 and caesium lowest at 0.79.</p>
<p>Electron affinity is the energy released when a free atom in the gas phase gains an electron. It grows across a period, but it does not simply grow up a group. Chlorine releases 349 kJ/mol and fluorine only 328 kJ/mol. Fluorine's 2p shell is small, so an arriving electron is crowded by the ones already there.</p>
<h3>Metallic character</h3>
<p>Metallic character is how readily an atom gives electrons up, so it runs opposite to ionisation energy. It grows down a group and to the left. The most metallic elements are at the bottom left and the non-metals at the top right.</p>
<h3>Comparing two atoms</h3>
<p>Two questions settle almost every comparison. Do the two atoms have the same number of shells, and if so, which has more protons?</p>
<p>Compare magnesium and calcium for size. Calcium is one period lower, so it has an extra shell and is bigger, 197 pm against 160 pm. Compare phosphorus and oxygen for electronegativity. Oxygen has fewer shells, so it grips bonding electrons harder, 3.44 against 2.19.</p>
<p>On a diagonal the shell count and the proton count push opposite ways, so a value is needed. Nitrogen is 3.04 and chlorine is 3.16, so chlorine is the more electronegative despite lying a period lower.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Estimate Z_eff by subtracting the inner electrons, and use it to explain a trend rather than state it.</li>
<li>Give the direction and rough size of the change in radius, ionisation energy and electronegativity across period 3.</li>
<li>Rank an atom against its own ion, and order an isoelectronic set by size.</li>
<li>Say why chlorine's electron affinity beats fluorine's, and why aluminium's ionisation energy dips below magnesium's.</li>
<li>Decide which of two named atoms is larger or more electronegative, and say which comparison needs a table.</li>
</ul>`, true),
        theory('Exam-level reference — Periodicity', `
<h3>The trends and their driver</h3>
<span class="eq">Z_eff = Z − S (Slater) — the single quantity behind every periodic trend</span>
<ul>
<li>Across a period: Z_eff ↑ (same shell, poor mutual shielding) → radius ↓, IE ↑, EA more −ve, EN ↑.</li>
<li>Down a group: new shells dominate → radius ↑, IE ↓, EN ↓; reactivity of metals ↑, of non-metals ↓.</li>
<li>Isoelectronic series: more protons → smaller (O²⁻ &gt; F⁻ &gt; Na⁺ &gt; Mg²⁺).</li>
</ul>
<h3>Anomalies to explain, not memorize</h3>
<ul>
<li>IE dips Be→B (new 2p subshell) and N→O (2p⁴ pairing repulsion); repeat in period 3.</li>
<li>EA F &lt; Cl (small-atom electron–electron repulsion); noble gases and half/filled shells resist adding electrons.</li>
<li>Successive-IE jumps reveal valence-electron count (group).</li>
</ul>
<h3>Descriptive consequences</h3>
<ul>
<li>Metallic ↔ non-metallic character; amphoterism (Al, Zn, Be, Sn, Pb); oxide acid–base trend across a period.</li>
<li>Diagonal relationships (Li–Mg, Be–Al, B–Si); inert-pair effect for heavy p-block; lanthanide contraction (Zr ≈ Hf).</li>
<li>Electronegativity scales: Pauling (bond energies), Mulliken (½(IE+EA)), Allred–Rochow (Z_eff/r²).</li>
</ul>`),
      ],
    }));
  },
};
