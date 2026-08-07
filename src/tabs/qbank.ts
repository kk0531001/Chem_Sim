// Question Bank tab: browse original exam-style practice by part and topic.
// Part I  = multiple choice (local/Part A style)
// Part II = multi-part free response with worked solutions
// Part III = laboratory practical scenarios
// CCO     = advanced CCO problem sets PS1–PS4 (multi-part, worked)
import { h, card, quiz, button, select, typesetMath, type TabDef, type QuizQ } from './framework';
import { PART1 } from './bankPart1';
import { PART2, type FRQ } from './bankPart2';
import { PART3 } from './bankPart3';
import { CCO_SETS } from './bankCCO';
import { INTEGRATED_SETS } from './bankIntegrated';
import { OLYMPIAD_PAPERS, officialByYear } from './bankOlympiad';
import { isSolved, markSolved, unmarkSolved, wrongQuestionIds } from '../progress';
import { tierOf, compsOf, query, type Indexable } from '../content/registry';
import {
  COMPS, COMP_LABEL, DOMAINS, EXAM_TOPIC_IDS, EXAM_TOPIC_LABEL, TIER_LABEL,
  type Comp, type ExamTopicId, type Tier,
} from '../content/topicIds';

// The topic list is EXAM_TOPIC_LABEL, not a copy of it. This file used to carry
// its own hard-coded array of the same twelve topics with three of the labels
// worded differently, which is exactly the drift the two-vocabulary rule in
// content/topicIds.ts exists to prevent.
const TOPICS: { id: string; label: string }[] = [
  { id: 'all', label: 'All topics' },
  ...EXAM_TOPIC_IDS.map(id => ({ id, label: EXAM_TOPIC_LABEL[id] })),
];
const topicLabel = (id: string) => (id in EXAM_TOPIC_LABEL ? EXAM_TOPIC_LABEL[id as ExamTopicId] : id);

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

// ---- filters (ROADMAP D.8) -------------------------------------------------
//
// Six of the seven filters the roadmap lists are answerable from state that
// already exists: competition and difficulty are derived by the registry
// (compsOf/tierOf), topic is indexed, and `completed` / `incorrect` read the
// Phase-A progress store directly. Only **bookmarked** needs a store nothing
// writes yet, so it is behind the capability check below rather than faked.
type Status = 'any' | 'done' | 'wrong' | 'todo';
const STATUS_LABEL: Record<Status, string> = {
  any: 'Any status',
  done: 'Completed',
  wrong: 'Answered incorrectly',
  todo: 'Not yet attempted',
};

/** Phase E adds the bookmark store; until then the filter would be a lie. */
const BOOKMARKS_AVAILABLE = false;

export const qbankTab: TabDef = {
  id: 'qbank',
  mount(root) {
    let part: '1' | '2' | '3' | 'cco' | 'integrated' | 'olympiad' | 'browse' | 'results' = '1';
    let topic = 'all';
    let comp: Comp | 'any' = 'any';
    let tier: Tier | 'any' = 'any';
    let status: Status = 'any';
    let ccoSet = CCO_SETS[0].id;
    let intSet = INTEGRATED_SETS[0].id;
    let olyPaper = OLYMPIAD_PAPERS[0].id;
    let shuffle = false;

    const content = h('div', {});
    const countNote = h('span', { class: 'muted' });

    type Part = '1' | '2' | '3' | 'cco' | 'integrated' | 'olympiad' | 'browse' | 'results';
    const partBtns = new Map<string, HTMLButtonElement>();
    const PARTS: [Part, string][] = [
      ['browse', 'Browse by topic'],
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

    const compCtl = select('competition',
      [{ value: 'any', label: 'Any competition' }, ...COMPS.map(c => ({ value: c, label: COMP_LABEL[c] }))],
      v => { comp = v as Comp | 'any'; render(); }, 'any');

    const tierCtl = select('difficulty',
      [{ value: 'any', label: 'Any difficulty' }, ...([1, 2, 3, 4] as Tier[]).map(t => ({ value: String(t), label: TIER_LABEL[t] }))],
      v => { tier = v === 'any' ? 'any' : (Number(v) as Tier); render(); }, 'any');

    const statusCtl = select('progress',
      [
        ...(Object.keys(STATUS_LABEL) as Status[]).map(s => ({ value: s, label: STATUS_LABEL[s] })),
        ...(BOOKMARKS_AVAILABLE ? [{ value: 'saved', label: 'Bookmarked' }] : []),
      ],
      v => { status = v as Status; render(); }, 'any');

    function clearFilters(): void {
      topic = 'all'; comp = 'any'; tier = 'any'; status = 'any';
      topicSel.value = 'all';
      (compCtl.querySelector('select') as HTMLSelectElement).value = 'any';
      (tierCtl.querySelector('select') as HTMLSelectElement).value = 'any';
      (statusCtl.querySelector('select') as HTMLSelectElement).value = 'any';
      render();
    }
    const clearBtn = button('Clear filters', clearFilters);

    const shuffleBtn = button('Shuffle: off', () => {
      shuffle = !shuffle;
      shuffleBtn.textContent = `Shuffle: ${shuffle ? 'on' : 'off'}`;
      render();
    });

    const filterRow = h('div', { class: 'qbank-filters' },
      h('span', { class: 'qbank-filter-label' }, 'Filter'),
      compCtl, tierCtl, statusCtl, clearBtn,
    );

    // ---- the filter itself ----
    //
    // `wrong` is read once per render rather than per question: it is an array
    // scan, and a 110-question list would otherwise walk it 110 times.
    function passes(q: Indexable, wrong: Set<string>): boolean {
      if (comp !== 'any' && !compsOf(q).includes(comp)) return false;
      if (tier !== 'any' && tierOf(q) !== tier) return false;
      if (status === 'done' && !isSolved(q.id)) return false;
      if (status === 'wrong' && !wrong.has(q.id)) return false;
      // "Not yet attempted" is an approximation and the label says so: a
      // question is counted as unattempted when it is neither solved nor
      // outstanding-wrong. The attempt log is deliberately capped
      // (progress.ts MAX_ATTEMPTS), so a question answered wrong long enough
      // ago can rotate out of the log and reappear here. Better an honest
      // approximation than an unbounded log to make it exact.
      if (status === 'todo' && (isSolved(q.id) || wrong.has(q.id))) return false;
      return true;
    }
    const applyFilters = <T extends Indexable>(items: T[]): T[] => {
      if (comp === 'any' && tier === 'any' && status === 'any') return items;
      const wrong = new Set(wrongQuestionIds());
      return items.filter(q => passes(q, wrong));
    };

    // ---- filter state in the URL (shareable views) ----
    const FILTER_KEYS = ['part', 'topic', 'comp', 'tier', 'status'] as const;
    function readUrl(): void {
      const p = new URLSearchParams(location.search);
      // Validated against every Part, not just the ones with a pill: `results`
      // is reachable only by drilling down from browse, but it is the view a
      // shared filter link names, and checking PARTS alone silently dropped it
      // back to Part I.
      const PART_IDS: readonly Part[] = [...PARTS.map(([id]) => id), 'results'];
      const pt = p.get('part');
      if (pt && (PART_IDS as readonly string[]).includes(pt)) part = pt as Part;
      const tp = p.get('topic');
      if (tp && TOPICS.some(t => t.id === tp)) topic = tp;
      const c = p.get('comp');
      if (c && (COMPS as readonly string[]).includes(c)) comp = c as Comp;
      const ti = Number(p.get('tier'));
      if (ti >= 1 && ti <= 4) tier = ti as Tier;
      const st = p.get('status');
      if (st && st in STATUS_LABEL) status = st as Status;
    }
    function writeUrl(): void {
      const p = new URLSearchParams(location.search);
      const vals: Record<(typeof FILTER_KEYS)[number], string> = {
        part, topic, comp: String(comp), tier: String(tier), status,
      };
      // Defaults are omitted rather than written as "any" — a shared link
      // should carry the filters someone chose, not the ones they didn't.
      for (const k of FILTER_KEYS) {
        const v = vals[k];
        if (!v || v === 'any' || (k === 'topic' && v === 'all') || (k === 'part' && v === '1')) p.delete(k);
        else p.set(k, v);
      }
      const qs = p.toString();
      history.replaceState({}, '', location.pathname + (qs ? '?' + qs : ''));
    }

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
      // The fixed problem sets are a curated running order, so filtering them
      // by topic or difficulty would mean showing "problem 3 of 7" with four
      // missing. Browse is its own filter, so it hides the row too.
      const isSet = part === 'cco' || part === 'integrated' || part === 'olympiad' || part === 'browse';
      topicCtl.style.display = isSet ? 'none' : '';
      filterRow.style.display = isSet ? 'none' : '';
      shuffleBtn.style.display = isSet ? 'none' : '';
      ccoCtl.style.display = part === 'cco' ? '' : 'none';
      intCtl.style.display = part === 'integrated' ? '' : 'none';
      olyCtl.style.display = part === 'olympiad' ? '' : 'none';
    }

    // An empty list after filtering is not the same thing as an empty topic,
    // and saying "no questions for this topic" when the student has simply
    // filtered to Platinum + Completed reads as missing content.
    function emptyNote(kind: string): HTMLElement {
      const filtered = comp !== 'any' || tier !== 'any' || status !== 'any';
      // A FRESH button, not the one in the filter row: appending an existing
      // node moves it, so reusing `clearBtn` here would tear "Clear filters"
      // out of the filter bar and leave it stranded in the empty-state message.
      return h('p', { class: 'muted' },
        filtered
          ? `No ${kind} match these filters. `
          : `No ${kind} for this topic in this part yet.`,
        filtered ? button('Clear filters', clearFilters) : '');
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

    /**
     * The result of a browse drill-down: every question in the corpus matching
     * the current topic/competition/difficulty/progress filters, whichever bank
     * it lives in.
     *
     * This view exists because the first version drilled down into Part I, and
     * the counts lied. Browse counts the WHOLE corpus (`query()`), but Part I is
     * one 110-question bank — so "Stoichiometry · Gold 7" opened a page reading
     * "0 questions", because those seven Gold items were in the module quizzes
     * and Part II. Either the browse had to shrink to one bank, or the
     * destination had to widen to the corpus. The corpus is what the student was
     * promised.
     */
    function resultsView(): HTMLElement[] {
      const items = applyFilters(query({ topic: topic === 'all' ? undefined : (topic as ExamTopicId) }));
      const frqs = items.filter((q): q is FRQ => 'parts' in q);
      const mcs = items.filter((q): q is QuizQ => !('parts' in q));
      countNote.textContent = ` ${items.length} question${items.length === 1 ? '' : 's'} across every bank`;
      if (items.length === 0) return [emptyNote('questions')];
      const out: HTMLElement[] = [];
      if (mcs.length) out.push(card(`Multiple choice (${mcs.length})`, quiz(maybeShuffle(mcs))));
      if (frqs.length) out.push(frqBrowser(maybeShuffle(frqs), `Written problems (${frqs.length})`));
      return out;
    }

    /**
     * Two-level browse: domain → topic → tier (D.8).
     *
     * Every count comes from `query()`, so this is a view over indexes that
     * already exist rather than a second copy of the corpus. Clicking sets the
     * filters and opens the results view, which is why the drill-down needs no
     * state of its own.
     */
    function browseView(): HTMLElement {
      const wrap = h('div', { class: 'cards' });
      for (const domain of DOMAINS) {
        const rows = h('div', { class: 'browse-domain' });
        for (const t of domain.topics) {
          const all = query({ topic: t });
          if (all.length === 0) continue;
          const tiers = ([1, 2, 3, 4] as Tier[]).map(tr => ({ tr, n: all.filter(q => tierOf(q) === tr).length }));
          const done = all.filter(q => isSolved(q.id)).length;
          rows.append(h('div', { class: 'browse-row' },
            h('button', {
              type: 'button', class: 'browse-topic',
              onclick: () => { topic = t; tier = 'any'; part = 'results'; topicSel.value = t; syncPills(); render(); },
            }, EXAM_TOPIC_LABEL[t]),
            h('span', { class: 'browse-count' }, `${done}/${all.length} solved`),
            h('div', { class: 'browse-tiers' },
              ...tiers.filter(x => x.n > 0).map(x => h('button', {
                type: 'button', class: `browse-tier tier-${TIER_LABEL[x.tr].toLowerCase()}`,
                'aria-label': `${EXAM_TOPIC_LABEL[t]}, ${TIER_LABEL[x.tr]}: ${x.n} questions`,
                onclick: () => {
                  topic = t; tier = x.tr; part = 'results';
                  topicSel.value = t;
                  (tierCtl.querySelector('select') as HTMLSelectElement).value = String(x.tr);
                  syncPills(); render();
                },
              }, `${TIER_LABEL[x.tr]} ${x.n}`)),
            ),
          ));
        }
        wrap.append(card(domain.name, rows));
      }
      return wrap;
    }

    function render(): void {
      writeUrl();
      content.replaceChildren();
      if (part === 'browse') {
        countNote.textContent = ` ${query({}).length} questions in the corpus`;
        content.append(
          h('p', { class: 'section-lede', style: 'margin-bottom:12px' },
            'Every question in the app by domain, topic and difficulty tier — module quizzes and exam banks together. Pick a topic or a tier to open everything that matches, whichever bank it lives in.'),
          browseView(),
        );
        return;
      }
      if (part === 'results') {
        content.append(
          h('div', { class: 'results-head' },
            button('← Back to browse', () => { part = 'browse'; syncPills(); render(); }),
            h('span', { class: 'muted' },
              `${topicLabel(topic)}${tier === 'any' ? '' : ' · ' + TIER_LABEL[tier]}${comp === 'any' ? '' : ' · ' + COMP_LABEL[comp]}${status === 'any' ? '' : ' · ' + STATUS_LABEL[status]}`),
          ),
          ...resultsView(),
        );
        return;
      }
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
        const items = maybeShuffle(applyFilters(PART2.filter(f => topic === 'all' || f.topic === topic)));
        countNote.textContent = ` ${items.length} problems`;
        if (items.length === 0) { content.append(emptyNote('free-response problems')); return; }
        content.append(frqBrowser(items, 'Free-response problems — work each part on paper first'));
        return;
      }
      const source = (part === '1' ? PART1 : PART3) as unknown as QuizQ[];
      const items = maybeShuffle(applyFilters(source.filter(q => topic === 'all' || q.topic === topic)));
      countNote.textContent = ` ${items.length} questions`;
      if (items.length === 0) { content.append(emptyNote('questions')); return; }
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
          filterRow,
        ),
      ),
      content,
    );
    // URL first, so a shared link opens on the view it names.
    readUrl();
    topicSel.value = topic;
    (compCtl.querySelector('select') as HTMLSelectElement).value = String(comp);
    (tierCtl.querySelector('select') as HTMLSelectElement).value = String(tier);
    (statusCtl.querySelector('select') as HTMLSelectElement).value = status;
    syncPills();
    render();
  },
};
