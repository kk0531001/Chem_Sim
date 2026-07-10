// Question Bank tab: browse original exam-style practice by part and topic.
// Part I  = multiple choice (local/Part A style)
// Part II = multi-part free response with worked solutions
// Part III = laboratory practical scenarios
import { h, card, quiz, button, type TabDef } from './framework';
import { PART1 } from './bankPart1';
import { PART2 } from './bankPart2';
import { PART3 } from './bankPart3';

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

export const qbankTab: TabDef = {
  id: 'qbank',
  label: 'Question Bank',
  group: 'Practice',
  mount(root) {
    let part: '1' | '2' | '3' = '1';
    let topic = 'all';
    let shuffle = false;

    const content = h('div', {});
    const countNote = h('span', { class: 'muted' });

    const partBtns = new Map<string, HTMLButtonElement>();
    const partBar = h('div', { class: 'pill-bar' },
      ...(['1', '2', '3'] as const).map(p => {
        const label = p === '1' ? 'Part I — Multiple Choice' : p === '2' ? 'Part II — Free Response' : 'Part III — Laboratory';
        const b = h('button', { class: 'pill', onclick: () => { part = p; syncPills(); render(); } }, label);
        partBtns.set(p, b);
        return b;
      }),
    );

    const topicSel = h('select', { autocomplete: 'off' });
    for (const t of TOPICS) topicSel.appendChild(h('option', { value: t.id }, t.label));
    topicSel.addEventListener('change', () => { topic = topicSel.value; render(); });

    const shuffleBtn = button('Shuffle: off', () => {
      shuffle = !shuffle;
      shuffleBtn.textContent = `Shuffle: ${shuffle ? 'on' : 'off'}`;
      render();
    });

    function syncPills(): void {
      partBtns.forEach((b, p) => b.classList.toggle('active', p === part));
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
      if (part === '2') {
        const items = maybeShuffle(PART2.filter(f => topic === 'all' || f.topic === topic));
        countNote.textContent = ` ${items.length} problems`;
        if (items.length === 0) {
          content.append(h('p', { class: 'muted' }, 'No free-response problems for this topic yet.'));
          return;
        }
        let idx = 0;
        const holder = h('div', {});
        const nav = h('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:10px' });
        const pos = h('span', { class: 'muted' });
        nav.append(
          button('Previous', () => { idx = (idx - 1 + items.length) % items.length; show(); }),
          button('Next problem', () => { idx = (idx + 1) % items.length; show(); }, 'primary'),
          pos,
        );
        function show(): void {
          const f = items[idx];
          pos.textContent = `Problem ${idx + 1} of ${items.length} · ${TOPICS.find(t => t.id === f.topic)?.label ?? f.topic}`;
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
              return h('div', { style: 'margin-top:14px' },
                h('p', { html: `<b>${p.q}</b>` }), btn, sol);
            }),
          );
        }
        show();
        content.append(card('Free-response problems — work each part on paper first', nav, holder));
        return;
      }
      const source = part === '1' ? PART1 : PART3;
      const items = maybeShuffle(source.filter(q => topic === 'all' || q.topic === topic));
      countNote.textContent = ` ${items.length} questions`;
      if (items.length === 0) {
        content.append(h('p', { class: 'muted' }, 'No questions for this topic in this part.'));
        return;
      }
      const title = part === '1'
        ? 'Part I style — one best answer'
        : 'Part III style — laboratory scenarios';
      content.append(card(title, quiz(items.map(({ q, opts, a, why }) => ({ q, opts, a, why })))));
    }

    root.append(
      h('div', { class: 'cards' },
        h('section', { class: 'card wide' },
          h('h2', {}, 'Exam-style question bank'),
          h('p', {}, 'Original practice questions written in the format and difficulty of the CCC / CCO / USNCO exam sections: Part I multiple choice, Part II free-response problems with worked solutions, and Part III laboratory practicals. Filter by exam part and topic.'),
          partBar,
          h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'topic'), topicSel, shuffleBtn, countNote),
        ),
      ),
      content,
    );
    syncPills();
    render();
  },
};
