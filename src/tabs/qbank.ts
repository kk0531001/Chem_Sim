// Question Bank tab: browse original exam-style practice by part and topic.
// Part I  = multiple choice (local/Part A style)
// Part II = multi-part free response with worked solutions
// Part III = laboratory practical scenarios
// CCO     = advanced CCO problem sets PS1–PS4 (multi-part, worked)
import { h, card, quiz, button, select, typesetMath, type TabDef } from './framework';
import { PART1 } from './bankPart1';
import { PART2, type FRQ } from './bankPart2';
import { PART3 } from './bankPart3';
import { CCO_SETS } from './bankCCO';
import { INTEGRATED_SETS } from './bankIntegrated';
import { OLYMPIAD_PAPERS, officialByYear } from './bankOlympiad';
import { isSolved, markSolved, unmarkSolved } from '../progress';

const TOPICS: { id: string; label: string }[] = [
  { id: 'all', label: 'All topics' },
  { id: 'stoich', label: 'Stoichiometry' },
  { id: 'states', label: 'States of Matter & Gases' },
  { id: 'thermo', label: 'Thermodynamics' },
  { id: 'kinetics', label: 'Kinetics' },
  { id: 'equilibrium', label: 'Equilibrium' },
  { id: 'acids', label: 'Acids & Bases' },
  { id: 'redox', label: 'Electrochemistry & Redox' },
  { id: 'atomic', label: 'Atomic Structure' },
  { id: 'bonding', label: 'Bonding & Structure' },
  { id: 'descriptive', label: 'Descriptive & Inorganic' },
  { id: 'organic', label: 'Organic Chemistry' },
  { id: 'lab', label: 'Laboratory' },
];
const topicLabel = (id: string) => TOPICS.find(t => t.id === id)?.label ?? id;

// Reusable multi-part free-response browser (Prev / Next + per-part solutions).
function frqBrowser(items: FRQ[], heading: string): HTMLElement {
  let idx = 0;
  const holder = h('div', {});
  const pos = h('span', { class: 'muted' });
  const nav = h('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:10px' },
    button('Previous', () => { idx = (idx - 1 + items.length) % items.length; show(); }),
    button('Next problem', () => { idx = (idx + 1) % items.length; show(); }, 'primary'),
    pos,
  );
  function show(): void {
    const f = items[idx];
    const id = f.id;   // explicit, not qid(title + '|' + prompt) — see QuizQ
    pos.textContent = `Problem ${idx + 1} of ${items.length} · ${topicLabel(f.topic)}`;
    const solveBtn = button('', () => { isSolved(id) ? unmarkSolved(id) : markSolved(id); syncSolveBtn(); });
    function syncSolveBtn(): void {
      const done = isSolved(id);
      solveBtn.textContent = done ? '✓ Solved — click to unmark' : 'Mark as solved';
      solveBtn.className = done ? 'btn primary' : 'btn';
    }
    syncSolveBtn();
    holder.replaceChildren(
      h('h3', {}, f.title),
      h('div', { class: 'result', html: f.prompt }),
      ...f.parts.map(p => {
        const sol = h('div', { class: 'result', html: p.a });
        sol.style.display = 'none';
        const btn = button('Show solution', () => {
          const hidden = sol.style.display === 'none';
          sol.style.display = hidden ? '' : 'none';
          btn.textContent = hidden ? 'Hide solution' : 'Show solution';
        });
        return h('div', { style: 'margin-top:14px' }, h('p', { html: `<b>${p.q}</b>` }), btn, sol);
      }),
      h('div', { style: 'margin-top:16px' }, solveBtn),
    );
    // Typeset immediately (prompt + pre-built, still-hidden solutions) rather
    // than waiting on the rAF-based observer, which can flash raw \( … \).
    typesetMath(holder);
  }
  show();
  return card(heading, nav, holder);
}

// Panel that LINKS OUT to the official past papers (copyright CIC — never
// reproduced here), grouped by year then competition/part.
function officialPapersPanel(): HTMLElement {
  const rows = officialByYear().map(({ year, papers }) =>
    h('div', { class: 'oly-year' },
      h('span', { class: 'oly-year-label' }, String(year)),
      h('div', { class: 'oly-links' },
        ...papers.map(p => h('a', {
          class: 'oly-link', href: p.url, target: '_blank', rel: 'noopener noreferrer',
        }, `${p.competition} ${p.part === 'Full' ? '(full)' : 'Part ' + p.part}`)),
      ),
    ));
  return card('Official past papers',
    h('p', { class: 'muted' }, 'Practice the real exams: these open the official PDFs on cheminst.ca in a new tab. They are the copyright of the Chemical Institute of Canada and are only linked here, not reproduced. Sorted by year, then competition (Olympiad before Contest) and part.'),
    ...rows,
  );
}

export const qbankTab: TabDef = {
  id: 'qbank',
  mount(root) {
    let part: '1' | '2' | '3' | 'cco' | 'integrated' | 'olympiad' = '1';
    let topic = 'all';
    let ccoSet = CCO_SETS[0].id;
    let intSet = INTEGRATED_SETS[0].id;
    let olyPaper = OLYMPIAD_PAPERS[0].id;
    let shuffle = false;

    const content = h('div', {});
    const countNote = h('span', { class: 'muted' });

    type Part = '1' | '2' | '3' | 'cco' | 'integrated' | 'olympiad';
    const partBtns = new Map<string, HTMLButtonElement>();
    const PARTS: [Part, string][] = [
      ['1', 'Part I — Multiple Choice'],
      ['2', 'Part II — Free Response'],
      ['3', 'Part III — Laboratory'],
      ['cco', 'CCO Problem Sets'],
      ['integrated', 'Integrated Challenges'],
      ['olympiad', 'Olympiad Questions'],
    ];
    const partBar = h('div', { class: 'pill-bar' },
      ...PARTS.map(([p, label]) => {
        const b = h('button', { class: 'pill', onclick: () => { part = p; syncPills(); render(); } }, label);
        partBtns.set(p, b);
        return b;
      }),
    );

    const topicSel = h('select', { autocomplete: 'off' });
    for (const t of TOPICS) topicSel.appendChild(h('option', { value: t.id }, t.label));
    topicSel.addEventListener('change', () => { topic = topicSel.value; render(); });
    const topicCtl = h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'topic'), topicSel);

    const shuffleBtn = button('Shuffle: off', () => {
      shuffle = !shuffle;
      shuffleBtn.textContent = `Shuffle: ${shuffle ? 'on' : 'off'}`;
      render();
    });

    // CCO problem-set picker (shown only for the CCO part)
    const ccoCtl = select('problem set', CCO_SETS.map(s => ({ value: s.id, label: `${s.month} · ${s.label}` })),
      v => { ccoSet = v; render(); }, ccoSet);
    ccoCtl.style.display = 'none';

    // Integrated-challenge theme picker (shown only for the Integrated part)
    const intCtl = select('theme', INTEGRATED_SETS.map(s => ({ value: s.id, label: s.label })),
      v => { intSet = v; render(); }, intSet);
    intCtl.style.display = 'none';

    // Olympiad mock-paper picker (shown only for the Olympiad part)
    const olyCtl = select('paper', OLYMPIAD_PAPERS.map(p => ({ value: p.id, label: p.label })),
      v => { olyPaper = v; render(); }, olyPaper);
    olyCtl.style.display = 'none';

    function syncPills(): void {
      partBtns.forEach((b, p) => b.classList.toggle('active', p === part));
      const isSet = part === 'cco' || part === 'integrated' || part === 'olympiad';
      topicCtl.style.display = isSet ? 'none' : '';
      shuffleBtn.style.display = isSet ? 'none' : '';
      ccoCtl.style.display = part === 'cco' ? '' : 'none';
      intCtl.style.display = part === 'integrated' ? '' : 'none';
      olyCtl.style.display = part === 'olympiad' ? '' : 'none';
    }

    function maybeShuffle<T>(arr: T[]): T[] {
      if (!shuffle) return arr;
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    }

    function render(): void {
      content.replaceChildren();
      if (part === 'cco') {
        const set = CCO_SETS.find(s => s.id === ccoSet)!;
        countNote.textContent = ` ${set.problems.length} problems`;
        content.append(
          h('p', { class: 'section-lede', style: 'margin-bottom:12px' }, `${set.month} — ${set.blurb}`),
          frqBrowser(set.problems, `${set.label} — work each part on paper first`),
        );
        return;
      }
      if (part === 'integrated') {
        const set = INTEGRATED_SETS.find(s => s.id === intSet)!;
        countNote.textContent = ` ${set.problems.length} problems`;
        content.append(
          h('p', { class: 'section-lede', style: 'margin-bottom:12px' }, `${set.label} — ${set.blurb}`),
          frqBrowser(set.problems, `${set.label} — reason through every part before revealing the solution`),
        );
        return;
      }
      if (part === 'olympiad') {
        const paper = OLYMPIAD_PAPERS.find(p => p.id === olyPaper)!;
        countNote.textContent = ` Part A: ${paper.partA.length} MC · Part B: ${paper.partB.length} written`;
        content.append(
          officialPapersPanel(),
          h('p', { class: 'section-lede', style: 'margin-top:20px;margin-bottom:12px' }, `${paper.label} — ${paper.blurb} All original, written to match the real contest format.`),
          card(`Part A — multiple choice (${paper.partA.length} questions)`, quiz(paper.partA)),
          frqBrowser(paper.partB, 'Part B — written problems (work each part before revealing)'),
        );
        return;
      }
      if (part === '2') {
        const items = maybeShuffle(PART2.filter(f => topic === 'all' || f.topic === topic));
        countNote.textContent = ` ${items.length} problems`;
        if (items.length === 0) { content.append(h('p', { class: 'muted' }, 'No free-response problems for this topic yet.')); return; }
        content.append(frqBrowser(items, 'Free-response problems — work each part on paper first'));
        return;
      }
      const source = part === '1' ? PART1 : PART3;
      const items = maybeShuffle(source.filter(q => topic === 'all' || q.topic === topic));
      countNote.textContent = ` ${items.length} questions`;
      if (items.length === 0) { content.append(h('p', { class: 'muted' }, 'No questions for this topic in this part.')); return; }
      const title = part === '1' ? 'Part I style — one best answer' : 'Part III style — laboratory scenarios';
      // BankMC is structurally a QuizQ now, so pass it straight through — the
      // old field-by-field re-map silently dropped `id` (and would drop any
      // field added later), which is exactly what the explicit ids exist to
      // prevent.
      content.append(card(title, quiz(items)));
    }

    root.append(
      h('div', { class: 'cards' },
        h('section', { class: 'card wide' },
          h('h2', {}, 'Exam-style question bank'),
          h('p', {}, 'Original practice written in the format and difficulty of the CCC / CCO / USNCO exam sections: Part I multiple choice, Part II free-response with worked solutions, Part III laboratory practicals, the advanced CCO problem sets (PS1–PS4), Integrated Challenges — multi-topic problems that demand experimental design, data interpretation, graph analysis, and open-response reasoning — and Olympiad Questions: five full-length mock papers (Part A + Part B) plus links to the official past papers. Nothing here is copied from real papers.'),
          partBar,
          h('div', { style: 'display:flex;gap:14px;align-items:center;flex-wrap:wrap' }, topicCtl, ccoCtl, intCtl, olyCtl, shuffleBtn, countNote),
        ),
      ),
      content,
    );
    syncPills();
    render();
  },
};
